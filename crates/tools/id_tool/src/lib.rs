//! UUID and ULID generator tool.
//!
//! Covers UUID v4, UUID v7, and ULID in the initial MVP.
//! Matches the React `id` page in `packages/frontend/src/pages/generator/id`.

mod view;

pub use view::{IdGeneratorView, IdType};
