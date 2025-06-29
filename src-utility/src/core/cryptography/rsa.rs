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
use num_bigint_dig::traits::ModInverse;
use num_integer::Integer;
use rand::rngs::OsRng;
use rsa::pkcs8::{
    DecodePrivateKey, DecodePublicKey, EncodePrivateKey, EncodePublicKey, LineEnding,
};
use rsa::traits::{PrivateKeyParts, PublicKeyParts};
use rsa::BigUint;
use rsa::{RsaPrivateKey, RsaPublicKey};
use serde::{Deserialize, Serialize};
use sha2::Digest;
use universal_function_macro::universal_function;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RsaKeyPair {
    pub private_key: String,
    pub public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum KeyType {
    Public,
    Private,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RsaKeyAnalysis {
    pub key_type: KeyType,
    pub key_size: u32,
    pub public_params: Option<PublicKeyParams>,
    pub private_params: Option<PrivateKeyParams>,
    pub derived_params: Option<DerivedParams>,
    // pub security_info: SecurityInfo,
    pub fingerprint: KeyFingerprint,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicKeyParams {
    pub n: String,     // Modulus
    pub e: String,     // Public exponent
    pub n_hex: String, // Modulus in hex
    pub e_hex: String, // Public exponent in hex
    pub n_bits: usize, // Modulus bit length
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrivateKeyParams {
    pub n: String,    // Modulus
    pub e: String,    // Public exponent
    pub d: String,    // Private exponent
    pub p: String,    // First prime
    pub q: String,    // Second prime
    pub dp: String,   // d mod (p-1)
    pub dq: String,   // d mod (q-1)
    pub qinv: String, // q^-1 mod p
    // Hex representations
    pub n_hex: String,
    pub e_hex: String,
    pub d_hex: String,
    pub p_hex: String,
    pub q_hex: String,
    pub dp_hex: String,
    pub dq_hex: String,
    pub qinv_hex: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DerivedParams {
    pub phi_n: String,       // Euler's totient φ(n) = (p-1)(q-1)
    pub lambda_n: String,    // Carmichael function λ(n)
    pub p_minus_1: String,   // p - 1
    pub q_minus_1: String,   // q - 1
    pub key_size_bits: u32,  // Actual key size in bits
    pub key_size_bytes: u32, // Key size in bytes
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityInfo {
    pub recommended_minimum_bits: u32,
    pub is_secure: bool,
    pub security_level: String,
    pub vulnerabilities: Vec<String>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyFingerprint {
    pub sha256: String,
    pub sha1: String,
    pub md5: String,
    pub sha512: String,
}

#[universal_function(desktop_only)]
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

fn extract_rsa_public_key_params(pub_key: &RsaPublicKey) -> PublicKeyParams {
    let n = pub_key.n();
    let e = pub_key.e();

    let n_bits = n.bits();

    PublicKeyParams {
        n: n.to_str_radix(10),
        e: e.to_str_radix(10),
        n_hex: n.to_str_radix(16),
        e_hex: e.to_str_radix(16),
        n_bits,
    }
}

fn extract_rsa_private_key_params(priv_key: &RsaPrivateKey) -> PrivateKeyParams {
    let n = priv_key.n();
    let e = priv_key.e();
    let d = priv_key.d();
    let primes = priv_key.primes();

    let (p, q) = (primes[0].clone(), primes[1].clone());
    let dp = d % (&p - 1u8);
    let dq = d % (&q - 1u8);
    let qinv = (&q)
        .mod_inverse(&p)
        .and_then(|inv| inv.to_biguint())
        .unwrap_or(BigUint::from(0u8));

    PrivateKeyParams {
        n: n.to_str_radix(10),
        e: e.to_str_radix(10),
        d: d.to_str_radix(10),
        p: p.to_str_radix(10),
        q: q.to_str_radix(10),
        dp: dp.to_str_radix(10),
        dq: dq.to_str_radix(10),
        qinv: qinv.to_str_radix(10),
        n_hex: n.to_str_radix(16),
        e_hex: e.to_str_radix(16),
        d_hex: d.to_str_radix(16),
        p_hex: p.to_str_radix(16),
        q_hex: q.to_str_radix(16),
        dp_hex: dp.to_str_radix(16),
        dq_hex: dq.to_str_radix(16),
        qinv_hex: qinv.to_str_radix(16),
    }
}

fn calculate_rsa_derived_params(priv_key: &RsaPrivateKey) -> DerivedParams {
    let primes = priv_key.primes();
    let p = &primes[0];
    let q = &primes[1];
    let n = priv_key.n();

    let p_minus_1 = p - 1u8;
    let q_minus_1 = q - 1u8;

    let phi_n = &p_minus_1 * &q_minus_1;
    let lambda_n = p_minus_1.lcm(&q_minus_1);

    let key_size_bits = n.bits() as u32;
    let key_size_bytes = key_size_bits / 8;

    DerivedParams {
        phi_n: phi_n.to_str_radix(10),
        lambda_n: lambda_n.to_str_radix(10),
        p_minus_1: p_minus_1.to_str_radix(10),
        q_minus_1: q_minus_1.to_str_radix(10),
        key_size_bits,
        key_size_bytes,
    }
}

fn calculate_key_fingerprint(public_key: &RsaPublicKey) -> Result<KeyFingerprint, UtilityError> {
    // Encode the public key to DER format
    let der_bytes = public_key
        .to_public_key_der()
        .map_err(|e| UtilityError::Runtime(format!("Failed to encode public key to DER: {}", e)))?;

    // Calculate hashes
    let sha256_hash = {
        let mut hasher = sha2::Sha256::new();
        hasher.update(der_bytes.as_bytes());
        hex::encode(hasher.finalize())
    };

    let sha1_hash = {
        let mut hasher = sha1::Sha1::new();
        hasher.update(der_bytes.as_bytes());
        hex::encode(hasher.finalize())
    };

    let md5_hash = {
        let mut hasher = md5::Md5::new();
        hasher.update(der_bytes.as_bytes());
        hex::encode(hasher.finalize())
    };

    let sha512_hash = {
        let mut hasher = sha2::Sha512::new();
        hasher.update(der_bytes.as_bytes());
        hex::encode(hasher.finalize())
    };

    Ok(KeyFingerprint {
        sha256: sha256_hash,
        sha1: sha1_hash,
        md5: md5_hash,
        sha512: sha512_hash,
    })
}

#[universal_function(desktop_only)]
pub async fn analyze_rsa_key(key: String) -> Result<RsaKeyAnalysis, UtilityError> {
    // Try to parse as private key first
    if let Ok(private_key) = RsaPrivateKey::from_pkcs8_pem(&key) {
        let public_params = Some(extract_rsa_public_key_params(&private_key.to_public_key()));
        let private_params = Some(extract_rsa_private_key_params(&private_key));
        let derived_params = Some(calculate_rsa_derived_params(&private_key));

        let key_size = private_key.size() * 8;
        // let security_info = calculate_security_info(key_size as u32);
        let fingerprint = calculate_key_fingerprint(&private_key.to_public_key())?;

        return Ok(RsaKeyAnalysis {
            key_type: KeyType::Private,
            key_size: key_size as u32,
            public_params,
            private_params,
            derived_params,
            // security_info,
            fingerprint,
        });
    }

    // Try to parse as public key
    if let Ok(public_key) = RsaPublicKey::from_public_key_pem(&key) {
        let public_params = Some(extract_rsa_public_key_params(&public_key));
        let key_size = public_key.size() * 8;
        // let security_info = calculate_security_info(key_size as u32);
        let fingerprint = calculate_key_fingerprint(&public_key)?;

        return Ok(RsaKeyAnalysis {
            key_type: KeyType::Public,
            key_size: key_size as u32,
            public_params,
            private_params: None,
            derived_params: None,
            // security_info,
            fingerprint,
        });
    }

    Err(UtilityError::InvalidInput(
        "Invalid RSA key format".to_string(),
    ))
}
