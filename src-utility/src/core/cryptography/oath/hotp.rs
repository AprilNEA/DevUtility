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

use super::{HashAlgorithm, SyncStatus};
use serde::{Deserialize, Serialize};
use universal_function_macro::universal_function;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HotpConfig {
    pub secret: String,           // Base32 encoded secret
    pub issuer: String,           // Service name
    pub account: String,          // Account identifier
    pub algorithm: HashAlgorithm, // HMAC algorithm
    pub digits: u32,              // Code length (4-8 digits)
    pub counter: u64,             // Current counter value
    pub initial_counter: u64,     // Initial counter value
    pub label: Option<String>,    // Custom label for UI
    pub created_at: u64,          // Creation timestamp
    pub last_used: Option<u64>,   // Last usage timestamp
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HotpResult {
    pub code: String,             // Generated HOTP code
    pub counter_used: u64,        // Counter value used for generation
    pub next_counter: u64,        // Next counter value
    pub algorithm: HashAlgorithm, // Algorithm used
    pub digits: u32,              // Code length
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HotpValidationResult {
    pub is_valid: bool,             // Whether code is valid
    pub counter_offset: i32,        // Offset from expected counter
    pub used_counter: u64,          // Counter value that matched
    pub new_counter: u64,           // New counter value after validation
    pub counter_synchronized: bool, // Whether counter was synchronized
    pub message: String,            // Validation message
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CounterInfo {
    pub current_counter: u64,        // Current counter value
    pub initial_counter: u64,        // Initial counter value
    pub total_generated: u64,        // Total codes generated
    pub last_increment: Option<u64>, // Last increment timestamp
    pub sync_status: SyncStatus,     // Synchronization status
}