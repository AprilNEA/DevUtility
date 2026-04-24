use gpui::Hsla;

/// Semantic "success" color. gpui-component's theme does not expose a
/// dedicated success color, so we hard-code a green that works in both
/// light and dark themes. Replace when the theme gains a proper token.
pub fn success() -> Hsla {
    gpui::hsla(145.0 / 360.0, 0.63, 0.42, 1.0)
}
