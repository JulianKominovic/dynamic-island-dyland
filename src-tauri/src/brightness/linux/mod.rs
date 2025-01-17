use std::sync::Arc;

use super::BrightnessStruct;
impl BrightnessStruct {
    pub fn new() -> Self {
        Self {
            on_brightness_change: Box::new(|_| ()),
            callback: None,
        }
    }

    pub fn set_on_brightness_change(&mut self, callback: Box<dyn Fn(f64) + Send + Sync + 'static>) {
        self.callback = Some(Arc::new(callback));
    }
    pub async fn start_listening(&self) {
        let callback = self.callback.clone();
        gnome_dbus_api::handlers::easy_gnome::screen::on_brightness_changed(move |value| {
            if let Some(callback) = callback.as_ref() {
                callback(value.into());
            }
        })
        .await;
    }
}
