use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::RwLock;

pub type Cache = Arc<RwLock<HashSet<String>>>;

pub async fn init_cache(pool: &sqlx::PgPool) -> Cache {
    let rows: Vec<String> = sqlx::query_scalar("SELECT group_address FROM groups")
        .fetch_all(pool)
        .await
        .expect("Failed to load cache");

    let mut set: HashSet<String> = HashSet::new();
    for group_address in rows {
        set.insert(group_address);
    }

    Arc::new(RwLock::new(set))
}
