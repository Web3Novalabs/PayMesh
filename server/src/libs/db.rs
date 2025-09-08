use std::time::Duration;

use anyhow::Result;
use sqlx::{PgPool, postgres::PgPoolOptions};

#[derive(Clone)]
pub struct Db {
    pub pool: PgPool,
}

impl Db {
    pub async fn new() -> Result<Self> {
        let db_connection_str =
            std::env::var("DATABASE_URL").map_err(|_| anyhow::anyhow!("DATABASE_URL not set"))?;

        let pool = PgPoolOptions::new()
            .max_connections(100)
            .acquire_timeout(Duration::from_secs(3))
            .connect(&db_connection_str)
            .await
            .expect("can't connect to database");

        Ok(Self { pool })
    }

    pub async fn run_migrations(&self) -> Result<()> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(|e| anyhow::anyhow!("could not run migrations {} ", e))?;
        Ok(())
    }

    pub async fn health_check(&self) -> bool {
        sqlx::query("SELECT 1 as one")
            .fetch_one(&self.pool)
            .await
            .is_ok()
    }
}
