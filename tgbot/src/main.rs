mod bot;
mod callbacks;
mod notifications;
mod redis_client;

use bot::{answer, Command};
use callbacks::handle_callback_query;
use teloxide::prelude::*;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    // Initialize logger with default level
    // SAFETY: This is called at the start of main, before any other threads are spawned
    unsafe {
        if std::env::var("RUST_LOG").is_err() {
            std::env::set_var("RUST_LOG", "info");
        }
    }
    pretty_env_logger::init();

    eprintln!("[TGBOT] Starting bot...");
    log::info!("Starting bot..");

    // Check for token
    let token = std::env::var("TELOXIDE_TOKEN").unwrap_or_else(|_| {
        eprintln!("[TGBOT] ERROR: TELOXIDE_TOKEN is not set!");
        std::process::exit(1);
    });
    eprintln!("[TGBOT] Token found: {}...", &token[..20.min(token.len())]);

    let bot = Bot::new(token);
    eprintln!("[TGBOT] Bot created successfully");
    log::info!("Bot created successfully");

    // Start notification stream consumer
    let bot_clone = bot.clone();
    tokio::spawn(async move {
        if let Err(e) = notifications::consume_notifications_stream(bot_clone).await {
            log::error!("Error in notification stream consumer: {}", e);
        }
    });

    // Setup command handler
    let handler = dptree::entry()
        .branch(
            Update::filter_message()
                .filter_command::<Command>()
                .endpoint(answer),
        )
        .branch(
            Update::filter_callback_query()
                .endpoint(handle_callback_query),
        );

    // Start dispatcher
    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}
