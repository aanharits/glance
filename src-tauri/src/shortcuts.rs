use crate::window::trigger_snap;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn setup_shortcuts(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // --- Global shortcut: Cmd/Ctrl+Shift+S (Open/Toggle Glance) ---
    let shortcut_s = Shortcut::new(Some(Modifiers::SHIFT | Modifiers::SUPER), Code::KeyS);
    let handle_s = app.clone();

    app.global_shortcut()
        .on_shortcut(shortcut_s, move |_app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                trigger_snap(&handle_s);
            }
        })?;

    // --- Global shortcut: Cmd/Ctrl+Shift+M (Toggle Minimize/Expand) ---
    let shortcut_m = Shortcut::new(Some(Modifiers::SHIFT | Modifiers::SUPER), Code::KeyM);
    let handle_m = app.clone();

    app.global_shortcut()
        .on_shortcut(shortcut_m, move |_app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                if let Some(window) = handle_m.get_webview_window("popup") {
                    let _ = window.emit("window:toggle_minimize", ());
                }
            }
        })?;

    Ok(())
}
