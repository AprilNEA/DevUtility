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

#[cfg(not(target_arch = "wasm32"))]
use std::time::{SystemTime, UNIX_EPOCH};
#[cfg(target_arch = "wasm32")]
use web_time::{SystemTime, UNIX_EPOCH};

use super::{HashAlgorithm, SyncStatus};
use crate::error::UtilityError;
use base32::Alphabet;
use hmac::{Hmac, Mac};

use serde::{Deserialize, Serialize};
use sha1::Sha1;
use sha2::{Sha256, Sha512};
use universal_function_macro::universal_function;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct TotpSecretResult {
    pub secret: String,           // Base32 encoded secret
    pub qr_code_url: String,      // QR code URL for provisioning
    pub provisioning_uri: String, // Full provisioning URI
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct TotpCodeResult {
    pub code: String,             // Generated TOTP code
    pub time_remaining: u64,      // Seconds remaining until next code
    pub time_used: u64,           // Time window used for generation
    pub algorithm: HashAlgorithm, // Algorithm used
    pub digits: u32,              // Code length
    pub period: u32,              // Time period used
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct TotpValidationResult {
    pub is_valid: bool,           // Whether code is valid
    pub time_offset: i32,         // Time offset from current window
    pub used_time_window: u64,    // Time window that matched
    pub current_time_window: u64, // Current time window
    pub message: String,          // Validation message
}

#[universal_function]
pub async fn generate_totp_secret(
    issuer: String,
    account: String,
    algorithm: HashAlgorithm,
    digits: u32,
    period: u32,
    image: Option<String>,
    add_issuer_prefix: bool,
) -> Result<TotpSecretResult, UtilityError> {
    // Generate 32 bytes of random data for the secret
    let mut secret_bytes = [0u8; 32];
    #[cfg(target_arch = "wasm32")]
    {
        use fastrand::Rng;

        let mut rng = Rng::new();
        rng.fill(&mut secret_bytes);
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        use rand::RngCore;
        rand::rngs::OsRng.fill_bytes(&mut secret_bytes);
    }

    // Encode to base32
    let secret = base32::encode(Alphabet::Rfc4648 { padding: false }, &secret_bytes);

    // Build provisioning URI
    let algo_str = match algorithm {
        HashAlgorithm::SHA1 => "SHA1",
        HashAlgorithm::SHA256 => "SHA256",
        HashAlgorithm::SHA512 => "SHA512",
    };

    let label_str = if add_issuer_prefix {
        format!("{}:{}", issuer, account)
    } else {
        account.clone()
    };

    let mut uri = format!(
        "otpauth://totp/{}?secret={}&issuer={}&algorithm={}&digits={}&period={}",
        urlencoding::encode(&label_str),
        secret,
        urlencoding::encode(&issuer),
        algo_str,
        digits,
        period
    );

    if let Some(img) = &image {
        uri.push_str(&format!("&image={}", urlencoding::encode(img)));
    }

    let qr_code_url = format!(
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={}",
        urlencoding::encode(&uri)
    );

    Ok(TotpSecretResult {
        secret,
        qr_code_url,
        provisioning_uri: uri,
    })
}

// Generate TOTP code for current time
#[universal_function]
pub async fn generate_totp_code(
    secret: String,
    algorithm: HashAlgorithm,
    digits: u32,
    period: u32,
) -> Result<TotpCodeResult, UtilityError> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| UtilityError::Runtime(format!("Time error: {}", e)))?
        .as_secs();

    generate_totp_code_for_time(secret, algorithm, digits, period, now).await
}

// Generate TOTP code for specific time
#[universal_function]
pub async fn generate_totp_code_for_time(
    secret: String,
    algorithm: HashAlgorithm,
    digits: u32,
    period: u32,
    timestamp: u64,
) -> Result<TotpCodeResult, UtilityError> {
    // Decode base32 secret
    let secret_bytes = base32::decode(Alphabet::Rfc4648 { padding: false }, &secret)
        .ok_or_else(|| UtilityError::InvalidInput("Invalid base32 secret".to_string()))?;

    // Calculate time counter
    let time_counter = timestamp / period as u64;
    let time_remaining = period as u64 - (timestamp % period as u64);

    // Convert counter to bytes (big endian)
    let counter_bytes = time_counter.to_be_bytes();

    // Calculate HMAC
    let hmac_result = match algorithm {
        HashAlgorithm::SHA1 => {
            let mut mac = Hmac::<Sha1>::new_from_slice(&secret_bytes)
                .map_err(|e| UtilityError::Runtime(format!("HMAC error: {}", e)))?;
            mac.update(&counter_bytes);
            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::SHA256 => {
            let mut mac = Hmac::<Sha256>::new_from_slice(&secret_bytes)
                .map_err(|e| UtilityError::Runtime(format!("HMAC error: {}", e)))?;
            mac.update(&counter_bytes);
            mac.finalize().into_bytes().to_vec()
        }
        HashAlgorithm::SHA512 => {
            let mut mac = Hmac::<Sha512>::new_from_slice(&secret_bytes)
                .map_err(|e| UtilityError::Runtime(format!("HMAC error: {}", e)))?;
            mac.update(&counter_bytes);
            mac.finalize().into_bytes().to_vec()
        }
    };

    // Dynamic truncation
    let offset = (hmac_result[hmac_result.len() - 1] & 0xf) as usize;
    let binary = ((hmac_result[offset] & 0x7f) as u32) << 24
        | (hmac_result[offset + 1] as u32) << 16
        | (hmac_result[offset + 2] as u32) << 8
        | (hmac_result[offset + 3] as u32);

    // Generate code
    let modulo = 10_u32.pow(digits);
    let code = binary % modulo;
    let code_str = format!("{:0width$}", code, width = digits as usize);

    Ok(TotpCodeResult {
        code: code_str,
        time_remaining,
        time_used: time_counter,
        algorithm,
        digits,
        period,
    })
}

// Validate TOTP code
#[universal_function]
pub async fn validate_totp_code(
    secret: String,
    code: String,
    algorithm: HashAlgorithm,
    digits: u32,
    period: u32,
    window: u32, // Number of time windows to check (before and after current)
) -> Result<TotpValidationResult, UtilityError> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| UtilityError::Runtime(format!("Time error: {}", e)))?
        .as_secs();

    let current_time_window = now / period as u64;

    // Check current window first
    let current_result =
        generate_totp_code_for_time(secret.clone(), algorithm.clone(), digits, period, now).await?;

    if current_result.code == code {
        return Ok(TotpValidationResult {
            is_valid: true,
            time_offset: 0,
            used_time_window: current_time_window,
            current_time_window,
            message: "Code is valid for current time window".to_string(),
        });
    }

    // Check windows before and after
    for offset in 1..=window as i64 {
        // Check past windows
        if let Ok(past_result) = generate_totp_code_for_time(
            secret.clone(),
            algorithm.clone(),
            digits,
            period,
            (current_time_window as i64 - offset) as u64 * period as u64,
        )
        .await
        {
            if past_result.code == code {
                return Ok(TotpValidationResult {
                    is_valid: true,
                    time_offset: -offset as i32,
                    used_time_window: (current_time_window as i64 - offset) as u64,
                    current_time_window,
                    message: format!("Code is valid for past time window (offset: {})", -offset),
                });
            }
        }

        // Check future windows
        if let Ok(future_result) = generate_totp_code_for_time(
            secret.clone(),
            algorithm.clone(),
            digits,
            period,
            (current_time_window + offset as u64) * period as u64,
        )
        .await
        {
            if future_result.code == code {
                return Ok(TotpValidationResult {
                    is_valid: true,
                    time_offset: offset as i32,
                    used_time_window: current_time_window + offset as u64,
                    current_time_window,
                    message: format!("Code is valid for future time window (offset: +{})", offset),
                });
            }
        }
    }

    Ok(TotpValidationResult {
        is_valid: false,
        time_offset: 0,
        used_time_window: current_time_window,
        current_time_window,
        message: "Code is not valid for any checked time window".to_string(),
    })
}
