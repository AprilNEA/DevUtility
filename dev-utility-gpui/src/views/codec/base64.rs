use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use gpui::*;
use gpui::prelude::FluentBuilder;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::tab::{Tab, TabBar};
use gpui_component::{h_flex, v_flex, ActiveTheme, Selectable, Sizable};
use gpui_component::scroll::ScrollableElement;

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum CodecMode {
    Encode,
    Decode,
}

pub struct Base64View {
    mode: CodecMode,
    input_state: Entity<InputState>,
    output: String,
    error: Option<String>,
}

impl Base64View {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("Enter text to encode/decode...")
        });

        cx.observe(&input_state, |this, _, cx| {
            this.process(cx);
        })
        .detach();

        Self {
            mode: CodecMode::Encode,
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
            CodecMode::Encode => {
                self.output = BASE64.encode(input.as_bytes());
            }
            CodecMode::Decode => match BASE64.decode(&input) {
                Ok(bytes) => match String::from_utf8(bytes) {
                    Ok(s) => self.output = s,
                    Err(e) => {
                        self.error = Some(format!("Invalid UTF-8: {}", e));
                        self.output.clear();
                    }
                },
                Err(e) => {
                    self.error = Some(format!("Decode error: {}", e));
                    self.output.clear();
                }
            },
        }
        cx.notify();
    }

    fn set_mode(&mut self, mode: CodecMode, cx: &mut Context<Self>) {
        self.mode = mode;
        self.process(cx);
    }

    fn clear(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.input_state.update(cx, |state, cx| {
            state.set_value("", window, cx);
        });
        self.output.clear();
        self.error = None;
        cx.notify();
    }

    fn copy_output(&self, cx: &mut Context<Self>) {
        if !self.output.is_empty() {
            cx.write_to_clipboard(ClipboardItem::new_string(self.output.clone()));
        }
    }

    fn paste_input(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        if let Some(item) = cx.read_from_clipboard() {
            if let Some(text) = item.text() {
                self.input_state.update(cx, |state, inner_cx| {
                    state.set_value(text, window, inner_cx);
                });
            }
        }
    }
}

impl Render for Base64View {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let mode = self.mode;

        v_flex()
            .size_full()
            .gap_4()
            .child(
                // Toolbar
                h_flex()
                    .items_center()
                    .justify_between()
                    .child(
                        TabBar::new("mode")
                            .child(
                                Tab::new()
                                    .label("Encode")
                                    .selected(mode == CodecMode::Encode)
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.set_mode(CodecMode::Encode, cx);
                                    })),
                            )
                            .child(
                                Tab::new()
                                    .label("Decode")
                                    .selected(mode == CodecMode::Decode)
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.set_mode(CodecMode::Decode, cx);
                                    })),
                            ),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .child(
                                Button::new("paste")
                                    .label("Paste")
                                    .small()
                                    .ghost()
                                    .on_click(cx.listener(|this, _, window, cx| {
                                        this.paste_input(window, cx);
                                    })),
                            )
                            .child(
                                Button::new("copy")
                                    .label("Copy")
                                    .small()
                                    .ghost()
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.copy_output(cx);
                                    })),
                            )
                            .child(
                                Button::new("clear")
                                    .label("Clear")
                                    .small()
                                    .ghost()
                                    .on_click(cx.listener(|this, _, window, cx| {
                                        this.clear(window, cx);
                                    })),
                            ),
                    ),
            )
            .child(
                // Main content
                div()
                    .flex_1()
                    .flex()
                    .flex_row()
                    .gap_4()
                    .overflow_hidden()
                    .child(
                        // Input section
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
                                    .child(
                                        Input::new(&self.input_state)
                                            .appearance(false),
                                    ),
                            ),
                    )
                    .child(
                        // Output section
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
                this.child(
                    div()
                        .px_3()
                        .py_2()
                        .rounded_md()
                        .bg(theme.danger.opacity(0.1))
                        .border_1()
                        .border_color(theme.danger)
                        .text_sm()
                        .text_color(theme.danger)
                        .child(error),
                )
            })
    }
}
