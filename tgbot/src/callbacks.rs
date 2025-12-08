use std::env;
use teloxide::prelude::*;
use teloxide::types::{CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, ParseMode};
use serde::{Deserialize, Serialize};

use crate::bot::{get_notification_status, update_notification_settings};

/// Response from backend for join request actions
#[derive(Deserialize)]
struct JoinRequestResponse {
    success: bool,
    message: Option<String>,
}

/// Request body for responding to join requests
#[derive(Serialize)]
struct RespondToJoinRequest {
    accepted: bool,
}

/// Handle callback queries from inline keyboard buttons
pub async fn handle_callback_query(bot: Bot, q: CallbackQuery) -> ResponseResult<()> {
    if let Some(data) = &q.data {
        log::info!("Received callback query: {}", data);
        
        // Parse the callback data
        let parts: Vec<&str> = data.split(':').collect();
        
        match parts.as_slice() {
            ["join_accept", team_id, request_id] => {
                handle_join_response(&bot, &q, team_id, request_id, true).await?;
            }
            ["join_reject", team_id, request_id] => {
                handle_join_response(&bot, &q, team_id, request_id, false).await?;
            }
            ["invite_accept", team_id, invite_id] => {
                handle_invite_response(&bot, &q, team_id, invite_id, true).await?;
            }
            ["invite_reject", team_id, invite_id] => {
                handle_invite_response(&bot, &q, team_id, invite_id, false).await?;
            }
            ["get_token"] => {
                handle_get_token(&bot, &q).await?;
            }
            ["notifications_menu"] => {
                handle_notifications_menu(&bot, &q).await?;
            }
            ["notifications_on"] => {
                handle_notification_toggle(&bot, &q, true).await?;
            }
            ["notifications_off"] => {
                handle_notification_toggle(&bot, &q, false).await?;
            }
            ["show_info"] => {
                handle_show_info(&bot, &q).await?;
            }
            ["back_to_main"] => {
                handle_back_to_main(&bot, &q).await?;
            }
            _ => {
                log::warn!("Unknown callback data: {}", data);
                bot.answer_callback_query(&q.id)
                    .text("Неизвестное действие")
                    .await?;
            }
        }
    }
    
    Ok(())
}

/// Handle join request accept/reject
async fn handle_join_response(
    bot: &Bot, 
    q: &CallbackQuery, 
    team_id: &str, 
    request_id: &str, 
    accept: bool
) -> ResponseResult<()> {
    let action = if accept { "принятия" } else { "отклонения" };
    log::info!("Processing join request {} for team {} - accept: {}", request_id, team_id, accept);
    
    // Show loading indicator
    bot.answer_callback_query(&q.id)
        .text(format!("Обработка {}...", action))
        .await?;
    
    // Call backend API to process the request
    let backend_url = env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    let url = format!("{}/api/teams/{}/join-requests/{}", backend_url, team_id, request_id);
    
    let client = reqwest::Client::new();
    let request_body = RespondToJoinRequest { accepted: accept };
    
    let result = client
        .put(&url)
        .json(&request_body)
        .send()
        .await;
    
    let response_text = match result {
        Ok(response) => {
            if response.status().is_success() {
                if accept {
                    "✅ Заявка успешно принята! Пользователь добавлен в команду."
                } else {
                    "❌ Заявка отклонена."
                }
            } else {
                let status = response.status();
                let error_text = response.text().await.unwrap_or_default();
                log::error!("Backend error: {} - {}", status, error_text);
                
                if error_text.contains("already processed") || error_text.contains("not found") {
                    "⚠️ Эта заявка уже была обработана ранее."
                } else if error_text.contains("team is full") {
                    "⚠️ Команда уже заполнена. Нельзя принять нового участника."
                } else {
                    "❌ Ошибка при обработке заявки. Попробуйте позже."
                }
            }
        }
        Err(e) => {
            log::error!("Failed to connect to backend: {}", e);
            "❌ Не удалось связаться с сервером. Попробуйте позже."
        }
    };
    
    // Update the message to show result
    if let Some(message) = &q.message {
        let new_text = format!(
            "{}\n\n{}",
            message.text().unwrap_or("Запрос на вступление"),
            response_text
        );
        
        // Edit the message to remove buttons and show result
        if let Err(e) = bot.edit_message_text(message.chat.id, message.id, new_text).await {
            log::warn!("Failed to edit message: {}", e);
        }
    }
    
    Ok(())
}

/// Handle invite accept/reject (from team captain's invite)
async fn handle_invite_response(
    bot: &Bot, 
    q: &CallbackQuery, 
    _team_id: &str, 
    invite_id: &str, 
    accept: bool
) -> ResponseResult<()> {
    let action = if accept { "принятия" } else { "отклонения" };
    log::info!("Processing invite {} - accept: {}", invite_id, accept);
    
    // Show loading indicator
    bot.answer_callback_query(&q.id)
        .text(format!("Обработка {}...", action))
        .await?;
    
    // Call backend API to process the invite
    let backend_url = env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    
    // Get user's telegram ID to find their auth token
    let telegram_id = q.from.id.0 as i64;
    
    // Get user's JWT token from backend (need to implement this or use a different approach)
    // For now, we'll call a special bot endpoint that doesn't require auth
    let url = if accept {
        format!("{}/api/bot/invites/{}/accept?telegramId={}", backend_url, invite_id, telegram_id)
    } else {
        format!("{}/api/bot/invites/{}/decline?telegramId={}", backend_url, invite_id, telegram_id)
    };
    
    let client = reqwest::Client::new();
    
    let result = client
        .post(&url)
        .send()
        .await;
    
    let response_text = match result {
        Ok(response) => {
            if response.status().is_success() {
                if accept {
                    "✅ Приглашение принято! Вы добавлены в команду."
                } else {
                    "❌ Приглашение отклонено."
                }
            } else {
                let status = response.status();
                let error_text = response.text().await.unwrap_or_default();
                log::error!("Backend error: {} - {}", status, error_text);
                
                if error_text.contains("already processed") || error_text.contains("not found") {
                    "⚠️ Это приглашение уже было обработано ранее."
                } else if error_text.contains("not your invite") {
                    "⚠️ Это приглашение адресовано другому пользователю."
                } else {
                    "❌ Ошибка при обработке приглашения. Попробуйте позже."
                }
            }
        }
        Err(e) => {
            log::error!("Failed to connect to backend: {}", e);
            "❌ Не удалось связаться с сервером. Попробуйте позже."
        }
    };
    
    // Update the message to show result
    if let Some(message) = &q.message {
        let new_text = format!(
            "{}\n\n{}",
            message.text().unwrap_or("Приглашение в команду"),
            response_text
        );
        
        // Edit the message to remove buttons and show result
        if let Err(e) = bot.edit_message_text(message.chat.id, message.id, new_text).await {
            log::warn!("Failed to edit message: {}", e);
        }
    }
    
    Ok(())
}

/// Handle get_token callback - generate and show token
async fn handle_get_token(bot: &Bot, q: &CallbackQuery) -> ResponseResult<()> {
    use chrono::Local;
    use rand::distributions::Alphanumeric;
    use rand::{thread_rng, Rng};
    use crate::redis_client;
    use ::redis::AsyncCommands;
    use teloxide::utils::markdown::escape;
    
    bot.answer_callback_query(&q.id)
        .text("Генерирую токен...")
        .await?;
    
    // Generate token
    let mut redis_conn = match redis_client::create_redis_conn().await {
        Ok(conn) => conn,
        Err(e) => {
            log::error!("Redis connection error: {}", e);
            if let Some(message) = &q.message {
                bot.send_message(message.chat.id, "❌ Ошибка при генерации токена. Попробуйте позже.")
                    .await?;
            }
            return Ok(());
        }
    };
    
    let token: String = (0..16).map(|_| thread_rng().sample(Alphanumeric) as char).collect();
    
    let user_id_u64 = q.from.id.0;
    let username = q.from.username.clone().unwrap_or_else(|| "-".into());
    let time = Local::now().format("%H:%M").to_string();
    let value = format!("{};{};{}", user_id_u64, username, time);
    
    let _: () = redis_conn.set_ex(&token, &value, 600).await.unwrap_or(());
    
    let token_md = escape(&token);
    let text = format!(
        "🔐 *Ваш токен для авторизации:*\n\n\
        `{}`\n\n\
        ⏰ Токен действителен *10 минут*\n\n\
        📋 Скопируйте токен и вставьте его на сайте для входа\\.",
        token_md
    );
    
    if let Some(message) = &q.message {
        bot.send_message(message.chat.id, text)
            .parse_mode(ParseMode::MarkdownV2)
            .await?;
    }
    
    Ok(())
}

/// Handle notifications_menu callback
async fn handle_notifications_menu(bot: &Bot, q: &CallbackQuery) -> ResponseResult<()> {
    bot.answer_callback_query(&q.id).await?;
    
    let telegram_id = q.from.id.0 as i64;
    
    let (status_text, status_emoji, current_enabled) = match get_notification_status(telegram_id).await {
        Ok((enabled, _name)) => {
            if enabled {
                ("Уведомления *включены* ✅", "🔔", true)
            } else {
                ("Уведомления *выключены* 🔇", "🔕", false)
            }
        }
        Err(_) => {
            ("Статус неизвестен \\(авторизуйтесь на сайте\\)", "❓", true)
        }
    };

    let text = format!(
        "{} *Настройки уведомлений*\n\n\
        Текущий статус: {}\n\n\
        Уведомления включают:\n\
        • 📨 Заявки на вступление в команду\n\
        • ✅ Одобрение/отклонение заявок\n\
        • 🎉 Новые матчи\n\n\
        Используйте кнопки ниже для управления\\.",
        status_emoji, status_text
    );

    let keyboard = if current_enabled {
        InlineKeyboardMarkup::new(vec![
            vec![InlineKeyboardButton::callback("🔕 Выключить уведомления", "notifications_off")],
            vec![InlineKeyboardButton::callback("◀️ Назад", "back_to_main")],
        ])
    } else {
        InlineKeyboardMarkup::new(vec![
            vec![InlineKeyboardButton::callback("🔔 Включить уведомления", "notifications_on")],
            vec![InlineKeyboardButton::callback("◀️ Назад", "back_to_main")],
        ])
    };

    if let Some(message) = &q.message {
        bot.edit_message_text(message.chat.id, message.id, text)
            .parse_mode(ParseMode::MarkdownV2)
            .reply_markup(keyboard)
            .await?;
    }

    Ok(())
}

/// Handle notification toggle on/off
async fn handle_notification_toggle(bot: &Bot, q: &CallbackQuery, enable: bool) -> ResponseResult<()> {
    let telegram_id = q.from.id.0 as i64;
    
    let action_text = if enable { "Включаю" } else { "Выключаю" };
    bot.answer_callback_query(&q.id)
        .text(format!("{} уведомления...", action_text))
        .await?;
    
    match update_notification_settings(telegram_id, enable).await {
        Ok(_) => {
            let (status_text, emoji) = if enable {
                ("Уведомления *включены* ✅\n\nТеперь вы будете получать все важные уведомления\\.", "🔔")
            } else {
                ("Уведомления *выключены* 🔇\n\nВы больше не будете получать уведомления в Telegram\\.", "🔕")
            };
            
            let text = format!("{} {}", emoji, status_text);
            
            let keyboard = if enable {
                InlineKeyboardMarkup::new(vec![
                    vec![InlineKeyboardButton::callback("🔕 Выключить уведомления", "notifications_off")],
                    vec![InlineKeyboardButton::callback("◀️ Назад", "back_to_main")],
                ])
            } else {
                InlineKeyboardMarkup::new(vec![
                    vec![InlineKeyboardButton::callback("🔔 Включить уведомления", "notifications_on")],
                    vec![InlineKeyboardButton::callback("◀️ Назад", "back_to_main")],
                ])
            };
            
            if let Some(message) = &q.message {
                bot.edit_message_text(message.chat.id, message.id, text)
                    .parse_mode(ParseMode::MarkdownV2)
                    .reply_markup(keyboard)
                    .await?;
            }
        }
        Err(e) => {
            log::error!("Failed to update notification settings: {}", e);
            if let Some(message) = &q.message {
                bot.send_message(message.chat.id, "❌ Не удалось обновить настройки. Убедитесь, что вы авторизованы на сайте.")
                    .await?;
            }
        }
    }
    
    Ok(())
}

/// Handle show_info callback
async fn handle_show_info(bot: &Bot, q: &CallbackQuery) -> ResponseResult<()> {
    bot.answer_callback_query(&q.id).await?;
    
    let info_text = 
        "ℹ️ *О платформе ITAM Hackathon*\n\n\
        🎯 *Что это?*\n\
        Платформа для участия в хакатонах с системой подбора команд\\.\n\n\
        ✨ *Возможности:*\n\
        • 🔍 Поиск команды по навыкам\n\
        • 👆 Свайп\\-система как в Tinder\n\
        • 🏆 Геймификация и достижения\n\
        • 🎨 Кастомизация профиля\n\
        • 📊 Рейтинг и MMR система\n\n\
        💡 *Как это работает:*\n\
        1\\. Создайте профиль с вашими навыками\n\
        2\\. Свайпайте карточки команд/участников\n\
        3\\. При взаимном лайке \\- это Match\\!\n\
        4\\. Общайтесь и формируйте команду\\!";
    
    let keyboard = InlineKeyboardMarkup::new(vec![
        vec![InlineKeyboardButton::callback("◀️ Назад", "back_to_main")],
    ]);
    
    if let Some(message) = &q.message {
        bot.edit_message_text(message.chat.id, message.id, info_text)
            .parse_mode(ParseMode::MarkdownV2)
            .reply_markup(keyboard)
            .await?;
    }
    
    Ok(())
}

/// Handle back_to_main callback
async fn handle_back_to_main(bot: &Bot, q: &CallbackQuery) -> ResponseResult<()> {
    use teloxide::utils::markdown::escape;
    
    bot.answer_callback_query(&q.id).await?;
    
    let user_name = q.from.first_name.clone();

    let welcome_text = format!(
        "👋 Привет, {}\\!\n\n\
        🚀 *ITAM Hackathon Bot*\n\n\
        Этот бот поможет тебе:\n\
        • 🔐 Авторизоваться на платформе\n\
        • 🔔 Получать уведомления\n\
        • 👥 Управлять приглашениями\n\n\
        Выбери действие:",
        escape(&user_name)
    );

    let keyboard = InlineKeyboardMarkup::new(vec![
        vec![
            InlineKeyboardButton::callback("🔐 Получить токен", "get_token"),
        ],
        vec![
            InlineKeyboardButton::callback("🔔 Уведомления", "notifications_menu"),
            InlineKeyboardButton::callback("ℹ️ Информация", "show_info"),
        ],
    ]);

    if let Some(message) = &q.message {
        bot.edit_message_text(message.chat.id, message.id, welcome_text)
            .parse_mode(ParseMode::MarkdownV2)
            .reply_markup(keyboard)
            .await?;
    }

    Ok(())
}
