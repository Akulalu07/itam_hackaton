use anyhow::Result;
use serde::Deserialize;
use std::collections::HashMap;
use std::env;
use teloxide::prelude::*;
use teloxide::types::{InlineKeyboardButton, InlineKeyboardMarkup};

use crate::redis_client;

#[derive(Deserialize)]
pub struct AuthorizedUsersResponse {
    pub users: Vec<AuthorizedUser>,
}

#[derive(Deserialize)]
pub struct AuthorizedUser {
    #[serde(rename = "telegramUserId")]
    pub telegram_user_id: i64,
    pub username: String,
    pub authorized: bool,
}

/// Notification types for the system
#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationType {
    JoinRequest,
    TeamAccepted,
    TeamRejected,
    General,
}

/// Structured notification from backend
#[derive(Debug, Deserialize)]
pub struct Notification {
    pub message: String,
    #[serde(rename = "type")]
    pub notification_type: Option<String>,
    #[serde(rename = "targetUserId")]
    pub target_user_id: Option<i64>,
    #[serde(rename = "requestId")]
    pub request_id: Option<i64>,
    #[serde(rename = "inviteId")]
    pub invite_id: Option<i64>,
    #[serde(rename = "teamId")]
    pub team_id: Option<i64>,
    #[serde(rename = "teamName")]
    pub team_name: Option<String>,
    #[serde(rename = "userName")]
    pub user_name: Option<String>,
    #[serde(rename = "inviterName")]
    pub inviter_name: Option<String>,
}

/// Consumes notifications from Redis stream and sends them to Telegram users
/// 
/// Reads from the "notifications" Redis stream and processes notification messages.
/// Each message should contain a "data" field with JSON containing a "message" field.
pub async fn consume_notifications_stream(bot: Bot) -> Result<()> {
    use ::redis::streams::StreamReadOptions;
    use ::redis::AsyncCommands;
    
    log::info!("Starting Redis Stream consumer...");
    let mut redis_conn = redis_client::create_redis_conn().await?;
    let stream_name = "notifications";
    let consumer_group = "telegram_bot";
    let consumer_name = "consumer_1";

    let _: Result<(), _> = redis_conn.xgroup_create(stream_name, consumer_group, "0").await;
    log::info!("Consumer group creation attempted (will retry when stream exists if needed)");

    log::info!("Listening for notifications on stream: {}", stream_name);

    loop {
        let opts = StreamReadOptions::default()
            .group(consumer_group, consumer_name)
            .count(10);

        match redis_conn
            .xread_options::<&str, &str, ::redis::streams::StreamReadReply>(
                &[stream_name],
                &[">"],
                &opts,
            )
            .await
        {
            Ok(streams) => {
                if streams.keys.is_empty() {
                    continue;
                }

                log::info!("Received {} stream keys", streams.keys.len());
                for stream_key in streams.keys {
                    log::info!("Processing {} messages from stream", stream_key.ids.len());
                    for stream_id in stream_key.ids {
                        log::debug!("Processing message ID: {}", stream_id.id);

                        let mut data: HashMap<String, String> = HashMap::new();
                        for (key, value) in stream_id.map {
                            if let Ok(str_val) = <String as ::redis::FromRedisValue>::from_redis_value(&value) {
                                data.insert(key, str_val);
                            } else {
                                log::warn!("Failed to convert value for key: {}", key);
                            }
                        }

                        if let Some(json_data) = data.get("data") {
                            log::debug!("Parsing notification data: {}", json_data);
                            
                            // Try to parse as structured notification first
                            if let Ok(notification) = serde_json::from_str::<Notification>(json_data) {
                                log::info!("Received structured notification: {:?}", notification);
                                
                                match notification.notification_type.as_deref() {
                                    Some("join_request") => {
                                        // Send to specific user (team captain) with accept/reject buttons
                                        if let Some(target_user_id) = notification.target_user_id {
                                            if let Err(e) = send_join_request_notification(&bot, target_user_id, &notification).await {
                                                log::error!("Error sending join request notification: {}", e);
                                            }
                                        } else {
                                            log::warn!("No target user for join_request notification");
                                        }
                                    }
                                    Some("team_invite") => {
                                        // Send to user who is invited to join team with accept/reject buttons
                                        if let Some(target_user_id) = notification.target_user_id {
                                            if let Err(e) = send_team_invite_notification(&bot, target_user_id, &notification).await {
                                                log::error!("Error sending team invite notification: {}", e);
                                            }
                                        } else {
                                            log::warn!("No target user for team_invite notification");
                                        }
                                    }
                                    Some("team_accepted") | Some("team_rejected") | Some("invite_accepted") | Some("invite_rejected") => {
                                        // Send to the user who requested to join or sent invite
                                        if let Some(target_user_id) = notification.target_user_id {
                                            if let Err(e) = send_notification_to_user(&bot, target_user_id, &notification.message).await {
                                                log::error!("Error sending response notification: {}", e);
                                            }
                                        }
                                    }
                                    _ => {
                                        // General notification - send to all users
                                        log::info!("Sending general notification: {}", notification.message);
                                        if let Err(e) = send_notification_to_all_users(&bot, &notification.message).await {
                                            log::error!("Error sending notifications: {}", e);
                                        }
                                    }
                                }
                            } else if let Ok(simple_notification) = serde_json::from_str::<serde_json::Value>(json_data) {
                                // Fallback to simple message format
                                let message = simple_notification
                                    .get("message")
                                    .and_then(|m| m.as_str())
                                    .unwrap_or("Новое уведомление");

                                log::info!("Sending simple notification: {}", message);

                                if let Err(e) = send_notification_to_all_users(&bot, message).await {
                                    log::error!("Error sending notifications: {}", e);
                                }
                            } else {
                                log::error!("Failed to parse notification JSON: {}", json_data);
                            }
                        } else {
                            log::warn!("No 'data' field found in stream message");
                        }

                        let _: Result<usize, _> = redis_conn
                            .xack(stream_name, consumer_group, &[stream_id.id])
                            .await;
                    }
                }
            }
            Err(e) => {
                let err_str = e.to_string();
                if err_str.contains("NOGROUP") {
                    log::debug!(
                        "Stream or consumer group doesn't exist yet, attempting to create consumer group..."
                    );
                    match redis_conn
                        .xgroup_create::<&str, &str, &str, ()>(stream_name, consumer_group, "0")
                        .await
                    {
                        Ok(_) => {
                            log::info!(
                                "Successfully created consumer group {} (stream now exists)",
                                consumer_group
                            );
                        }
                        Err(create_err) => {
                            let create_err_str = create_err.to_string();
                            if create_err_str.contains("BUSYGROUP") {
                                log::debug!("Consumer group already exists");
                            } else {
                                log::debug!(
                                    "Stream doesn't exist yet, waiting for first notification..."
                                );
                            }
                        }
                    }

                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                } else {
                    log::error!("Error reading from stream: {}", e);
                    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                }
                continue;
            }
        }

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    }
}

/// Sends a notification message to all authorized users
async fn send_notification_to_all_users(bot: &Bot, message: &str) -> Result<()> {
    let backend_url = env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    let url = format!("{}/api/users/authorized", backend_url);

    log::info!("Fetching authorized users from: {}", url);
    let client = reqwest::Client::new();
    let response = match client.get(&url).send().await {
        Ok(r) => r,
        Err(e) => {
            log::error!("Failed to connect to backend at {}: {}", url, e);
            return Err(anyhow::anyhow!("Backend connection failed: {}", e));
        }
    };

    if response.status().is_success() {
        let users_resp: AuthorizedUsersResponse = match response.json().await {
            Ok(u) => u,
            Err(e) => {
                log::error!("Failed to parse users response: {}", e);
                return Err(anyhow::anyhow!("Failed to parse users: {}", e));
            }
        };

        log::info!("Found {} authorized users", users_resp.users.len());

        if users_resp.users.is_empty() {
            log::warn!("No authorized users found to send notifications to");
            return Ok(());
        }

        for user in users_resp.users {
            if user.authorized {
                let chat_id = ChatId(user.telegram_user_id);
                log::debug!(
                    "Sending notification to user {} (chat_id: {:?})",
                    user.telegram_user_id,
                    chat_id
                );
                if let Err(e) = bot.send_message(chat_id, message).await {
                    log::error!(
                        "Failed to send notification to user {}: {}",
                        user.telegram_user_id,
                        e
                    );
                } else {
                    log::info!(
                        "✓ Notification sent to user {} ({})",
                        user.telegram_user_id,
                        user.username
                    );
                }
            } else {
                log::debug!("Skipping user {} (not authorized)", user.telegram_user_id);
            }
        }
    } else {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        log::error!("Failed to get authorized users: {} - {}", status, text);
        return Err(anyhow::anyhow!("Backend returned {}: {}", status, text));
    }

    Ok(())
}

/// Check if user has notifications enabled
async fn check_notifications_enabled(telegram_user_id: i64) -> bool {
    let backend_url = env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    let url = format!("{}/api/bot/notifications/{}", backend_url, telegram_user_id);
    
    let client = reqwest::Client::new();
    match client.get(&url).send().await {
        Ok(response) if response.status().is_success() => {
            if let Ok(data) = response.json::<serde_json::Value>().await {
                data.get("notificationsEnabled").and_then(|v| v.as_bool()).unwrap_or(true)
            } else {
                true // Default to enabled if can't parse
            }
        }
        _ => true // Default to enabled if can't reach backend
    }
}

/// Sends a notification to a specific user by their Telegram ID
async fn send_notification_to_user(bot: &Bot, telegram_user_id: i64, message: &str) -> Result<()> {
    // Check if user has notifications enabled
    if !check_notifications_enabled(telegram_user_id).await {
        log::info!("Skipping notification for user {} - notifications disabled", telegram_user_id);
        return Ok(());
    }
    
    let chat_id = ChatId(telegram_user_id);
    log::info!("Sending notification to user {} (chat_id: {:?})", telegram_user_id, chat_id);
    
    if let Err(e) = bot.send_message(chat_id, message).await {
        log::error!("Failed to send notification to user {}: {}", telegram_user_id, e);
        return Err(anyhow::anyhow!("Failed to send message: {}", e));
    }
    
    log::info!("✓ Notification sent to user {}", telegram_user_id);
    Ok(())
}

/// Sends a join request notification with accept/reject buttons
async fn send_join_request_notification(bot: &Bot, captain_telegram_id: i64, notification: &Notification) -> Result<()> {
    // Check if captain has notifications enabled
    if !check_notifications_enabled(captain_telegram_id).await {
        log::info!("Skipping join request notification for captain {} - notifications disabled", captain_telegram_id);
        return Ok(());
    }
    
    let chat_id = ChatId(captain_telegram_id);
    
    let request_id = notification.request_id.unwrap_or(0);
    let team_id = notification.team_id.unwrap_or(0);
    let user_name = notification.user_name.clone().unwrap_or_else(|| "Пользователь".to_string());
    let team_name = notification.team_name.clone().unwrap_or_else(|| "команду".to_string());
    
    let message = format!(
        "🔔 *Запрос на вступление в команду*\n\n\
        Пользователь *{}* хочет вступить в команду *{}*.\n\n\
        Нажмите кнопку ниже, чтобы принять или отклонить заявку.",
        user_name, team_name
    );
    
    // Create inline keyboard with accept/reject buttons
    let keyboard = InlineKeyboardMarkup::new(vec![
        vec![
            InlineKeyboardButton::callback(
                "✅ Принять", 
                format!("join_accept:{}:{}", team_id, request_id)
            ),
            InlineKeyboardButton::callback(
                "❌ Отклонить", 
                format!("join_reject:{}:{}", team_id, request_id)
            ),
        ],
    ]);
    
    log::info!("Sending join request notification to captain {} for request {}", captain_telegram_id, request_id);
    
    if let Err(e) = bot
        .send_message(chat_id, &message)
        .parse_mode(teloxide::types::ParseMode::MarkdownV2)
        .reply_markup(keyboard)
        .await 
    {
        // Try without markdown if it fails
        log::warn!("Failed to send with markdown, trying plain text: {}", e);
        let plain_message = format!(
            "🔔 Запрос на вступление в команду\n\n\
            Пользователь {} хочет вступить в команду {}.\n\n\
            Нажмите кнопку ниже, чтобы принять или отклонить заявку.",
            user_name, team_name
        );
        
        let keyboard = InlineKeyboardMarkup::new(vec![
            vec![
                InlineKeyboardButton::callback(
                    "✅ Принять", 
                    format!("join_accept:{}:{}", team_id, request_id)
                ),
                InlineKeyboardButton::callback(
                    "❌ Отклонить", 
                    format!("join_reject:{}:{}", team_id, request_id)
                ),
            ],
        ]);
        
        if let Err(e2) = bot
            .send_message(chat_id, &plain_message)
            .reply_markup(keyboard)
            .await 
        {
            log::error!("Failed to send join request notification to {}: {}", captain_telegram_id, e2);
            return Err(anyhow::anyhow!("Failed to send message: {}", e2));
        }
    }
    
    log::info!("✓ Join request notification sent to captain {}", captain_telegram_id);
    Ok(())
}

/// Sends a team invite notification with accept/reject buttons
async fn send_team_invite_notification(bot: &Bot, user_telegram_id: i64, notification: &Notification) -> Result<()> {
    // Check if user has notifications enabled
    if !check_notifications_enabled(user_telegram_id).await {
        log::info!("Skipping team invite notification for user {} - notifications disabled", user_telegram_id);
        return Ok(());
    }
    
    let chat_id = ChatId(user_telegram_id);
    
    // Get invite_id - try invite_id first, fallback to request_id
    let invite_id = notification.invite_id.or(notification.request_id).unwrap_or(0);
    let team_id = notification.team_id.unwrap_or(0);
    let inviter_name = notification.inviter_name.clone()
        .or_else(|| notification.user_name.clone())
        .unwrap_or_else(|| "Капитан".to_string());
    let team_name = notification.team_name.clone().unwrap_or_else(|| "команду".to_string());
    
    let message = format!(
        "📨 Приглашение в команду\n\n\
        {} приглашает вас в команду \"{}\".\n\n\
        Нажмите кнопку ниже, чтобы принять или отклонить приглашение.",
        inviter_name, team_name
    );
    
    // Create inline keyboard with accept/reject buttons
    let keyboard = InlineKeyboardMarkup::new(vec![
        vec![
            InlineKeyboardButton::callback(
                "✅ Принять", 
                format!("invite_accept:{}:{}", team_id, invite_id)
            ),
            InlineKeyboardButton::callback(
                "❌ Отклонить", 
                format!("invite_reject:{}:{}", team_id, invite_id)
            ),
        ],
    ]);
    
    log::info!("Sending team invite notification to user {} for invite {}", user_telegram_id, invite_id);
    
    if let Err(e) = bot
        .send_message(chat_id, &message)
        .reply_markup(keyboard)
        .await 
    {
        log::error!("Failed to send team invite notification to {}: {}", user_telegram_id, e);
        return Err(anyhow::anyhow!("Failed to send message: {}", e));
    }
    
    log::info!("✓ Team invite notification sent to user {}", user_telegram_id);
    Ok(())
}

