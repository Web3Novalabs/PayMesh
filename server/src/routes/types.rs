use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct PaymeshGroup {
    pub group_address: String,
    pub usage_remaining: String,
}

#[derive(Debug, Deserialize)]
pub struct GetGroupDetailsRequest {
    pub group_address: String,
}

#[derive(Debug, Serialize)]
pub struct GetGroupDetailsResponse {
    pub group_address: String,
    pub usage_remaining: bigdecimal::BigDecimal,
    pub created_at: time::OffsetDateTime,
    pub updated_at: Option<time::OffsetDateTime>,
}
