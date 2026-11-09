# Pantau Kucing Liar

Dashboard komunitas untuk mencatat laporan kucing jalanan dan aktivitas perawatannya. Antarmuka menggunakan XHTML, CSS, dan JavaScript; backend menggunakan PHP murni tanpa framework.

## Menjalankan aplikasi

1. Pasang PHP 8.0 atau lebih baru dan pastikan ekstensi `fileinfo` aktif untuk validasi foto.
2. Dari folder proyek, jalankan:

   ```powershell
   php -S 127.0.0.1:8000 router.php
   ```

3. Buka `http://127.0.0.1:8000`.
4. Buat akun dari tombol akun di bagian atas. Kata sandi 8–200 karakter.

Data akun, laporan, dan catatan tersimpan dalam `pantau-kucing-data\store.json` di folder induk proyek agar tidak dapat diunduh sebagai berkas web. Foto JPG, PNG, atau WebP (maksimal 5 MB) disimpan di `uploads\`.

## Fitur

- Registrasi, login, logout, dan pembaruan profil; kata sandi disimpan menggunakan `password_hash()`.
- CRUD laporan kucing; setiap pengguna hanya dapat mengubah atau menghapus laporannya sendiri.
- CRUD catatan aktivitas perawatan (pemberian makan/minum, obat, steril, dan vaksin) milik pengguna yang sedang masuk.
- Token CSRF untuk seluruh permintaan yang mengubah data, validasi input di server, dan penyimpanan JSON dengan file locking.

Jalankan lewat `router.php` seperti di atas agar halaman utama dan endpoint API dilayani oleh PHP. Membuka `code.xhtml` langsung dari file explorer tidak mengaktifkan backend.
