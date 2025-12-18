use argon2::PasswordHasher;
use argon2::{Argon2, password_hash};
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::time::Duration;
#[derive(Clone)]
pub struct Db {
    pub pool: PgPool,
}

impl Db {
    pub async fn new() -> Result<Self, String> {
        let db_connection_str =
            std::env::var("DATABASE_URL").map_err(|_| "DATABASE_URL not set".to_string())?;

        let pool = PgPoolOptions::new()
            .max_connections(100)
            .acquire_timeout(Duration::from_secs(3))
            .connect(&db_connection_str)
            .await
            .expect("can't connect to database from provided DATABASE_URL");

        Ok(Self { pool })
    }

    pub async fn run_migrations(&self) -> Result<(), String> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(|e| format!("could not run migrations {} ", e))?;
        Ok(())
    }

    pub async fn create_genesis_admin(&self) -> Result<(), String> {
        let admin_email = std::env::var("GENESIS_ADMIN_EMAIL")
            .map_err(|_| format!("GENESIS_ADMIN_EMAIL not set"))?;
        let admin_password = std::env::var("GENESIS_ADMIN_PASSWORD")
            .map_err(|_| format!("GENESIS_ADMIN_PASSWORD not set"))?;

        let user_exists: Option<bool> = sqlx::query_scalar!(
            "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as \"exists!\"",
            admin_email
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| format!("could not check if user exists {} ", e))?;

        if user_exists.unwrap_or(false) {
            println!("Genesis admin already exists");
            return Ok(());
        }

        let salt = password_hash::SaltString::generate(&mut password_hash::rand_core::OsRng);
        let hashed_password = Argon2::default()
            .hash_password(admin_password.as_bytes(), &salt)
            .map_err(|e| {
                tracing::error!("error while hashing {}", e);
                "Error while hashing password"
            })
            .map(|hash| hash.to_string())?;

        sqlx::query!(
            "INSERT INTO users (email, password, role) VALUES ($1, $2, 'admin')",
            admin_email,
            hashed_password
        )
        .execute(&self.pool)
        .await
        .map_err(|e| format!("could not create user {} ", e))?;

        println!("Genesis admin created with email: {}", admin_email);
        Ok(())
    }

    pub async fn health_check(&self) -> bool {
        sqlx::query("SELECT 1 as one")
            .fetch_one(&self.pool)
            .await
            .is_ok()
    }
}
