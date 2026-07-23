# Fitur Baru — Custom Theme untuk Popup

Fitur ini menambahkan kemampuan mengganti tema warna popup, terinspirasi dari
pendekatan Zen Browser: user memilih dari preset gradient yang sudah dikurasi,
bukan color picker penuh yang rumit. Fitur ini dibangun DI ATAS desain
glassmorphism yang sudah/sedang diimplementasikan — bukan menggantinya.

## Konsep Visual (Referensi)

Card dengan efek glassmorphism (semi-transparan, blur, border tipis) diletakkan
di atas background gradient. Warna gradient inilah yang bisa diganti oleh user,
sementara efek glass pada card tetap konsisten (blur, opacity, border).

## Requirement Fungsional

### 1. Preset Theme (Prioritas Utama)

Sediakan minimal 4 preset gradient yang sudah dikurasi, contoh:

- Midnight Purple (gelap ke ungu)
- Ocean Teal (gelap ke teal/cyan)
- Sunset Coral (gelap ke coral/oranye lembut)
- Monochrome (grayscale, untuk yang prefer minimalis tanpa warna aksen)

User memilih salah satu lewat menu tray (tambahkan submenu "Tema" di tray icon
yang sudah ada) atau lewat tombol settings kecil di popup.

### 2. Custom Color (Prioritas Lebih Rendah, Opsional)

Jika preset dirasa kurang, sediakan opsi custom menggunakan elemen native HTML
`<input type="color">` — JANGAN install library color-picker pihak ketiga.

### 3. Penyimpanan Preferensi

Gunakan `tauri-plugin-store` (plugin resmi Tauri) untuk menyimpan preferensi
tema user secara persisten di disk lokal, agar tema yang dipilih tetap
tersimpan setelah aplikasi ditutup dan dibuka lagi. Tidak perlu menyimpan ke
cloud/remote.

## Requirement Non-Fungsional (Wajib Dipatuhi)

- Implementasi harus tetap ringan — ganti tema cukup dengan mengubah CSS
  variables yang sudah ada (`--bg`, `--accent`, dst di `app.css`), BUKAN
  re-mount komponen atau reload window
- Jangan menambahkan library besar untuk color picker — cukup native HTML input
- Preset gradient cukup didefinisikan sebagai CSS gradient value, tidak perlu
  asset gambar
- Efek glassmorphism (blur, opacity card) yang sudah ada harus tetap konsisten
  terlepas dari tema gradient yang dipilih — jangan sampai mengorbankan
  keterbacaan teks di tema tertentu

## Yang TIDAK Termasuk di Iterasi Ini

- Custom font
- Tema per-mode (misal beda tema untuk hasil clipboard vs screenshot)
- Sinkronisasi tema antar device
