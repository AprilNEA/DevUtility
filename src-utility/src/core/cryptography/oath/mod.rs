pub mod hotp;
pub use hotp::*;

pub mod totp;
pub use totp::*;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum HashAlgorithm {
    SHA1,
    SHA256,
    SHA512,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SyncStatus {
    Synchronized,
    DriftDetected,
    OutOfSync,
}
