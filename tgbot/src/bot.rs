use chrono::Local;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use teloxide::prelude::*;
use teloxide::types::ParseMode;
use teloxide::utils::command::BotCommands;
use teloxide::utils::markdown::escape;

use crate::redis_client;

#[derive(BotCommands, Clone)]
#[command(rename_rule = "lowercase", description = "Доступные команды:")]
pub enum Command {
    #[command(description = "получить логин-токен")]
    Login,
    Start,
}

/// Handles bot command responses
pub async fn answer(bot: Bot, msg: Message, cmd: Command) -> ResponseResult<()> {
    match cmd {
        Command::Login => {
            let token = match generate_unique_token(&msg).await {
                Ok(t) => t,
                Err(e) => {
                    log::error!("Error generating token: {}", e);
                    bot.send_message(msg.chat.id, "Ошибка при генерации токена")
                        .await?;
                    return Ok(());
                }
            };

            bot.send_message(msg.chat.id, format!("Ваш токен: `{}`", token))
                .parse_mode(ParseMode::MarkdownV2)
                .await?;

            bot.send_message(
                msg.chat.id,
                "Используйте этот токен для авторизации на сайте",
            )
            .await?;
        }

        Command::Start => {
            let token = match generate_unique_token(&msg).await {
                Ok(t) => t,
                Err(e) => {
                    log::error!("Error generating token: {}", e);
                    bot.send_message(msg.chat.id, "Ошибка при генерации токена")
                        .await?;
                    return Ok(());
                }
            };
            let username_raw = msg
                .from()
                .and_then(|u| u.username.clone())
                .unwrap_or_else(|| "-".into());

            let username = escape(&username_raw);
            let token_md = escape(&token);

            let text = format!(
                "Привет, {}\n\
                 Ваш токен: `{}`\n\
                 Данный токен истекает через 10 минут\n\
                 Используйте этот токен для авторизации на сайте",
                username,
                token_md,
            );

            bot.send_message(msg.chat.id, text)
                .parse_mode(ParseMode::MarkdownV2)
                .await?;
        }
    }

    Ok(())
}

/// Generates a unique token for user authentication and saves it to Redis
/// 
/// Format in Redis:
/// - Key: generated token
/// - Value: "tg_id;tg_username;hh:mm"
/// - Expiration: 600 seconds (10 minutes)



async fn generate_unique_token(msg: &Message) -> anyhow::Result<String>{
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
