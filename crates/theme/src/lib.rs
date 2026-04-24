//! Theme layer for DevUtility.
//!
//! Wraps `gpui-component`'s `ActiveTheme` with:
//! - a `ThemeSettings { mode: Light | Dark | System }` setting
//! - palette JSON loaded from `assets/themes/*.json`
//! - live switching via the settings store
//!
//! Mirrors Zed's `crates/theme` approach.
