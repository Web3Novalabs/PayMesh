use server::{
    AppState,
    libs::{cache::init_cache, config::Env, db::Db, logging::init_tracing, router::router},
};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    init_tracing();

    tracing::debug!("Initializing env");
    let env = Env::init();

    tracing::debug!("Initializing db");
    let db = Db::new().await.expect("Failed to initialize DB");

    tracing::debug!("Initializing cache");
    let cache = init_cache(&db.pool.clone()).await;

    let config = AppState {
        db: db.pool.clone(),
        cache,
        env,
    };

    {
        let cache = config.cache.clone();
        let db = config.db.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(300));
            loop {
                let new_cache = init_cache(&db).await;
                *cache.write().await = new_cache.read().await.clone();
                interval.tick().await;
            }
        });
        tracing::info!("Cache Refreshed");
    }

    tracing::debug!("Running Migrations");
    db.run_migrations().await.expect("Failed to run migrations");

    tracing::debug!("Creating genesis admin");
    db.create_genesis_admin()
        .await
        .expect("Failed to create genesis admin");

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    tracing::info!("listening on port{}", listener.local_addr().unwrap());

    let router = router(config);

    axum::serve(listener, router)
        .await
        .expect("Failed to start server")
}
