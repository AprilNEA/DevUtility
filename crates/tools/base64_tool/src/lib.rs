//! Base64 encoder/decoder tool.
//!
//! One of fifteen independent tool crates under `crates/tools/`.
//! Follows the Zed convention of a dedicated crate per user-facing feature.

mod view;

pub use view::{Base64View, CodecMode};
