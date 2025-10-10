use utoipa_axum::{router::OpenApiRouter, routes};
mod group;
mod groups_types;
mod pay_group;
mod subscription_topped;
use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    let group: OpenApiRouter<AppState> = OpenApiRouter::new()
        .routes(routes!(group::get_group, group::create_group))
        .routes(routes!(pay_group::pay_group))
        .routes(routes!(subscription_topped::subscription_topped))
        .routes(routes!(group::get_groups))
        .routes(routes!(pay_group::store_payment_distribution_history))
        .routes(routes!(group::get_all_group_addresses));

    group
}
