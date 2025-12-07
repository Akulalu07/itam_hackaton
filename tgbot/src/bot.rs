use chrono::Local;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use teloxide::prelude::*;
use teloxide::types::ParseMode;
use teloxide::utils::command::BotCommands;
use tokio::sync::Mutex;

use crate::redis_client;

#[derive(BotCommands, Clone)]
#[command(rename_rule = "lowercase", description = "Доступные команды:")]
pub enum Command {
    #[command(description = "получить логин-токен")]
    Login,
}

#[derive(Debug, Clone)]
pub enum OnboardingState {
    NotStarted,
    WaitingForName,
    WaitingForEmail,
    Completed,
}

pub struct OnboardingData {
    pub state: OnboardingState,
    pub name: Option<String>,
    pub email: Option<String>,
}

pub type OnboardingStateMap = Arc<Mutex<HashMap<i64, OnboardingData>>>;

#[derive(Serialize, Deserialize)]
struct RegisterUserRequest {
    #[serde(rename = "telegramUserId")]
    telegram_user_id: i64,
    username: String,
}

#[derive(Deserialize)]
struct RegisterUserResponse {
    status: String,
    #[serde(rename = "isNewUser")]
    is_new_user: Option<bool>,
}

/// Handles bot command responses
pub async fn answer(
    bot: Bot,
    msg: Message,
    cmd: Command,
    onboarding_state: OnboardingStateMap,
) -> ResponseResult<()> {
    match cmd {
        Command::Login => {
            let token = match generate_unique_token(&msg, &bot, &onboarding_state).await {
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
    }

    Ok(())
}

/// Generates a unique token for user authentication
async fn generate_unique_token(
    msg: &Message,
    _bot: &Bot,
    onboarding_state: &OnboardingStateMap,
) -> anyhow::Result<String> {
    use ::redis::AsyncCommands;
    let mut redis_conn = redis_client::create_redis_conn().await?;

    loop {
        let token = random_string();
        let exists: bool = redis_conn.exists(&token).await?;

        if !exists {
            let user_id_u64 = msg.from().map(|u| u.id.0).unwrap_or(0);
            let user_id = user_id_u64 as i64;
            let username = msg
                .from()
                .and_then(|u| u.username.clone())
                .unwrap_or_else(|| "-".into());

            let time = Local::now().format("%H:%M").to_string();
            let value = format!("{};{};{}", user_id_u64, username, time);

            let _: () = redis_conn.set_ex(&token, value, 600).await?;

            log::info!("Token saved: {}", token);

            let is_new_user = match register_user_in_backend(user_id, &username).await {
                Ok(resp) => resp.is_new_user.unwrap_or(false),
                Err(e) => {
                    log::error!("Failed to register user in backend: {}", e);
                    false
                }
            };

            if is_new_user {
                let mut state_map = onboarding_state.lock().await;
                state_map.insert(
                    user_id,
                    OnboardingData {
                        state: OnboardingState::WaitingForName,
                        name: None,
                        email: None,
                    },
                );
                drop(state_map);
            }

            return Ok(token);
        }
    }
}

/// Registers a user in the backend system
async fn register_user_in_backend(
    telegram_user_id: i64,
    username: &str,
) -> anyhow::Result<RegisterUserResponse> {
    let backend_url = env::var("BACKEND_URL").unwrap_or_else(|_| "http://backend:8080".to_string());
    let url = format!("{}/api/user/register", backend_url);

    let client = reqwest::Client::new();
    let payload = RegisterUserRequest {
        telegram_user_id,
        username: username.to_string(),
    };

    let response = client.post(&url).json(&payload).send().await?;

    if response.status().is_success() {
        let resp: RegisterUserResponse = response.json().await?;
        log::info!(
            "User registered: {} (new: {:?})",
            telegram_user_id,
            resp.is_new_user
        );
        Ok(resp)
    } else {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        Err(anyhow::anyhow!("Backend returned {}: {}", status, text))
    }
}

/// Generates a random alphanumeric string
fn random_string() -> String {
    let mut rng = thread_rng();
    (0..16).map(|_| rng.sample(Alphanumeric) as char).collect()
}

