use tauri::{Emitter, Manager, PhysicalPosition};

#[cfg(target_os = "macos")]
pub fn setup_mac_window_spaces_behavior(window: &tauri::WebviewWindow) {
    use objc::{msg_send, sel, sel_impl};
    if let Ok(ns_win_ptr) = window.ns_window() {
        let ns_win = ns_win_ptr as *mut objc::runtime::Object;
        if !ns_win.is_null() {
            unsafe {
                // NSWindowCollectionBehaviorCanJoinAllSpaces (1) + NSWindowCollectionBehaviorFullScreenAuxiliary (256)
                // Ensures Glance popup stays visible across ALL macOS Spaces & Fullscreen desktops
                let behavior: u64 = 1 | 256;
                let _: () = msg_send![ns_win, setCollectionBehavior: behavior];
            }
        }
    }
}

#[cfg(target_os = "macos")]
pub fn make_window_key_and_focus(window: &tauri::WebviewWindow) {
    use objc::{msg_send, sel, sel_impl};
    if let Ok(ns_win_ptr) = window.ns_window() {
        let ns_win = ns_win_ptr as *mut objc::runtime::Object;
        if !ns_win.is_null() {
            unsafe {
                // Force Cocoa NSWindow to become key window instantly so Esc works without clicking
                let _: () = msg_send![ns_win, makeKeyAndOrderFront: 0usize];
            }
        }
    }
}

// Main trigger: positions popup window anchored directly at Glance tray icon area.
pub fn trigger_snap(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("popup") else {
        return;
    };

    // Toggle close if window is already visible and focused
    if window.is_visible().unwrap_or(false) && window.is_focused().unwrap_or(false) {
        let _ = window.hide();
        return;
    }

    #[cfg(target_os = "macos")]
    setup_mac_window_spaces_behavior(&window);

    if let Ok(Some(monitor)) = window.primary_monitor() {
        let monitor_size = monitor.size();
        let scale_factor = monitor.scale_factor();
        let window_width = 380.0 * scale_factor;

        let (x, y) = if cfg!(target_os = "macos") {
            // macOS: Aligned under the Glance menu bar tray icon (◎)
            let right_margin = 130.0 * scale_factor;
            let top_offset = 44.0 * scale_factor;
            let x_pos = (monitor_size.width as f64 - window_width - right_margin).max(12.0);
            let y_pos = top_offset;
            (x_pos, y_pos)
        } else {
            // Windows / Linux: Aligned above the Glance system tray icon (◎)
            let right_margin = 20.0 * scale_factor;
            let bottom_offset = 60.0 * scale_factor;
            let x_pos = (monitor_size.width as f64 - window_width - right_margin).max(12.0);

            let window_height = if let Ok(size) = window.outer_size() {
                size.height as f64
            } else {
                300.0 * scale_factor
            };

            let y_pos = (monitor_size.height as f64 - window_height - bottom_offset).max(12.0);
            (x_pos, y_pos)
        };

        let _ = window.set_position(PhysicalPosition::new(x, y));
    }

    let _ = window.show();
    let _ = window.set_focus();

    #[cfg(target_os = "macos")]
    make_window_key_and_focus(&window);

    let _ = window.emit("snap:triggered", ());
}
