use utoipa::{
    Modify, OpenApi,
    openapi::security::{ApiKey, ApiKeyValue, Http, HttpAuthScheme, SecurityScheme},
};

// tags
pub const USER_TAG: &str = "user";
pub const ADMIN_TAG: &str = "admin";
pub const GROUP_TAG: &str = "group";
pub const CROWD_FUNDING_TAG: &str = "crowd_funding";
pub const CROWD_FUNDING_ADMIN_TAG: &str = "crowd_funding_admin";

#[derive(OpenApi)]
#[openapi(
    modifiers(&SecurityAddon),
    tags(
        (name = USER_TAG, description = "User API endpoints"),
        (name = ADMIN_TAG, description = "Admin API endpoints"),
        (name = GROUP_TAG, description = "Group API endpoints"),
        (name = CROWD_FUNDING_TAG, description = "Crowd Funding API endpoints"),
        (name = CROWD_FUNDING_ADMIN_TAG, description = "Crowd Funding Admin API endpoints"),
    )
)]
pub struct ApiDoc;

pub struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "api_key",
                SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new("paymesh_apikey"))),
            );
            components.add_security_scheme(
                "bearer",
                SecurityScheme::Http(Http::new(HttpAuthScheme::Bearer)),
            )
        }
    }
}
