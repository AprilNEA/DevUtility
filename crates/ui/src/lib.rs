//! Shared UI primitives for DevUtility views.
//!
//! Current exports:
//! - `error_box` — danger callout box used by tool views to surface errors
//! - `Segment` — a single selectable item for `SegmentedControl`
//! - `SegmentedControl` — horizontal toggle bar used by tool views
//! - `success` — semantic success color (green, works in light and dark themes)
//! - `labelled_input` — small label above a bordered rounded-lg input box
//! - `section` — small muted label with a bordered scrollable monospace body
//! - `row_with_copy` — key-value row with a trailing Copy button
//! - `pem_panel` — multi-line scrollable key panel with a trailing Copy button

mod colors;
mod error_box;
mod rows;
mod segmented_control;

pub use colors::success;
pub use error_box::error_box;
pub use rows::{labelled_input, pem_panel, row_with_copy, section};
pub use segmented_control::{Segment, SegmentedControl};
