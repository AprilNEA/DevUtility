use gpui::*;
use gpui::prelude::FluentBuilder;
use gpui_component::{h_flex, v_flex, ActiveTheme};
use gpui_component::scroll::ScrollableElement;

use crate::app::Route;

pub struct SidebarItem {
    pub key: &'static str,
    pub label: &'static str,
    pub route: Route,
}

pub struct SidebarGroup {
    #[allow(dead_code)]
    pub key: &'static str,
    pub label: &'static str,
    pub items: Vec<SidebarItem>,
}

impl EventEmitter<Route> for Sidebar {}

pub struct Sidebar {
    groups: Vec<SidebarGroup>,
    current_route: Route,
}

impl Sidebar {
    pub fn new(groups: Vec<SidebarGroup>, current_route: Route, _cx: &mut Context<Self>) -> Self {
        Self {
            groups,
            current_route,
        }
    }

    pub fn set_current_route(&mut self, route: Route, cx: &mut Context<Self>) {
        self.current_route = route;
        cx.notify();
    }

    fn render_item(
        &self,
        item: &SidebarItem,
        is_selected: bool,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let theme = cx.theme();
        let route = item.route.clone();

        div()
            .id(SharedString::from(item.key))
            .px_3()
            .py_1p5()
            .mx_2()
            .rounded_md()
            .cursor_pointer()
            .text_sm()
            .when(is_selected, |this| {
                this.bg(theme.accent).text_color(theme.accent_foreground)
            })
            .when(!is_selected, |this| {
                this.hover(|style| style.bg(theme.muted))
            })
            .on_click(cx.listener(move |_this, _event, _window, cx| {
                cx.emit(route.clone());
            }))
            .child(item.label)
    }

    fn render_group(&self, group: &SidebarGroup, cx: &mut Context<Self>) -> AnyElement {
        let theme = cx.theme();

        v_flex()
            .gap_1()
            .mb_4()
            .child(
                div()
                    .px_3()
                    .py_1()
                    .text_xs()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(theme.muted_foreground)
                    .child(group.label),
            )
            .children(group.items.iter().map(|item| {
                let is_selected = self.current_route == item.route;
                self.render_item(item, is_selected, cx)
            }))
            .into_any_element()
    }
}

impl Render for Sidebar {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        // Pre-render groups to avoid borrow conflicts
        let group_elements: Vec<AnyElement> = self.groups
            .iter()
            .map(|group| self.render_group(group, cx))
            .collect();

        let theme = cx.theme();
        let sidebar_bg = theme.sidebar;
        let border_color = theme.border;
        let muted_fg = theme.muted_foreground;

        v_flex()
            .w(px(240.))
            .h_full()
            .bg(sidebar_bg)
            .border_r_1()
            .border_color(border_color)
            .child(
                // Header spacer for title bar
                div().h(px(52.)),
            )
            .child(
                // Navigation groups
                div()
                    .flex_1()
                    .overflow_y_scrollbar()
                    .py_2()
                    .children(group_elements),
            )
            .child(
                // Footer
                h_flex()
                    .px_3()
                    .py_2()
                    .border_t_1()
                    .border_color(border_color)
                    .gap_2()
                    .child(
                        div()
                            .text_xs()
                            .text_color(muted_fg)
                            .child("DevUtility v0.3.0"),
                    ),
            )
    }
}
