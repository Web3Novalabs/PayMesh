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
    pub total_groups: i64,
    pub total_payments: i64,
    pub total_usdc_paid: String,
    pub total_usdt_paid: String,
    pub total_eth_paid: String,
    pub total_strk_paid: String,
}
