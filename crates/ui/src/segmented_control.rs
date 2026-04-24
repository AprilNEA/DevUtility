use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::{h_flex, ActiveTheme};

type SegmentHandler = Box<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

pub struct Segment {
    label: SharedString,
    selected: bool,
    handler: SegmentHandler,
}

impl Segment {
    pub fn new<L, H>(label: L, selected: bool, handler: H) -> Self
    where
        L: Into<SharedString>,
        H: Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    {
        Self {
            label: label.into(),
            selected,
            handler: Box::new(handler),
        }
    }
}

#[derive(IntoElement)]
pub struct SegmentedControl {
    id: ElementId,
    segments: Vec<Segment>,
}

impl SegmentedControl {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            segments: Vec::new(),
        }
    }

    pub fn segment(mut self, seg: Segment) -> Self {
        self.segments.push(seg);
        self
    }
}

impl RenderOnce for SegmentedControl {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let track_bg = theme.muted;
        let active_bg = theme.background;
        let border = theme.border;
        let muted_fg = theme.muted_foreground;
        let fg = theme.foreground;

        h_flex()
            .id(self.id)
            .p(px(2.))
            .gap(px(2.))
            .rounded_md()
            .border_1()
            .border_color(border)
            .bg(track_bg)
            .children(self.segments.into_iter().enumerate().map(
                move |(i, seg)| {
                    let handler = seg.handler;
                    div()
                        .id(("segment", i))
                        .px_3()
                        .py_1()
                        .rounded_sm()
                        .text_sm()
                        .cursor_pointer()
                        .when(seg.selected, |this| {
                            this.bg(active_bg)
                                .text_color(fg)
                                .font_weight(FontWeight::MEDIUM)
                        })
                        .when(!seg.selected, |this| this.text_color(muted_fg))
                        .on_click(move |event, window, cx| handler(event, window, cx))
                        .child(seg.label)
                },
            ))
    }
}
