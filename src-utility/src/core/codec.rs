// Copyright (c) 2023-2025, ApriilNEA LLC.
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

use crate::error::UtilityError;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use universal_function_macro::universal_function;

#[universal_function]
pub fn decode_base64(input: &str) -> Result<String, UtilityError> {
    BASE64
        .decode(input)
        .map_err(|e| UtilityError::DecodeError(e.to_string()))
        .and_then(|bytes| {
            String::from_utf8(bytes).map_err(|e| UtilityError::DecodeError(e.to_string()))
        })
}

#[universal_function]
pub fn encode_base64(input: &str) -> String {
    BASE64.encode(input.as_bytes())
}
