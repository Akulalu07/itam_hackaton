use anyhow::Result;
use serde::Deserialize;
use std::collections::HashMap;
use std::env;
use teloxide::prelude::*;

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
                            if let Ok(notification) =
                                serde_json::from_str::<serde_json::Value>(json_data)
                            {
                                let message = notification
                                    .get("message")
                                    .and_then(|m| m.as_str())
                                    .unwrap_or("Новое уведомление");

                                log::info!("Sending notification: {}", message);

                                if let Err(e) = send_notification_to_all_users(&bot, message).await
                                {
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

