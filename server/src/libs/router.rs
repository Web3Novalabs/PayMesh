use std::time::Duration;

use axum::{
    Router,
    http::{
        HeaderName, Method, StatusCode,
        header::{AUTHORIZATION, CONTENT_TYPE},
    },
    routing::get,
};
use axum_prometheus::PrometheusMetricLayer;
use tower_http::{cors::CorsLayer, timeout::TimeoutLayer, trace::TraceLayer};
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;
use utoipa_scalar::{Scalar, Servable};
use utoipa_swagger_ui::SwaggerUi;

use crate::{
    AppState,
    libs::utopia::ApiDoc,
    routes::{self, health},
};

pub fn router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            HeaderName::from_static("x-requested-with"),
            HeaderName::from_static("paymesh-api-key"),
        ]);

    let (prometheus_layer, metric_handle) = PrometheusMetricLayer::pair();

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .routes(routes!(health::health_check))
        .nest("/users", routes::user::router())
        .nest("/groups", routes::groups::router())
        .nest("/admin", routes::admin::router())
        .nest("/crowdfunding", routes::crowd_funding::router())
        .route("/metrics", get(|| async move { metric_handle.render() }))
        .with_state(state)
        .layer(prometheus_layer)
        .layer(cors)
        .layer((
            TraceLayer::new_for_http(),
            TimeoutLayer::new(Duration::from_secs(10)),
        ))
        .fallback(|| async { (StatusCode::UNAUTHORIZED, "UNAUTHORIZED ORIGIN") })
        .split_for_parts();

    let router = router
        .merge(SwaggerUi::new("/swagger-ui").url("/apidoc/openapi.json", api.clone()))
        .merge(Scalar::with_url("/scalar", api));

    router
}
