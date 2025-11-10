use server::{
    AppState,
    libs::{config::Env, db::Db, logging::init_tracing, redis, router::router},
};
use tokio::{net::TcpListener, signal};

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
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Failed to start server")
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
