pub mod libs {
    pub mod auth;
    pub mod cache;
    pub mod config;
    pub mod db;
    pub mod error;
    pub mod logging;
    pub mod middleware;
}

pub mod routes {
    pub mod admin;
    pub mod group;
    pub mod health;
    pub mod pay_group;
    pub mod subscription_topped;
    pub mod types;
}

pub mod util {
    pub mod connector;
    pub mod starknet;
    pub mod util_types;
}

use crate::{
    libs::{auth::auth, cache::Cache, config::Env},
    routes::admin,
};
use axum::{
    Router,
    http::{
        HeaderName, Method, StatusCode,
        header::{AUTHORIZATION, CONTENT_TYPE},
    },
    middleware,
    routing::{get, post},
};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub cache: Cache,
    pub env: Env,
}

use crate::routes::{group, health, pay_group, subscription_topped};

pub fn router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            HeaderName::from_static("x-requested-with"),
        ]);

    // admin routes
    let admin_routes = Router::new()
        .route("/all_groups", get(group::get_groups))
        .route("/history", get(group::get_groups_metrics))
        .route("/transfer_metrics", get(group::get_payments_totals));

    // indexer routes
    let indexer_routes = Router::new()
        .route(
            "/store_payment_distribution_history",
            post(pay_group::store_payment_distribution_history),
        )
        .route("/pay_group", post(pay_group::pay_group))
        .route(
            "/subscription_topped",
            post(subscription_topped::subscription_topped),
        )
        .route("/group", post(group::create_group))
        .route("/all_group_addresses", get(group::get_all_group_addresses));

    // main router
    Router::new()
        .route("/health", get(health::health_check))
         .route("/auth/register", post(admin::register_user_handler))
        .route("/auth/login", post(admin::login_user_handler))
        .route(
            "/logout",
            get(admin::logout_handler)
                .route_layer(middleware::from_fn_with_state(state.clone(), auth)),
        )
        .route(
            "/me",
            get(admin::get_me_handler)
                .route_layer(middleware::from_fn_with_state(state.clone(), auth)),
        )
        // nested routes for admin and indexer functions
        .nest("/indexer", indexer_routes)
        .nest("/admin", admin_routes)
        .with_state(state)
        .layer(cors)
        .fallback(|| async { (StatusCode::UNAUTHORIZED, "UNAUTHORIZED ORIGIN") })
}
