use bb8_redis::{RedisConnectionManager, bb8};
use redis::AsyncCommands;
use sqlx::PgPool;

use crate::libs::config::Env;

pub type RedisPool = bb8::Pool<RedisConnectionManager>;

pub async fn init_redis(pool: &PgPool, config: &Env) -> RedisPool {
    let redis_url = config.redis_url.clone();
    println!("Connecting to Redis at {}", redis_url);
    let manager = RedisConnectionManager::new(redis_url).expect("init redis failed");

    let redis_pool = bb8::Pool::builder()
        .max_size(100)
        .build(manager)
        .await
        .expect("Failed to build Redis pool");

    {
        let crowd_funding_addresses: Vec<String> =
            sqlx::query_scalar("SELECT pool_address FROM crowd_funding")
                .fetch_all(pool)
                .await
                .expect("Failed to get crowd funding addresses");

        let group_funding_addresses: Vec<String> =
            sqlx::query_scalar("SELECT group_address FROM groups")
                .fetch_all(pool)
                .await
                .expect("Failed to get group addresses");

        let mut conn = redis_pool
            .get()
            .await
            .expect("Failed to get Redis connection");

        let _: () = conn
            .sadd("crowd_funding_addresses", &crowd_funding_addresses)
            .await
            .expect("Failed to store crowd funding addresses");

        let _: () = conn
            .sadd("group_funding_addresses", &group_funding_addresses)
            .await
            .expect("Failed to store group addresses");
    }

    redis_pool
}

pub async fn refresh_cache(pool: &PgPool, redis_pool: &RedisPool) {
    let crowd_funding_addresses: Vec<String> =
        sqlx::query_scalar("SELECT pool_address FROM crowd_funding")
            .fetch_all(pool)
            .await
            .expect("Failed to get crowd funding addresses");

    let group_funding_addresses: Vec<String> =
        sqlx::query_scalar("SELECT group_address FROM groups")
            .fetch_all(pool)
            .await
            .expect("Failed to get group addresses");

    let mut conn = redis_pool
        .get()
        .await
        .expect("Failed to get Redis connection");

    let _: () = conn
        .sadd("crowd_funding_addresses", &crowd_funding_addresses)
        .await
        .expect("Failed to store crowd funding addresses");

    let _: () = conn
        .sadd("group_funding_addresses", &group_funding_addresses)
        .await
        .expect("Failed to store group addresses");
}
