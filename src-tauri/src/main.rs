// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod events;
#[cfg(target_os = "macos")]
use cocoa::appkit::NSMainMenuWindowLevel;
#[cfg(target_os = "macos")]
use cocoa::foundation::NSPoint;
#[cfg(target_os = "macos")]
use events::greet;
use objc::{msg_send, sel, sel_impl};
use specta::collect_types;
use tauri::Manager;
use tauri_specta::ts;

fn main() {
    #[cfg(debug_assertions)]
    ts::export(collect_types![greet], "../src/bindings.ts").unwrap();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            unsafe {
                let window = app.get_window("main").unwrap();
                let ns_window = window.ns_window().unwrap() as cocoa::base::id;

                // Set window style to non-activating panel
                // let style_mask: u64 = msg_send![ns_window, styleMask];
                // let new_style_mask = style_mask | NSWindowStyleMask::NSTitledWindowMask as u64;
                // let _: () = msg_send![ns_window, setStyleMask: new_style_mask];

                // Set window level to floating window level
                let _: () = msg_send![ns_window, setLevel: NSMainMenuWindowLevel+3];
                // Make window immovable
                let _: () = msg_send![ns_window, setMovable: false];
                // Get screen height
                let monitor = window.current_monitor().unwrap().unwrap();
                let screen_size = monitor.size();
                let screen_height = screen_size.height;
                println!("screen_height: {}", screen_height);

                // Set window position to the top of the screen
                let top_left = NSPoint::new(0.0, 4000 as f64);
                let _: () = msg_send![ns_window, setFrameTopLeftPoint: top_left];
            };
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
