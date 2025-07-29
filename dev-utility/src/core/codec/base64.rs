use crate::error::UtilityError;
use serde::{Deserialize, Serialize};
use universal_function_macro::universal_function;

use base64::{
  engine::general_purpose::STANDARD as BASE64,
  engine::general_purpose::URL_SAFE_NO_PAD as BASE64_URL_SAFE, Engine as _,
};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub enum Base64Engine {
  Standard,
  UrlSafe,
}

#[universal_function]
pub async fn decode_base64(input: &str, engine: Base64Engine) -> Result<String, UtilityError> {
  let base64_engine = match engine {
      Base64Engine::Standard => BASE64,
      Base64Engine::UrlSafe => BASE64_URL_SAFE,
  };

  base64_engine
      .decode(input)
      .map_err(|e| UtilityError::DecodeError(e.to_string()))
      .and_then(|bytes| {
          String::from_utf8(bytes).map_err(|e| UtilityError::DecodeError(e.to_string()))
      })
}

#[universal_function]
pub async fn encode_base64(input: &str) -> Result<String, UtilityError> {
  Ok(BASE64.encode(input.as_bytes()))
}
