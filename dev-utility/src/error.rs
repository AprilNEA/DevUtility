// Copyright (c) 2023-2025, AprilNEA LLC.
//
// Dual licensed under:
// - GPL-3.0 (open source)
// - Commercial license (contact us)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// See LICENSE file for details or contact admin@aprilnea.com

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

#[cfg(target_arch = "wasm32")]
impl From<UtilityError> for wasm_bindgen::prelude::JsValue {
    fn from(err: UtilityError) -> wasm_bindgen::prelude::JsValue {
        wasm_bindgen::prelude::JsValue::from_str(&err.to_string())
    }
}
