use dev_utility_core::codec::jwt::{decode_jwt, JwtDecodeResult, JwtDecodeStatus};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::input::{Input, InputState};
use gpui_component::{h_flex, v_flex, ActiveTheme};
use ui::{error_box, section};

pub struct JwtView {
    input_state: Entity<InputState>,
    result: Option<JwtDecodeResult>,
    error: Option<String>,
    _task: Option<Task<()>>,
}

impl JwtView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("Paste JWT here (three base64url parts separated by dots)...")
        });

        cx.observe(&input_state, |this, _, cx| {
            this.process(cx);
        })
        .detach();

        Self {
            input_state,
            result: None,
            error: None,
            _task: None,
        }
    }

    fn process(&mut self, cx: &mut Context<Self>) {
        self.error = None;
        let input = self.input_state.read(cx).text().to_string();

        if input.trim().is_empty() {
            self.result = None;
            self._task = None;
            cx.notify();
            return;
        }

        let bg = cx.background_executor().clone();

        // Parse algorithm from token header; fall back to HS256 on any error.
        let algorithm = input
            .split('.')
            .next()
            .and_then(|seg| {
                use base64::Engine as _;
                base64::engine::general_purpose::URL_SAFE_NO_PAD
                    .decode(seg)
                    .ok()
            })
            .and_then(|bytes| serde_json::from_slice::<serde_json::Value>(&bytes).ok())
            .and_then(|v| v.get("alg").and_then(|a| a.as_str()).map(str::to_owned))
            .and_then(|alg| alg.parse::<jsonwebtoken::Algorithm>().ok())
            .unwrap_or(jsonwebtoken::Algorithm::HS256);

        self._task = Some(cx.spawn(async move |this, cx| {
            let result = bg
                .spawn(async move {
                    decode_jwt(&input, algorithm, None).await
                })
                .await;

            let _ = this.update(cx, |this, cx| {
                match result {
                    Ok(r) => {
                        this.result = Some(r);
                        this.error = None;
                    }
                    Err(e) => {
                        this.error = Some(e.to_string());
                        this.result = None;
                    }
                }
                cx.notify();
            });
        }));
    }
}


impl Render for JwtView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let (header, payload, signature, status) = match &self.result {
            Some(r) => (
                r.header.clone(),
                r.payload.clone(),
                r.signature.clone(),
                Some(&r.status),
            ),
            None => (String::new(), String::new(), String::new(), None),
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
                            .child("Token"),
                    )
                    .child(
                        div()
                            .h(px(96.))
                            .rounded_lg()
                            .border_1()
                            .border_color(theme.border)
                            .bg(theme.background)
                            .p_2()
                            .overflow_hidden()
                            .child(Input::new(&self.input_state).appearance(false)),
                    ),
            )
            .when_some(status, |this, status| {
                let (label, color) = match status {
                    JwtDecodeStatus::Valid => ("Signature verified", ui::success()),
                    JwtDecodeStatus::Invalid => ("Signature invalid", theme.danger),
                    JwtDecodeStatus::Unverified => ("Unverified (no secret provided)", theme.muted_foreground),
                };
                this.child(
                    div()
                        .px_3()
                        .py_2()
                        .rounded_md()
                        .bg(color.opacity(0.1))
                        .border_1()
                        .border_color(color)
                        .text_sm()
                        .text_color(color)
                        .child(label),
                )
            })
            .child(
                h_flex()
                    .flex_1()
                    .gap_4()
                    .overflow_hidden()
                    .child(section("Header", header, theme))
                    .child(section("Payload", payload, theme))
                    .child(section("Signature (hex)", signature, theme)),
            )
            .when_some(self.error.clone(), |this, error| {
                this.child(error_box(error, theme))
            })
    }
}
