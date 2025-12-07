mod bot;
mod notifications;
mod redis_client;
                                            
use bot::{answer, Command, OnboardingStateMap};
use std::collections::HashMap;
use std::sync::Arc;
use teloxide::prelude::*;
use tokio::sync::Mutex;

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

    // Start notification stream consumer
    let bot_clone = bot.clone();
    tokio::spawn(async move {
        if let Err(e) = notifications::consume_notifications_stream(bot_clone).await {
            log::error!("Error in notification stream consumer: {}", e);
        }
    });

    // Setup command handler
    let onboarding_state_for_cmd = onboarding_state.clone();
    let handler = dptree::entry().branch(
        Update::filter_message()
            .filter_command::<Command>()
            .endpoint(move |bot: Bot, msg: Message, cmd: Command| {
                let state = onboarding_state_for_cmd.clone();
                answer(bot, msg, cmd, state)
            }),
    );

    // Start dispatcher
    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}
