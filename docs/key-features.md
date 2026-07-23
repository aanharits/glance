# Konteks Project: Snap & Ask

Saya sedang membangun desktop tool bernama **Snap & Ask** menggunakan Tauri + Svelte.
Fungsinya: user menekan global shortcut dari app manapun, lalu memilih konten (lewat
drag-select screenshot ATAU clipboard teks yang sudah di-copy), dan mendapat penjelasan/
ringkasan dari AI (Gemini Vision untuk gambar, Groq untuk teks) dalam popup kecil dekat cursor.

## Yang Sudah Berhasil Jalan (Jangan Dibangun Ulang dari Nol)

- Project Tauri v2 + Svelte + Vite sudah tersetup dan **berhasil dijalankan** dengan `npm run tauri dev`
- Tray icon dengan menu "Buka"/"Keluar" — bekerja
- Global shortcut `Cmd+Shift+S` — bekerja, memicu popup window
- Popup window muncul dekat posisi cursor — bekerja
- Konfigurasi `macOSPrivateApi: true` di `tauri.conf.json` sudah ditambahkan agar transparansi window bekerja dengan benar di macOS
- Komponen `App.svelte` (popup UI) sudah ada dengan 3 state: loading, result, error — styling modern minimalist (dark/light mode otomatis via `prefers-color-scheme`, animasi pop-in halus, keyboard shortcut `Esc` untuk tutup dan `Cmd/Ctrl+C` untuk copy)
- Struktur folder: `src/` (frontend Svelte), `src-tauri/` (backend Rust: `lib.rs` berisi logic tray + shortcut + emit event `snap:triggered` ke frontend)

## Stack yang Dipakai (Ikuti, Jangan Ganti Tanpa Alasan Kuat)

- Frontend: Svelte + Vite (bukan React, bukan SvelteKit — cukup Svelte biasa karena single-purpose popup)
- Styling: vanilla CSS + CSS variables (bukan Tailwind)
- Backend: Rust (Tauri v2)
- AI: Gemini Vision (untuk input gambar/screenshot), Groq (untuk input teks/clipboard)
- Prinsip arsitektur: WebView TIDAK boleh selalu aktif saat idle — popup window di-destroy setelah ditutup, bukan disembunyikan, agar hemat memori saat berjalan di background

## Yang Perlu Dilanjutkan Sekarang

1. **Logic capture** — belum diimplementasikan. Titik masuknya: event `snap:triggered` yang di-emit dari Rust (`lib.rs`, fungsi `trigger_snap()`) perlu didengarkan di `App.svelte` untuk memicu salah satu dari:
   - Mode clipboard: baca clipboard via `@tauri-apps/plugin-clipboard-manager` (sudah terpasang), kirim teksnya ke Groq
   - Mode screenshot: tampilkan overlay window transparan full-screen baru untuk drag-select area, screenshot area itu, kirim ke Gemini Vision
2. **Pemanggilan API AI** — belum ada kode fetch. CSP di `tauri.conf.json` sudah mengizinkan domain `generativelanguage.googleapis.com` dan `api.groq.com`.
3. **API key** — harus disimpan sebagai environment variable saat development, tidak boleh hardcoded di source (karena ter-bundle ke aplikasi yang bisa di-inspect user).
4. **Icon aplikasi** — sudah ada placeholder sederhana (dot biru di atas background gelap), bisa diganti desain final belakangan.

## Constraint Desain yang Harus Dipatuhi

- Popup harus tetap ringan — hindari state management berat, hindari library besar yang tidak perlu
- Popup auto-resize mengikuti panjang hasil (max-height + scroll jika kepanjangan) — belum diimplementasikan, tolong tambahkan
- Semua interaksi keyboard-first: Esc untuk tutup sudah ada, Cmd/Ctrl+C untuk copy sudah ada

## Yang Saya Minta dari Kamu Sekarang

Lanjutkan development dari kondisi project yang sudah ada ini (jangan re-scaffold dari nol).
Mulai dari implementasi **mode clipboard** dulu (lebih sederhana dari mode screenshot),
karena ini yang paling cepat memberi hasil end-to-end yang bisa dites: shortcut ditekan →
baca clipboard → kirim ke Groq → tampilkan hasil di popup.

Setelah mode clipboard berhasil dan sudah saya tes, kita lanjut ke mode screenshot
(overlay drag-select) sebagai tahap berikutnya.
