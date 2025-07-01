use axum::{extract::Query, http::StatusCode, routing::get, Json, Router};
use dev_utility_core::core::cryptography::hash::{generate_hashes, HashResult};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
struct HashQuery {
    input: String,
}

async fn hash(Query(params): Query<HashQuery>) -> (StatusCode, Json<HashResult>) {
    let hash_result = generate_hashes(&params.input);

    (StatusCode::OK, Json(hash_result))
}

pub fn routes() -> Router {
    Router::new().route("/", get(hash))
}
