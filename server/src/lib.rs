pub mod libs {
    pub mod auth;
    pub mod config;
    pub mod db;
    pub mod error;
    pub mod logging;
    pub mod middleware;
    pub mod redis;
    pub mod router;
    pub mod utopia;
}

pub mod routes {
    pub mod admin;
    pub mod crowd_funding;
    pub mod groups;
    pub mod health;
    pub mod user;
}

pub mod util {
    pub mod connector;
    pub mod crowd_funding_resolve;
    pub mod hash_api_key;
    pub mod paymesh_crowd_funding;
    pub mod starknet;
    pub mod util_types;
    pub mod validate_address;
}

use crate::libs::{config::Env, error::ApiError, redis::RedisPool};

use redis::AsyncCommands;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: RedisPool,
    pub env: Env,
}

impl AppState {
    async fn add_group_address(&self, addr: &str) -> Result<(), ApiError> {
        let mut conn = self.redis.get().await.expect("Error connecting to redis");
        conn.sadd("group_funding_address", addr).await.map_err(|e| {
            tracing::error!("Error adding group address to redis: {:?}", e);
            ApiError::Internal("Error adding group address to redis")
        })
    }
    async fn has_group_address(&self, addr: &str) -> Result<bool, ApiError> {
        let mut conn = self.redis.get().await.expect("Error connecting to redis");
        conn.sismember("group_funding_address", addr)
            .await
            .map_err(|e| {
                tracing::error!("Error checking group address in redis: {:?}", e);
                ApiError::Internal("Error checking group address in redis")
            })
    }

    async fn get_all_group_addresses(&self) -> Result<Vec<String>, ApiError> {
        let mut conn = self.redis.get().await.expect("Error connecting to redis");
        let addresses: Vec<String> =
            conn.smembers("group_funding_addresses")
                .await
                .map_err(|e| {
                    tracing::error!("Error getting group addresses from redis: {:?}", e);
                    ApiError::Internal("Error getting group addresses from redis")
                })?;
        Ok(addresses)
    }

    async fn add_crowd_funding_address(&self, addr: &str) -> Result<(), ApiError> {
        let mut conn = self.redis.get().await.expect("Error connecting to redis");
        conn.sadd("crowd_funding_address", addr).await.map_err(|e| {
            tracing::error!("Error adding crowd funding address to redis: {:?}", e);
            ApiError::Internal("Error adding crowd funding address to redis")
        })
    }
    async fn _has_crowd_funding_address(&self, addr: &str) -> Result<bool, ApiError> {
        let mut conn = self.redis.get().await.expect("Error connecting to redis");
        conn.sismember("crowd_funding_address", addr)
            .await
            .map_err(|e| {
                tracing::error!("Error checking crowd funding address in redis: {:?}", e);
                ApiError::Internal("Error checking crowd funding address in redis")
            })
    }

    async fn get_all_crowd_funding_addresses(&self) -> Result<Vec<String>, ApiError> {
        let mut conn = self.redis.get().await.expect("Error connecting to redis");
        let addresses: Vec<String> =
            conn.smembers("crowd_funding_addresses")
                .await
                .map_err(|e| {
                    tracing::error!("Error getting crowd funding addresses from redis: {:?}", e);
                    ApiError::Internal("Error getting crowd funding addresses from redis")
                })?;
        Ok(addresses)
    }
}
