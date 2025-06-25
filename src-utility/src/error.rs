#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;

#[derive(Debug, thiserror::Error)]
pub enum UtilityError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("Runtime error: {0}")]
    Runtime(String),
    #[error("Decode error: {0}")]
    DecodeError(String),
    #[error("Parse error: {0}")]
    ParseError(String),
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl serde::Serialize for UtilityError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[cfg(feature = "web")]
impl From<UtilityError> for JsValue {
    fn from(err: UtilityError) -> JsValue {
        JsValue::from_str(&err.to_string())
    }
}
