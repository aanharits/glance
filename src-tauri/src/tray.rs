use crate::window::trigger_snap;
use tauri::{
    menu::{Menu, MenuItem, Submenu},
    tray::TrayIconBuilder,
    Emitter,
};

pub fn setup_tray(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItem::with_id(app, "show", "Open", true, None::<&str>)?;

    // Theme submenu presets
    let theme_purple = MenuItem::with_id(
        app,
        "theme:midnight-purple",
        "Midnight Purple (Default)",
        true,
        None::<&str>,
    )?;
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

    Ok(())
}
