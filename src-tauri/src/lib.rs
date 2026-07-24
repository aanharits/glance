use tauri::{
    menu::{Menu, MenuItem, Submenu},
    tray::TrayIconBuilder,
    Emitter, Manager, PhysicalPosition,
};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

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

#[cfg(target_os = "macos")]
fn setup_mac_window_spaces_behavior(window: &tauri::WebviewWindow) {
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

// Main trigger: positions popup window anchored directly at Glance tray icon area.
fn trigger_snap(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("popup") else {
        return;
    };

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

    let _ = window.emit("snap:triggered", ());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // Hide dock icon — app runs exclusively as an Accessory item in tray
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("popup") {
                setup_mac_window_spaces_behavior(&window);
            }

            // Native OS changeCount pasteboard listener thread (100ms)
            // Triggers instantly on ANY system copy action (Cmd+C), 100% independent of Webkit window focus
            let handle_clip = app.handle().clone();
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

            // --- Tray menu setup ---
            let show_item = MenuItem::with_id(app, "show", "Open", true, None::<&str>)?;

            // Theme submenu
            let theme_purple = MenuItem::with_id(app, "theme:midnight-purple", "Midnight Purple (Default)", true, None::<&str>)?;
            let theme_teal = MenuItem::with_id(app, "theme:ocean-teal", "Ocean Teal", true, None::<&str>)?;
            let theme_coral = MenuItem::with_id(app, "theme:sunset-coral", "Sunset Coral", true, None::<&str>)?;
            let theme_mono = MenuItem::with_id(app, "theme:monochrome", "Monochrome", true, None::<&str>)?;

            let theme_submenu = Submenu::with_items(
                app,
                "Theme",
                true,
                &[&theme_purple, &theme_teal, &theme_coral, &theme_mono],
            )?;

            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &theme_submenu, &quit_item])?;

            let icon = tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))
                .expect("Failed to load 32x32 icon");

            TrayIconBuilder::with_id("main")
                .icon(icon)
                .menu(&menu)
                .show_menu_on_left_click(true)
                .icon_as_template(true)
                .on_menu_event(|app, event| {
                    let id = event.id.as_ref();
                    if id == "quit" {
                        app.exit(0);
                    } else if id == "show" {
                        trigger_snap(app);
                    } else if let Some(theme_id) = id.strip_prefix("theme:") {
                        let _ = app.emit("theme:changed", theme_id);
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        trigger_snap(app);
                    }
                })
                .build(app)?;

            // --- Global shortcut: Cmd/Ctrl+Shift+S ---
            let shortcut = Shortcut::new(Some(Modifiers::SHIFT | Modifiers::SUPER), Code::KeyS);
            let handle = app.handle().clone();

            app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state() == ShortcutState::Pressed {
                    trigger_snap(&handle);
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error running Glance application");
}
