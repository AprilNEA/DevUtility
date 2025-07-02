use async_trait::async_trait;
use axum::{
    extract::{FromRequest, Query, Request},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Custom extractor, merge query and body data
struct QueryOrBody<T>(pub T);

#[async_trait]
impl<T, S> FromRequest<S> for QueryOrBody<T>
where
    T: serde::de::DeserializeOwned + Default + Clone,
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let method = req.method().clone();
        let uri = req.uri().clone();
        let headers = req.headers().clone();

        // 提取query参数
        let query_string = uri.query().unwrap_or("");
        let query_data: T =
            serde_urlencoded::from_str(query_string).unwrap_or_else(|_| T::default());
        // 先尝试提取query参数
        let query_result = Query::<T>::from_request(req, state).await;
        let mut query_data = match query_result {
            Ok(Query(data)) => data,
            Err(_) => T::default(),
        };

        // 再尝试提取body数据
        let body_result = Json::<T>::from_request(req, state).await;
        if let Ok(Json(body_data)) = body_result {
            // 合并数据，body优先
            query_data = merge_data(query_data, body_data);
        }

        Ok(QueryOrBody(query_data))
    }
}

// 合并函数：body数据覆盖query数据
fn merge_data<T>(mut base: T, override_with: T) -> T
where
    T: serde::Serialize + serde::de::DeserializeOwned,
{
    // 将两个结构体转换为HashMap进行合并
    let base_map: HashMap<String, serde_json::Value> =
        serde_json::from_str(&serde_json::to_string(&base).unwrap()).unwrap();
    let override_map: HashMap<String, serde_json::Value> =
        serde_json::from_str(&serde_json::to_string(&override_with).unwrap()).unwrap();

    let mut merged = base_map;
    for (key, value) in override_map {
        if !value.is_null() {
            merged.insert(key, value);
        }
    }

    serde_json::from_value(serde_json::Value::Object(merged.into_iter().collect())).unwrap_or(base)
}
