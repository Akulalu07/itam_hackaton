use anyhow::Result;
use std::env;

/// Creates a Redis connection using environment variables
pub async fn create_redis_conn() -> Result<::redis::aio::MultiplexedConnection> {
    let addr = env::var("REDISADDR").unwrap_or_else(|_| "redis:6379".to_string());
    let username = env::var("REDISUSER").ok();
    let password = env::var("REDISPASSWORD").ok();
    let url = match (username, password) {
        (Some(u), Some(p)) => format!("redis://{}:{}@{}", u, p, addr),
        _ => format!("redis://{}", addr),
    };
    let client = ::redis::Client::open(url)?;
    let conn = client.get_multiplexed_async_connection().await?;
    Ok(conn)
}

