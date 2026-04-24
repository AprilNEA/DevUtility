use dev_utility_core::network::ip::{analyze_ipv4_cidr, IpAnalysisResult};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::input::{Input, InputState};
use gpui_component::{h_flex, v_flex, ActiveTheme};
use ui::error_box;
use std::net::Ipv4Addr;


pub struct IpCalculatorView {
    input_state: Entity<InputState>,
}

impl IpCalculatorView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx).placeholder("CIDR like 192.168.1.0/24")
        });

        cx.observe(&input_state, |_, _, cx| cx.notify()).detach();

        Self { input_state }
    }
}

fn parse_cidr(input: &str) -> Option<(Ipv4Addr, u8)> {
    let trimmed = input.trim();
    let (ip_str, cidr_str) = trimmed.split_once('/')?;
    let ip: Ipv4Addr = ip_str.parse().ok()?;
    let cidr: u8 = cidr_str.parse().ok()?;
    Some((ip, cidr))
}

impl Render for IpCalculatorView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let input = self.input_state.read(cx).text().to_string();

        enum ParseResult {
            Empty,
            Ok(String, Vec<(&'static str, String)>),
            Err(String),
        }

        let result = match parse_cidr(&input) {
            Some((ip, cidr)) => match analyze_ipv4_cidr(ip, cidr) {
                Some(r) => ParseResult::Ok(format!("{}/{}", ip, cidr), format_rows(&r)),
                None => ParseResult::Err("Invalid CIDR".to_string()),
            },
            None if input.trim().is_empty() => ParseResult::Empty,
            None => ParseResult::Err("Expected format: 10.0.0.0/24".to_string()),
        };

        let border = theme.border;
        let secondary = theme.secondary;
        let muted = theme.muted_foreground;
        let fg = theme.foreground;

        let (header, rows, error): (Option<String>, Vec<(&'static str, String)>, Option<String>) =
            match result {
                ParseResult::Empty => (None, Vec::new(), None),
                ParseResult::Ok(h, r) => (Some(h), r, None),
                ParseResult::Err(e) => (None, Vec::new(), Some(e)),
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
                            .text_color(muted)
                            .child("CIDR"),
                    )
                    .child(
                        div()
                            .rounded_lg()
                            .border_1()
                            .border_color(border)
                            .bg(theme.background)
                            .p_2()
                            .child(Input::new(&self.input_state).appearance(false)),
                    ),
            )
            .when_some(error, |this, err| {
                this.child(error_box(err, theme))
            })
            .when_some(header, |this, h| {
                this.child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(muted)
                        .child(h),
                )
            })
            .child(
                v_flex()
                    .gap_1()
                    .children(rows.into_iter().map(move |(label, value)| {
                        h_flex()
                            .items_center()
                            .gap_2()
                            .px_3()
                            .py_2()
                            .rounded_md()
                            .border_1()
                            .border_color(border)
                            .bg(secondary)
                            .child(
                                div()
                                    .w(px(160.))
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
                    })),
            )
    }
}

fn format_rows(r: &IpAnalysisResult) -> Vec<(&'static str, String)> {
    vec![
        ("Network address", r.network_address.to_string()),
        ("Broadcast address", r.broadcast_address.to_string()),
        (
            "First usable host",
            r.first_usable_host
                .map(|a| a.to_string())
                .unwrap_or_else(|| "—".to_string()),
        ),
        (
            "Last usable host",
            r.last_usable_host
                .map(|a| a.to_string())
                .unwrap_or_else(|| "—".to_string()),
        ),
        ("Subnet mask", r.subnet_mask.to_string()),
        ("CIDR", format!("/{}", r.cidr)),
        ("Total hosts", r.total_hosts.to_string()),
        ("Usable hosts", r.usable_hosts.to_string()),
    ]
}
