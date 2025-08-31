pub mod libs {
    pub mod config;
    pub mod db;
    pub mod error;
    pub mod logging;
    pub mod middleware;
}

pub mod routes {
    pub mod group;
    pub mod health;
    pub mod pay_group;
    pub mod types;
}

pub mod util {
    pub mod connector;
}

use axum::{routing::{get, post}, Router};
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

use crate::routes::{group, health, pay_group};

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health::health_check))
        .route("/group", post(group::create_group))
        .route("/pay_group", post(pay_group::pay_group))
        .with_state(state)
}
