//! JSON formatter / minifier.
//!
//! Backed by `dev_utility_core::formatter::format_json`, which uses
//! `sonic-rs` on native builds and `serde_json` on wasm.

mod view;

pub use view::JsonFormatterView;
