use std::error::Error;

use sqlx::types::BigDecimal;

pub async fn create_paymesh_group(
    group_address: String,
    usage_remaining: BigDecimal,
    pool: &sqlx::PgPool,
) -> Result<(), Box<dyn Error>> {
    let query = "INSERT INTO paymesh_group (group_address, usage_remaining) VALUES ($1, $2)";

    sqlx::query(query)
        .bind(group_address)
        .bind(usage_remaining)
        .execute(pool)
        .await?;

    Ok(())
}
