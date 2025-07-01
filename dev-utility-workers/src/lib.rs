mod routes;

use axum::Router;
use routes::hash;
use tower_service::Service;
use worker::*;

fn router() -> Router {
    Router::new().nest("/hash", hash::routes())
}

#[event(fetch)]
async fn fetch(
    req: HttpRequest,
    _env: Env,
    _ctx: Context,
) -> Result<axum::http::Response<axum::body::Body>> {
    console_error_panic_hook::set_once();
    Ok(router().call(req).await?)
}
