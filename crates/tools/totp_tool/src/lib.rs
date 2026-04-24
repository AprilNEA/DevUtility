//! TOTP (RFC 6238) debugger.
//!
//! Three modes: generate a new secret + otpauth URI, live-tick a code
//! from an existing secret, and validate a user-entered code against
//! the current time window.
//!
//! The live ticker drives `cx.notify()` once per second via the
//! background executor's `timer`, then the render pass re-computes the
//! current code synchronously from the secret.

mod view;

pub use view::{TotpMode, TotpView};
