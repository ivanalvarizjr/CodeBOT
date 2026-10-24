# Common Error Patterns in Flutter/Dart

Daftar error yang sering terjadi beserta cara mengatasinya tanpa perlu melakukan *trial and error*.

## 1. `Null check operator used on a null value`

**Penyebab:** 
Memanggil operator `!` pada variabel yang nilainya `null`.

**Solusi:**
*   Periksa alur data (*data flow*). Apakah data dari API memungkinkan untuk bernilai `null`?
*   Gunakan *null-aware operator* (`?.`, `??`) atau lakukan pengecekan eksplisit `if (variable != null)`.
*   Jangan gunakan `!` kecuali Anda 100% yakin variabel tersebut tidak akan pernah `null`.

---

## 2. `setState() called after dispose()`

**Penyebab:** 
Memanggil `setState` setelah widget dihancurkan (misalnya: setelah navigasi kembali atau setelah *request async* selesai namun widget sudah tidak ada).

**Solusi:**
*   Selalu periksa properti `mounted` sebelum memanggil `setState`.
    ```dart
    if (mounted) {
      setState(() { 
        // ...
      });
    }
    ```
*   Gunakan `StreamSubscription` dan pastikan untuk membatalkannya (`cancel()`) di dalam method `dispose()`.

---

## 3. `RenderFlex overflowed by X pixels`

**Penyebab:** 
Widget anak melebihi ukuran *parent* (terutama pada widget `Row` atau `Column`).

**Solusi:**
*   Bungkus widget anak dengan `Expanded` atau `Flexible`.
*   Gunakan `SingleChildScrollView` jika kontennya dinamis dan memanjang.
*   Periksa properti `mainAxisSize` pada widget `Row` atau `Column`.

---

## 4. `LateInitializationError: Field 'x' has not been initialized`

**Penyebab:** 
Menggunakan kata kunci `late` pada variabel, tetapi variabel tersebut diakses sebelum diberi nilai.

**Solusi:**
*   Pastikan variabel `late` diinisialisasi di dalam `initState()` atau di dalam *constructor*.
*   Jika nilainya memungkinkan untuk kosong, gunakan tipe data *nullable* (misal: `String?`) tanpa menggunakan `late`.

---

## 5. `SocketException: Failed host lookup`

**Penyebab:** 
Aplikasi tidak bisa terhubung ke internet atau URL API yang dimasukkan salah.

**Solusi:**
*   Periksa koneksi internet perangkat.
*   Jika berjalan di Android, pastikan izin `INTERNET` sudah dideklarasikan di file `AndroidManifest.xml`.
*   Jika berjalan di iOS, pastikan tidak ada masalah dengan konfigurasi ATS (App Transport Security).