use crate::{
    DYNAMIC_ISLAND_SIZES, LINUX_NOTCH_EXTRA_HEIGHT_PX, LINUX_NOTCH_EXTRA_WIDTH_PX,
    LINUX_NOTCH_HEIGHT_PX, LINUX_NOTCH_WIDTH_PX,
};
#[cfg(target_os = "linux")]
use gtk::prelude::{GtkWindowExt, WidgetExt};
#[cfg(target_os = "linux")]
use gtk::Window;
use tauri::Manager;
use tauri::State;

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn update_window_size(size: String, sender: State<glib::Sender<String>>) {
    sender.send(size).unwrap()
}
#[cfg(target_os = "linux")]
pub fn update_window_size_and_coords(
    app: tauri::AppHandle,
    size: String,
    gtk_window: Window,
) -> Result<(), String> {
    use std::{thread, time::Duration};

    let window = app.get_webview_window("main").unwrap();
    let current_monitor = window.current_monitor().unwrap().unwrap();
    let screen_bounds = current_monitor.size();
    let screen_x_center = screen_bounds.width as f32 / 2.0;
    let mut sizes = DYNAMIC_ISLAND_SIZES.lock().unwrap();
    match size.as_str() {
        "sm" => {
            sizes.dynamic_island_width = 220;
            sizes.dynamic_island_height = 24;
            sizes.window_width = sizes.dynamic_island_width + 24;
            sizes.window_height = sizes.dynamic_island_height + 8;
        }
        "md" => {
            sizes.dynamic_island_width = 320;
            sizes.dynamic_island_height = 40;
            sizes.window_width = sizes.dynamic_island_width + 24;
            sizes.window_height = sizes.dynamic_island_height + 12;
        }
        "lg" => {
            sizes.dynamic_island_width = 320;
            sizes.dynamic_island_height = 160;
            sizes.window_width = sizes.dynamic_island_width + 48;
            sizes.window_height = sizes.dynamic_island_height + 48;
        }
        _ => {
            return Err("Invalid size".to_string());
        }
    }
    #[cfg(target_os = "linux")]
    {
        println!(
            "Setting window size to: {}w x {}h",
            sizes.window_width, sizes.window_height
        );
        println!(
            "Setting dynamic island size to: {}w x {}h",
            sizes.dynamic_island_width, sizes.dynamic_island_height
        );
        println!("Setting window position to x: {}, y: {}", sizes.x, sizes.y);
        let window_x_start = screen_x_center as i32 - sizes.dynamic_island_width / 2;
        sizes.x = window_x_start;
        sizes.y = 0;
        gtk_window.move_(window_x_start, 0);
        // Do a smooth resize step by step
        // This is a workaround to avoid the window flickering
        let original_width = gtk_window.allocated_width();
        let original_height = gtk_window.allocated_height();
        let width_diff = sizes.window_width - original_width;
        let height_diff = sizes.window_height - original_height;
        let steps = match size.as_str() {
            "sm" => 60,
            "md" => 60,
            "lg" => 20,
            _ => 10,
        };

        for i in 1..=steps {
            let progress = i as f64 / steps as f64;
            let current_width = original_width + (width_diff as f64 * progress) as i32;
            let current_height = original_height + (height_diff as f64 * progress) as i32;
            let current_x = screen_x_center as i32 - current_width / 2;
            gtk_window.set_size_request(current_width, current_height);
            gtk_window.move_(current_x, 0);
            gtk_window.queue_draw();
            thread::sleep(Duration::from_millis(2));
            while gtk::events_pending() {
                gtk::main_iteration();
            }
        }
    }

    Ok(())
}
