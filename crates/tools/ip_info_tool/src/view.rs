use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::error_box;
use serde::Deserialize;
use std::net::IpAddr;
use std::str::FromStr;
use std::time::Duration;

#[derive(Debug, Clone, Deserialize)]
struct IpInfo {
    ip: Option<String>,
    hostname: Option<String>,
    city: Option<String>,
    region: Option<String>,
    country: Option<String>,
    loc: Option<String>,
    org: Option<String>,
    postal: Option<String>,
    timezone: Option<String>,
}

pub struct IpInfoView {
    input_state: Entity<InputState>,
    result: Option<IpInfo>,
    error: Option<String>,
    loading: bool,
    _task: Option<Task<()>>,
}

impl IpInfoView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("IP address (leave empty for your own)")
        });

        Self {
            input_state,
            result: None,
            error: None,
            loading: false,
            _task: None,
        }
    }

    fn lookup(&mut self, cx: &mut Context<Self>) {
        let query = self.input_state.read(cx).text().to_string();
        let query = query.trim().to_string();
        let url = if query.is_empty() {
            "https://ipinfo.io/json".to_string()
        } else {
            let ip = match IpAddr::from_str(&query) {
                Ok(ip) => ip,
                Err(_) => {
                    self.error = Some(format!("Invalid IP address: {}", query));
                    cx.notify();
                    return;
                }
            };
            let ip_str = match ip {
                IpAddr::V4(v4) => v4.to_string(),
                IpAddr::V6(v6) => format!("[{}]", v6),
            };
            format!("https://ipinfo.io/{}/json", ip_str)
        };

        self.loading = true;
        self.error = None;
        self.result = None;
        cx.notify();

        let task = cx.spawn(async move |this, cx| {
            let result = cx
                .background_executor()
                .spawn(async move {
                    ureq::AgentBuilder::new()
                        .timeout(Duration::from_secs(10))
                        .build()
                        .get(&url)
                        .call()
                        .map_err(|e| e.to_string())
                        .and_then(|r| r.into_json::<IpInfo>().map_err(|e| e.to_string()))
                })
                .await;

            let _ = this.update(cx, |this, cx| {
                this.loading = false;
                match result {
                    Ok(info) => {
                        this.result = Some(info);
                        this.error = None;
                    }
                    Err(e) => {
                        this.error = Some(e);
                        this.result = None;
                    }
                }
                cx.notify();
            });
        });
        self._task = Some(task);
    }
}

impl Render for IpInfoView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let loading = self.loading;

        let rows: Vec<(&'static str, String)> = match &self.result {
            Some(info) => {
                let mut v = Vec::new();
                if let Some(ip) = &info.ip {
                    v.push(("IP", ip.clone()));
                }
                if let Some(h) = &info.hostname {
                    v.push(("Hostname", h.clone()));
                }
                if let Some(org) = &info.org {
                    v.push(("Organization", org.clone()));
                }
                if let Some(city) = &info.city {
                    v.push(("City", city.clone()));
                }
                if let Some(region) = &info.region {
                    v.push(("Region", region.clone()));
                }
                if let Some(country) = &info.country {
                    v.push(("Country", country.clone()));
                }
                if let Some(postal) = &info.postal {
                    v.push(("Postal", postal.clone()));
                }
                if let Some(loc) = &info.loc {
                    v.push(("Coordinates", loc.clone()));
                }
                if let Some(tz) = &info.timezone {
                    v.push(("Timezone", tz.clone()));
                }
                v
            }
            None => Vec::new(),
        };

        let border = theme.border;
        let secondary = theme.secondary;
        let muted = theme.muted_foreground;
        let fg = theme.foreground;

        v_flex()
            .size_full()
            .gap_4()
            .child(
                h_flex()
                    .items_end()
                    .gap_3()
                    .child(
                        v_flex()
                            .flex_1()
                            .gap_1()
                            .child(
                                div()
                                    .text_xs()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(muted)
                                    .child("IP address"),
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
                    .child(
                        Button::new("lookup")
                            .label(if loading { "Looking up..." } else { "Look up" })
                            .small()
                            .primary()
                            .disabled(loading)
                            .on_click(cx.listener(|this, _, _window, cx| this.lookup(cx))),
                    ),
            )
            .when_some(self.error.clone(), |this, error| {
                this.child(error_box(error, theme))
            })
            .child(
                v_flex()
                    .flex_1()
                    .gap_1()
                    .overflow_y_scrollbar()
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
                                    .w(px(140.))
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
