use teloxide::prelude::*;
use rand::{distr::Alphanumeric, Rng}; 

#[tokio::main]
async fn main() {
    pretty_env_logger::init();
    log::info!("Starting bot..");

    let bot = Bot::from_env();

    teloxide::repl(bot, |bot: Bot, msg: Message| async move {
        let text = random_string();               
        bot.send_message(msg.chat.id, text).await?;
        Ok(())
    })
    .await;
}

fn random_string() -> String {
    const LEN: usize = 16;

    let token = rand::rng()                     
        .sample_iter(Alphanumeric)   
        .take(LEN)
        .map(char::from)
        .collect();
    //TODO: Try to search token in redis and send to redis

    token
}