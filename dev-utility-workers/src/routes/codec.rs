use crate::response::ApiResult;
use axum::{
    extract::{Json as JsonExtractor, Query},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use dev_utility_core::core::codec::{decode_base64, encode_base64};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
enum CodecType {
    Encode,
    Decode,
}

#[derive(Deserialize, Serialize, Debug)]
struct Base64Query {
    r#type: Option<CodecType>,
    input: Option<String>,
}

async fn base64(
    Query(query): Query<Base64Query>,
    payload: Option<JsonExtractor<Base64Query>>,
) -> impl IntoResponse {
    let (input, codec_type) = if let Some(JsonExtractor(body)) = payload {
        (body.input, body.r#type)
    } else {
        (query.input, query.r#type)
    };

    let Some(input) = input else {
        return ApiResult::error_json("Input is required".to_string());
    };

    let codec_type = codec_type.unwrap_or(CodecType::Encode);

    let result = match codec_type {
        CodecType::Encode => encode_base64(&input),
        CodecType::Decode => match decode_base64(&input) {
            Ok(decoded) => decoded,
            Err(_) => return ApiResult::error_json("Invalid base64 input".to_string()),
        },
    };

    ApiResult::success_json(result)
}

pub fn routes() -> Router {
    Router::new()
        .route("/base64", get(base64))
        .route("/base64", post(base64))
}
