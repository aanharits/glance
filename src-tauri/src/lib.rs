mod clipboard;
mod groq;
mod shortcuts;
mod tray;
pub mod window;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![groq::ask_groq])
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
            if let Some(win) = app.get_webview_window("popup") {
                window::setup_mac_window_spaces_behavior(&win);
            }

            clipboard::start_listener(app.handle());
            tray::setup_tray(app.handle())?;
            shortcuts::setup_shortcuts(app.handle())?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error running Glance application");
}
