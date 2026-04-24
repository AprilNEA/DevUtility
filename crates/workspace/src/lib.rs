//! Workspace model for DevUtility.
//!
//! A stripped-down port of Zed's `crates/workspace`:
//! - `Workspace` hosts `left_dock`, a `center_pane` holding tabbed items, and optional docks.
//! - `Panel` trait — implemented by dock contents (e.g., `tools_panel::ToolsPanel`).
//! - `Item` trait — implemented by every tool view. `workspace.open_item(ToolView::new())`
//!   becomes the primary way to switch tools.
//!
//! No split panes in this iteration — a single center pane is enough.
