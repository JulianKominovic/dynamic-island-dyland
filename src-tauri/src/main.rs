// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod events;
use events::greet;
use tauri::Manager;
pub mod multimedia;
#[cfg(target_os = "macos")]
use cocoa::base::id;
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};
use std::ptr;
#[cfg(target_os = "linux")]
use x11::xlib;

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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
