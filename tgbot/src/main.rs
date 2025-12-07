mod bot;
mod notifications;
mod redis_client;

use bot::{answer, Command};
use teloxide::prelude::*;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    // Initialize logger
    pretty_env_logger::init();

    log::info!("Starting bot..");

    let bot = Bot::from_env();
    log::info!("Bot created successfully");

    // Start notification stream consumer
    let bot_clone = bot.clone();
    tokio::spawn(async move {
        if let Err(e) = notifications::consume_notifications_stream(bot_clone).await {
            log::error!("Error in notification stream consumer: {}", e);
        }
    });

    // Setup command handler
    let handler = dptree::entry().branch(
        Update::filter_message()
            .filter_command::<Command>()
            .endpoint(answer),
    );

    // Start dispatcher
    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}
