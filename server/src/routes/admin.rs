use axum::{
    Router,
    routing::{delete, get, patch},
};

use crate::AppState;

pub mod admin_types;
pub mod group_admin;
pub mod user_admin;

pub fn router() -> Router<AppState> {
    let user_admin = Router::new()
        .route("/overview", get(user_admin::get_overview))
        .route("/promote_to_admin", patch(user_admin::promote_to_admin))
        .route("/demote_from_admin", patch(user_admin::demote_from_admin))
        .route("/all_users", get(user_admin::get_all_users))
        .route("/delete_user", delete(user_admin::delete_user));

    let group_admin = Router::new()
        .route("/history", get(group_admin::get_groups_metrics))
        .route("/transfer_metrics", get(group_admin::get_payments_totals))
    ;
    let admin_route = Router::new().nest("/user_admin", user_admin).nest("/group_admin", group_admin);
    admin_route
}
