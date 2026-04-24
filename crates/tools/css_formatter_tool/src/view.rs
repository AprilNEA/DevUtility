use dev_utility_core::formatter::format_css;
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::error_box;

pub struct CssFormatterView {
    input_state: Entity<InputState>,
    output: String,
    error: Option<String>,
}

impl CssFormatterView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("Paste CSS here...")
        });

        cx.observe(&input_state, |this, _, cx| {
            this.process(cx);
        })
        .detach();

        Self {
            input_state,
            output: String::new(),
            error: None,
        }
    }

    fn process(&mut self, cx: &mut Context<Self>) {
        self.error = None;
        let input = self.input_state.read(cx).text().to_string();

        if input.trim().is_empty() {
            self.output.clear();
            cx.notify();
            return;
        }

        match format_css(input) {
            Ok(s) => self.output = s,
            Err(e) => {
                self.error = Some(e.to_string());
                self.output.clear();
            }
        }
        cx.notify();
    }

    fn copy_output(&self, cx: &mut Context<Self>) {
        if !self.output.is_empty() {
            cx.write_to_clipboard(ClipboardItem::new_string(self.output.clone()));
        }
    }
}

impl Render for CssFormatterView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();

        v_flex()
            .size_full()
            .gap_4()
            .child(
                h_flex().items_center().justify_end().child(
                    Button::new("copy")
                        .label("Copy")
                        .small()
                        .ghost()
                        .disabled(self.output.is_empty())
                        .on_click(cx.listener(|this, _, _window, cx| {
                            this.copy_output(cx);
                        })),
                ),
            )
            .child(
                div()
                    .flex_1()
                    .flex()
                    .flex_row()
                    .gap_4()
                    .overflow_hidden()
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
                                    .child("Output"),
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
                                            .child(self.output.clone()),
                                    ),
                            ),
                    ),
            )
            .when_some(self.error.clone(), |this, error| {
                this.child(error_box(error, theme))
            })
    }
}
