// Copyright (c) 2023-2025, AprilNEA LLC.
//
// Dual licensed under:
// - GPL-3.0 (open source)
// - Commercial license (contact us)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// See LICENSE file for details or contact admin@aprilnea.com

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use dev_utility_core;
use tauri::{
    menu::{MenuItem, MenuItemKind, PredefinedMenuItem, SubmenuBuilder, HELP_SUBMENU_ID},
    Manager,
};

const SETTINGS_ID: &str = "settings";
const UPDATE_ID: &str = "update";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())
                    .unwrap();
                app.handle().plugin(tauri_plugin_shell::init()).unwrap();

                let global_menu = app.menu().unwrap();

                #[cfg(target_os = "macos")]
                if let Ok(items) = global_menu.items() {
                    if let Some(app_submenu) = items.first() {
                        if let MenuItemKind::Submenu(submenu) = app_submenu {
                            let about_position = 0;

                            let separator = PredefinedMenuItem::separator(app)?;
                            let _ = submenu.insert(&separator, about_position + 1);

                            let preference_item = MenuItem::with_id(
                                app,
                                SETTINGS_ID,
                                "Settings",
                                true,
                                Some("cmd+,"),
                            )?;
                            let _ = submenu.insert(&preference_item, about_position + 2);

                            let update_item = MenuItem::with_id(
                                app,
                                UPDATE_ID,
                                "Check for Updates",
                                true,
                                None::<&str>,
                            )?;
                            let _ = submenu.insert(&update_item, about_position + 3);
                        }
                    }
                }

                if let Some(item) = global_menu.get(HELP_SUBMENU_ID) {
                    let _ = global_menu.remove(&item);
                }

                global_menu
                    .append(
                        &SubmenuBuilder::new(app, "Help")
                            .text("privacy_policy", "Privacy Policy")
                            .separator()
                            .text("report_issue", "Report An Issue...")
                            .text("readest_help", "Readest Help")
                            .build()?,
                    )
                    .unwrap();

                // listen for menu item click events
                app.on_menu_event(move |app, event| {
                    // emit a window event to the frontend
                    // let _event = app.emit("custom-event", "/settings");

                    if event.id() == SETTINGS_ID {
                        let app_handle = app.app_handle().clone();
                        std::thread::spawn(move || {
                            let _ = tauri::WebviewWindowBuilder::new(
                                &app_handle,
                                "settings",
                                tauri::WebviewUrl::App("/settings".into()),
                            )
                            .inner_size(360.0, 680.0)
                            .build()
                            .unwrap();
                        });
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // #[cfg(desktop)]
            // dev_utility_core::hardware::list_hid_devices,
            dev_utility_core::codec::decode_base64,
            dev_utility_core::codec::encode_base64,
            #[cfg(desktop)]
            dev_utility_core::codec::decode_jwt,
            dev_utility_core::cryptography::generate_rsa_key,
            dev_utility_core::cryptography::analyze_rsa_key,
            dev_utility_core::cryptography::generate_hashes,
            dev_utility_core::cryptography::generate_totp_secret,
            dev_utility_core::cryptography::generate_totp_code,
            dev_utility_core::cryptography::validate_totp_code,
            dev_utility_core::generator::analyze_uuid,
            dev_utility_core::generator::generate_uuid_v1,
            dev_utility_core::generator::generate_uuid_v4,
            dev_utility_core::generator::generate_uuid_v7,
            dev_utility_core::generator::generate_ulid,
            dev_utility_core::generator::generate_nanoid,
            dev_utility_core::formatter::format_json,
            dev_utility_core::formatter::format_css,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
