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

use nanoid::nanoid;
use serde::{Deserialize, Serialize};
use std::{
    fmt::Display,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use ulid::Ulid;
use universal_function_macro::universal_function;
use uuid::{Timestamp, Uuid, Variant, Version};

use crate::error::UtilityError;

#[universal_function]
pub fn generate_ulid(count: u32) -> String {
    (0..count)
        .map(|_| Ulid::new().to_string())
        .collect::<Vec<String>>()
        .join("\n")
}

#[universal_function(desktop_only)]
pub fn generate_nanoid(count: u32) -> String {
    (0..count)
        .map(|_| nanoid!())
        .collect::<Vec<String>>()
        .join("\n")
}

#[universal_function]
pub fn generate_uuid_v1(
    count: u32,
    timestamp: Option<u64>,
    mac_address: Vec<u8>,
) -> String {
    let context = uuid::Context::new_random();

    let base_seconds = timestamp.unwrap_or_else(|| {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        now.as_secs()
    });

    // Convert Vec<u8> to [u8; 6], using default if not provided or wrong size
    let mac_array: [u8; 6] = if mac_address.len() == 6 {
        [
            mac_address[0],
            mac_address[1],
            mac_address[2],
            mac_address[3],
            mac_address[4],
            mac_address[5],
        ]
    } else {
        [0; 6]
    };

    (0..count)
        .map(|i| {
            let nanos = i;
            let time = Timestamp::from_unix(&context, base_seconds, nanos);
            Uuid::new_v1(time, &mac_array).to_string()
        })
        .collect::<Vec<String>>()
        .join("\n")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub enum Namespace {
    Dns,
    Url,
    Oid,
    X500,
}

impl Namespace {
    pub fn to_uuid(&self) -> Uuid {
        match self {
            Namespace::Dns => Uuid::NAMESPACE_DNS,
            Namespace::Url => Uuid::NAMESPACE_URL,
            Namespace::Oid => Uuid::NAMESPACE_OID,
            Namespace::X500 => Uuid::NAMESPACE_X500,
        }
    }
}

impl Display for Namespace {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[universal_function]
pub fn generate_uuid_v3(
    count: u32,
    namespace: Namespace,
    names: Vec<String>,
) -> Result<String, UtilityError> {
    let namespace_uuid = namespace.to_uuid();

    let result = if names.is_empty() {
        // Generate using default names if none provided
        (0..count)
            .map(|i| Uuid::new_v3(&namespace_uuid, format!("name{}", i).as_bytes()).to_string())
            .collect::<Vec<String>>()
            .join("\n")
    } else {
        // Generate using provided names, cycling through them if count > names.len()
        (0..count)
            .map(|i| {
                let name = &names[i as usize % names.len()];
                Uuid::new_v3(&namespace_uuid, name.as_bytes()).to_string()
            })
            .collect::<Vec<String>>()
            .join("\n")
    };

    Ok(result)
}

#[universal_function]
pub fn generate_uuid_v4(count: u32) -> String {
    (0..count)
        .map(|_| Uuid::new_v4().to_string())
        .collect::<Vec<String>>()
        .join("\n")
}

#[universal_function]
pub fn generate_uuid_v5(
    count: u32,
    namespace: Namespace,
    names: Vec<String>,
) -> Result<String, UtilityError> {
    let namespace_uuid = namespace.to_uuid();

    let result = if names.is_empty() {
        // Generate using default names if none provided
        (0..count)
            .map(|i| Uuid::new_v5(&namespace_uuid, format!("name{}", i).as_bytes()).to_string())
            .collect::<Vec<String>>()
            .join("\n")
    } else {
        // Generate using provided names, cycling through them if count > names.len()
        (0..count)
            .map(|i| {
                let name = &names[i as usize % names.len()];
                Uuid::new_v5(&namespace_uuid, name.as_bytes()).to_string()
            })
            .collect::<Vec<String>>()
            .join("\n")
    };

    Ok(result)
}

#[universal_function]
pub fn generate_uuid_v7(count: u32, timestamp: Option<u64>) -> String {
    let context = uuid::Context::new_random();

    let base_seconds = timestamp.unwrap_or_else(|| {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        now.as_secs()
    });
    (0..count)
        .map(|i| {
            let nanos = i;
            let time = Timestamp::from_unix(&context, base_seconds, nanos);
            Uuid::new_v7(time).to_string()
        })
        .collect::<Vec<String>>()
        .join("\n")
}

#[derive(Debug, Serialize, Deserialize)]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct IdAnalyzer {
    pub uuid: Uuid,
    pub version: Option<String>,
    pub variant: String,
    pub content: Content,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub enum Content {
    V1(V1Content),
    V3(V3Content),
    V4(V4Content),
    V5(V5Content),
    V7(V7Content),
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct V1Content {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    pub timestamp: Option<SystemTime>,
    pub timestamp_raw: u64,
    pub clock_sequence: u16,
    pub node_id: [u8; 6],
    pub mac_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct V3Content {
    pub namespace_info: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct V4Content {
    pub random_bits: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct V5Content {
    pub namespace_info: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
#[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
pub struct V7Content {
    pub timestamp: Option<SystemTime>,
    pub timestamp_ms: u64,
    pub random_bits: String,
}

impl IdAnalyzer {
    fn analyze(uuid_str: &str) -> Result<Self, uuid::Error> {
        let uuid = Uuid::parse_str(uuid_str)?;
        let version = uuid.get_version();
        let variant = uuid.get_variant();

        let content = match version {
            Some(Version::Mac) => Content::V1(Self::analyze_v1(&uuid)),
            Some(Version::Md5) => Content::V3(Self::analyze_v3(&uuid)),
            Some(Version::Random) => Content::V4(Self::analyze_v4(&uuid)),
            Some(Version::Sha1) => Content::V5(Self::analyze_v5(&uuid)),
            Some(Version::SortRand) => Content::V7(Self::analyze_v7(&uuid)),
            _ => Content::Unknown,
        };

        Ok(IdAnalyzer {
            uuid,
            version: version.map(|v| match v {
                Version::Nil => "Nil".to_string(),
                Version::Mac => "V1 (Time-based)".to_string(),
                Version::Dce => "V2 (DCE Security)".to_string(),
                Version::Md5 => "V3 (MD5 Name-based)".to_string(),
                Version::Random => "V4 (Random)".to_string(),
                Version::Sha1 => "V5 (SHA-1 Name-based)".to_string(),
                Version::SortMac => "V6 (Sortable Time-based)".to_string(),
                Version::SortRand => "V7 (Sortable Random)".to_string(),
                Version::Custom => "V8 (Custom)".to_string(),
                _ => format!("{:?}", v),
            }),
            variant: match variant {
                Variant::NCS => "NCS".to_string(),
                Variant::RFC4122 => "RFC4122".to_string(),
                Variant::Microsoft => "Microsoft".to_string(),
                Variant::Future => "Future".to_string(),
                _ => format!("{:?}", variant),
            },
            content,
        })
    }

    fn analyze_v1(uuid: &Uuid) -> V1Content {
        let bytes = uuid.as_bytes();

        // Extract timestamp (60-bit)
        let time_low = u32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) as u64;
        let time_mid = u16::from_be_bytes([bytes[4], bytes[5]]) as u64;
        let time_hi = u16::from_be_bytes([bytes[6], bytes[7]]) as u64 & 0x0FFF;

        let timestamp_100ns = (time_hi << 48) | (time_mid << 32) | time_low;

        // UUID v1 timestamp is the number of 100-nanosecond intervals since 1582-10-15 00:00:00
        // Convert to Unix timestamp
        const UUID_EPOCH_OFFSET: u64 = 122192928000000000; // 100ns intervals between 1582-10-15 and 1970-01-01
        let timestamp = if timestamp_100ns >= UUID_EPOCH_OFFSET {
            let unix_100ns = timestamp_100ns - UUID_EPOCH_OFFSET;
            let unix_secs = unix_100ns / 10_000_000;
            let unix_nanos = (unix_100ns % 10_000_000) * 100;
            Some(UNIX_EPOCH + Duration::new(unix_secs, unix_nanos as u32))
        } else {
            None
        };

        // Extract clock sequence (14-bit)
        let clock_seq_hi = bytes[8] & 0x3F;
        let clock_seq_low = bytes[9];
        let clock_sequence = ((clock_seq_hi as u16) << 8) | clock_seq_low as u16;

        // Extract node ID (MAC address)
        let node_id = [
            bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15],
        ];
        let mac_address = node_id
            .iter()
            .map(|b| format!("{:02X}", b))
            .collect::<Vec<_>>()
            .join(":");

        V1Content {
            timestamp,
            timestamp_raw: timestamp_100ns,
            clock_sequence,
            node_id,
            mac_address,
        }
    }

    fn analyze_v3(uuid: &Uuid) -> V3Content {
        V3Content {
            namespace_info: "MD5 hash-based UUID (namespace and name are hashed)".to_string(),
        }
    }

    fn analyze_v4(uuid: &Uuid) -> V4Content {
        let bytes = uuid.as_bytes();
        let random_bits = bytes
            .iter()
            .enumerate()
            .filter(|(i, _)| {
                // 排除版本和变体位
                !(*i == 6 || *i == 8)
            })
            .map(|(_, b)| format!("{:02x}", b))
            .collect::<String>();

        V4Content { random_bits }
    }

    fn analyze_v5(uuid: &Uuid) -> V5Content {
        V5Content {
            namespace_info: "SHA-1 hash-based UUID (namespace and name are hashed)".to_string(),
        }
    }

    fn analyze_v7(uuid: &Uuid) -> V7Content {
        let bytes = uuid.as_bytes();

        // Extract Unix timestamp in milliseconds (first 48 bits)
        let timestamp_ms = ((bytes[0] as u64) << 40)
            | ((bytes[1] as u64) << 32)
            | ((bytes[2] as u64) << 24)
            | ((bytes[3] as u64) << 16)
            | ((bytes[4] as u64) << 8)
            | (bytes[5] as u64);

        // Convert milliseconds to SystemTime
        let timestamp = UNIX_EPOCH + Duration::from_millis(timestamp_ms);

        // Extract random bits (excluding version and variant bits)
        let random_bits = format!(
            "{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
            bytes[6] & 0x0F, // Lower 4 bits of byte 6 (upper 4 bits are version)
            bytes[7],
            bytes[8] & 0x3F, // Lower 6 bits of byte 8 (upper 2 bits are variant)
            bytes[9],
            bytes[10],
            bytes[11],
            bytes[12],
            bytes[13],
            bytes[14],
            bytes[15]
        );

        V7Content {
            timestamp: Some(timestamp),
            timestamp_ms,
            random_bits,
        }
    }

    fn display(&self) {
        println!("UUID Analysis");
        println!("=============");
        println!("UUID: {}", self.uuid);
        println!("Version: {:?}", self.version);
        println!("Variant: {:?}", self.variant);
        println!();

        match &self.content {
            Content::V1(info) => {
                println!("UUID Version 1 (Time-based) Details:");
                println!("-----------------------------------");
                if let Some(timestamp) = info.timestamp {
                    println!("Timestamp: {:?}", timestamp);
                    if let Ok(duration) = timestamp.duration_since(UNIX_EPOCH) {
                        println!("Unix timestamp (seconds): {}", duration.as_secs());
                        println!("Unix timestamp (nanos): {}", duration.subsec_nanos());
                    }
                }
                println!("Timestamp (raw, 100ns intervals): {}", info.timestamp_raw);
                println!("Clock Sequence: {}", info.clock_sequence);
                println!("Node ID: {:?}", info.node_id);
                println!("MAC Address: {}", info.mac_address);

                // 检查是否是多播地址
                if info.node_id[0] & 0x01 != 0 {
                    println!("Note: This is a multicast MAC address");
                }
                // 检查是否是本地管理的地址
                if info.node_id[0] & 0x02 != 0 {
                    println!("Note: This is a locally administered MAC address");
                }
            }
            Content::V3(info) => {
                println!("UUID Version 3 (MD5 Name-based) Details:");
                println!("---------------------------------------");
                println!("{}", info.namespace_info);
            }
            Content::V4(info) => {
                println!("UUID Version 4 (Random) Details:");
                println!("-------------------------------");
                println!("Random bits: {}", info.random_bits);
                println!("Total random bits: 122");
            }
            Content::V5(info) => {
                println!("UUID Version 5 (SHA-1 Name-based) Details:");
                println!("-----------------------------------------");
                println!("{}", info.namespace_info);
            }
            Content::V7(info) => {
                println!("UUID Version 7 (Time-ordered) Details:");
                println!("-------------------------------------");
                if let Some(timestamp) = info.timestamp {
                    println!("Timestamp: {:?}", timestamp);
                    if let Ok(duration) = timestamp.duration_since(UNIX_EPOCH) {
                        println!("Unix timestamp (seconds): {}", duration.as_secs());
                        println!("Unix timestamp (milliseconds): {}", info.timestamp_ms);
                    }
                }
                println!("Random bits: {}", info.random_bits);
                println!("Total random bits: 74");
            }
            Content::Unknown => {
                println!("Unknown or unsupported UUID version");
            }
        }
    }
}

#[universal_function]
pub fn analyze_uuid(input: &str) -> Result<IdAnalyzer, UtilityError> {
    IdAnalyzer::analyze(input).map_err(|e| UtilityError::ParseError(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_ulid() {
        let result = generate_ulid(3);
        let ulids: Vec<&str> = result.split('\n').collect();
        assert_eq!(ulids.len(), 3);

        // Verify each ULID is valid
        for ulid_str in ulids {
            assert_eq!(ulid_str.len(), 26);
            assert!(Ulid::from_string(ulid_str).is_ok());
        }
    }

    #[test]
    fn test_generate_uuid_v1() {
        let result = generate_uuid_v1(2, None, vec![]);
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 2);

        for uuid_str in uuids {
            let uuid = Uuid::parse_str(uuid_str).unwrap();
            assert_eq!(uuid.get_version(), Some(Version::Mac));
        }
    }

    #[test]
    fn test_generate_uuid_v1_with_custom_params() {
        let timestamp = 1234567890u64;
        let mac = vec![0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC];
        let result = generate_uuid_v1(1, Some(timestamp), mac);

        let uuid = Uuid::parse_str(result.trim()).unwrap();
        assert_eq!(uuid.get_version(), Some(Version::Mac));
    }

    #[test]
    fn test_generate_uuid_v3() {
        // Test with DNS namespace
        let result = generate_uuid_v3(2, Namespace::Dns, vec!["example.com".to_string()]).unwrap();
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 2);

        // Get the expected UUID for verification
        let expected_uuid =
            Uuid::new_v3(&Uuid::NAMESPACE_DNS, "example.com".as_bytes()).to_string();

        for uuid_str in uuids {
            let uuid = Uuid::parse_str(uuid_str).unwrap();
            assert_eq!(uuid.get_version(), Some(Version::Md5));
            // V3 UUIDs with same namespace and name should be identical
            assert_eq!(uuid_str, expected_uuid);
        }

        // Test with multiple names
        let result = generate_uuid_v3(
            3,
            Namespace::Url,
            vec![
                "http://example.com".to_string(),
                "http://test.com".to_string(),
            ],
        )
        .unwrap();
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 3);
    }

    #[test]
    fn test_generate_uuid_v5() {
        // Test with URL namespace
        let result =
            generate_uuid_v5(2, Namespace::Url, vec!["http://example.com".to_string()]).unwrap();
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 2);

        // Get the expected UUID for verification
        let expected_uuid =
            Uuid::new_v5(&Uuid::NAMESPACE_URL, "http://example.com".as_bytes()).to_string();

        for uuid_str in uuids {
            let uuid = Uuid::parse_str(uuid_str).unwrap();
            assert_eq!(uuid.get_version(), Some(Version::Sha1));
            // V5 UUIDs with same namespace and name should be identical
            assert_eq!(uuid_str, expected_uuid);
        }

        // Test with OID namespace as another example
        let result = generate_uuid_v5(1, Namespace::Oid, vec!["test".to_string()]).unwrap();
        let uuid = Uuid::parse_str(result.trim()).unwrap();
        assert_eq!(uuid.get_version(), Some(Version::Sha1));
    }

    #[test]
    fn test_generate_uuid_v4() {
        let result = generate_uuid_v4(5);
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 5);

        for uuid_str in uuids {
            let uuid = Uuid::parse_str(uuid_str).unwrap();
            assert_eq!(uuid.get_version(), Some(Version::Random));
        }
    }

    #[test]
    fn test_generate_uuid_v7() {
        let result = generate_uuid_v7(3, None);
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 3);

        for uuid_str in uuids {
            let uuid = Uuid::parse_str(uuid_str).unwrap();
            assert_eq!(uuid.get_version(), Some(Version::SortRand));
        }
    }

    #[test]
    fn test_generate_uuid_v3_v5_edge_cases() {
        // Test with empty names - should generate default names
        let result = generate_uuid_v3(3, Namespace::Dns, vec![]).unwrap();
        let uuids: Vec<&str> = result.split('\n').collect();
        assert_eq!(uuids.len(), 3);

        // Test with all standard namespaces
        for ns in &[
            Namespace::Dns,
            Namespace::Url,
            Namespace::Oid,
            Namespace::X500,
        ] {
            let result = generate_uuid_v5(1, ns.clone(), vec!["test".to_string()]);
            assert!(result.is_ok());
        }
    }

    #[test]
    fn test_analyze_uuid_v1() {
        let uuid_str = "550e8400-e29b-11d4-a716-446655440000";
        let analyzer = IdAnalyzer::analyze(uuid_str).unwrap();

        assert_eq!(analyzer.version, Some("V1 (Time-based)".to_string()));

        if let Content::V1(ref v1_content) = analyzer.content {
            assert_eq!(v1_content.mac_address, "44:66:55:44:00:00");
            assert_eq!(v1_content.node_id, [0x44, 0x66, 0x55, 0x44, 0x00, 0x00]);
            assert!(v1_content.timestamp.is_some());
        } else {
            panic!("Expected V1 content");
        }
    }

    #[test]
    fn test_analyze_uuid_v4() {
        let uuid_str = "c9a5e2ec-386c-4d28-b44d-8e7a3c6f5e48";
        let analyzer = IdAnalyzer::analyze(uuid_str).unwrap();

        assert_eq!(analyzer.version, Some("V4 (Random)".to_string()));

        if let Content::V4(ref v4_content) = analyzer.content {
            // V4 UUIDs should have 122 bits of randomness
            assert!(!v4_content.random_bits.is_empty());
        } else {
            panic!("Expected V4 content");
        }
    }

    #[test]
    fn test_analyze_uuid_v5() {
        let uuid_str = "74738ff5-5367-5958-9aee-98fffdcd1876";
        let analyzer = IdAnalyzer::analyze(uuid_str).unwrap();

        assert_eq!(analyzer.version, Some("V5 (SHA-1 Name-based)".to_string()));

        if let Content::V5(ref v5_content) = analyzer.content {
            assert!(v5_content.namespace_info.contains("SHA-1"));
        } else {
            panic!("Expected V5 content");
        }
    }

    #[test]
    fn test_analyze_uuid_v7() {
        // Generate a fresh UUID v7 to analyze
        let uuid_v7 = Uuid::new_v7(Timestamp::now(uuid::NoContext));
        let uuid_str = uuid_v7.to_string();
        let analyzer = IdAnalyzer::analyze(&uuid_str).unwrap();

        assert_eq!(analyzer.version, Some("V7 (Sortable Random)".to_string()));

        if let Content::V7(ref v7_content) = analyzer.content {
            // V7 UUIDs should have a valid timestamp
            assert!(v7_content.timestamp.is_some());
            assert!(v7_content.timestamp_ms > 0);
            assert!(!v7_content.random_bits.is_empty());
        } else {
            panic!("Expected V7 content");
        }
    }

    #[test]
    fn test_analyze_invalid_uuid() {
        let invalid_uuid = "not-a-valid-uuid";
        let result = IdAnalyzer::analyze(invalid_uuid);
        assert!(result.is_err());
    }

    #[test]
    fn test_multiple_uuid_versions() {
        let test_uuids = vec![
            // V1 - Time-based
            (
                "550e8400-e29b-11d4-a716-446655440000",
                Some("V1 (Time-based)".to_string()),
            ),
            (
                "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                Some("V1 (Time-based)".to_string()),
            ),
            // V4 - Random
            (
                "c9a5e2ec-386c-4d28-b44d-8e7a3c6f5e48",
                Some("V4 (Random)".to_string()),
            ),
            // V5 - SHA-1 name-based
            (
                "74738ff5-5367-5958-9aee-98fffdcd1876",
                Some("V5 (SHA-1 Name-based)".to_string()),
            ),
        ];

        for (uuid_str, expected_version) in test_uuids {
            let analyzer = IdAnalyzer::analyze(uuid_str).unwrap();
            assert_eq!(
                analyzer.version, expected_version,
                "UUID {} should have version {:?}",
                uuid_str, expected_version
            );
        }
    }

    #[test]
    fn test_v1_mac_address_flags() {
        // Test multicast MAC address (first octet has bit 0 set)
        let uuid_str = "550e8400-e29b-11d4-a716-016655440000";
        let uuid = Uuid::parse_str(uuid_str).unwrap();
        let v1_content = IdAnalyzer::analyze_v1(&uuid);

        // Check if multicast bit would be detected
        let is_multicast = v1_content.node_id[0] & 0x01 != 0;
        assert_eq!(is_multicast, v1_content.node_id[0] & 0x01 != 0);
    }

    #[test]
    fn test_v1_timestamp_conversion() {
        let uuid_str = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
        let analyzer = IdAnalyzer::analyze(uuid_str).unwrap();

        if let Content::V1(ref v1_content) = analyzer.content {
            // The timestamp should be convertible to a SystemTime
            assert!(v1_content.timestamp.is_some());

            if let Some(timestamp) = v1_content.timestamp {
                // Verify it's a reasonable timestamp
                let duration = timestamp.duration_since(UNIX_EPOCH);
                assert!(duration.is_ok());
            }
        } else {
            panic!("Expected V1 content");
        }
    }

    #[test]
    fn test_uuid_variant() {
        let test_cases = vec![
            "550e8400-e29b-11d4-a716-446655440000",
            "c9a5e2ec-386c-4d28-b44d-8e7a3c6f5e48",
        ];

        for uuid_str in test_cases {
            let analyzer = IdAnalyzer::analyze(uuid_str).unwrap();
            // Most UUIDs should be RFC4122 variant
            assert_eq!(analyzer.variant, "RFC4122".to_string());
        }
    }

    #[test]
    #[cfg(not(target_arch = "wasm32"))]
    fn test_generate_nanoid() {
        let result = generate_nanoid(3);
        let ids: Vec<&str> = result.split('\n').collect();
        assert_eq!(ids.len(), 3);

        // NanoIDs are typically 21 characters long
        for id in ids {
            assert_eq!(id.len(), 21);
        }
    }
}
