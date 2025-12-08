use chrono::Local;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use teloxide::prelude::*;
use teloxide::types::{InlineKeyboardButton, InlineKeyboardMarkup, ParseMode};
use teloxide::utils::command::BotCommands;
use teloxide::utils::markdown::escape;

use crate::redis_client;

#[derive(BotCommands, Clone)]
#[command(rename_rule = "lowercase", description = "Доступные команды:")]
pub enum Command {
    #[command(description = "начать работу с ботом")]
    Start,
    #[command(description = "получить токен для входа на сайт")]
    Login,
    #[command(description = "информация о системе")]
    Info,
    #[command(description = "настройки уведомлений")]
    Notifications,
    #[command(description = "помощь")]
    Help,
}

/// Handles bot command responses
pub async fn answer(bot: Bot, msg: Message, cmd: Command) -> ResponseResult<()> {
    match cmd {
        Command::Start => {
            handle_start(&bot, &msg).await?;
        }
        Command::Login => {
            handle_login(&bot, &msg).await?;
        }
        Command::Info => {
            handle_info(&bot, &msg).await?;
        }
        Command::Notifications => {
            handle_notifications(&bot, &msg).await?;
        }
        Command::Help => {
            handle_help(&bot, &msg).await?;
        }
    }

    Ok(())
}

/// Handle /start command with welcome message
async fn handle_start(bot: &Bot, msg: &Message) -> ResponseResult<()> {
    let user_name = msg
        .from()
        .map(|u| u.first_name.clone())
        .unwrap_or_else(|| "друг".to_string());

    let welcome_text = format!(
        "👋 Привет, {}\\!\n\n\
        🚀 Добро пожаловать в *ITAM Hackathon Bot*\\!\n\n\
        Этот бот поможет тебе:\n\
        • 🔐 Авторизоваться на платформе хакатонов\n\
        • 🔔 Получать уведомления о заявках в команду\n\
        • 👥 Управлять приглашениями прямо из Telegram\n\n\
        📝 *Как начать:*\n\
        1\\. Нажми кнопку \"Получить токен\"\n\
        2\\. Введи токен на сайте для авторизации\n\
        3\\. Настрой профиль и найди команду\\!\n\n\
        ⚙️ Используй кнопки ниже или команды для навигации\\.",
        escape(&user_name)
    );

    // Create inline keyboard with main actions
    let keyboard = InlineKeyboardMarkup::new(vec![
        vec![
            InlineKeyboardButton::callback("🔐 Получить токен", "get_token"),
        ],
        vec![
            InlineKeyboardButton::callback("🔔 Уведомления", "notifications_menu"),
            InlineKeyboardButton::callback("ℹ️ Информация", "show_info"),
        ],
    ]);

    bot.send_message(msg.chat.id, welcome_text)
        .parse_mode(ParseMode::MarkdownV2)
        .reply_markup(keyboard)
        .await?;

    Ok(())
}

/// Handle /login command
async fn handle_login(bot: &Bot, msg: &Message) -> ResponseResult<()> {
    let token = match generate_unique_token(msg).await {
        Ok(t) => t,
        Err(e) => {
            log::error!("Error generating token: {}", e);
            bot.send_message(msg.chat.id, "❌ Ошибка при генерации токена. Попробуйте позже.")
                .await?;
            return Ok(());
        }
    };

    let token_md = escape(&token);

    let text = format!(
        "🔐 *Ваш токен для авторизации:*\n\n\
        `{}`\n\n\
        ⏰ Токен действителен *10 минут*\n\n\
        📋 Скопируйте токен и вставьте его на сайте для входа\\.",
        token_md
    );

    bot.send_message(msg.chat.id, text)
        .parse_mode(ParseMode::MarkdownV2)
        .await?;

    Ok(())
}

/// Handle /info command
async fn handle_info(bot: &Bot, msg: &Message) -> ResponseResult<()> {
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

    bot.send_message(msg.chat.id, info_text)
        .parse_mode(ParseMode::MarkdownV2)
        .await?;

    Ok(())
}

/// Handle /notifications command
pub async fn handle_notifications(bot: &Bot, msg: &Message) -> ResponseResult<()> {
    let telegram_id = msg.from().map(|u| u.id.0 as i64).unwrap_or(0);
    
    // Check current notification settings from backend
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
        • 🎉 Новые матчи\n\
        • 📢 Важные объявления\n\n\
        Используйте кнопки ниже для управления\\.",
        status_emoji, status_text
    );

    // Create toggle buttons
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

    bot.send_message(msg.chat.id, text)
        .parse_mode(ParseMode::MarkdownV2)
        .reply_markup(keyboard)
        .await?;

    Ok(())
}

/// Handle /help command
async fn handle_help(bot: &Bot, msg: &Message) -> ResponseResult<()> {
    let help_text = Command::descriptions().to_string();
    
    let full_text = format!(
        "📚 *Справка по командам*\n\n{}\n\n\
        💬 Если у вас есть вопросы, обратитесь к организаторам хакатона\\.",
        escape(&help_text)
    );

    bot.send_message(msg.chat.id, full_text)
        .parse_mode(ParseMode::MarkdownV2)
        .await?;

    Ok(())
}

/// Get notification status from backend
pub async fn get_notification_status(telegram_id: i64) -> anyhow::Result<(bool, String)> {
    let backend_url = std::env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    let url = format!("{}/api/bot/notifications/{}", backend_url, telegram_id);
    
    let client = reqwest::Client::new();
    let response = client.get(&url).send().await?;
    
    if response.status().is_success() {
        let data: serde_json::Value = response.json().await?;
        let enabled = data.get("notificationsEnabled").and_then(|v| v.as_bool()).unwrap_or(true);
        let name = data.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
        Ok((enabled, name))
    } else {
        Err(anyhow::anyhow!("User not found"))
    }
}

/// Update notification settings via backend
pub async fn update_notification_settings(telegram_id: i64, enabled: bool) -> anyhow::Result<()> {
    let backend_url = std::env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    let url = format!("{}/api/bot/notifications/{}", backend_url, telegram_id);
    
    let client = reqwest::Client::new();
    let response = client
        .put(&url)
        .json(&serde_json::json!({ "enabled": enabled }))
        .send()
        .await?;
    
    if response.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("Failed to update settings"))
    }
}

/// Generates a unique token for user authentication and saves it to Redis
async fn generate_unique_token(msg: &Message) -> anyhow::Result<String> {
    use ::redis::AsyncCommands;
    let mut redis_conn = redis_client::create_redis_conn().await?;

    loop {
        let token = random_string();
        let exists: bool = redis_conn.exists(&token).await?;

        if !exists {
            let user_id_u64 = msg.from().map(|u| u.id.0).unwrap_or(0);
            let username = msg
                .from()
                .and_then(|u| u.username.clone())
                .unwrap_or_else(|| "-".into());

            let time = Local::now().format("%H:%M").to_string();
            let value = format!("{};{};{}", user_id_u64, username, time);

            let _: () = redis_conn.set_ex(&token, &value, 600).await?;

            log::info!("Token saved to Redis - key: {}, value: {}", token, value);

            return Ok(token);
        }
    }
}

fn random_string() -> String {
    let mut rng = thread_rng();
    (0..16).map(|_| rng.sample(Alphanumeric) as char).collect()
}
