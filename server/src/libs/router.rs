use axum::{
    Router,
    http::{
        HeaderName, Method, StatusCode,
        header::{AUTHORIZATION, CONTENT_TYPE},
    },
    routing::get,
};
use tower_http::cors::CorsLayer;

use crate::{
    AppState,
    routes::{self, health},
};

pub fn router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            HeaderName::from_static("x-requested-with"),
        ]);

    Router::new()
        .route("/health", get(health::health_check))
        .nest("/users", routes::user::router())
        .nest("/groups", routes::groups::router())
        .nest("/admin", routes::admin::router())
        // .nest("/crowdfunding", handlers::crowdfunding::router())
        .with_state(state)
        .layer(cors)
        .fallback(|| async { (StatusCode::UNAUTHORIZED, "UNAUTHORIZED ORIGIN") })
}
