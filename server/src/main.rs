use server::{
    AppState,
    libs::{cache::init_cache, db::Db, logging::init_tracing},
    router,
};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    init_tracing();

    tracing::debug!("Initializing db");
    let db = Db::new().await.expect("Failed to initialize DB");

    let cache = init_cache(&db.pool.clone()).await;

    let config = AppState {
        db: db.pool.clone(),
        cache,
    };

    {
        let cache = config.cache.clone();
        let db = config.db.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(300));
            loop {
                interval.tick().await;
                let new_cache = init_cache(&db).await;
                *cache.write().await = new_cache.read().await.clone();
            }
        });
        tracing::info!("Cache Refreshed");
    }

    tracing::debug!("Running Migrations");
    db.run_migrations().await.expect("Failed to run migrations");

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());

    let router = router(config);

    axum::serve(listener, router)
        .await
        .expect("Failed to start server")
}
