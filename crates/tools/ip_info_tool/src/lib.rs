//! IP address info lookup.
//!
//! Fetches geo / ASN / org metadata from `ipinfo.io`'s free endpoint.
//! Synchronous HTTP runs inside `cx.background_executor().spawn` so
//! the UI thread never blocks on the network.

mod view;

pub use view::IpInfoView;
