use backslash_escapist_tool::BackslashEscapistView;
use base64_tool::Base64View;
use css_formatter_tool::CssFormatterView;
use gpui::*;
use gpui_component::{h_flex, ActiveTheme};
use hash_tool::HashView;
use html_formatter_tool::HtmlFormatterView;
use id_tool::IdGeneratorView;
use ip_calculator_tool::IpCalculatorView;
use ip_info_tool::IpInfoView;
use json_formatter_tool::JsonFormatterView;
use jwt_tool::JwtView;
use number_base_tool::NumberBaseView;
use rsa_tool::RsaView;
use string_inspector_tool::StringInspectorView;
use totp_tool::TotpView;
use unix_time_tool::UnixTimeView;

use crate::layout::sidebar::{Sidebar, SidebarGroup, SidebarItem};

#[derive(Clone, PartialEq, Debug)]
pub enum Route {
    Base64,
    Jwt,
    Hash,
    IdGenerator,
    Totp,
    Rsa,
    JsonFormatter,
    CssFormatter,
    HtmlFormatter,
    NumberBase,
    UnixTime,
    StringInspector,
    BackslashEscapist,
    IpCalculator,
    IpInfo,
}

impl Route {
    pub fn title(&self) -> &'static str {
        match self {
            Route::Base64 => "Base64 Encoder/Decoder",
            Route::Jwt => "JWT Decoder",
            Route::Hash => "Hash Generator",
            Route::IdGenerator => "UUID/ULID Generator",
            Route::Totp => "TOTP Debugger",
            Route::Rsa => "RSA Key Tool",
            Route::JsonFormatter => "JSON Formatter",
            Route::CssFormatter => "CSS Formatter",
            Route::HtmlFormatter => "HTML Formatter",
            Route::NumberBase => "Number Base Converter",
            Route::UnixTime => "Unix Timestamp",
            Route::StringInspector => "String Inspector",
            Route::BackslashEscapist => "Backslash Escapist",
            Route::IpCalculator => "IP Calculator",
            Route::IpInfo => "IP Info",
        }
    }
}

pub fn sidebar_groups() -> Vec<SidebarGroup> {
    vec![
        SidebarGroup {
            key: "codec",
            label: "Encoder / Decoder",
            items: vec![
                SidebarItem {
                    key: "base64",
                    label: "Base64",
                    route: Route::Base64,
                },
                SidebarItem {
                    key: "jwt",
                    label: "JWT Decoder",
                    route: Route::Jwt,
                },
            ],
        },
        SidebarGroup {
            key: "generator",
            label: "Generators",
            items: vec![
                SidebarItem {
                    key: "id",
                    label: "UUID/ULID",
                    route: Route::IdGenerator,
                },
                SidebarItem {
                    key: "hash",
                    label: "Hash Generator",
                    route: Route::Hash,
                },
            ],
        },
        SidebarGroup {
            key: "cryptography",
            label: "Cryptography",
            items: vec![
                SidebarItem {
                    key: "totp",
                    label: "TOTP Debugger",
                    route: Route::Totp,
                },
                SidebarItem {
                    key: "rsa",
                    label: "RSA Key Tool",
                    route: Route::Rsa,
                },
            ],
        },
        SidebarGroup {
            key: "formatter",
            label: "Formatters",
            items: vec![
                SidebarItem {
                    key: "json",
                    label: "JSON",
                    route: Route::JsonFormatter,
                },
                SidebarItem {
                    key: "css",
                    label: "CSS",
                    route: Route::CssFormatter,
                },
                SidebarItem {
                    key: "html",
                    label: "HTML",
                    route: Route::HtmlFormatter,
                },
            ],
        },
        SidebarGroup {
            key: "converter",
            label: "Converters",
            items: vec![
                SidebarItem {
                    key: "number",
                    label: "Number Base",
                    route: Route::NumberBase,
                },
                SidebarItem {
                    key: "unix",
                    label: "Unix Timestamp",
                    route: Route::UnixTime,
                },
                SidebarItem {
                    key: "string",
                    label: "String Inspector",
                    route: Route::StringInspector,
                },
                SidebarItem {
                    key: "backslash",
                    label: "Backslash Escapist",
                    route: Route::BackslashEscapist,
                },
            ],
        },
        SidebarGroup {
            key: "network",
            label: "Network",
            items: vec![
                SidebarItem {
                    key: "ip",
                    label: "IP Calculator",
                    route: Route::IpCalculator,
                },
                SidebarItem {
                    key: "ipinfo",
                    label: "IP Info",
                    route: Route::IpInfo,
                },
            ],
        },
    ]
}

pub struct DevUtilityApp {
    current_route: Route,
    sidebar: Entity<Sidebar>,
    base64_view: Entity<Base64View>,
    id_generator_view: Entity<IdGeneratorView>,
    hash_view: Entity<HashView>,
    jwt_view: Entity<JwtView>,
    json_formatter_view: Entity<JsonFormatterView>,
    css_formatter_view: Entity<CssFormatterView>,
    number_base_view: Entity<NumberBaseView>,
    unix_time_view: Entity<UnixTimeView>,
    string_inspector_view: Entity<StringInspectorView>,
    backslash_view: Entity<BackslashEscapistView>,
    ip_calculator_view: Entity<IpCalculatorView>,
    rsa_view: Entity<RsaView>,
    totp_view: Entity<TotpView>,
    ip_info_view: Entity<IpInfoView>,
    html_formatter_view: Entity<HtmlFormatterView>,
}

impl DevUtilityApp {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let current_route = Route::Base64;

        let sidebar = cx.new(|cx| {
            Sidebar::new(sidebar_groups(), current_route.clone(), cx)
        });

        cx.subscribe(&sidebar, |this, _, event: &Route, cx| {
            this.navigate(event.clone(), cx);
        })
        .detach();

        let base64_view = cx.new(|cx| Base64View::new(window, cx));
        let id_generator_view = cx.new(|cx| IdGeneratorView::new(window, cx));
        let hash_view = cx.new(|cx| HashView::new(window, cx));
        let jwt_view = cx.new(|cx| JwtView::new(window, cx));
        let json_formatter_view = cx.new(|cx| JsonFormatterView::new(window, cx));
        let css_formatter_view = cx.new(|cx| CssFormatterView::new(window, cx));
        let number_base_view = cx.new(|cx| NumberBaseView::new(window, cx));
        let unix_time_view = cx.new(|cx| UnixTimeView::new(window, cx));
        let string_inspector_view = cx.new(|cx| StringInspectorView::new(window, cx));
        let backslash_view = cx.new(|cx| BackslashEscapistView::new(window, cx));
        let ip_calculator_view = cx.new(|cx| IpCalculatorView::new(window, cx));
        let rsa_view = cx.new(|cx| RsaView::new(window, cx));
        let totp_view = cx.new(|cx| TotpView::new(window, cx));
        let ip_info_view = cx.new(|cx| IpInfoView::new(window, cx));
        let html_formatter_view = cx.new(|cx| HtmlFormatterView::new(window, cx));

        Self {
            current_route,
            sidebar,
            base64_view,
            id_generator_view,
            hash_view,
            jwt_view,
            json_formatter_view,
            css_formatter_view,
            number_base_view,
            unix_time_view,
            string_inspector_view,
            backslash_view,
            ip_calculator_view,
            rsa_view,
            totp_view,
            ip_info_view,
            html_formatter_view,
        }
    }

    pub fn navigate(&mut self, route: Route, cx: &mut Context<Self>) {
        self.current_route = route.clone();
        self.sidebar.update(cx, |sidebar, cx| {
            sidebar.set_current_route(route, cx);
        });
        cx.notify();
    }

    fn render_content(&self, _window: &mut Window, _cx: &mut Context<Self>) -> AnyElement {
        match &self.current_route {
            Route::Base64 => self.base64_view.clone().into_any_element(),
            Route::IdGenerator => self.id_generator_view.clone().into_any_element(),
            Route::Hash => self.hash_view.clone().into_any_element(),
            Route::Jwt => self.jwt_view.clone().into_any_element(),
            Route::JsonFormatter => self.json_formatter_view.clone().into_any_element(),
            Route::CssFormatter => self.css_formatter_view.clone().into_any_element(),
            Route::NumberBase => self.number_base_view.clone().into_any_element(),
            Route::UnixTime => self.unix_time_view.clone().into_any_element(),
            Route::StringInspector => self.string_inspector_view.clone().into_any_element(),
            Route::BackslashEscapist => self.backslash_view.clone().into_any_element(),
            Route::IpCalculator => self.ip_calculator_view.clone().into_any_element(),
            Route::Rsa => self.rsa_view.clone().into_any_element(),
            Route::Totp => self.totp_view.clone().into_any_element(),
            Route::IpInfo => self.ip_info_view.clone().into_any_element(),
            Route::HtmlFormatter => self.html_formatter_view.clone().into_any_element(),
        }
    }
}

impl Render for DevUtilityApp {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();

        h_flex()
            .size_full()
            .bg(theme.background)
            .text_color(theme.foreground)
            .child(self.sidebar.clone())
            .child(
                div()
                    .flex_1()
                    .flex()
                    .flex_col()
                    .h_full()
                    .overflow_hidden()
                    .child(
                        // Page header — starts at y=0, content fills the whole right pane.
                        div()
                            .h(px(40.))
                            .w_full()
                            .flex()
                            .items_center()
                            .px_4()
                            .border_b_1()
                            .border_color(theme.border)
                            .child(
                                div()
                                    .text_sm()
                                    .font_weight(FontWeight::MEDIUM)
                                    .child(self.current_route.title()),
                            ),
                    )
                    .child(
                        // Content — top-aligned, fills remaining space.
                        div()
                            .flex_1()
                            .p_4()
                            .overflow_hidden()
                            .child(self.render_content(window, cx)),
                    ),
            )
    }
}
