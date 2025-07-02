use crate::response::ApiResult;
use axum::{
    extract::{Json as JsonExtractor, Query},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use dev_utility_core::core::cryptography::hash::generate_hashes;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
struct HashQuery {
    input: Option<String>,
}

async fn hash(
    Query(query): Query<HashQuery>,
    payload: Option<JsonExtractor<HashQuery>>,
) -> impl IntoResponse {
    let input = if let Some(JsonExtractor(body)) = payload {
        body.input
    } else {
        query.input
    };

    let Some(input) = input else {
        return ApiResult::error_json("Input is required".to_string());
    };

    let hash_result = generate_hashes(&input);

    ApiResult::success_json(hash_result)
}

pub fn routes() -> Router {
    Router::new()
        .route("/hash", get(hash))
        .route("/hash", post(hash))
}
