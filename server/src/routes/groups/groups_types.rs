use crate::util::validate_address::validate_address;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;
use validator::Validate;
#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct GroupRequest {
    #[validate(custom(function = "validate_address"))]
    pub group_address: String,
    #[validate(length(min = 2, max = 100))]
    pub group_name: String,
    #[validate(custom(function = "validate_address"))]
    pub created_by: String,
    pub usage_remaining: u32,
    pub members: Vec<GroupMembersRequest>,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct GroupMembersRequest {
    #[validate(custom(function = "validate_address"))]
    pub addr: String,
    #[validate(range(min = 1, max = 100))]
    pub percentage: u8,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GetBasicGroupDetailsResponse {
    pub group_address: String,
    pub group_name: String,
    pub created_by: String,
    pub usage_remaining: String,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub members: Vec<GroupMemberResponse>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GetGroupDetailsResponse {
    pub group_address: String,
    pub group_name: String,
    pub created_by: String,
    pub usage_remaining: String,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub members: Vec<GroupMemberResponse>,
    pub history: Vec<GroupPaymentHistoryResponse>,
}

#[derive(Debug, Serialize, ToSchema, Deserialize)]
pub struct GroupPaymentHistoryResponse {
    pub total_amount_paid: String,
    pub token_address: String,
    pub tx_hash: String,
    pub paid_at: String,
    pub members: Vec<GroupMemberPaymentResponse>,
}

#[derive(Debug, Serialize, ToSchema, Deserialize)]
pub struct GroupMemberPaymentResponse {
    pub member_address: String,
    pub member_amount: String,
    pub member_percentage: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct PayGroupRequest {
    #[validate(custom(function = "validate_address"))]
    pub token_address: String,
    #[validate(custom(function = "validate_address"))]
    pub tx_hash: String,
    pub usage_remaining: u32,
    pub token_amount: String,
    pub members: Vec<PayGroupMembersRequest>,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct CallContractRequest {
    #[validate(custom(function = "validate_address"))]
    pub from_address: String,
    #[validate(custom(function = "validate_address"))]
    pub tx_hash: String,
    pub token_amount: String,
    pub token_address: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct SubscriptionToppedReq {
    pub usage_count: u32,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct PayGroupMembersRequest {
    #[validate(custom(function = "validate_address"))]
    pub member_address: String,
    pub member_amount: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GroupsResponse {
    pub group_address: String,
    pub group_name: String,
    pub created_by: String,
    pub usage_remaining: String,
    pub created_at: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GroupFullDetailResponse {
    pub group_data: GetBasicGroupDetailsResponse,
    pub share_usdc: Option<String>,
    pub share_usdt: Option<String>,
    pub share_eth: Option<String>,
    pub share_strk: Option<String>,
}

#[derive(Debug, FromRow, ToSchema)]
pub struct GroupTokenTransfer {
    pub group_address: String,
    pub token_symbol: String,
    pub amount: String,
}
#[derive(Debug, FromRow, ToSchema)]
pub struct GroupMemberWithAddress {
    pub group_address: String,
    pub member_address: String,
    pub member_percentage: String,
    pub is_active: bool,
    pub added_at: String,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct GroupMemberResponse {
    pub member_address: String,
    pub member_percentage: String,
    pub is_active: bool,
    pub added_at: String,
}

#[derive(Debug, Serialize)]
pub struct GetGroupUsageRemaining {
    pub usage_remaining: bigdecimal::BigDecimal,
}
