use dev_utility_core::converter::inspect_string;
use gpui::*;
use gpui_component::input::{Input, InputState};
use gpui_component::{h_flex, v_flex, ActiveTheme};

pub struct StringInspectorView {
    input_state: Entity<InputState>,
}

impl StringInspectorView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("The quick brown fox")
        });

        cx.observe(&input_state, |_, _, cx| cx.notify()).detach();

        Self { input_state }
    }
}

impl Render for StringInspectorView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let input = self.input_state.read(cx).text().to_string();
        let stats = inspect_string(&input);

        let stat = |label: &'static str, value: String| {
            v_flex()
                .flex_1()
                .gap_1()
                .px_4()
                .py_3()
                .rounded_lg()
                .border_1()
                .border_color(theme.border)
                .bg(theme.secondary)
                .child(
                    div()
                        .text_xs()
                        .text_color(theme.muted_foreground)
                        .child(label),
                )
                .child(
                    div()
                        .text_lg()
                        .font_weight(FontWeight::BOLD)
                        .font_family("monospace")
                        .text_color(theme.foreground)
                        .child(value),
                )
        };

        v_flex()
            .size_full()
            .gap_4()
            .child(
                h_flex()
                    .gap_3()
                    .child(stat("Characters", stats.char_count.to_string()))
                    .child(stat("Words", stats.word_count.to_string()))
                    .child(stat("Lines", stats.line_count.to_string()))
                    .child(stat("Bytes", stats.byte_count.to_string())),
            )
            .child(
                v_flex()
                    .flex_1()
                    .gap_2()
                    .overflow_hidden()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.muted_foreground)
                            .child("Input"),
                    )
                    .child(
                        div()
                            .flex_1()
                            .rounded_lg()
                            .border_1()
                            .border_color(theme.border)
                            .bg(theme.background)
                            .p_2()
                            .overflow_hidden()
                            .child(Input::new(&self.input_state).appearance(false)),
                    ),
            )
    }
}
