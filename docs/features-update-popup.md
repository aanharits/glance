# Update Fitur — Popup Snap & Ask

Dokumen ini berisi revisi UI/UX untuk popup hasil, berdasarkan hasil testing MVP mode
clipboard yang sudah berjalan. Fungsional inti (shortcut → clipboard → Groq → hasil)
sudah bekerja dan tidak perlu diubah. Yang perlu direvisi murni soal window behavior,
interaksi, dan visual.

## Bug yang Harus Diperbaiki

### 1. Tombol close (pojok kanan atas) tidak berfungsi

Klik tombol X di `SnapPopup.svelte` tidak menutup popup. Kemungkinan penyebab: event handler
tidak terpasang dengan benar, atau referensi window (`getCurrentWindow()`) tidak
mengarah ke window yang benar. Perlu di-debug ulang, pastikan `closePopup()` benar-benar
terpanggil (bisa tambahkan console.log sementara untuk verifikasi) dan window API
Tauri merespons.

### 2. Tombol Escape tidak menutup popup

Sama seperti di atas — listener `keydown` untuk `Escape` di `handleKeydown()` tidak
berjalan. Kemungkinan `<svelte:window>` tidak menerima fokus keyboard karena popup
window tidak mendapat fokus otomatis saat muncul, atau listener ter-attach ke scope
yang salah. Pastikan window benar-benar dapat fokus keyboard saat `show()` dipanggil.

## Fitur yang Perlu Ditambahkan

### 3. Auto-resize window sesuai panjang konten

Saat ini ukuran window tetap kecil (default 380x200) walau hasil AI panjang, sehingga
konten terpotong. Window perlu resize otomatis mengikuti tinggi konten hasil (dengan
batas maksimum tinggi, misal 500px, lalu scroll internal jika melebihi itu). Ini butuh
komunikasi dari frontend (ukur tinggi konten via JS setelah render) ke Rust untuk
memanggil `window.set_size()` secara dinamis — bukan cuma CSS `max-height` di dalam
window yang ukurannya sudah fixed dari Rust.

### 4. Window bisa di-drag (dipindah posisinya oleh user)

Saat ini popup tidak bisa digeser. Tambahkan drag region di bagian header popup, agar
user bisa memindah posisi popup kalau menghalangi konten yang sedang dibaca. Di Tauri,
ini biasanya ditambahkan lewat atribut `data-tauri-drag-region` pada elemen HTML yang
menjadi handle drag-nya (misal di `.card-header`).

### 5. Window bisa di-resize manual oleh user (opsional, prioritas lebih rendah)

Selain auto-resize otomatis di poin 3, pertimbangkan juga apakah user perlu resize
manual (drag dari sudut/tepi window). Ini di-set lewat `resizable: true` di konfigurasi
window, tapi perlu dipikirkan apakah ini betulan dibutuhkan mengingat popup sudah
auto-resize — didiskusikan dulu sebelum diimplementasikan supaya tidak konflik dengan
auto-resize di poin 3.

## Revisi Desain Visual

### 6. Ubah ke gaya glassmorphism ala iOS (tidak terlalu transparan)

Ganti pendekatan visual card dari solid background ke glassmorphism:

- Background semi-transparan dengan blur di baliknya (`backdrop-filter: blur(...)`),
  bukan warna solid seperti sekarang
- Opacity background jangan terlalu rendah — konten tetap harus terbaca jelas,
  bukan efek "kaca buram" yang mengorbankan keterbacaan
- Border tipis dengan warna semi-transparan untuk memperkuat efek "kaca" (mirip Control
  Center atau Notification Center di iOS/macOS)
- Tetap pertahankan dark/light mode otomatis mengikuti `prefers-color-scheme`

### 7. Animasi pop-in/pop-out konsisten, terinspirasi Spotlight Search iOS

Animasi saat ini tidak konsisten (pop-in ada, pop-out belum ada sama sekali — window
langsung hilang begitu ditutup). Perlu:

- Pop-in: scale dari sedikit lebih kecil + fade-in, cepat dan halus (mirip saat
  Spotlight Search muncul di iOS — bukan bounce berlebihan, tapi smooth ease-out)
- Pop-out: kebalikannya — scale mengecil sedikit + fade-out sebelum window benar-benar
  ditutup/di-destroy, bukan langsung hilang instan
- Durasi animasi konsisten antara pop-in dan pop-out (sekitar 150-250ms), gunakan
  easing yang sama di kedua arah
