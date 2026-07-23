// Prevents additional console window on Windows in release build
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    snap_and_ask_lib::run();
}
