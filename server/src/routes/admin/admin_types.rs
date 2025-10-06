use validator::Validate;

#[derive(serde::Serialize, serde::Deserialize, Debug, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub wallet_address: Option<String>,
    pub role: String,
    pub created_at: String,
}

#[derive(serde::Deserialize, Validate)]
pub struct UserEmailRequest {
    #[validate(email)]
    pub email: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct OverviewResponse {
    pub total_users: i64,
    pub total_admins: i64,
}
