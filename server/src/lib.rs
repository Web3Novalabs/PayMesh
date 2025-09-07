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
    pub mod starknet;
    pub mod util_types;
}

use axum::{
    Router,
    http::{
        HeaderName, HeaderValue, Method, StatusCode,
        header::{AUTHORIZATION, CONTENT_TYPE},
    },
    routing::{get, post},
};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

use crate::routes::{group, health, pay_group};

pub fn router(state: AppState) -> Router {
    let allowed_origins = {
        let mut origins = vec![
            HeaderValue::from_str("https://paymesh.app")
                .map_err(|e| eprintln!("Invalid origin: {}", e))
                .unwrap_or_else(|_| HeaderValue::from_static("https://paymesh.app")),
            HeaderValue::from_str("http://localhost:3000")
                .unwrap_or_else(|_| HeaderValue::from_static("http://localhost:3000")),
        ];

        if cfg!(debug_assertions) {
            origins.push(
                HeaderValue::from_str("http://localhost:3000")
                    .map_err(|e| eprintln!("Invalid localhost origin: {}", e))
                    .unwrap_or_else(|_| HeaderValue::from_static("http://localhost:3000")),
            );
        }
        origins
    };

    let cors = CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            HeaderName::from_static("x-requested-with"),
        ])
        .allow_credentials(true);

    Router::new()
        .route("/health", get(health::health_check))
        .route("/group", get(group::get_group).post(group::create_group))
        .route("/pay_group", post(pay_group::pay_group))
        .route("/all_groups", get(group::get_groups))
        .route("/history", get(group::get_groups_metrics))
        .route("/transfer_metrics", get(group::get_payments_totals))
        .route(
            "/store_payment_distribution_history",
            post(pay_group::store_payment_distribution_history),
        )
        .with_state(state)
        .layer(cors)
        .fallback(|| async { (StatusCode::UNAUTHORIZED, "UNAUTHORIZED ORIGIN") })
}
