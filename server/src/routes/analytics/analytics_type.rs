use bigdecimal::BigDecimal;
use serde::{Deserialize, Serialize};
use sqlx::types::chrono;
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Serialize, ToSchema)]
pub struct VolumeDetails {}

#[derive(Debug, Serialize, ToSchema)]
pub struct VolumeRecord {}

#[derive(Debug, Serialize, ToSchema)]
pub struct VolumeParams {
    token: String,
    perios: String,
    total_inflow: String,
    total_outflow: String,
    net_volume: String,
}

#[derive(Debug, Serialize, ToSchema, Deserialize, IntoParams)]
pub struct VolumeRequest {
    pub from: Option<String>,
    pub to: Option<String>,
    pub token: Option<String>,
}

pub type AnalyticsRow = (String, BigDecimal, chrono::DateTime<chrono::Utc>, String);

#[derive(Debug, Serialize, ToSchema)]
pub struct AnalyticsItem {
    pub token_address: String,
    pub token_amount: String,
    pub time: String,
    pub source: String,
}
