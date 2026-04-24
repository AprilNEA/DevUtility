//! Settings store for DevUtility.
//!
//! Mirrors Zed's `crates/settings`:
//! - each crate declares its own `Settings` struct and registers it with the store
//! - a three-layer merge (embedded defaults → release-channel overrides → user overrides)
//! - JSON5 on disk at the platform config dir (resolved via `directories`)
//! - live reload via a `notify` file watcher
