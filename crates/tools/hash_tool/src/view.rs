use dev_utility_core::cryptography::hash::{generate_hashes, HashResult};
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};

pub struct HashView {
    input_state: Entity<InputState>,
    result: Option<HashResult>,
    _task: Option<Task<()>>,
}

impl HashView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("The quick brown fox")
        });

        cx.observe(&input_state, |this, _, cx| {
            this.process(cx);
        })
        .detach();

        Self {
            input_state,
            result: None,
            _task: None,
        }
    }

    fn process(&mut self, cx: &mut Context<Self>) {
        let input = self.input_state.read(cx).text().to_string();

        if input.is_empty() {
            self.result = None;
            self._task = None;
            cx.notify();
            return;
        }

        let inner = cx.background_executor().spawn(async move { generate_hashes(&input) });

        self._task = Some(cx.spawn(async move |this, cx| {
            let result = inner.await;
            let _ = this.update(cx, |this, cx| {
                this.result = Some(result);
                cx.notify();
            });
        }));
    }

    fn copy(&self, value: String, cx: &mut Context<Self>) {
        cx.write_to_clipboard(ClipboardItem::new_string(value));
    }
}

impl Render for HashView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();

        let rows: Vec<(&'static str, String)> = match &self.result {
            Some(r) => vec![
                ("MD2", r.md2.clone()),
                ("MD4", r.md4.clone()),
                ("MD5", r.md5.clone()),
                ("SHA-1", r.sha1.clone()),
                ("SHA-224", r.sha224.clone()),
                ("SHA-256", r.sha256.clone()),
                ("SHA-384", r.sha384.clone()),
                ("SHA-512", r.sha512.clone()),
                ("SHA3-256", r.sha3_256.clone()),
                ("Keccak-256", r.keccak256.clone()),
            ],
            None => Vec::new(),
        };

        v_flex()
            .size_full()
            .gap_4()
            .child(
                v_flex()
                    .gap_2()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.muted_foreground)
                            .child("Input"),
                    )
                    .child(
                        div()
                            .h(px(128.))
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
                            .child("Hashes"),
                    )
                    .child(
                        v_flex()
                            .flex_1()
                            .gap_1()
                            .overflow_y_scrollbar()
                            .children(rows.into_iter().map(|(name, value)| {
                                let value_for_copy = value.clone();
                                h_flex()
                                    .items_center()
                                    .gap_2()
                                    .px_3()
                                    .py_2()
                                    .rounded_md()
                                    .border_1()
                                    .border_color(theme.border)
                                    .bg(theme.secondary)
                                    .child(
                                        div()
                                            .w(px(120.))
                                            .text_sm()
                                            .font_weight(FontWeight::MEDIUM)
                                            .text_color(theme.muted_foreground)
                                            .child(name),
                                    )
                                    .child(
                                        div()
                                            .flex_1()
                                            .text_sm()
                                            .font_family("monospace")
                                            .text_color(theme.foreground)
                                            .overflow_x_hidden()
                                            .child(value.clone()),
                                    )
                                    .child(
                                        Button::new(SharedString::from(format!(
                                            "copy-{}",
                                            name
                                        )))
                                        .label("Copy")
                                        .small()
                                        .ghost()
                                        .disabled(value.is_empty())
                                        .on_click(cx.listener(
                                            move |this, _, _window, cx| {
                                                this.copy(value_for_copy.clone(), cx);
                                            },
                                        )),
                                    )
                            })),
                    ),
            )
    }
}
