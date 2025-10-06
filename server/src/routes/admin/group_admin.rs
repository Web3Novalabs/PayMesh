use axum::{extract::State, Json};
use bigdecimal::BigDecimal;

use crate::{libs::error::ApiError, routes::admin::admin_types::{GroupsMetricsResponse, PaymentsTotalsResponse}, AppState};

// Get all groups metrics with token shares
pub async fn get_groups_metrics(
    State(state): State<AppState>,
) -> Result<Json<Vec<GroupsMetricsResponse>>, ApiError> {
    let metrics = sqlx::query!(
        r#"
        SELECT 
            g.group_address,
            MAX(CASE WHEN gth.token_symbol = 'USDC' THEN gth.amount::text END) as share_usdc,
            MAX(CASE WHEN gth.token_symbol = 'USDT' THEN gth.amount::text END) as share_usdt,
            MAX(CASE WHEN gth.token_symbol = 'ETH' THEN gth.amount::text END) as share_eth,
            MAX(CASE WHEN gth.token_symbol = 'STRK' THEN gth.amount::text END) as share_strk,
            MAX(CASE WHEN gth.token_symbol = 'WBTC' THEN gth.amount::text END) as share_wbtc
        FROM groups g
        LEFT JOIN group_token_history gth ON g.group_address = gth.group_address
        GROUP BY g.group_address
        ORDER BY g.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching group metrics: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    let response: Vec<GroupsMetricsResponse> = metrics
        .into_iter()
        .map(|row| GroupsMetricsResponse {
            group_address: row.group_address,
            share_usdc: row.share_usdc,
            share_usdt: row.share_usdt,
            share_eth: row.share_eth,
            share_strk: row.share_strk,
            share_wbtc: row.share_wbtc,
        })
        .collect();

    Ok(Json(response))
}



pub async fn get_payments_totals(
    State(state): State<AppState>,
) -> Result<Json<PaymentsTotalsResponse>, ApiError> {
    let totals = sqlx::query!(
        r#"
        SELECT 
            COUNT(DISTINCT p.group_address) as total_groups,
            COUNT(p.tx_hash) as total_payments,
            COALESCE(SUM(CASE WHEN p.token_address = '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8' THEN p.amount END), 0) as total_usdc_paid,
            COALESCE(SUM(CASE WHEN p.token_address = '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8' THEN p.amount END), 0) as total_usdt_paid,
            COALESCE(SUM(CASE WHEN p.token_address = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' THEN p.amount END), 0) as total_eth_paid,
            COALESCE(SUM(CASE WHEN p.token_address = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' THEN p.amount END), 0) as total_strk_paid
        FROM payments p
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching payment totals: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    let response = PaymentsTotalsResponse {
        total_groups: totals.total_groups.unwrap_or(0),
        total_payments: totals.total_payments.unwrap_or(0),
        total_usdc_paid: totals
            .total_usdc_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_usdt_paid: totals
            .total_usdt_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_eth_paid: totals
            .total_eth_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_strk_paid: totals
            .total_strk_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
    };

    Ok(Json(response))
}


