use dev_utility_core::codec::{decode_base64, encode_base64, Base64Engine};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::{error_box, Segment, SegmentedControl};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum CodecMode {
    Encode,
    Decode,
}

pub struct Base64View {
    mode: CodecMode,
    engine: Base64Engine,
    input_state: Entity<InputState>,
    output: String,
    error: Option<String>,
    _task: Option<Task<()>>,
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
            engine: Base64Engine::Standard,
            input_state,
            output: String::new(),
            error: None,
            _task: None,
        }
    }

    fn process(&mut self, cx: &mut Context<Self>) {
        self.error = None;

        let input = self.input_state.read(cx).text().to_string();

        if input.is_empty() {
            self.output.clear();
            self._task = None;
            cx.notify();
            return;
        }

        let mode = self.mode;
        let url_safe = matches!(self.engine, Base64Engine::UrlSafe);
        let bg = cx.background_executor().clone();

        self._task = Some(cx.spawn(async move |this, cx| {
            let result = bg
                .spawn(async move {
                    match mode {
                        // encode_base64 in core only supports Standard; URL-safe encode is not yet implemented.
                        CodecMode::Encode => encode_base64(&input).await,
                        CodecMode::Decode => {
                            let e = if url_safe {
                                Base64Engine::UrlSafe
                            } else {
                                Base64Engine::Standard
                            };
                            decode_base64(&input, e).await
                        }
                    }
                })
                .await;

            let _ = this.update(cx, |this, cx| {
                match result {
                    Ok(s) => {
                        this.output = s;
                        this.error = None;
                    }
                    Err(e) => {
                        this.error = Some(e.to_string());
                        this.output.clear();
                    }
                }
                cx.notify();
            });
        }));
    }

    fn set_mode(&mut self, mode: CodecMode, cx: &mut Context<Self>) {
        self.mode = mode;
        self.process(cx);
    }

    fn set_engine(&mut self, engine: Base64Engine, cx: &mut Context<Self>) {
        self.engine = engine;
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
        let is_url_safe = matches!(self.engine, Base64Engine::UrlSafe);

        v_flex()
            .size_full()
            .gap_4()
            .child(
                h_flex()
                    .items_center()
                    .justify_between()
                    .child(
                        h_flex()
                            .gap_2()
                            .child(
                                SegmentedControl::new("mode")
                                    .segment(Segment::new(
                                        "Encode",
                                        mode == CodecMode::Encode,
                                        cx.listener(|this, _, _window, cx| {
                                            this.set_mode(CodecMode::Encode, cx);
                                        }),
                                    ))
                                    .segment(Segment::new(
                                        "Decode",
                                        mode == CodecMode::Decode,
                                        cx.listener(|this, _, _window, cx| {
                                            this.set_mode(CodecMode::Decode, cx);
                                        }),
                                    )),
                            )
                            .child(
                                SegmentedControl::new("engine")
                                    .segment(Segment::new(
                                        "Standard",
                                        !is_url_safe,
                                        cx.listener(|this, _, _window, cx| {
                                            this.set_engine(Base64Engine::Standard, cx);
                                        }),
                                    ))
                                    .segment(Segment::new(
                                        "URL-safe",
                                        is_url_safe,
                                        cx.listener(|this, _, _window, cx| {
                                            this.set_engine(Base64Engine::UrlSafe, cx);
                                        }),
                                    )),
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
                                    .disabled(self.output.is_empty())
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
            .when(
                matches!(self.engine, Base64Engine::UrlSafe) && self.mode == CodecMode::Encode,
                |this| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(theme.muted_foreground)
                            .child("URL-safe encode produces standard Base64 output (core limitation)."),
                    )
                },
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
