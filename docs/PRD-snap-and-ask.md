# PRD — Snap & Ask (MVP)

## 1. Ringkasan

Snap & Ask adalah desktop tool berbasis Tauri yang memungkinkan user memanggil AI (Gemini Vision / Groq) kapan saja lewat global shortcut, untuk menjelaskan, meringkas, atau menerjemahkan konten yang sedang dilihat di layar — tanpa berpindah window atau membuka browser tambahan.

**Masalah yang diselesaikan**: saat membaca artikel/dokumentasi/kode di app lain dan menemukan bagian yang tidak dipahami, user harus copy-paste manual ke ChatGPT/Gemini di tab terpisah — memutus fokus dan alur baca.

**Target pengguna**: developer/pelajar yang sering baca dokumentasi teknis, artikel bahasa asing, atau konten yang butuh penjelasan cepat.

## 2. Tujuan MVP

- Membuktikan bahwa alur "shortcut → capture → AI → popup hasil" bisa berjalan mulus dan cepat (< 5 detik dari shortcut ke hasil)
- Validasi bahwa akses system-level (tray, global shortcut, screenshot, clipboard) di Tauri cukup stabil untuk dipakai sehari-hari
- Jadi fondasi untuk fitur lanjutan (history, custom prompt, OCR editable)

## 3. Key Features (MVP)

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| 1 | Tray icon | App jalan di background, muncul di tray/menu bar, klik kanan untuk "Buka" / "Keluar" | Must have |
| 2 | Global shortcut | Kombinasi tombol (default `Cmd/Ctrl+Shift+S`) memicu mode capture dari app manapun | Must have |
| 3 | Region screenshot capture | Overlay transparan full-screen muncul, user drag-select area yang ingin ditanya | Must have |
| 4 | Kirim ke Gemini Vision | Screenshot area terpilih dikirim ke Gemini Vision API dengan prompt default ("jelaskan ini") | Must have |
| 5 | Popup hasil dekat cursor | Window kecil baru muncul dekat posisi cursor terakhir, menampilkan hasil dari AI | Must have |
| 6 | Copy hasil | Tombol copy di popup untuk menyalin hasil penjelasan | Should have |
| 7 | Clipboard text mode | Mode alternatif: baca teks dari clipboard (bukan screenshot), kirim ke Groq untuk diringkas/diterjemahkan | Should have |
| 8 | Escape untuk batal | Tekan `Esc` saat overlay aktif untuk membatalkan capture | Should have |
| 9 | Run on startup | App otomatis jalan di background begitu OS boot, tanpa user perlu buka manual | Must have |

**Di luar scope MVP** (untuk V2): history hasil, prompt custom oleh user, mode OCR jadi teks editable, auto-detect bahasa.

## 4. User Flow

1. App berjalan di background (tray icon), tidak ada window terbuka
2. User sedang membaca sesuatu di app lain (browser, PDF reader, dll)
3. User menekan global shortcut
4. Layar tertutup overlay transparan; app lain di baliknya tetap terlihat dan tidak terganggu
5. User drag untuk memilih area yang ingin ditanyakan
6. Area tersebut di-screenshot, dikirim ke Gemini Vision
7. Popup kecil muncul dekat cursor, menampilkan hasil penjelasan dari AI
8. User bisa copy hasil atau menutup popup untuk kembali ke aktivitas sebelumnya

## 5. Kebutuhan Teknis

### Sistem-level API (Tauri)
- **Tray icon**: Tauri tray API bawaan
- **Global shortcut**: plugin `@tauri-apps/plugin-global-shortcut`
- **Screenshot region capture**: overlay window transparan Tauri + drag-select, capture area lewat command Rust atau plugin screenshot
- **Clipboard read**: plugin `@tauri-apps/plugin-clipboard-manager`
- **Popup window**: window baru Tauri, posisi mengikuti koordinat cursor terakhir
- **Run on startup**: plugin `tauri-plugin-autostart`, aktif default agar app selalu siap tanpa dibuka manual

### Catatan Arsitektur — Lightweight Footprint
- WebView (frontend popup) **tidak boleh selalu aktif** saat idle di tray — hanya proses Rust kecil (listener shortcut + tray) yang berjalan terus-menerus
- Window popup di-**destroy** (bukan disembunyikan) setelah ditutup, agar memori WebView kembali ke OS, bukan menumpuk di background
- Frontend popup sebaiknya pakai **Svelte atau vanilla JS/HTML**, bukan React penuh — popup ini single-purpose (tampilkan hasil + tombol copy), tidak butuh overhead virtual DOM/runtime React
- Single-instance guard (`tauri-plugin-single-instance`) agar tidak ada proses ganda menumpuk
- SDK AI (Gemini/Groq) di-lazy-load, tidak diimpor saat startup

### UI Stack — Modern Minimalist
- **Framework**: Svelte + Vite (bukan SvelteKit — cukup single-page, tidak perlu routing)
- **Styling**: vanilla CSS + CSS variables (bukan Tailwind — popup terlalu kecil untuk butuh utility framework)
- **Font**: satu typeface, variable font (misal Inter/Geist) untuk hemat load
- **Icon**: Lucide, diimpor sebagai SVG manual (bukan install seluruh package)
- **Animasi**: CSS transitions/keyframes native, bukan library animasi
- **Dark/light mode**: mengikuti `prefers-color-scheme` OS, bukan toggle manual
- **Interaksi**: auto-resize popup sesuai panjang hasil (max-height + scroll), `Esc` untuk tutup, `Cmd/Ctrl+C` untuk copy tanpa klik mouse
- **Loading state**: teks animasi kontekstual (bukan spinner generik)

### AI Integration
- **Gemini Vision** — untuk input berupa gambar (screenshot)
- **Groq** — untuk input berupa teks (clipboard mode), konsisten dengan yang sudah dipakai di project meal plan generator

## 6. Metrik Keberhasilan (MVP)

- Shortcut berhasil terdeteksi dari app manapun, tanpa gagal/delay signifikan
- Waktu dari shortcut ditekan sampai hasil muncul: idealnya di bawah 5 detik
- Popup hasil tidak mengganggu posisi/scroll app yang sedang dibuka user

## 7. Rencana Build Bertahap

1. **Tahap 1**: setup project Tauri + React, tray icon jalan, global shortcut jalan (belum ada capture, cukup buka window kosong dulu)
2. **Tahap 2**: implementasi clipboard read → kirim ke Groq → tampilkan hasil ringkas di popup
3. **Tahap 3**: implementasi overlay + drag-select screenshot → kirim ke Gemini Vision
4. **Tahap 4**: polish UI popup, tombol copy, tombol batal (Esc)
