use axum::routing::{get, post};
use utoipa_axum::router::OpenApiRouter;
mod group;
mod groups_types;
mod pay_group;
mod subscription_topped;
use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    let group: OpenApiRouter<AppState> = OpenApiRouter::new()
        .route("/group", get(group::get_group).post(group::create_group))
        .route("/pay_group", post(pay_group::pay_group))
        .route(
            "/subscription_topped",
            post(subscription_topped::subscription_topped),
        )
        .route("/all_groups", get(group::get_groups))
        .route(
            "/store_payment_distribution_history",
            post(pay_group::store_payment_distribution_history),
        )
        .route("/all_group_addresses", get(group::get_all_group_addresses));

    group
}
