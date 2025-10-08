use utoipa_axum::{router::OpenApiRouter, routes};

use crate::AppState;

pub mod admin_types;
pub mod group_admin;
pub mod user_admin;

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

    let admin_route = OpenApiRouter::new()
        .nest("/user_admin", user_admin)
        .nest("/group_admin", group_admin);

    admin_route
}
