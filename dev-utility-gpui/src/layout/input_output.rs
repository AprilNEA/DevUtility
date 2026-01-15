use gpui::*;
use gpui::prelude::FluentBuilder;
use gpui_component::{h_flex, v_flex, ActiveTheme};

#[allow(dead_code)]
pub enum Orientation {
    Horizontal,
    Vertical,
}

#[derive(IntoElement)]
#[allow(dead_code)]
pub struct InputOutputLayout {
    orientation: Orientation,
    input_label: SharedString,
    input_toolbar: Option<AnyElement>,
    input_content: AnyElement,
    output_label: SharedString,
    output_toolbar: Option<AnyElement>,
    output_content: AnyElement,
}

#[allow(dead_code)]
impl InputOutputLayout {
    pub fn new(input: impl IntoElement, output: impl IntoElement) -> Self {
        Self {
            orientation: Orientation::Horizontal,
            input_label: "Input".into(),
            input_toolbar: None,
            input_content: input.into_any_element(),
            output_label: "Output".into(),
            output_toolbar: None,
            output_content: output.into_any_element(),
        }
    }

    pub fn orientation(mut self, orientation: Orientation) -> Self {
        self.orientation = orientation;
        self
    }

    pub fn input_label(mut self, label: impl Into<SharedString>) -> Self {
        self.input_label = label.into();
        self
    }

    pub fn output_label(mut self, label: impl Into<SharedString>) -> Self {
        self.output_label = label.into();
        self
    }

    pub fn input_toolbar(mut self, toolbar: impl IntoElement) -> Self {
        self.input_toolbar = Some(toolbar.into_any_element());
        self
    }

    pub fn output_toolbar(mut self, toolbar: impl IntoElement) -> Self {
        self.output_toolbar = Some(toolbar.into_any_element());
        self
    }

    fn render_section(
        label: SharedString,
        toolbar: Option<AnyElement>,
        content: AnyElement,
        cx: &mut App,
    ) -> impl IntoElement {
        let theme = cx.theme();

        v_flex()
            .flex_1()
            .gap_2()
            .overflow_hidden()
            .child(
                h_flex()
                    .items_center()
                    .justify_between()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.muted_foreground)
                            .child(label),
                    )
                    .when_some(toolbar, |this, toolbar| this.child(toolbar)),
            )
            .child(
                div()
                    .flex_1()
                    .rounded_lg()
                    .border_1()
                    .border_color(theme.border)
                    .bg(theme.secondary)
                    .overflow_hidden()
                    .child(content),
            )
    }
}

impl RenderOnce for InputOutputLayout {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let container = match self.orientation {
            Orientation::Horizontal => div().flex().flex_row().gap_4(),
            Orientation::Vertical => div().flex().flex_col().gap_4(),
        };

        container
            .size_full()
            .child(Self::render_section(
                self.input_label,
                self.input_toolbar,
                self.input_content,
                cx,
            ))
            .child(Self::render_section(
                self.output_label,
                self.output_toolbar,
                self.output_content,
                cx,
            ))
    }
}
