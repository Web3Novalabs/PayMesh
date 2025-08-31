use server::{
    AppState,
    libs::{db::Db, logging::init_tracing},
    router,
};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    init_tracing();

    tracing::debug!("Initializing db");
    let db = Db::new().await.expect("Failed to initialize DB");

    let config = AppState {
        db: db.pool.clone(),
    };

    tracing::debug!("Running Migrations");
    db.run_migrations().await.expect("Failed to run migrations");

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());

    let router = router(config);

    axum::serve(listener, router)
        .await
        .expect("Failed to start server")
}
