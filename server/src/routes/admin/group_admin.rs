use axum::{Json, extract::State};
use bigdecimal::BigDecimal;

use crate::{
    AppState,
    libs::{error::ApiError, utopia::ADMIN_TAG},
    routes::admin::admin_types::{
        CrowdfundingPayoutRecord, CrowdfundingPayoutTimelineResponse, GroupPayoutRecord,
        GroupPayoutTimelineResponse, GroupsMetricsResponse, PaymentsTotalsResponse, PayoutRecord,
        PayoutTimelineResponse,
    },
};

// Get all groups metrics with token shares
#[utoipa::path(
    method(get),
    path = "/history",
    responses(
        (status = OK, description = "Success", body = Vec<GroupsMetricsResponse>),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch groups metrics", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
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

#[utoipa::path(
    method(get),
    path = "/transfer_metrics",
    responses(
        (status = OK, description = "Success", body = PaymentsTotalsResponse),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch payments totals", body = ApiError),
    ),
    tag = ADMIN_TAG,
)]
pub async fn get_payments_totals(
    State(state): State<AppState>,
) -> Result<Json<PaymentsTotalsResponse>, ApiError> {
    // Get group payment totals from raw payments logs
    let group_totals = sqlx::query!(
        r#"
        SELECT 
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8') THEN amount END), 0) as total_usdc_paid,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8') THEN amount END), 0) as total_usdt_paid,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7') THEN amount END), 0) as total_eth_paid,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d') THEN amount END), 0) as total_strk_paid,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac') THEN amount END), 0) as total_wbtc_paid
        FROM payments
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching group totals: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Get crowdfunding payout totals from raw withdrawals logs
    let pool_totals = sqlx::query!(
        r#"
        SELECT 
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8') THEN amount END), 0) as total_usdc_pooled,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8') THEN amount END), 0) as total_usdt_pooled,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7') THEN amount END), 0) as total_eth_pooled,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d') THEN amount END), 0) as total_strk_pooled,
            COALESCE(SUM(CASE WHEN LOWER(token_address) = LOWER('0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac') THEN amount END), 0) as total_wbtc_pooled
        FROM withdrawals
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching pool totals: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Get counts
    let counts = sqlx::query!(
        r#"
        SELECT 
            (SELECT COUNT(DISTINCT group_address) FROM groups) as total_groups,
            (SELECT COUNT(*) FROM payments) as total_payments,
            (SELECT COUNT(DISTINCT id) FROM crowd_funding) as total_pools,
            (SELECT COUNT(*) FROM withdrawals) as total_withdrawals
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching counts: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Calculate combined totals
    let total_usdc_combined = group_totals
        .total_usdc_paid
        .clone()
        .unwrap_or(BigDecimal::from(0))
        + pool_totals
            .total_usdc_pooled
            .clone()
            .unwrap_or(BigDecimal::from(0));
    let total_usdt_combined = group_totals
        .total_usdt_paid
        .clone()
        .unwrap_or(BigDecimal::from(0))
        + pool_totals
            .total_usdt_pooled
            .clone()
            .unwrap_or(BigDecimal::from(0));
    let total_eth_combined = group_totals
        .total_eth_paid
        .clone()
        .unwrap_or(BigDecimal::from(0))
        + pool_totals
            .total_eth_pooled
            .clone()
            .unwrap_or(BigDecimal::from(0));
    let total_strk_combined = group_totals
        .total_strk_paid
        .clone()
        .unwrap_or(BigDecimal::from(0))
        + pool_totals
            .total_strk_pooled
            .clone()
            .unwrap_or(BigDecimal::from(0));
    let total_wbtc_combined = group_totals
        .total_wbtc_paid
        .clone()
        .unwrap_or(BigDecimal::from(0))
        + pool_totals
            .total_wbtc_pooled
            .clone()
            .unwrap_or(BigDecimal::from(0));

    let response = PaymentsTotalsResponse {
        total_groups: counts.total_groups.unwrap_or(0),
        total_payments: counts.total_payments.unwrap_or(0),
        total_crowdfunding_pools: counts.total_pools.unwrap_or(0),
        total_crowdfunding_withdrawals: counts.total_withdrawals.unwrap_or(0),

        // Group totals
        total_usdc_paid: group_totals
            .total_usdc_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_usdt_paid: group_totals
            .total_usdt_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_eth_paid: group_totals
            .total_eth_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_strk_paid: group_totals
            .total_strk_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_wbtc_paid: group_totals
            .total_wbtc_paid
            .unwrap_or(BigDecimal::from(0))
            .to_string(),

        // Pool totals
        total_usdc_pooled: pool_totals
            .total_usdc_pooled
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_usdt_pooled: pool_totals
            .total_usdt_pooled
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_eth_pooled: pool_totals
            .total_eth_pooled
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_strk_pooled: pool_totals
            .total_strk_pooled
            .unwrap_or(BigDecimal::from(0))
            .to_string(),
        total_wbtc_pooled: pool_totals
            .total_wbtc_pooled
            .unwrap_or(BigDecimal::from(0))
            .to_string(),

        // Combined totals
        total_usdc_combined: total_usdc_combined.to_string(),
        total_usdt_combined: total_usdt_combined.to_string(),
        total_eth_combined: total_eth_combined.to_string(),
        total_strk_combined: total_strk_combined.to_string(),
        total_wbtc_combined: total_wbtc_combined.to_string(),
    };

    Ok(Json(response))
}

// Combined payout timeline (groups + crowdfunding)
#[utoipa::path(
    method(get),
    path = "/payout_timeline",
    responses(
        (status = OK, description = "Success", body = PayoutTimelineResponse),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch payout timeline", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn get_payout_timeline(
    State(state): State<AppState>,
) -> Result<Json<PayoutTimelineResponse>, ApiError> {
    let payouts = sqlx::query!(
        r#"
        SELECT 
            paid_at::text as "payout_at!",
            'group' as "source!",
            token_address,
            amount::text as "amount!"
        FROM payments
        
        UNION ALL
        
        SELECT 
            created_at::text as "payout_at!",
            'crowdfunding' as "source!",
            token_address,
            amount::text as "amount!"
        FROM withdrawals
        
        ORDER BY 1 DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching payout timeline: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    let response = PayoutTimelineResponse {
        payouts: payouts
            .into_iter()
            .map(|row| PayoutRecord {
                payout_at: row.payout_at,
                source: row.source,
                token_address: row.token_address.unwrap_or_default(),
                amount: row.amount,
            })
            .collect(),
    };

    Ok(Json(response))
}

// Group-specific payout timeline
#[utoipa::path(
    method(get),
    path = "/group_payout_timeline",
    responses(
        (status = OK, description = "Success", body = GroupPayoutTimelineResponse),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch group payout timeline", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn get_group_payout_timeline(
    State(state): State<AppState>,
) -> Result<Json<GroupPayoutTimelineResponse>, ApiError> {
    let payouts = sqlx::query!(
        r#"
        SELECT 
            paid_at::text as "payout_at!",
            group_address,
            token_address,
            amount::text as "amount!",
            tx_hash
        FROM payments
        ORDER BY paid_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching group payout timeline: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    let response = GroupPayoutTimelineResponse {
        payouts: payouts
            .into_iter()
            .map(|row| GroupPayoutRecord {
                payout_at: row.payout_at,
                group_address: row.group_address,
                token_address: row.token_address,
                amount: row.amount,
                tx_hash: row.tx_hash,
            })
            .collect(),
    };

    Ok(Json(response))
}

// Crowdfunding-specific payout timeline
#[utoipa::path(
    method(get),
    path = "/crowdfunding_payout_timeline",
    responses(
        (status = OK, description = "Success", body = CrowdfundingPayoutTimelineResponse),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch crowdfunding payout timeline", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn get_crowdfunding_payout_timeline(
    State(state): State<AppState>,
) -> Result<Json<CrowdfundingPayoutTimelineResponse>, ApiError> {
    let payouts = sqlx::query!(
        r#"
        SELECT 
            w.created_at::text as "payout_at!",
            w.withdrawn_by as "recipient!",
            w.token_address,
            w.amount::text as "amount!",
            w.transaction_hash,
            cf.pool_address,
            cf.name as "pool_name!"
        FROM withdrawals w
        JOIN crowd_funding cf ON w.crowd_funding_id = cf.id
        ORDER BY w.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!(
            "Database error fetching crowdfunding payout timeline: {}",
            e
        );
        ApiError::Internal("Database Error Occurred")
    })?;

    let response = CrowdfundingPayoutTimelineResponse {
        payouts: payouts
            .into_iter()
            .map(|row| CrowdfundingPayoutRecord {
                payout_at: row.payout_at,
                pool_address: row.pool_address,
                pool_name: row.pool_name,
                recipient: row.recipient,
                token_address: row.token_address,
                amount: row.amount,
                transaction_hash: row.transaction_hash,
            })
            .collect(),
    };

    Ok(Json(response))
}
