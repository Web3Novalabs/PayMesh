use utoipa_axum::{router::OpenApiRouter, routes};

use crate::AppState;

pub mod analytics_admin_routes;
pub mod analytics_type;
pub mod analytics_user_routes;
pub fn router() -> OpenApiRouter<AppState> {
    let admin_analytics = OpenApiRouter::new().routes(routes!(analytics_admin_routes::get_volume));

    OpenApiRouter::new().nest("/admin", admin_analytics)
}
