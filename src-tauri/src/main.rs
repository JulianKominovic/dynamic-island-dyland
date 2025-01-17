// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod brightness;
pub mod events;
pub mod multimedia;
pub mod window;
#[cfg(target_os = "macos")]
use cocoa::base::id;
use gtk::glib::{self, ControlFlow};
#[cfg(target_os = "linux")]
use gtk::{
    gdk,
    prelude::{BinExt, ContainerExt, CssProviderExt, GtkWindowExt, WidgetExt},
};

use multimedia::{MultimediaFrontendStruct, MultimediaTrait};
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};
use once_cell::sync::Lazy;
use tauri::{Emitter, Manager};
use window::{update_window_size, update_window_size_and_coords};

pub const MACOS_WINDOW_LEVEL: u8 = 25;
pub const MACOS_NOTCH_HEIGHT_PX: i32 = 64;
pub const MACOS_NOTCH_WIDTH_PX: i32 = 360;

/// The top bar interferes with listeners on the top of the screen
/// This is a workaround to move the window down a little to achieve the hover effect
pub const LINUX_NOTCH_EXTRA_HEIGHT_PX: i32 = 12;
pub const LINUX_NOTCH_EXTRA_WIDTH_PX: i32 = 24;
pub const LINUX_NOTCH_HEIGHT_PX: i32 = 32;
pub const LINUX_NOTCH_WIDTH_PX: i32 = 240;
pub const LINUX_NOTCH_HOVERING_X_SCALE: f32 = 1.1;
pub const LINUX_NOTCH_HOVERING_Y_SCALE: f32 = 1.15;

// Sizes singleton
struct Sizes {
    window_width: i32,
    window_height: i32,
    dynamic_island_width: i32,
    dynamic_island_height: i32,
    x: i32,
    y: i32,
}
#[cfg(target_os = "linux")]
pub static DYNAMIC_ISLAND_SIZES: Lazy<std::sync::Mutex<Sizes>> = Lazy::new(|| {
    std::sync::Mutex::new(Sizes {
        window_width: LINUX_NOTCH_WIDTH_PX + LINUX_NOTCH_EXTRA_WIDTH_PX,
        window_height: LINUX_NOTCH_HEIGHT_PX + LINUX_NOTCH_EXTRA_HEIGHT_PX,
        dynamic_island_width: LINUX_NOTCH_WIDTH_PX,
        dynamic_island_height: LINUX_NOTCH_HEIGHT_PX,
        x: 0,
        y: 0,
    })
});

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![update_window_size])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
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

                if let Some(vbox) = gtk_window.child() {
                    gtk_window.remove(&vbox);
                    let new_window = gtk::Window::new(gtk::WindowType::Popup);

                    // Prevent flickering
                    // Enable double buffering and set visual
                    if let Some(screen) = gtk::prelude::WidgetExt::screen(&new_window) {
                        if let Some(visual) = screen.rgba_visual() {
                            new_window.set_visual(Some(&visual));
                        }
                        // Enable compositing and double buffering
                        new_window.set_app_paintable(true);
                        new_window.set_opacity(1.0);
                        // Add damage handling
                        new_window.connect_draw(|_, _| glib::Propagation::Proceed);

                        // End of Prevent flickering

                        new_window.set_type_hint(gdk::WindowTypeHint::Dock);
                        new_window.set_resizable(false);
                        new_window.set_decorated(false);
                        new_window.set_keep_above(true);
                        new_window.set_keep_below(false);
                        new_window.set_skip_taskbar_hint(true);
                        new_window.set_skip_pager_hint(true);
                        new_window.set_gravity(gdk::Gravity::Center);
                    }

                    // Hack to make the window transparent
                    let css_provider = gtk::CssProvider::new();
                    css_provider
                        .load_from_data(
                            b"
                            window {
                                background-color: transparent;
                                background-clip: border-box;
                                opacity: 1;
                            }
                            ",
                        )
                        .unwrap();
                    if let Some(screen) = gtk::prelude::GtkWindowExt::screen(&new_window) {
                        gtk::StyleContext::add_provider_for_screen(
                            &screen,
                            &css_provider,
                            gtk::STYLE_PROVIDER_PRIORITY_APPLICATION,
                        );
                        new_window.set_visual(screen.rgba_visual().as_ref());
                    }
                    // End of Hack to make the window transparent

                    new_window.add(&vbox);
                    let mut sizes = DYNAMIC_ISLAND_SIZES.lock().unwrap();
                    new_window.set_default_size(sizes.window_width, sizes.window_height);
                    new_window.set_size_request(sizes.window_width, sizes.window_height);
                    let window_x_start = screen_x_center as i32 - LINUX_NOTCH_WIDTH_PX / 2;
                    sizes.x = window_x_start;
                    sizes.y = 0;
                    new_window.move_(window_x_start, 0);
                    new_window.show_all();
                    vbox.show_all();
                    window.hide().unwrap();
                    drop(sizes);
                    // Track mouse globally
                    let app_handle = app.handle().clone();
                    std::thread::spawn(move || {
                        let display = unsafe { x11::xlib::XOpenDisplay(std::ptr::null()) };
                        if display.is_null() {
                            return;
                        }
                        let root = unsafe { x11::xlib::XDefaultRootWindow(display) };
                        let mut root_x = 0;
                        let mut root_y = 0;
                        let mut win_x = 0;
                        let mut win_y = 0;
                        let mut mask = 0;
                        let mut child = 0;

                        loop {
                            unsafe {
                                x11::xlib::XQueryPointer(
                                    display,
                                    root,
                                    &mut child,
                                    &mut child,
                                    &mut root_x,
                                    &mut root_y,
                                    &mut win_x,
                                    &mut win_y,
                                    &mut mask,
                                );
                            }
                            let sizes = DYNAMIC_ISLAND_SIZES.lock().unwrap();
                            let is_intersecting = win_x >= sizes.x
                                && win_x <= sizes.x + sizes.window_width
                                && win_y >= sizes.y
                                && win_y <= sizes.y + sizes.window_height;
                            drop(sizes);
                            if is_intersecting {
                                let _ = app_handle.emit("mouse-enter", ());
                            } else {
                                let _ = app_handle.emit("mouse-leave", ());
                            }

                            std::thread::sleep(std::time::Duration::from_millis(50));
                        }
                    });
                    // End of Track mouse globally

                    // Listen for frontend window resize request
                    let (sender, receiver) = glib::MainContext::channel(glib::Priority::DEFAULT);
                    let app_clone_update_window_size = app.handle().clone();
                    let window_clone = new_window.clone();
                    receiver.attach(None, move |size| {
                        update_window_size_and_coords(
                            app_clone_update_window_size.clone(),
                            size,
                            window_clone.clone(),
                        )
                        .unwrap();
                        ControlFlow::Continue
                    });
                    app.manage(sender);
                }
            }
            window.open_devtools();

            // Start services
            let mut brightness = brightness::BrightnessStruct::new();
            let brighness_handle_app = app.handle().clone();
            brightness.set_on_brightness_change(Box::new(move |value| {
                let _ = brighness_handle_app.emit("brightness-changed", value);
            }));
            let runtime = tauri::async_runtime::spawn(async move {
                brightness.start_listening().await;
            });

            let media = multimedia::MultimediaStruct::new();
            let media_clone = media.clone();
            let multimedia_handle_app = app.handle().clone();

            media.on_multimedia_change(Box::new(move || {
                let _ = multimedia_handle_app.emit(
                    "multimedia-changed",
                    MultimediaFrontendStruct {
                        metadata: media_clone.get_metadata(),
                        volume: media_clone.get_volume(),
                        mute: media_clone.get_mute(),
                        playing: media_clone.is_playing(),
                        position: media_clone.get_position(),
                    },
                );
            }));
            app.manage(runtime);

            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
