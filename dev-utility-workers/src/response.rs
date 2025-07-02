use axum::{
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T> {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

pub enum ApiResult<T> {
    Json(ApiResponse<T>),
    Text(String),
    Html(String),
}

impl<T> IntoResponse for ApiResult<T>
where
    T: Serialize,
{
    fn into_response(self) -> Response {
        match self {
            ApiResult::Json(data) => Json(data).into_response(),
            ApiResult::Text(text) => (
                StatusCode::OK,
                [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
                text,
            )
                .into_response(),
            ApiResult::Html(html) => (
                StatusCode::OK,
                [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
                html,
            )
                .into_response(),
        }
    }
}

impl<T> ApiResult<T>
where
    T: Serialize,
{
    pub fn success_json(data: T) -> Self {
        Self::Json(ApiResponse {
            ok: true,
            data: Some(data),
            message: None,
        })
    }

    pub fn error_json(message: String) -> Self {
        Self::Json(ApiResponse {
            ok: false,
            data: None,
            message: Some(message),
        })
    }

    pub fn text(content: String) -> Self {
        Self::Text(content)
    }
}
