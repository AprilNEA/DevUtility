//! Cryptographic hash generator.
//!
//! Backed by `dev_utility_core::cryptography::hash::generate_hashes`,
//! which parallelizes MD2/MD4/MD5/SHA-1/SHA-2 family/SHA-3 family/Keccak
//! via `rayon` on native builds.

mod view;

pub use view::HashView;
