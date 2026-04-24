//! Unix timestamp → human-readable date conversion.
//!
//! Uses `chrono` locally (not via core) because core avoids a chrono dep
//! to keep its WASM build small.

mod view;

pub use view::UnixTimeView;
