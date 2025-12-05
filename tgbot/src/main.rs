use teloxide::{prelude::*, types::ParseMode, utils::command::BotCommands};
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use chrono::Local;
use redis::AsyncCommands;
use std::env;

#[derive(BotCommands, Clone)]
#[command(
    rename_rule = "lowercase",
    description = "Доступные команды:"
)]
enum Command {
    #[command(description = "получить логин-токен")]
    Login,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    pretty_env_logger::init();
    log::info!("Starting bot..");

    let bot = Bot::from_env();

    let handler = Update::filter_message()
        .filter_command::<Command>()
        .endpoint(answer);

    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}

async fn answer(bot: Bot, msg: Message, cmd: Command) -> ResponseResult<()> {
    match cmd {
        Command::Login => {
            let token = generate_unique_token(&msg).await.unwrap();

            bot.send_message(msg.chat.id, format!("`{}`", token))
                .parse_mode(ParseMode::MarkdownV2)
                .await?;
        }
    }

    Ok(())
}

async fn generate_unique_token(msg: &Message) -> anyhow::Result<String> {
    let mut redis = create_redis_conn().await?;

    loop {
        let token = random_string();
        let exists: bool = redis.exists(&token).await?;

        if !exists {
            let user_id = msg.from().map(|u| u.id.0).unwrap_or(0);
            let username = msg.from()
                .and_then(|u| u.username.clone())
                .unwrap_or_else(|| "-".into());

            let time = Local::now().format("%H:%M").to_string();
            let value = format!("{};{};{}", user_id, username, time);

            let _: () = redis.set_ex(&token, value, 600).await?;

            println!("token saved: {}", token);

            return Ok(token);
        }
    }
}

fn random_string() -> String {
    let mut rng = thread_rng();
    (0..16)
        .map(|_| rng.sample(Alphanumeric) as char)
        .collect()
}

async fn create_redis_conn() -> anyhow::Result<redis::aio::MultiplexedConnection> {
    let addr = env::var("REDISADDR")?;
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
