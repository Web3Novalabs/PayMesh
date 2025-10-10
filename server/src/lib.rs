pub mod libs {
    pub mod auth;
    pub mod cache;
    pub mod config;
    pub mod db;
    pub mod error;
    pub mod logging;
    pub mod middleware;
    pub mod router;
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
    pub mod starknet;
    pub mod util_types;
    pub mod validate_address;
}

use crate::libs::{cache::Cache, config::Env};

use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub cache: Cache,
    pub env: Env,
}
