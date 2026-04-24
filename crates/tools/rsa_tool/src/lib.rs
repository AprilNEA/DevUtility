//! RSA key generator + analyzer.
//!
//! Two modes in a single view: `Generator` creates a new keypair at
//! the selected bit size (1024–4096) and shows PEM output;
//! `Analyzer` parses a pasted PEM-encoded public or private key and
//! renders its parameters and fingerprints.
//!
//! Key generation runs on a background executor — a 4096-bit key
//! blocks for several seconds of CPU and would freeze the UI thread
//! if run inline.

mod view;

pub use view::{RsaMode, RsaView};
