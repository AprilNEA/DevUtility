use dev_utility_core::formatter::{format_json, IndentStyle};
use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::button::{Button, ButtonVariants};
use gpui_component::input::{Input, InputState};
use gpui_component::scroll::ScrollableElement;
use gpui_component::{h_flex, v_flex, ActiveTheme, Disableable, Sizable};
use ui::{error_box, Segment, SegmentedControl};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum IndentChoice {
    TwoSpaces,
    FourSpaces,
    Tabs,
    Minified,
}

impl IndentChoice {
    fn to_style(self) -> IndentStyle {
        match self {
            IndentChoice::TwoSpaces => IndentStyle::Spaces(2),
            IndentChoice::FourSpaces => IndentStyle::Spaces(4),
            IndentChoice::Tabs => IndentStyle::Tabs,
            IndentChoice::Minified => IndentStyle::Minified,
        }
    }

    fn label(self) -> &'static str {
        match self {
            IndentChoice::TwoSpaces => "2 spaces",
            IndentChoice::FourSpaces => "4 spaces",
            IndentChoice::Tabs => "Tabs",
            IndentChoice::Minified => "Minified",
        }
    }
}

pub struct JsonFormatterView {
    input_state: Entity<InputState>,
    indent: IndentChoice,
    output: String,
    error: Option<String>,
}

impl JsonFormatterView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input_state = cx.new(|cx| {
            InputState::new(window, cx)
                .multi_line(true)
                .placeholder("Paste JSON here...")
        });

        cx.observe(&input_state, |this, _, cx| {
            this.process(cx);
        })
        .detach();

        Self {
            input_state,
            indent: IndentChoice::TwoSpaces,
            output: String::new(),
            error: None,
        }
    }

    fn process(&mut self, cx: &mut Context<Self>) {
        self.error = None;
        let input = self.input_state.read(cx).text().to_string();

        if input.trim().is_empty() {
            self.output.clear();
            cx.notify();
            return;
        }

        match format_json(&input, self.indent.to_style()) {
            Ok(s) => self.output = s,
            Err(e) => {
                self.error = Some(e.to_string());
                self.output.clear();
            }
        }
        cx.notify();
    }

    fn set_indent(&mut self, indent: IndentChoice, cx: &mut Context<Self>) {
        self.indent = indent;
        self.process(cx);
    }

    fn copy_output(&self, cx: &mut Context<Self>) {
        if !self.output.is_empty() {
            cx.write_to_clipboard(ClipboardItem::new_string(self.output.clone()));
        }
    }
}

impl Render for JsonFormatterView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let indent = self.indent;

        let make_seg = |choice: IndentChoice, cx: &mut Context<Self>| {
            Segment::new(
                choice.label(),
                indent == choice,
                cx.listener(move |this, _, _window, cx| {
                    this.set_indent(choice, cx);
                }),
            )
        };

        let tab_bar = SegmentedControl::new("indent")
            .segment(make_seg(IndentChoice::TwoSpaces, cx))
            .segment(make_seg(IndentChoice::FourSpaces, cx))
            .segment(make_seg(IndentChoice::Tabs, cx))
            .segment(make_seg(IndentChoice::Minified, cx));

        let theme = cx.theme();

        v_flex()
            .size_full()
            .gap_4()
            .child(
                h_flex()
                    .items_center()
                    .justify_between()
                    .child(tab_bar)
                    .child(
                        Button::new("copy")
                            .label("Copy")
                            .small()
                            .ghost()
                            .disabled(self.output.is_empty())
                            .on_click(cx.listener(|this, _, _window, cx| {
                                this.copy_output(cx);
                            })),
                    ),
            )
            .child(
                div()
                    .flex_1()
                    .flex()
                    .flex_row()
                    .gap_4()
                    .overflow_hidden()
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
                                    .child("Input"),
                            )
                            .child(
                                div()
                                    .flex_1()
                                    .rounded_lg()
                                    .border_1()
                                    .border_color(theme.border)
                                    .bg(theme.background)
                                    .p_2()
                                    .overflow_hidden()
                                    .child(Input::new(&self.input_state).appearance(false)),
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
                    ),
            )
            .when_some(self.error.clone(), |this, error| {
                this.child(error_box(error, theme))
            })
    }
}
