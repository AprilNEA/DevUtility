use dev_utility_core::converter::{escape_backslash, unescape_backslash};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme};
use ui::{error_box, Segment, SegmentedControl};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum EscapeMode {
    Escape,
    Unescape,
}

pub struct BackslashEscapistView {
    mode: EscapeMode,
    input_state: Entity<InputState>,
    output: String,
    error: Option<String>,
}

impl BackslashEscapistView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("e.g. Hello\\nWorld")
        });

        cx.observe(&input_state, |this, _, cx| this.process(cx))
            .detach();

        Self {
            mode: EscapeMode::Escape,
            input_state,
            output: String::new(),
            error: None,
        }
    }

    fn process(&mut self, cx: &mut Context<Self>) {
        self.error = None;
        let input = self.input_state.read(cx).text().to_string();
        if input.is_empty() {
            self.output.clear();
            cx.notify();
            return;
        }
        match self.mode {
            EscapeMode::Escape => self.output = escape_backslash(&input),
            EscapeMode::Unescape => match unescape_backslash(&input) {
                Ok(s) => self.output = s,
                Err(e) => {
                    self.error = Some(e.to_string());
                    self.output.clear();
                }
            },
        }
        cx.notify();
    }

    fn set_mode(&mut self, mode: EscapeMode, cx: &mut Context<Self>) {
        self.mode = mode;
        self.process(cx);
    }
}

impl Render for BackslashEscapistView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let mode = self.mode;

        v_flex()
            .size_full()
            .gap_4()
            .child(
                SegmentedControl::new("mode")
                    .segment(Segment::new(
                        "Escape",
                        mode == EscapeMode::Escape,
                        cx.listener(|this, _, _window, cx| {
                            this.set_mode(EscapeMode::Escape, cx);
                        }),
                    ))
                    .segment(Segment::new(
                        "Unescape",
                        mode == EscapeMode::Unescape,
                        cx.listener(|this, _, _window, cx| {
                            this.set_mode(EscapeMode::Unescape, cx);
                        }),
                    )),
            )
            .child(
                h_flex()
                    .flex_1()
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
