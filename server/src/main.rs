use server::{AppState, libs::db::Db, router};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let db = Db::new().await.expect("Failed to initialize DB");

    let config = AppState {
        db: db.pool.clone(),
    };

    db.run_migrations().await.expect("Failed to run migrations");

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    let router = router(config);

    axum::serve(listener, router)
        .await
        .expect("Failed to start server")
}

// use std::time::Duration;

// use axum::{
//     Router,
//     http::{
//         HeaderName, HeaderValue, Method, StatusCode,
//         header::{AUTHORIZATION, CONTENT_TYPE},
//     },
//     routing::{get, post},
// };

// mod http;
// mod util;
// use http::request::new;

// use crate::http::request::{create_group, pay};
// use sqlx::postgres::{PgPool, PgPoolOptions};
// use tower_http::cors::CorsLayer;

// #[derive(Clone)]
// pub struct AppState {
//     pub pool: PgPool,
// }

// #[tokio::main]
// async fn main() {
//     // Read (development) Environment Variables.
//     dotenvy::dotenv().ok();
//     let db_connection_str = std::env::var("DATABASE_URL")
//         .unwrap_or_else(|_| "postgres://macbookpro:12345678@localhost:5432/paymesh".to_string());

//     let pool = PgPoolOptions::new()
//         .max_connections(5)
//         .acquire_timeout(Duration::from_secs(3))
//         .connect(&db_connection_str)
//         .await
//         .expect("can't connect to database");

//     sqlx::migrate!("./migrations")
//         .run(&pool)
//         .await
//         .expect("could not run migrations");

//     let app_state = AppState { pool };

//     let allowed_origins = {
//         let mut origins = vec![
//             HeaderValue::from_str("https://paymesh.app")
//                 .map_err(|e| eprintln!("Invalid origin: {}", e))
//                 .unwrap_or_else(|_| HeaderValue::from_static("https://paymesh.app")),
//         ];

//         // Only include localhost in development
//         if cfg!(debug_assertions) {
//             origins.push(
//                 HeaderValue::from_str("http://localhost:3000")
//                     .map_err(|e| eprintln!("Invalid localhost origin: {}", e))
//                     .unwrap_or_else(|_| HeaderValue::from_static("http://localhost:3000")),
//             );
//         }
//         origins
//     };

//     let cors = CorsLayer::new()
//         .allow_origin(allowed_origins)
//         .allow_methods([Method::GET, Method::POST])
//         .allow_headers([
//             CONTENT_TYPE,
//             AUTHORIZATION,
//             HeaderName::from_static("x-requested-with"),
//         ])
//         .allow_credentials(true);
//     let allowed_origins = {
//         let mut origins = vec![
//             HeaderValue::from_str("https://paymesh.app")
//                 .map_err(|e| eprintln!("Invalid origin: {}", e))
//                 .unwrap_or_else(|_| HeaderValue::from_static("https://paymesh.app")),
//         ];

//         // Only include localhost in development
//         if cfg!(debug_assertions) {
//             origins.push(
//                 HeaderValue::from_str("http://localhost:3000")
//                     .map_err(|e| eprintln!("Invalid localhost origin: {}", e))
//                     .unwrap_or_else(|_| HeaderValue::from_static("http://localhost:3000")),
//             );
//         }
//         origins
//     };

//     let cors = CorsLayer::new()
//         .allow_origin(allowed_origins)
//         .allow_methods([Method::GET, Method::POST])
//         .allow_headers([
//             CONTENT_TYPE,
//             AUTHORIZATION,
//             HeaderName::from_static("x-requested-with"),
//         ])
//         .allow_credentials(true);

//     // build our application with a route
//     let app = Router::new()
//         .route("/", get(new))
//         .route("/pay_member", post(pay))
//         .route("/create_group", post(create_group))
//         .layer(cors)
//         .fallback(|| async { (StatusCode::UNAUTHORIZED, "UNAUTHORIZED ORIGIN") })
//         .with_state(app_state);

//     let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
//     axum::serve(listener, app).await.unwrap();
// }
