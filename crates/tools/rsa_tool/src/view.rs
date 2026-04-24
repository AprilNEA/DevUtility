use dev_utility_core::cryptography::rsa::{
    analyze_rsa_key, generate_rsa_key, KeyType, RsaKeyAnalysis, RsaKeyPair,
};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::{error_box, pem_panel, Segment, SegmentedControl};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum RsaMode {
    Generator,
    Analyzer,
}

const BIT_OPTIONS: &[usize] = &[1024, 2048, 3072, 4096];

pub struct RsaView {
    mode: RsaMode,
    // Generator state
    bits: usize,
    generating: bool,
    key_pair: Option<RsaKeyPair>,
    generator_error: Option<String>,
    _generate_task: Option<Task<()>>,
    // Analyzer state
    analyzer_input: Entity<InputState>,
    analyzing: bool,
    analysis: Option<RsaKeyAnalysis>,
    analyzer_error: Option<String>,
    _analyze_task: Option<Task<()>>,
}

impl RsaView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let analyzer_input = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("Paste PEM-encoded RSA public or private key...")
        });

        cx.observe(&analyzer_input, |this, _, cx| {
            this.run_analysis(cx);
        })
        .detach();

        Self {
            mode: RsaMode::Generator,
            bits: 2048,
            generating: false,
            key_pair: None,
            generator_error: None,
            analyzer_input,
            analyzing: false,
            analysis: None,
            analyzer_error: None,
            _analyze_task: None,
            _generate_task: None,
        }
    }

    fn set_mode(&mut self, mode: RsaMode, cx: &mut Context<Self>) {
        self.mode = mode;
        cx.notify();
    }

    fn set_bits(&mut self, bits: usize, cx: &mut Context<Self>) {
        self.bits = bits;
        cx.notify();
    }

    fn generate(&mut self, cx: &mut Context<Self>) {
        if self.generating {
            return;
        }
        self.generating = true;
        self.generator_error = None;
        self.key_pair = None;
        cx.notify();

        let bits = self.bits;
        let task = cx
            .background_executor()
            .spawn(async move { generate_rsa_key(Some(bits)).await });

        self._generate_task = Some(cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.generating = false;
                match result {
                    Ok(pair) => {
                        this.key_pair = Some(pair);
                        this.generator_error = None;
                    }
                    Err(e) => {
                        this.generator_error = Some(e.to_string());
                        this.key_pair = None;
                    }
                }
                cx.notify();
            })
            .ok();
        }));
    }

    fn run_analysis(&mut self, cx: &mut Context<Self>) {
        let input = self.analyzer_input.read(cx).text().to_string();
        if input.trim().is_empty() {
            self._analyze_task = None;
            self.analyzing = false;
            self.analysis = None;
            self.analyzer_error = None;
            cx.notify();
            return;
        }

        self.analyzing = true;
        self.analysis = None;
        self.analyzer_error = None;
        cx.notify();

        let task = cx
            .background_executor()
            .spawn(async move { analyze_rsa_key(input).await });

        self._analyze_task = Some(cx.spawn(async move |this, cx| {
            let result = task.await;
            this.update(cx, |this, cx| {
                this.analyzing = false;
                match result {
                    Ok(a) => {
                        this.analysis = Some(a);
                        this.analyzer_error = None;
                    }
                    Err(e) => {
                        this.analyzer_error = Some(e.to_string());
                        this.analysis = None;
                    }
                }
                cx.notify();
            })
            .ok();
        }));
    }

    fn copy(&self, value: String, cx: &mut Context<Self>) {
        if !value.is_empty() {
            cx.write_to_clipboard(ClipboardItem::new_string(value));
        }
    }
}

impl Render for RsaView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let mode = self.mode;

        let mode_bar = SegmentedControl::new("rsa-mode")
            .segment(Segment::new(
                "Generator",
                mode == RsaMode::Generator,
                cx.listener(|this, _, _window, cx| this.set_mode(RsaMode::Generator, cx)),
            ))
            .segment(Segment::new(
                "Analyzer",
                mode == RsaMode::Analyzer,
                cx.listener(|this, _, _window, cx| this.set_mode(RsaMode::Analyzer, cx)),
            ));

        let content: AnyElement = match mode {
            RsaMode::Generator => self.render_generator(cx).into_any_element(),
            RsaMode::Analyzer => self.render_analyzer(cx).into_any_element(),
        };

        v_flex().size_full().gap_4().child(mode_bar).child(content)
    }
}

impl RsaView {
    fn render_generator(&self, cx: &Context<Self>) -> Div {
        let theme = cx.theme();
        let bits = self.bits;
        let generating = self.generating;

        let bits_bar = {
            let mut bar = SegmentedControl::new("rsa-bits");
            for size in BIT_OPTIONS.iter().copied() {
                bar = bar.segment(Segment::new(
                    format!("{} bit", size),
                    bits == size,
                    cx.listener(move |this, _, _window, cx| this.set_bits(size, cx)),
                ));
            }
            bar
        };

        let (pub_pem, priv_pem) = match &self.key_pair {
            Some(p) => (p.public_key.clone(), p.private_key.clone()),
            None => (String::new(), String::new()),
        };

        let pub_for_copy = pub_pem.clone();
        let priv_for_copy = priv_pem.clone();

        v_flex()
            .flex_1()
            .gap_4()
            .child(
                h_flex()
                    .items_center()
                    .gap_3()
                    .child(bits_bar)
                    .child(
                        Button::new("generate")
                            .label(if generating {
                                "Generating..."
                            } else {
                                "Generate"
                            })
                            .small()
                            .primary()
                            .disabled(generating)
                            .on_click(cx.listener(|this, _, _window, cx| this.generate(cx))),
                    )
                    .when(generating, |this| {
                        this.child(
                            div()
                                .text_sm()
                                .text_color(theme.muted_foreground)
                                .child(format!(
                                    "Generating {}-bit key, please wait\u{2026}",
                                    bits
                                )),
                        )
                    }),
            )
            .when_some(self.generator_error.clone(), |this, error| {
                this.child(error_box(error, theme))
            })
            .child(
                h_flex()
                    .flex_1()
                    .gap_4()
                    .overflow_hidden()
                    .child(pem_panel(
                        "Public key",
                        pub_pem,
                        "copy-pub",
                        cx.listener(move |this, _, _window, cx| {
                            this.copy(pub_for_copy.clone(), cx)
                        }),
                        theme,
                    ))
                    .child(pem_panel(
                        "Private key",
                        priv_pem,
                        "copy-priv",
                        cx.listener(move |this, _, _window, cx| {
                            this.copy(priv_for_copy.clone(), cx)
                        }),
                        theme,
                    )),
            )
    }

    fn render_analyzer(&self, cx: &Context<Self>) -> Div {
        let theme = cx.theme();
        let analyzing = self.analyzing;

        v_flex()
            .flex_1()
            .gap_4()
            .child(
                v_flex()
                    .gap_2()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.muted_foreground)
                            .child("PEM input"),
                    )
                    .child(
                        div()
                            .h(px(160.))
                            .rounded_lg()
                            .border_1()
                            .border_color(theme.border)
                            .bg(theme.background)
                            .p_2()
                            .overflow_hidden()
                            .child(Input::new(&self.analyzer_input).appearance(false)),
                    ),
            )
            .when(analyzing, |this| {
                this.child(
                    div()
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child("Analyzing..."),
                )
            })
            .when_some(self.analyzer_error.clone(), |this, error| {
                this.child(error_box(error, theme))
            })
            .when_some(self.analysis.as_ref(), |this, analysis| {
                this.child(render_analysis(analysis, theme))
            })
    }
}

fn render_analysis(a: &RsaKeyAnalysis, theme: &gpui_component::theme::Theme) -> Div {
    let key_type = match a.key_type {
        KeyType::Public => "Public key",
        KeyType::Private => "Private key",
    };
    let mut rows: Vec<(&'static str, String)> = vec![
        ("Type", key_type.to_string()),
        ("Size", format!("{} bits", a.key_size)),
        ("Fingerprint SHA-256", a.fingerprint.sha256.clone()),
        ("Fingerprint SHA-1", a.fingerprint.sha1.clone()),
        ("Fingerprint MD5", a.fingerprint.md5.clone()),
    ];

    if let Some(pub_p) = &a.public_params {
        rows.push(("Modulus (n)", truncate(&pub_p.n_hex, 96)));
        rows.push(("Exponent (e)", pub_p.e.clone()));
    }
    if let Some(priv_p) = &a.private_params {
        rows.push(("Prime p", truncate(&priv_p.p_hex, 96)));
        rows.push(("Prime q", truncate(&priv_p.q_hex, 96)));
        rows.push(("d mod (p-1)", truncate(&priv_p.dp_hex, 96)));
        rows.push(("d mod (q-1)", truncate(&priv_p.dq_hex, 96)));
    }
    if let Some(derived) = &a.derived_params {
        rows.push(("Key size (bytes)", derived.key_size_bytes.to_string()));
    }

    let border = theme.border;
    let secondary = theme.secondary;
    let muted = theme.muted_foreground;
    let fg = theme.foreground;

    v_flex()
        .flex_1()
        .gap_1()
        .children(rows.into_iter().map(move |(label, value)| {
            h_flex()
                .items_start()
                .gap_2()
                .px_3()
                .py_2()
                .rounded_md()
                .border_1()
                .border_color(border)
                .bg(secondary)
                .child(
                    div()
                        .w(px(180.))
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(muted)
                        .child(label),
                )
                .child(
                    div()
                        .flex_1()
                        .text_sm()
                        .font_family("monospace")
                        .text_color(fg)
                        .child(value),
                )
        }))
}

fn truncate(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        let end = s.char_indices().nth(max).map(|(i, _)| i).unwrap_or(s.len());
        format!("{}… ({} chars)", &s[..end], s.len())
    }
}

