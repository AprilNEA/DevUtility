use gpui::{px, Application, AppContext, Bounds, Size, WindowBounds, WindowOptions};
use gpui_component::init as init_gpui_component;
use gpui_component::Root;
use gpui_component_assets::Assets;

mod app;
mod layout;
mod theme;

use app::DevUtilityApp;

fn main() {
    env_logger::init();

    let app = Application::new().with_assets(Assets);

    app.run(|cx| {
        init_gpui_component(cx);

        let bounds = Bounds::centered(None, Size {
            width: px(1200.),
            height: px(800.),
        }, cx);

        let options = WindowOptions {
            window_bounds: Some(WindowBounds::Windowed(bounds)),
            titlebar: Some(gpui::TitlebarOptions {
                title: Some("DevUtility".into()),
                appears_transparent: true,
                traffic_light_position: Some(gpui::Point {
                    x: px(18.),
                    y: px(18.),
                }),
            }),
            window_min_size: Some(Size {
                width: px(800.),
                height: px(600.),
            }),
            ..Default::default()
        };

        cx.open_window(options, |window, cx| {
            let main_view = cx.new(|cx| DevUtilityApp::new(window, cx));
            cx.new(|cx| Root::new(main_view, window, cx))
        })
        .unwrap();
    });
}
