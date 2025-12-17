use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow, ToSchema)]
pub struct User {
    pub id: String,
    pub email: String,
    pub wallet_address: Option<String>,
    pub role: String,
    pub created_at: String,
}

#[derive(Deserialize, Validate, ToSchema)]
pub struct UserEmailRequest {
    #[validate(email)]
    pub email: String,
}

#[derive(Deserialize, Serialize, ToSchema)]
pub struct OverviewResponse {
    pub total_users: i64,
    pub total_admins: i64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GroupsMetricsResponse {
    pub group_address: String,
    pub share_usdc: Option<String>,
    pub share_usdt: Option<String>,
    pub share_eth: Option<String>,
    pub share_strk: Option<String>,
    pub share_wbtc: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct PaymentsTotalsResponse {
    // Group metrics
    pub total_groups: i64,
    pub total_payments: i64,

    // Crowdfunding metrics
    pub total_crowdfunding_pools: i64,
    pub total_crowdfunding_withdrawals: i64,

    // Per-token breakdowns - Groups
    pub total_usdc_paid: String,
    pub total_usdt_paid: String,
    pub total_eth_paid: String,
    pub total_strk_paid: String,
    pub total_wbtc_paid: String,

    // Per-token breakdowns - Crowdfunding pools
    pub total_usdc_pooled: String,
    pub total_usdt_pooled: String,
    pub total_eth_pooled: String,
    pub total_strk_pooled: String,
    pub total_wbtc_pooled: String,

    // Combined totals
    pub total_usdc_combined: String,
    pub total_usdt_combined: String,
    pub total_eth_combined: String,
    pub total_strk_combined: String,
    pub total_wbtc_combined: String,
}

// Combined payout timeline (groups + crowdfunding)
#[derive(Debug, Serialize, ToSchema)]
pub struct PayoutTimelineResponse {
    pub payouts: Vec<PayoutRecord>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct PayoutRecord {
    pub payout_at: String,
    pub source: String, // "group" | "crowdfunding"
    pub token_address: String,
    pub amount: String,
}

// Group-specific payout timeline
#[derive(Debug, Serialize, ToSchema)]
pub struct GroupPayoutTimelineResponse {
    pub payouts: Vec<GroupPayoutRecord>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GroupPayoutRecord {
    pub payout_at: String,
    pub group_address: String,
    pub token_address: String,
    pub amount: String,
    pub tx_hash: String,
}

// Crowdfunding-specific payout timeline
#[derive(Debug, Serialize, ToSchema)]
pub struct CrowdfundingPayoutTimelineResponse {
    pub payouts: Vec<CrowdfundingPayoutRecord>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct CrowdfundingPayoutRecord {
    pub payout_at: String,
    pub pool_address: String,
    pub pool_name: String,
    pub recipient: String,
    pub token_address: String,
    pub amount: String,
    pub transaction_hash: String,
}
