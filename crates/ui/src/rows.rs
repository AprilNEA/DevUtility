use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, Disableable, Sizable};

/// Small label above a bordered rounded-lg input box.
pub fn labelled_input(
    label: impl Into<SharedString>,
    input: &Entity<InputState>,
    theme: &gpui_component::theme::Theme,
) -> Div {
    let label: SharedString = label.into();
    v_flex()
        .gap_1()
        .child(
            div()
                .text_xs()
                .font_weight(FontWeight::MEDIUM)
                .text_color(theme.muted_foreground)
                .child(label),
        )
        .child(
            div()
                .rounded_lg()
                .border_1()
                .border_color(theme.border)
                .bg(theme.background)
                .p_2()
                .child(Input::new(input).appearance(false)),
        )
}

/// Small muted label with a bordered scrollable monospace body.
pub fn section(
    label: impl Into<SharedString>,
    body: impl Into<SharedString>,
    theme: &gpui_component::theme::Theme,
) -> Div {
    let label: SharedString = label.into();
    let body: SharedString = body.into();
    v_flex()
        .flex_1()
        .gap_2()
        .overflow_hidden()
        .child(
            div()
                .text_sm()
                .font_weight(FontWeight::MEDIUM)
                .text_color(theme.muted_foreground)
                .child(label),
        )
        .child(
            div()
                .flex_1()
                .rounded_lg()
                .border_1()
                .border_color(theme.border)
                .bg(theme.background)
                .p_2()
                .overflow_y_scrollbar()
                .child(
                    div()
                        .size_full()
                        .text_sm()
                        .font_family("monospace")
                        .child(body),
                ),
        )
}

/// Key-value row with a trailing Copy button.
///
/// The caller is responsible for wrapping the handler with `cx.listener` when
/// operating inside a component context. The helper accepts a bare
/// `Fn(&ClickEvent, &mut Window, &mut App)` so it stays independent of any
/// particular view type.
pub fn row_with_copy(
    label: impl Into<SharedString>,
    value: impl Into<SharedString>,
    id: impl Into<ElementId>,
    on_copy: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    theme: &gpui_component::theme::Theme,
) -> Div {
    let label: SharedString = label.into();
    let value: SharedString = value.into();
    let disabled = value.is_empty();
    h_flex()
        .items_start()
        .gap_2()
        .px_3()
        .py_2()
        .rounded_md()
        .border_1()
        .border_color(theme.border)
        .bg(theme.secondary)
        .child(
            div()
                .w(px(140.))
                .text_sm()
                .font_weight(FontWeight::MEDIUM)
                .text_color(theme.muted_foreground)
                .child(label),
        )
        .child(
            div()
                .flex_1()
                .text_sm()
                .font_family("monospace")
                .text_color(theme.foreground)
                .child(value),
        )
        .child(
            Button::new(id)
                .label("Copy")
                .small()
                .ghost()
                .disabled(disabled)
                .on_click(on_copy),
        )
}

/// Multi-line scrollable key panel with a trailing Copy button.
///
/// Same handler convention as `row_with_copy`.
pub fn pem_panel(
    label: impl Into<SharedString>,
    value: impl Into<SharedString>,
    copy_id: impl Into<ElementId>,
    on_copy: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    theme: &gpui_component::theme::Theme,
) -> Div {
    let label: SharedString = label.into();
    let value: SharedString = value.into();
    let disabled = value.is_empty();
    v_flex()
        .flex_1()
        .gap_2()
        .overflow_hidden()
        .child(
            h_flex()
                .items_center()
                .justify_between()
                .child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.muted_foreground)
                        .child(label),
                )
                .child(
                    Button::new(copy_id)
                        .label("Copy")
                        .small()
                        .ghost()
                        .disabled(disabled)
                        .on_click(on_copy),
                ),
        )
        .child(
            div()
                .flex_1()
                .rounded_lg()
                .border_1()
                .border_color(theme.border)
                .bg(theme.background)
                .p_2()
                .overflow_y_scrollbar()
                .child(
                    div()
                        .size_full()
                        .text_sm()
                        .font_family("monospace")
                        .child(value),
                ),
        )
}
