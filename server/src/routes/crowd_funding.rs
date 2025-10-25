use utoipa_axum::{router::OpenApiRouter, routes};

use crate::AppState;

mod crowd_funding_routes;
mod crowd_funding_types;

pub fn router() -> OpenApiRouter<AppState> {
    let group: OpenApiRouter<AppState> = OpenApiRouter::new()
        .routes(routes!(crowd_funding_routes::create_crowd_funding))
        .routes(routes!(crowd_funding_routes::get_crowd_funding))
        .routes(routes!(crowd_funding_routes::resolve_crowd_funding))
        .routes(routes!(crowd_funding_routes::donate_to_crowd_funding))
        .routes(routes!(
            crowd_funding_routes::get_all_crowd_funding_addresses
        ))
        .routes(routes!(crowd_funding_routes::update_crowd_funding));
    // .routes(routes!(crowd_funding_routes::get_crowd_funding_by_address))
    // .routes(routes!(crowd_funding_routes::get_crowd_funding_by_id))

    group
}
