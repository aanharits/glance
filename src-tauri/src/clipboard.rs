use tauri::Emitter;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[cfg(target_os = "macos")]
fn get_mac_pasteboard_change_count() -> i64 {
    use objc::{msg_send, sel, sel_impl};
    unsafe {
        let cls = match objc::runtime::Class::get("NSPasteboard") {
            Some(c) => c,
            None => return 0,
        };
        let pb: *mut objc::runtime::Object = msg_send![cls, generalPasteboard];
        if pb.is_null() {
            return 0;
        }
        let count: i64 = msg_send![pb, changeCount];
        count
    }
}

pub fn start_listener(app: &tauri::AppHandle) {
    let handle_clip = app.clone();
    std::thread::spawn(move || {
        #[cfg(target_os = "macos")]
        let mut last_change_count = get_mac_pasteboard_change_count();
        #[cfg(not(target_os = "macos"))]
        let mut last_text = String::new();

        loop {
            std::thread::sleep(std::time::Duration::from_millis(100));

            #[cfg(target_os = "macos")]
            {
                let current_count = get_mac_pasteboard_change_count();
                if current_count != last_change_count {
                    last_change_count = current_count;

                    // System copy action occurred! Retry up to 4x for pasteboard write completion
                    for attempt in 0..4 {
                        if let Ok(text) = handle_clip.clipboard().read_text() {
                            let trimmed = text.trim();
                            if !trimmed.is_empty() {
                                let _ = handle_clip.emit("clipboard:changed", trimmed.to_string());
                                break;
                            }
                        }
                        if attempt < 3 {
                            std::thread::sleep(std::time::Duration::from_millis(30));
                        }
                    }
                }
            }

            #[cfg(not(target_os = "macos"))]
            {
                if let Ok(text) = handle_clip.clipboard().read_text() {
                    let trimmed = text.trim();
                    if !trimmed.is_empty() && trimmed != last_text {
                        last_text = trimmed.to_string();
                        let _ = handle_clip.emit("clipboard:changed", trimmed.to_string());
                    }
                }
            }
        }
    });
}
