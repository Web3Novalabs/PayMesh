use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PaymeshGroup {
    pub group_address: String,
    pub usage_remaining: String,
}
