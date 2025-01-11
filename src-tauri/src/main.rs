// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod events;
use events::greet;
use gtk::prelude::{ApplicationWindowExt, GtkWindowExt, WidgetExt};
use std::ptr;
use tauri::{window::Window, Manager};
use x11::xlib;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Obtén el ID de la ventana
            let gdk_window = window.gtk_window().unwrap();
            println!("GDK Window: {:?}", gdk_window);

            // unsafe {
            //     let display = xlib::XOpenDisplay(ptr::null());
            //     let root = xlib::XDefaultRootWindow(display);

            //     // Configura el tipo de ventana
            //     let atom = xlib::XInternAtom(
            //         display,
            //         b"_NET_WM_WINDOW_TYPE\0".as_ptr() as *const u8,
            //         xlib::False,
            //     );
            //     let value = xlib::XInternAtom(
            //         display,
            //         b"_NET_WM_WINDOW_TYPE_NOTIFICATION\0".as_ptr() as *const u8,
            //         xlib::False,
            //     );

            //     xlib::XChangeProperty(
            //         display,
            //         x11_window_id,
            //         atom,
            //         xlib::XA_ATOM,
            //         32,
            //         xlib::PropModeReplace,
            //         &value as *const xlib::Atom as *const u8,
            //         1,
            //     );

            //     // Mueve la ventana al frente
            //     xlib::XRaiseWindow(display, x11_window_id);

            //     xlib::XFlush(display);
            //     xlib::XCloseDisplay(display);
            // }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
