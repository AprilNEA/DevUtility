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

use crate::error::UtilityError;
use base64::{
    engine::general_purpose::STANDARD as BASE64,
    engine::general_purpose::URL_SAFE_NO_PAD as BASE64_URL_SAFE, Engine as _,
};
use jsonwebtoken::Algorithm;
use serde::{Deserialize, Serialize};
use universal_function_macro::universal_function;

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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JwtDecodeStatus {
    Valid,
    Invalid,
    Unverified,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtDecodeResult {
    pub header: String,
    pub payload: String,
    pub signature: String,
    pub status: JwtDecodeStatus,
}

async fn decode_jwt_with_secret(input: &str) -> Result<JwtDecodeResult, UtilityError> {
    // If verification fails, try to decode without verification
    let parts: Vec<&str> = input.split('.').collect();
    if parts.len() != 3 {
        return Err(UtilityError::DecodeError("Invalid JWT format".to_string()));
    }

    // Decode base64 parts, but handle signature as raw bytes since it may not be valid UTF-8
    let header = decode_base64(parts[0], Base64Engine::UrlSafe).await?;
    let payload = decode_base64(parts[1], Base64Engine::UrlSafe).await?;
    
    // For signature, decode to bytes and convert to hex string to avoid UTF-8 issues
    let base64_engine = BASE64_URL_SAFE;
    let signature_bytes = base64_engine
        .decode(parts[2])
        .map_err(|e| UtilityError::DecodeError(e.to_string()))?;
    let signature = hex::encode(signature_bytes);
    
    Ok(JwtDecodeResult {
        header,
        payload,
        signature,
        status: JwtDecodeStatus::Unverified,
    })
}

#[universal_function(desktop_only)]
pub async fn decode_jwt(
    input: &str,
    algorithm: Algorithm,
    secret: Option<&str>,
) -> Result<JwtDecodeResult, UtilityError> {
    let parts = decode_jwt_with_secret(input).await?;
    match secret {
        Some(secret_key) => {
            let validation = jsonwebtoken::Validation::new(algorithm);
            match jsonwebtoken::decode::<serde_json::Value>(
                input,
                &jsonwebtoken::DecodingKey::from_secret(secret_key.as_bytes()),
                &validation,
            ) {
                Ok(_) => Ok(JwtDecodeResult {
                    header: parts.header,
                    payload: parts.payload,
                    signature: parts.signature,
                    status: JwtDecodeStatus::Valid,
                }),
                Err(_) => {
                    let mut result = decode_jwt_with_secret(input).await?;
                    result.status = JwtDecodeStatus::Invalid;
                    Ok(result)
                }
            }
        }
        None => decode_jwt_with_secret(input).await,
    }
}
