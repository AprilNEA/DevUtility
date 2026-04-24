use dev_utility_core::generator::{generate_ulid, generate_uuid_v4, generate_uuid_v7};
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::{Segment, SegmentedControl};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum IdType {
    UuidV4,
    UuidV7,
    Ulid,
}

impl IdType {
    fn label(&self) -> &'static str {
        match self {
            IdType::UuidV4 => "UUID v4",
            IdType::UuidV7 => "UUID v7",
            IdType::Ulid => "ULID",
        }
    }
}

pub struct IdGeneratorView {
    id_type: IdType,
    count: u32,
    output: String,
}

impl IdGeneratorView {
    pub fn new(_window: &mut Window, _cx: &mut Context<Self>) -> Self {
        let mut view = Self {
            id_type: IdType::UuidV4,
            count: 5,
            output: String::new(),
        };
        view.generate();
        view
    }

    fn generate(&mut self) {
        self.output = match self.id_type {
            IdType::UuidV4 => generate_uuid_v4(self.count),
            IdType::UuidV7 => generate_uuid_v7(self.count, None),
            IdType::Ulid => generate_ulid(self.count),
        };
    }

    fn set_id_type(&mut self, id_type: IdType, cx: &mut Context<Self>) {
        self.id_type = id_type;
        self.generate();
        cx.notify();
    }

    fn regenerate(&mut self, cx: &mut Context<Self>) {
        self.generate();
        cx.notify();
    }

    fn copy_output(&self, cx: &mut Context<Self>) {
        if !self.output.is_empty() {
            cx.write_to_clipboard(ClipboardItem::new_string(self.output.clone()));
        }
    }

    fn set_count(&mut self, count: u32, cx: &mut Context<Self>) {
        self.count = count.max(1).min(100);
        self.generate();
        cx.notify();
    }
}

impl Render for IdGeneratorView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        let id_type = self.id_type;

        v_flex()
            .size_full()
            .gap_4()
            .child(
                h_flex()
                    .items_center()
                    .justify_between()
                    .child(
                        SegmentedControl::new("id-type")
                            .segment(Segment::new(
                                IdType::UuidV4.label(),
                                id_type == IdType::UuidV4,
                                cx.listener(|this, _, _window, cx| {
                                    this.set_id_type(IdType::UuidV4, cx);
                                }),
                            ))
                            .segment(Segment::new(
                                IdType::UuidV7.label(),
                                id_type == IdType::UuidV7,
                                cx.listener(|this, _, _window, cx| {
                                    this.set_id_type(IdType::UuidV7, cx);
                                }),
                            ))
                            .segment(Segment::new(
                                IdType::Ulid.label(),
                                id_type == IdType::Ulid,
                                cx.listener(|this, _, _window, cx| {
                                    this.set_id_type(IdType::Ulid, cx);
                                }),
                            )),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .items_center()
                            .child(
                                div()
                                    .text_sm()
                                    .text_color(theme.muted_foreground)
                                    .child(format!("Count: {}", self.count)),
                            )
                            .child(
                                Button::new("minus")
                                    .label("-")
                                    .small()
                                    .ghost()
                                    .disabled(self.count <= 1)
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.set_count(this.count.saturating_sub(1), cx);
                                    })),
                            )
                            .child(
                                Button::new("plus")
                                    .label("+")
                                    .small()
                                    .ghost()
                                    .disabled(self.count >= 100)
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.set_count(this.count.saturating_add(1), cx);
                                    })),
                            )
                            .child(
                                Button::new("generate")
                                    .label("Generate")
                                    .small()
                                    .primary()
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.regenerate(cx);
                                    })),
                            )
                            .child(
                                Button::new("copy")
                                    .label("Copy All")
                                    .small()
                                    .ghost()
                                    .disabled(self.output.is_empty())
                                    .on_click(cx.listener(|this, _, _window, cx| {
                                        this.copy_output(cx);
                                    })),
                            ),
                    ),
            )
            .child(
                v_flex()
                    .flex_1()
                    .gap_2()
                    .overflow_hidden()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.muted_foreground)
                            .child("Output"),
                    )
                    .child(
                        div()
                            .flex_1()
                            .rounded_lg()
                            .border_1()
                            .border_color(theme.border)
                            .bg(theme.background)
                            .p_2()
                            .overflow_y_scrollbar()
                            .child(
                                div()
                                    .size_full()
                                    .text_sm()
                                    .font_family("monospace")
                                    .child(self.output.clone()),
                            ),
                    ),
            )
    }
}
