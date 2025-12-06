use chrono::Local;
use rand::distributions::Alphanumeric;
use rand::{Rng, thread_rng};
use redis::AsyncCommands;
use redis::streams::StreamReadOptions;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use teloxide::{prelude::*, types::ParseMode, utils::command::BotCommands};
use tokio::sync::Mutex;

#[derive(BotCommands, Clone)]
#[command(rename_rule = "lowercase", description = "Доступные команды:")]
enum Command {
    #[command(description = "получить логин-токен")]
    Login,
}

#[derive(Debug, Clone)]
enum OnboardingState {
    NotStarted,
    WaitingForName,
    WaitingForEmail,
    Completed,
}

struct OnboardingData {
    state: OnboardingState,
    name: Option<String>,
    email: Option<String>,
}

type OnboardingStateMap = Arc<Mutex<HashMap<i64, OnboardingData>>>;

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

#[derive(Deserialize)]
struct AuthorizedUsersResponse {
    users: Vec<AuthorizedUser>,
}

#[derive(Deserialize)]
struct AuthorizedUser {
    #[serde(rename = "telegramUserId")]
    telegram_user_id: i64,
    username: String,
    authorized: bool,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    // Initialize logger
    pretty_env_logger::init();

    println!("Logger initialized");
    log::info!("Starting bot..");

    let onboarding_state: OnboardingStateMap = Arc::new(Mutex::new(HashMap::new()));

    println!("Creating bot from env...");
    let bot = Bot::from_env();
    println!("Bot created successfully");

    let bot_clone = bot.clone();
    let onboarding_state_clone = onboarding_state.clone();
    tokio::spawn(async move {
        if let Err(e) = consume_notifications_stream(bot_clone, onboarding_state_clone).await {
            log::error!("Error in notification stream consumer: {}", e);
        }
    });

    let onboarding_state_for_cmd = onboarding_state.clone();
    let onboarding_state_for_text = onboarding_state.clone();
    let handler = dptree::entry().branch(
        Update::filter_message()
            .filter_command::<Command>()
            .endpoint(move |bot: Bot, msg: Message, cmd: Command| {
                let state = onboarding_state_for_cmd.clone();
                answer(bot, msg, cmd, state)
            }),
    );

    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}

async fn answer(
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

async fn generate_unique_token(
    msg: &Message,
    bot: &Bot,
    onboarding_state: &OnboardingStateMap,
) -> anyhow::Result<String> {
    let mut redis = create_redis_conn().await?;

    loop {
        let token = random_string();
        let exists: bool = redis.exists(&token).await?;

        if !exists {
            let user_id_u64 = msg.from().map(|u| u.id.0).unwrap_or(0);
            let user_id = user_id_u64 as i64;
            let username = msg
                .from()
                .and_then(|u| u.username.clone())
                .unwrap_or_else(|| "-".into());

            let time = Local::now().format("%H:%M").to_string();
            let value = format!("{};{};{}", user_id_u64, username, time);

            let _: () = redis.set_ex(&token, value, 600).await?;

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

async fn consume_notifications_stream(
    bot: Bot,
    onboarding_state: OnboardingStateMap,
) -> anyhow::Result<()> {
    log::info!("Starting Redis Stream consumer...");
    let mut redis = create_redis_conn().await?;
    let stream_name = "notifications";
    let consumer_group = "telegram_bot";
    let consumer_name = "consumer_1";

    let _: Result<(), _> = redis.xgroup_create(stream_name, consumer_group, "0").await;
    log::info!("Consumer group creation attempted (will retry when stream exists if needed)");

    log::info!("Listening for notifications on stream: {}", stream_name);

    loop {
        let opts = StreamReadOptions::default()
            .group(consumer_group, consumer_name)
            .count(10);

        match redis
            .xread_options::<&str, &str, redis::streams::StreamReadReply>(
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
                            if let Ok(str_val) = redis::from_redis_value::<String>(&value) {
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

                        let _: Result<usize, _> = redis
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
                    match redis
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

async fn send_notification_to_all_users(bot: &Bot, message: &str) -> anyhow::Result<()> {
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

async fn create_redis_conn() -> anyhow::Result<redis::aio::MultiplexedConnection> {
    let addr = env::var("REDISADDR").unwrap_or_else(|_| "redis:6379".to_string());
    let username = env::var("REDISUSER").ok();
    let password = env::var("REDISPASSWORD").ok();
    let url = match (username, password) {
        (Some(u), Some(p)) => format!("redis://{}:{}@{}", u, p, addr),
        _ => format!("redis://{}", addr),
    };
    let client = redis::Client::open(url)?;
    let conn = client.get_multiplexed_async_connection().await?;
    Ok(conn)
}

fn random_string() -> String {
    let mut rng = thread_rng();
    (0..16).map(|_| rng.sample(Alphanumeric) as char).collect()
}
