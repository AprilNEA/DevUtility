use gpui::*;
use gpui_component::{h_flex, ActiveTheme};

use crate::layout::sidebar::{Sidebar, SidebarGroup, SidebarItem};
use crate::views::codec::base64::Base64View;
use crate::views::generator::id::IdGeneratorView;

#[derive(Clone, PartialEq, Debug)]
#[allow(dead_code)]
pub enum Route {
    Home,
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
    IpCalculator,
    IpInfo,
}

impl Route {
    pub fn title(&self) -> &'static str {
        match self {
            Route::Home => "Home",
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

        Self {
            current_route,
            sidebar,
            base64_view,
            id_generator_view,
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
            _ => div()
                .size_full()
                .flex()
                .items_center()
                .justify_center()
                .child(format!("View for {} is not implemented yet", self.current_route.title()))
                .into_any_element(),
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
                    .overflow_hidden()
                    .child(
                        // Header
                        div()
                            .h(px(52.))
                            .w_full()
                            .flex()
                            .items_center()
                            .px_4()
                            .border_b_1()
                            .border_color(theme.border)
                            .child(
                                div()
                                    .pl(px(70.))
                                    .text_sm()
                                    .font_weight(FontWeight::MEDIUM)
                                    .child(self.current_route.title()),
                            ),
                    )
                    .child(
                        // Content
                        div()
                            .flex_1()
                            .p_4()
                            .overflow_hidden()
                            .child(self.render_content(window, cx)),
                    ),
            )
    }
}
