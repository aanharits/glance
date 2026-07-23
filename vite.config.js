import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Config disesuaikan agar cocok dengan requirement Tauri:
// - port tetap (1420) supaya cocok dengan devUrl di tauri.conf.json
// - strictPort supaya build gagal jelas kalau port kepakai, bukan pindah diam-diam
export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Target modern karena WebView2/WebKit sudah cukup baru, hasil bundle lebih kecil
    target: ["es2021", "chrome100", "safari13"],
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
