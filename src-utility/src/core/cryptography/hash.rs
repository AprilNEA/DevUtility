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

use digest::Digest;
use hex;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct HashResult {
    pub md2: String,
    pub md4: String,
    pub md5: String,
    pub sha1: String,
    pub sha224: String,
    pub sha256: String,
    pub sha384: String,
    pub sha512: String,
    pub sha3_256: String,
    pub keccak256: String,
}

fn hash_with_algorithm<D: Digest>(data: &[u8]) -> String {
    let mut hasher = D::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

#[tauri::command]
pub fn generate_hashes(input: &str) -> HashResult {
    let data = Arc::new(input.as_bytes().to_vec());

    let tasks: Vec<(&str, Box<dyn Fn(&[u8]) -> String + Send + Sync>)> = vec![
        (
            "MD2",
            Box::new(|data| hash_with_algorithm::<md2::Md2>(data)),
        ),
        (
            "MD5",
            Box::new(|data| hash_with_algorithm::<md5::Md5>(data)),
        ),
        (
            "MD4",
            Box::new(|data| hash_with_algorithm::<md4::Md4>(data)),
        ),
        (
            "SHA1",
            Box::new(|data| hash_with_algorithm::<sha1::Sha1>(data)),
        ),
        (
            "SHA224",
            Box::new(|data| hash_with_algorithm::<sha2::Sha224>(data)),
        ),
        (
            "SHA256",
            Box::new(|data| hash_with_algorithm::<sha2::Sha256>(data)),
        ),
        (
            "SHA384",
            Box::new(|data| hash_with_algorithm::<sha2::Sha384>(data)),
        ),
        (
            "SHA512",
            Box::new(|data| hash_with_algorithm::<sha2::Sha512>(data)),
        ),
        (
            "SHA3-256",
            Box::new(|data| hash_with_algorithm::<sha3::Sha3_256>(data)),
        ),
        (
            "Keccak256",
            Box::new(|data| hash_with_algorithm::<sha3::Keccak256>(data)),
        ),
    ];

    let results: Vec<(String, String)> = tasks
        .into_par_iter()
        .map(|(name, hasher)| {
            let hash = hasher(&data);
            (name.to_string(), hash)
        })
        .collect();

    let mut hash_map = std::collections::HashMap::new();
    for (name, hash) in results {
        hash_map.insert(name, hash);
    }

    HashResult {
        md2: hash_map.get("MD2").unwrap().clone(),
        md4: hash_map.get("MD4").unwrap().clone(),
        md5: hash_map.get("MD5").unwrap().clone(),
        sha1: hash_map.get("SHA1").unwrap().clone(),
        sha224: hash_map.get("SHA224").unwrap().clone(),
        sha256: hash_map.get("SHA256").unwrap().clone(),
        sha384: hash_map.get("SHA384").unwrap().clone(),
        sha512: hash_map.get("SHA512").unwrap().clone(),
        sha3_256: hash_map.get("SHA3-256").unwrap().clone(),
        keccak256: hash_map.get("Keccak256").unwrap().clone(),
    }
}
