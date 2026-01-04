use axum::{
    Json,
    extract::{Query, State},
};
use bigdecimal::BigDecimal;

use crate::{
    AppState,
    libs::{
        auth::AdminUser,
        error::{ApiError, map_sqlx_error},
        utopia::ADMIN_TAG,
    },
    routes::analytics::analytics_type::{
        AnalyticsItem, AnalyticsRow, FlowDirection, VolumeDetails, VolumeRequest, VolumeSource,
    },
    util::validate_address::validate_date,
};
use sqlx::Arguments;
#[axum::debug_handler]
#[utoipa::path(
    method(get),
    description = "Get volume processed",
    path = "/volume",
    responses(
        (status = OK, description = "Success", body = VolumeDetails),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to get crowd funding", body = ApiError),
        (status = NOT_FOUND, description = "Crowd Funding Not Found", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Crowd Funding Address", body = ApiError),
    ),
    params(
        VolumeRequest,
    ),
    tag = ADMIN_TAG,
    security(
        ("bearer" = [])
    )
)]
pub async fn get_volume(
    State(state): State<AppState>,
    // AdminUser(_hello): AdminUser,
    Query(params): Query<VolumeRequest>,
) -> Result<Json<Vec<AnalyticsItem>>, ApiError> {
    let volume_source_payments_group_inflow = "
                SELECT token_address, token_amount, created_at::timestamptz AS time, 'payment_group_in' AS source
            FROM group_tx_hashes";

    let volume_source_payments_group_outflow = "
            SELECT token_address, amount AS token_amount, paid_at::timestamptz AS time, 'payment_group_out' AS source
            FROM payments
    ";

    let volume_source_crowdfunding_inflow = "
                SELECT token_address, amount AS token_amount, created_at::timestamptz AS time, 'crowdfunding_in' AS source
            FROM donations
    ";
    let volume_source_crowdfunding_outflow = "
                       SELECT token_address, amount AS token_amount, created_at::timestamptz AS time, 'crowdfunding_out' AS source
            FROM withdrawals
    ";

    let union_all = " UNION ALL ";

    let volume_source = params.sources.clone().unwrap_or(VolumeSource::Both);

    let flow_direction = params.direction.clone().unwrap_or(FlowDirection::Both);

    let mut base_sql_command = String::from(
        "SELECT *
        FROM (

        ",
    );

    let mut _i: i32 = 1;
    let mut args: sqlx::postgres::PgArguments = sqlx::postgres::PgArguments::default();

    match volume_source {
        VolumeSource::PaymentGroup => match flow_direction {
            FlowDirection::Inflow => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
            }
            FlowDirection::Outflow => {
                base_sql_command.push_str(volume_source_payments_group_outflow);
            }
            FlowDirection::Both => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_payments_group_outflow);
            }
        },
        VolumeSource::Crowdfunding => match flow_direction {
            FlowDirection::Inflow => {
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
            }
            FlowDirection::Outflow => {
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
            FlowDirection::Both => {
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
        },
        VolumeSource::Both => match flow_direction {
            FlowDirection::Inflow => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
            }
            FlowDirection::Outflow => {
                base_sql_command.push_str(volume_source_payments_group_outflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
            FlowDirection::Both => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_payments_group_outflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
        },
    }

    base_sql_command.push_str(") AS all_tx");

    if let (Some(from), Some(to)) = (params.from.as_ref(), params.to.as_ref()) {
        validate_date(&from)?;
        validate_date(&to)?;
        base_sql_command.push_str(&format!(
            " WHERE time BETWEEN ${}::timestamptz AND ${}::timestamptz",
            _i,
            _i + 1
        ));
        args.add(from.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        args.add(to.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 2;
    } else if let Some(from) = params.from.as_ref() {
        validate_date(&from)?;
        base_sql_command.push_str(&format!(" WHERE time >= ${}::timestamptz", _i));
        args.add(from.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 1;
    } else if let Some(to) = params.to.as_ref() {
        validate_date(&to)?;
        base_sql_command.push_str(&format!(" WHERE time <= ${}::timestamptz", _i));
        args.add(to.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 1;
    }

    if let Some(token) = params.token.as_ref() {
        if _i == 1 {
            base_sql_command.push_str(&format!(" WHERE token_address = ${}", _i));
        } else {
            base_sql_command.push_str(&format!(" AND token_address = ${}", _i));
        }
        args.add(token.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 1;
    }
    base_sql_command.push_str(" ORDER BY time DESC;");

    // println!("params: {:?}", &params);
    // println!("SQL COMMAND: {}", &base_sql_command);
    // println!("ARGS: {:?}", &args);

    let rows: Vec<AnalyticsRow> = sqlx::query_as_with(&base_sql_command, args)
        .fetch_all(&state.db)
        .await
        .map_err(|e| {
            dbg!(&e);
            map_sqlx_error(&e)
        })?;

    let items: Vec<AnalyticsItem> = rows
        .into_iter()
        .map(
            |(token_address, token_amount, time, source)| AnalyticsItem {
                token_address: token_address,
                token_amount: BigDecimal::to_string(&token_amount),
                time: time.to_rfc3339(),
                source: source,
            },
        )
        .collect();

    Ok(Json(items))
}
