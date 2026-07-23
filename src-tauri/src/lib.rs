use tauri::{
    menu::{Menu, MenuItem, Submenu},
    tray::TrayIconBuilder,
    Emitter, Manager, PhysicalPosition,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

// Main trigger: positions popup window near macOS Menu Bar (top-right) or Windows System Tray (bottom-right).
fn trigger_snap(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("popup") else {
        return;
    };

    if let Ok(Some(monitor)) = window.primary_monitor() {
        let monitor_size = monitor.size();
        let scale_factor = monitor.scale_factor();
        let window_width = 380.0 * scale_factor;

        let (x, y) = if cfg!(target_os = "macos") {
            // macOS: Top-right under menu bar
            let right_offset = 180.0 * scale_factor;
            let top_offset = 38.0 * scale_factor;
            let x_pos = (monitor_size.width as f64 - window_width - right_offset).max(12.0);
            let y_pos = top_offset;
            (x_pos, y_pos)
        } else {
            // Windows / Linux: Bottom-right above taskbar system tray
            let right_offset = 16.0 * scale_factor;
            let bottom_offset = 70.0 * scale_factor;
            let x_pos = (monitor_size.width as f64 - window_width - right_offset).max(12.0);

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
