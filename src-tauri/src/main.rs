// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod events;
use events::greet;
use gtk::prelude::{GtkWindowExt, WidgetExt};
use tauri::Manager;
pub mod multimedia;
#[cfg(target_os = "macos")]
use cocoa::base::id;
#[cfg(target_os = "linux")]
use gtk::{
    gdk::WindowTypeHint,
    prelude::{BinExt, ContainerExt, GtkWindowExt, WidgetExt},
};
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};
use std::ptr;
const MACOS_NOTCH_HEIGHT_PX: i32 = 64;
const MACOS_WINDOW_LEVEL: u8 = 25;
const MACOS_NOTCH_WIDTH_PX: i32 = 360;
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(debug_assertions)]
            window.open_devtools();
            let current_monitor = window.current_monitor().unwrap().unwrap();
            let screen_bounds = current_monitor.size();
            let screen_x_center = screen_bounds.width as f32 / 2.0;
            #[cfg(target_os = "macos")]
            {
                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    let _: () = msg_send![ns_window, setLevel: MACOS_WINDOW_LEVEL];
                }
                if let Err(e) = window.set_position(tauri::PhysicalPosition::new(
                    screen_x_center as i32 - MACOS_NOTCH_WIDTH_PX / 2,
                    0,
                )) {
                    eprintln!("Failed to set window position: {:?}", e);
                }
                if let Err(e) = window.set_size(tauri::PhysicalSize::new(
                    MACOS_NOTCH_WIDTH_PX,
                    MACOS_NOTCH_HEIGHT_PX,
                )) {
                    eprintln!("Failed to set window size: {:?}", e);
                }
            }

            #[cfg(target_os = "linux")]
            {
                let gtk_window = window.gtk_window().unwrap();
                if let Some(vbox) = gtk_window.get_child() {
                    gtk_window.remove(&vbox);
                    let new_window = gtk::Window::new(gtk::WindowType::Popup);
                    new_window.set_type_hint(gdk::WindowTypeHint::Dock);
                    new_window.set_resizable(false);
                    new_window.set_decorated(false);
                    new_window.set_keep_above(true);
                    new_window.set_skip_taskbar_hint(true);
                    new_window.set_skip_pager_hint(true);

                    new_window.add(&vbox);
                    new_window.set_default_size(MACOS_NOTCH_WIDTH_PX, MACOS_NOTCH_HEIGHT_PX);
                    new_window.set_size_request(MACOS_NOTCH_WIDTH_PX, MACOS_NOTCH_HEIGHT_PX);
                    new_window.move_(
                        (screen_x_center as i32 - MACOS_NOTCH_WIDTH_PX / 2) as i32,
                        0,
                    );
                    new_window.show_all();
                    vbox.show_all();
                    window.hide().unwrap();
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
