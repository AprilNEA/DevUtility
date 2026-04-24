use std::time::Duration;

use dev_utility_core::cryptography::oath::{
    generate_totp_code, generate_totp_secret, validate_totp_code, HashAlgorithm,
    TotpSecretResult, TotpValidationResult,
};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::InputState;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::{error_box, labelled_input, row_with_copy, Segment, SegmentedControl};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum TotpMode {
    Secret,
    Live,
    Validate,
}

pub struct TotpView {
    mode: TotpMode,
    // Shared settings
    algorithm: HashAlgorithm,
    digits: u32,
    period: u32,
    // Secret builder
    issuer_input: Entity<InputState>,
    account_input: Entity<InputState>,
    secret_result: Option<TotpSecretResult>,
    secret_error: Option<String>,
    building: bool,
    _build_task: Option<Task<()>>,
    // Live ticker
    live_secret_input: Entity<InputState>,
    live_cached_code: String,
    live_cached_remaining: u64,
    live_cached_error: Option<String>,
    _live_task: Option<Task<()>>,
    // Validator
    validate_secret_input: Entity<InputState>,
    validate_code_input: Entity<InputState>,
    validation: Option<TotpValidationResult>,
    validation_error: Option<String>,
    validating: bool,
    _validate_task: Option<Task<()>>,
    // Ticker task — dropped when view drops, loop exits on update() error
    _tick_task: Option<Task<()>>,
}

impl TotpView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let issuer_input = cx.new(|cx| {
            InputState::new(window, cx).placeholder("Issuer (e.g. MyApp)")
        });
        let account_input = cx.new(|cx| {
            InputState::new(window, cx).placeholder("Account (e.g. alice@example.com)")
        });
        let live_secret_input = cx.new(|cx| {
            InputState::new(window, cx).placeholder("e.g. JBSWY3DPEHPK3PXP")
        });
        let validate_secret_input = cx.new(|cx| {
            InputState::new(window, cx).placeholder("e.g. JBSWY3DPEHPK3PXP")
        });
        let validate_code_input = cx.new(|cx| {
            InputState::new(window, cx).placeholder("6-digit code...")
        });

        cx.observe(&live_secret_input, |this, _, cx| {
            if matches!(this.mode, TotpMode::Live) {
                this.refresh_live_code(cx);
            }
        })
        .detach();

        let tick_task = cx.spawn(async move |this, cx| {
            loop {
                cx.background_executor()
                    .timer(Duration::from_secs(1))
                    .await;
                if this
                    .update(cx, |this, cx| {
                        if this.mode == TotpMode::Live {
                            this.refresh_live_code(cx);
                        }
                    })
                    .is_err()
                {
                    break;
                }
            }
        });

        Self {
            mode: TotpMode::Secret,
            algorithm: HashAlgorithm::SHA1,
            digits: 6,
            period: 30,
            issuer_input,
            account_input,
            secret_result: None,
            secret_error: None,
            building: false,
            _build_task: None,
            live_secret_input,
            live_cached_code: placeholder_dashes(6),
            live_cached_remaining: 0,
            live_cached_error: None,
            _live_task: None,
            validate_secret_input,
            validate_code_input,
            validation: None,
            validation_error: None,
            validating: false,
            _validate_task: None,
            _tick_task: Some(tick_task),
        }
    }

    fn refresh_live_code(&mut self, cx: &mut Context<Self>) {
        let secret = self.live_secret_input.read(cx).text().to_string();
        let digits = self.digits;
        if secret.trim().is_empty() {
            self.live_cached_code = placeholder_dashes(digits);
            self.live_cached_remaining = 0;
            self.live_cached_error = None;
            cx.notify();
            return;
        }
        let algorithm = self.algorithm.clone();
        let period = self.period;
        let secret_trimmed = secret.trim().to_string();
        let task = cx.spawn(async move |this, cx| {
            let result = cx
                .background_executor()
                .spawn(generate_totp_code(
                    secret_trimmed,
                    algorithm,
                    digits,
                    period,
                ))
                .await;
            let _ = this.update(cx, |this, cx| {
                match result {
                    Ok(r) => {
                        this.live_cached_code = format_code(&r.code);
                        this.live_cached_remaining = r.time_remaining;
                        this.live_cached_error = None;
                    }
                    Err(e) => {
                        this.live_cached_code = placeholder_dashes(this.digits);
                        this.live_cached_remaining = 0;
                        this.live_cached_error = Some(e.to_string());
                    }
                }
                cx.notify();
            });
        });
        self._live_task = Some(task);
    }

    fn set_mode(&mut self, mode: TotpMode, cx: &mut Context<Self>) {
        self.mode = mode;
        cx.notify();
        if mode == TotpMode::Live {
            self.refresh_live_code(cx);
        }
    }

    fn set_algorithm(&mut self, alg: HashAlgorithm, cx: &mut Context<Self>) {
        self.algorithm = alg;
        cx.notify();
        self.refresh_live_code(cx);
    }

    fn set_digits(&mut self, digits: u32, cx: &mut Context<Self>) {
        self.digits = digits;
        cx.notify();
        self.refresh_live_code(cx);
    }

    fn set_period(&mut self, period: u32, cx: &mut Context<Self>) {
        self.period = period;
        self.live_cached_remaining = 0;
        cx.notify();
        self.refresh_live_code(cx);
    }

    fn build_secret(&mut self, cx: &mut Context<Self>) {
        if self.building {
            return;
        }
        let issuer = self.issuer_input.read(cx).text().to_string();
        let account = self.account_input.read(cx).text().to_string();
        if issuer.trim().is_empty() || account.trim().is_empty() {
            self.secret_error = Some("Both issuer and account are required".to_string());
            self.secret_result = None;
            cx.notify();
            return;
        }
        let algorithm = self.algorithm.clone();
        let digits = self.digits;
        let period = self.period;
        self.building = true;
        let task = cx.spawn(async move |this, cx| {
            let result = cx
                .background_executor()
                .spawn(generate_totp_secret(
                    issuer,
                    account,
                    algorithm,
                    digits,
                    period,
                    None,
                    true,
                ))
                .await;
            let _ = this.update(cx, |this, cx| {
                this.building = false;
                match result {
                    Ok(r) => {
                        this.secret_result = Some(r);
                        this.secret_error = None;
                    }
                    Err(e) => {
                        this.secret_error = Some(e.to_string());
                        this.secret_result = None;
                    }
                }
                cx.notify();
            });
        });
        self._build_task = Some(task);
    }

    fn run_validation(&mut self, cx: &mut Context<Self>) {
        if self.validating {
            return;
        }
        let secret = self.validate_secret_input.read(cx).text().to_string();
        let code = self.validate_code_input.read(cx).text().to_string();
        if secret.trim().is_empty() || code.trim().is_empty() {
            self.validation_error = Some("Both secret and code are required".to_string());
            self.validation = None;
            cx.notify();
            return;
        }
        let algorithm = self.algorithm.clone();
        let digits = self.digits;
        let period = self.period;
        self.validating = true;
        let task = cx.spawn(async move |this, cx| {
            let result = cx
                .background_executor()
                .spawn(validate_totp_code(
                    secret,
                    code,
                    algorithm,
                    digits,
                    period,
                    1,
                ))
                .await;
            let _ = this.update(cx, |this, cx| {
                this.validating = false;
                match result {
                    Ok(r) => {
                        this.validation = Some(r);
                        this.validation_error = None;
                    }
                    Err(e) => {
                        this.validation_error = Some(e.to_string());
                        this.validation = None;
                    }
                }
                cx.notify();
            });
        });
        self._validate_task = Some(task);
    }

    fn copy(&self, value: String, cx: &mut Context<Self>) {
        if !value.is_empty() {
            cx.write_to_clipboard(ClipboardItem::new_string(value));
        }
    }
}

impl Render for TotpView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let mode = self.mode;

        let mode_bar = SegmentedControl::new("totp-mode")
            .segment(Segment::new(
                "Secret",
                mode == TotpMode::Secret,
                cx.listener(|this, _, _window, cx| this.set_mode(TotpMode::Secret, cx)),
            ))
            .segment(Segment::new(
                "Live code",
                mode == TotpMode::Live,
                cx.listener(|this, _, _window, cx| this.set_mode(TotpMode::Live, cx)),
            ))
            .segment(Segment::new(
                "Validate",
                mode == TotpMode::Validate,
                cx.listener(|this, _, _window, cx| this.set_mode(TotpMode::Validate, cx)),
            ));

        let settings_bar = self.render_settings(cx);

        let content: AnyElement = match mode {
            TotpMode::Secret => self.render_secret(cx).into_any_element(),
            TotpMode::Live => self.render_live(cx).into_any_element(),
            TotpMode::Validate => self.render_validate(cx).into_any_element(),
        };

        v_flex()
            .size_full()
            .gap_4()
            .child(h_flex().items_center().gap_3().child(mode_bar).child(settings_bar))
            .child(content)
    }
}

impl TotpView {
    fn render_settings(&self, cx: &Context<Self>) -> Div {
        let theme = cx.theme();
        let algorithm = self.algorithm.clone();
        let digits = self.digits;
        let period = self.period;

        let alg_bar = SegmentedControl::new("totp-alg")
            .segment(Segment::new(
                "SHA1",
                matches!(algorithm, HashAlgorithm::SHA1),
                cx.listener(|this, _, _window, cx| this.set_algorithm(HashAlgorithm::SHA1, cx)),
            ))
            .segment(Segment::new(
                "SHA256",
                matches!(algorithm, HashAlgorithm::SHA256),
                cx.listener(|this, _, _window, cx| this.set_algorithm(HashAlgorithm::SHA256, cx)),
            ))
            .segment(Segment::new(
                "SHA512",
                matches!(algorithm, HashAlgorithm::SHA512),
                cx.listener(|this, _, _window, cx| this.set_algorithm(HashAlgorithm::SHA512, cx)),
            ));

        let digits_bar = SegmentedControl::new("totp-digits")
            .segment(Segment::new(
                "6",
                digits == 6,
                cx.listener(|this, _, _window, cx| this.set_digits(6, cx)),
            ))
            .segment(Segment::new(
                "7",
                digits == 7,
                cx.listener(|this, _, _window, cx| this.set_digits(7, cx)),
            ))
            .segment(Segment::new(
                "8",
                digits == 8,
                cx.listener(|this, _, _window, cx| this.set_digits(8, cx)),
            ));

        let period_bar = SegmentedControl::new("totp-period")
            .segment(Segment::new(
                "30s",
                period == 30,
                cx.listener(|this, _, _window, cx| this.set_period(30, cx)),
            ))
            .segment(Segment::new(
                "60s",
                period == 60,
                cx.listener(|this, _, _window, cx| this.set_period(60, cx)),
            ));

        h_flex()
            .items_center()
            .gap_3()
            .child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child("Alg"),
            )
            .child(alg_bar)
            .child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child("Digits"),
            )
            .child(digits_bar)
            .child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child("Period"),
            )
            .child(period_bar)
    }

    fn render_secret(&self, cx: &Context<Self>) -> Div {
        let theme = cx.theme();
        let uri = self
            .secret_result
            .as_ref()
            .map(|r| r.provisioning_uri.clone())
            .unwrap_or_default();
        let secret = self
            .secret_result
            .as_ref()
            .map(|r| r.secret.clone())
            .unwrap_or_default();

        let secret_for_copy = secret.clone();
        let uri_for_copy = uri.clone();

        v_flex()
            .flex_1()
            .gap_4()
            .child(labelled_input("Issuer", &self.issuer_input, theme))
            .child(labelled_input("Account", &self.account_input, theme))
            .child(
                Button::new("generate-secret")
                    .label("Generate")
                    .small()
                    .primary()
                    .on_click(cx.listener(|this, _, _window, cx| this.build_secret(cx))),
            )
            .when_some(self.secret_error.clone(), |this, e| {
                this.child(error_box(e, theme))
            })
            .when(self.secret_result.is_some(), |this| {
                this.child(
                    v_flex()
                        .gap_2()
                        .child(
                            row_with_copy(
                                "Secret (base32)",
                                secret,
                                "copy-secret",
                                cx.listener(move |this, _, _window, cx| {
                                    this.copy(secret_for_copy.clone(), cx)
                                }),
                                theme,
                            ),
                        )
                        .child(
                            row_with_copy(
                                "otpauth URI",
                                uri,
                                "copy-uri",
                                cx.listener(move |this, _, _window, cx| {
                                    this.copy(uri_for_copy.clone(), cx)
                                }),
                                theme,
                            ),
                        ),
                )
            })
    }

    fn render_live(&self, cx: &Context<Self>) -> Div {
        let theme = cx.theme();
        let secret = self.live_secret_input.read(cx).text().to_string();

        let code = self.live_cached_code.clone();
        let remaining = self.live_cached_remaining;
        let period = self.period;

        let pct = if period > 0 && self.live_cached_error.is_none() && !secret.trim().is_empty() {
            let elapsed = (period as u64).saturating_sub(remaining);
            (elapsed as f32 / period as f32).clamp(0.0, 1.0)
        } else {
            0.
        };

        let code_for_copy = code.replace(' ', "");
        let copy_disabled = secret.trim().is_empty() || self.live_cached_error.is_some();

        v_flex()
            .flex_1()
            .gap_4()
            .child(labelled_input("Secret", &self.live_secret_input, theme))
            .child(
                v_flex()
                    .items_center()
                    .gap_2()
                    .py_6()
                    .rounded_lg()
                    .border_1()
                    .border_color(theme.border)
                    .bg(theme.secondary)
                    .child(
                        div()
                            .text_3xl()
                            .font_family("monospace")
                            .font_weight(FontWeight::BOLD)
                            .text_color(theme.foreground)
                            .child(code),
                    )
                    .child(
                        div()
                            .w(px(320.))
                            .h(px(6.))
                            .rounded_md()
                            .bg(theme.muted)
                            .child(
                                div()
                                    .h_full()
                                    .w(relative(pct))
                                    .rounded_md()
                                    .bg(theme.accent),
                            ),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(theme.muted_foreground)
                            .child(format!("{}s until next code", remaining)),
                    )
                    .child(
                        Button::new("copy-code")
                            .label("Copy")
                            .small()
                            .ghost()
                            .disabled(copy_disabled)
                            .on_click(cx.listener(move |this, _, _window, cx| {
                                this.copy(code_for_copy.clone(), cx);
                            })),
                    ),
            )
            .when_some(self.live_cached_error.clone(), |this, e| {
                this.child(error_box(e, theme))
            })
    }

    fn render_validate(&self, cx: &Context<Self>) -> Div {
        let theme = cx.theme();

        v_flex()
            .flex_1()
            .gap_4()
            .child(labelled_input("Secret", &self.validate_secret_input, theme))
            .child(labelled_input("Code", &self.validate_code_input, theme))
            .child(
                Button::new("validate")
                    .label("Validate")
                    .small()
                    .primary()
                    .on_click(cx.listener(|this, _, _window, cx| this.run_validation(cx))),
            )
            .when_some(self.validation_error.clone(), |this, e| {
                this.child(error_box(e, theme))
            })
            .when_some(self.validation.as_ref(), |this, v| {
                let (label, color) = if v.is_valid {
                    ("Valid".to_string(), ui::success())
                } else {
                    ("Invalid".to_string(), theme.danger)
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
                        .child(format!("{} — {}", label, v.message)),
                )
            })
    }
}

fn placeholder_dashes(digits: u32) -> String {
    std::iter::repeat("—")
        .take(digits as usize)
        .collect::<Vec<_>>()
        .join(" ")
}

fn format_code(code: &str) -> String {
    // Explicit grouping for the three supported digit counts.
    match code.len() {
        6 => {
            let (l, r) = code.split_at(3);
            format!("{} {}", l, r)
        }
        7 => {
            let (l, r) = code.split_at(3);
            format!("{} {}", l, r)
        }
        8 => {
            let (l, r) = code.split_at(4);
            format!("{} {}", l, r)
        }
        _ => code.to_string(),
    }
}
