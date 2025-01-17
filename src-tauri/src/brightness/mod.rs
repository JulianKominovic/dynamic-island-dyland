use std::sync::Arc;

#[cfg(target_os = "linux")]
pub mod linux;

pub struct BrightnessStruct {
    pub on_brightness_change: Box<dyn Fn(f64) + Send + Sync + 'static>,
    callback: Option<Arc<Box<dyn Fn(f64) + Send + Sync + 'static>>>,
}
