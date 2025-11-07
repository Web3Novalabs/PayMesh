use server::{
    AppState,
    libs::{config::Env, db::Db, logging::init_tracing, redis, router::router},
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

    tracing::debug!("Initializing redis");
    let redis_pool = redis::init_redis(&db.pool.clone()).await;

    let config = AppState {
        db: db.pool.clone(),
        redis: redis_pool,
        env,
    };

    {
        let redis_pool = config.redis.clone();
        let db = config.db.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(300));
            loop {
                tracing::info!("Refreshing redis cache");
                redis::refresh_cache(&db, &redis_pool).await;
                interval.tick().await;
            }
        });
        tracing::info!("Started cache refresher task");
    }

    tracing::debug!("Running Migrations");
    db.run_migrations().await.expect("Failed to run migrations");

    tracing::debug!("Creating genesis admin");
    db.create_genesis_admin()
        .await
        .expect("Failed to create genesis admin");

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());

    let router = router(config);

    axum::serve(listener, router)
        .await
        .expect("Failed to start server")
}
