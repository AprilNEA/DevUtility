//! JWT decoder.
//!
//! Backed by `dev_utility_core::codec::jwt::decode_jwt`. Desktop-only
//! on the core side (WASM skips it because `jsonwebtoken` is not
//! built for the wasm target).

mod view;

pub use view::JwtView;
