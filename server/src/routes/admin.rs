use utoipa_axum::{router::OpenApiRouter, routes};

use crate::AppState;

pub mod admin_types;
pub mod group_admin;
pub mod user_admin;
pub mod crowd_funding_admin;

pub fn router() -> OpenApiRouter<AppState> {
    let user_admin = OpenApiRouter::new()
        .routes(routes!(user_admin::get_overview))
        .routes(routes!(user_admin::promote_to_admin))
        .routes(routes!(user_admin::demote_from_admin))
        .routes(routes!(user_admin::get_all_users))
        .routes(routes!(user_admin::delete_user));

    let group_admin = OpenApiRouter::new()
        .routes(routes!(group_admin::get_groups_metrics))
        .routes(routes!(group_admin::get_payments_totals));

    let crowd_funding_admin = OpenApiRouter::new()
        .routes(routes!(crowd_funding_admin::add_token))
        .routes(routes!(crowd_funding_admin::remove_token))
        .routes(routes!(crowd_funding_admin::set_active_token))
        .routes(routes!(crowd_funding_admin::get_active_token));    
    
    let admin_route = OpenApiRouter::new()
        .nest("/user_admin", user_admin)
        .nest("/group_admin", group_admin)
        .nest("/crowd_funding_admin", crowd_funding_admin);

    admin_route
}
