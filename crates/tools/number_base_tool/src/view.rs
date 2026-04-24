use dev_utility_core::converter::number_base_convert;
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::input::{Input, InputState};
use gpui_component::{h_flex, v_flex, ActiveTheme};
use ui::{Segment, SegmentedControl};

const BASES: &[(&str, u32)] = &[
    ("Binary (2)", 2),
    ("Octal (8)", 8),
    ("Decimal (10)", 10),
    ("Hex (16)", 16),
];

/// Short labels shown in the "From base" segmented control.
const BASE_LABELS: &[(&str, u32)] = &[("2", 2), ("8", 8), ("10", 10), ("16", 16)];

pub struct NumberBaseView {
    input_state: Entity<InputState>,
    from_base: u32,
}

impl NumberBaseView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx).placeholder("Enter a number...")
        });

        cx.observe(&input_state, |_, _, cx| cx.notify()).detach();

        Self {
            input_state,
            from_base: 10,
        }
    }

    fn set_from_base(&mut self, base: u32, cx: &mut Context<Self>) {
        self.from_base = base;
        cx.notify();
    }
}

/// Strip a `0x` / `0b` / `0o` prefix (case-insensitive) if present and
/// return the bare digits.  We strip regardless of whether the prefix
/// matches `from_base`; mismatches are caught by the parser.
fn strip_prefix(input: &str) -> &str {
    let s = input.trim();
    if s.len() >= 2 {
        let prefix = &s[..2];
        if prefix.eq_ignore_ascii_case("0x")
            || prefix.eq_ignore_ascii_case("0b")
            || prefix.eq_ignore_ascii_case("0o")
        {
            return &s[2..];
        }
    }
    s
}

impl Render for NumberBaseView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let raw_input = self.input_state.read(cx).text().to_string();
        let from_base = self.from_base;

        // Strip common numeric prefixes before conversion.
        let stripped = strip_prefix(&raw_input);
        let is_empty = stripped.is_empty();

        // Compute all conversions; collect the first error (if any).
        let conversions: Vec<(&str, Result<String, String>)> = if is_empty {
            BASES
                .iter()
                .map(|(label, _)| (*label, Ok(String::new())))
                .collect()
        } else {
            BASES
                .iter()
                .map(|(label, base)| {
                    (
                        *label,
                        number_base_convert(stripped, from_base, *base)
                            .map_err(|e| e.to_string()),
                    )
                })
                .collect()
        };

        let conversion_error: Option<String> = conversions
            .iter()
            .find_map(|(_, r)| r.as_ref().err().cloned());

        let rows: Vec<(&str, String)> = conversions
            .into_iter()
            .map(|(label, r)| (label, r.unwrap_or_default()))
            .collect();

        v_flex()
            .size_full()
            .gap_4()
            .child(
                v_flex()
                    .gap_2()
                    .child(
                        h_flex()
                            .items_center()
                            .justify_between()
                            .child(
                                div()
                                    .text_sm()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(theme.muted_foreground)
                                    .child(format!("Input (base {})", from_base)),
                            )
                            .child(
                                BASE_LABELS.iter().fold(
                                    SegmentedControl::new("from-base"),
                                    |ctrl, (label, base)| {
                                        let base = *base;
                                        ctrl.segment(Segment::new(
                                            *label,
                                            from_base == base,
                                            cx.listener(move |this, _, _window, cx| {
                                                this.set_from_base(base, cx);
                                            }),
                                        ))
                                    },
                                ),
                            ),
                    )
                    .child(
                        div()
                            .rounded_lg()
                            .border_1()
                            .border_color(theme.border)
                            .bg(theme.background)
                            .p_2()
                            .child(Input::new(&self.input_state).appearance(false)),
                    ),
            )
            .when_some(conversion_error, |this, error| {
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
            .child(
                v_flex()
                    .flex_1()
                    .gap_1()
                    .children(rows.into_iter().map(|(label, value)| {
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
                    })),
            )
    }
}
