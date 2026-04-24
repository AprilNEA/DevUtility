use gpui::*;

pub fn error_box(error: impl Into<SharedString>, theme: &gpui_component::theme::Theme) -> Div {
    div()
        .px_3()
        .py_2()
        .rounded_md()
        .bg(theme.danger.opacity(0.1))
        .border_1()
        .border_color(theme.danger)
        .text_sm()
        .text_color(theme.danger)
        .child(error.into())
}
