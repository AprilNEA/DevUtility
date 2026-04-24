use chrono::{DateTime, Local, TimeZone, Utc};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::input::{Input, InputState};
use gpui_component::{h_flex, v_flex, ActiveTheme};
use ui::error_box;

pub struct UnixTimeView {
    input_state: Entity<InputState>,
}

impl UnixTimeView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let now = Utc::now().timestamp();
        let input_state = cx.new(|cx| {
            InputState::new(window, cx).placeholder("Unix timestamp (seconds)...")
        });
        input_state.update(cx, |s, cx| {
            let window = window;
            let _ = s.set_value(now.to_string(), window, cx);
        });

        cx.observe(&input_state, |_, _, cx| cx.notify()).detach();

        Self { input_state }
    }
}

fn parse_ts(input: &str) -> Option<i64> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }
    // Interpret as seconds if <= 10 digits, otherwise milliseconds.
    if let Ok(n) = trimmed.parse::<i64>() {
        if trimmed.len() >= 13 {
            return Some(n / 1000);
        }
        return Some(n);
    }
    None
}

impl Render for UnixTimeView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let input = self.input_state.read(cx).text().to_string();
        let trimmed = input.trim();

        // Three states:
        //   - empty input   → no rows, no error
        //   - valid parse   → rows populated, no error
        //   - non-empty but unparseable → rows empty, show error callout
        let (rows, error): (Option<(String, String, String, String)>, Option<String>) =
            if trimmed.is_empty() {
                (None, None)
            } else {
                match parse_ts(trimmed) {
                    Some(seconds) => match Utc.timestamp_opt(seconds, 0) {
                        chrono::LocalResult::Single(dt) => {
                            let local: DateTime<Local> = dt.with_timezone(&Local);
                            let delta = Utc::now().timestamp() - seconds;
                            let rel = format_delta(delta);
                            (
                                Some((
                                    dt.format("%Y-%m-%d %H:%M:%S UTC").to_string(),
                                    local.format("%Y-%m-%d %H:%M:%S %z").to_string(),
                                    dt.to_rfc3339(),
                                    rel,
                                )),
                                None,
                            )
                        }
                        _ => (
                            None,
                            Some("Timestamp is out of valid range.".to_string()),
                        ),
                    },
                    None => (
                        None,
                        Some(format!("\"{}\" is not a valid Unix timestamp.", trimmed)),
                    ),
                }
            };

        let (utc_str, local_str, iso_str, relative_str) = rows.unwrap_or_default();

        let row = |label: &'static str, value: String| {
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
                            .child("Timestamp"),
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
            .when_some(error, |this, msg| {
                this.child(error_box(msg, theme))
            })
            .child(
                v_flex()
                    .gap_1()
                    .child(row("UTC", utc_str))
                    .child(row("Local", local_str))
                    .child(row("ISO 8601", iso_str))
                    .child(row("Relative", relative_str)),
            )
    }
}

fn format_delta(secs: i64) -> String {
    if secs == 0 {
        return "just now".to_string();
    }
    let abs = secs.abs();
    let (value, unit) = if abs < 60 {
        (abs, "second")
    } else if abs < 3600 {
        (abs / 60, "minute")
    } else if abs < 86_400 {
        (abs / 3600, "hour")
    } else if abs < 2_592_000 {
        (abs / 86_400, "day")
    } else if abs < 31_536_000 {
        (abs / 2_592_000, "month")
    } else {
        (abs / 31_536_000, "year")
    };
    let plural = if value == 1 { "" } else { "s" };
    if secs > 0 {
        format!("{} {}{} ago", value, unit, plural)
    } else {
        format!("in {} {}{}", value, unit, plural)
    }
}
