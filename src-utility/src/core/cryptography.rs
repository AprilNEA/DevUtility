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
use rand::rngs::OsRng;
use rsa::pkcs8::{EncodePrivateKey, EncodePublicKey, LineEnding};
use rsa::{RsaPrivateKey, RsaPublicKey};
use serde::{Deserialize, Serialize};
use universal_function_macro::universal_function;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RsaKeyPair {
    pub private_key: String,
    pub public_key: String,
}

#[universal_function]
pub async fn generate_rsa_key(bits: Option<usize>) -> Result<RsaKeyPair, UtilityError> {
    let mut rng = OsRng;
    let bits = bits.unwrap_or(2048);
    let private_key =
        RsaPrivateKey::new(&mut rng, bits).map_err(|e| UtilityError::Runtime(e.to_string()))?;
    let public_key = RsaPublicKey::from(&private_key);

    let private_pem = private_key
        .to_pkcs8_pem(LineEnding::LF)
        .map_err(|e| UtilityError::Runtime(e.to_string()))?;
    let public_pem = public_key
        .to_public_key_pem(LineEnding::LF)
        .map_err(|e| UtilityError::Runtime(e.to_string()))?;

    Ok(RsaKeyPair {
        private_key: private_pem.to_string(),
        public_key: public_pem.to_string(),
    })
}
