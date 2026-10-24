# Platform-Specific Debugging

Panduan untuk menangani error yang hanya muncul pada *layer native* (Android/iOS) yang tidak terdeteksi di Dart layer.

## 1. Android (Kotlin/Java)

Jika terjadi crash yang berasal dari *plugin* atau kode native Android.

**Alat:** `adb` (Android Debug Bridge).

**Perintah:**
```bash
# Filter log hanya untuk tag Flutter dan error Android
adb logcat -s flutter:V AndroidRuntime:E *:S

# Atau cari error spesifik
adb logcat *:E | grep -i "exception\|fatal"
```

**Tips Debugging:**
*   Cari `FATAL EXCEPTION: main` di dalam log.
*   Lihat baris `Caused by: ...` untuk menemukan *root cause* sebenarnya (bukan hanya *top-level exception*).
*   Jika menggunakan *plugin* kustom, pastikan `minSdkVersion` di `build.gradle` sesuai dengan kebutuhan *plugin*.

---

## 2. iOS (Swift/Objective-C)

Jika terjadi crash pada simulator atau perangkat iOS.

**Alat:** `xcodebuild`, Xcode Console, atau LLDB.

**Perintah:**
```bash
# Jika menggunakan xcodebuild MCP atau terminal
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Runner"' --level debug
```

**Tips Debugging:**
*   Buka Xcode, jalankan aplikasi di Simulator, dan lihat panel **Debug Area** di bagian bawah.
*   Cari `Thread 0 Crashed` atau `EXC_BAD_ACCESS` (biasanya karena *memory management* yang buruk di Swift/Obj-C).
*   Jika menggunakan *plugin* kustom, jalankan `pod install` ulang di folder `ios/`.

---

## 3. Mapping Native Crash ke Dart

Terkadang error native hanya menampilkan nama kelas Java/Swift. Anda harus mencari nama *method channel* yang relevan di kode Dart.

*   **Contoh:** Terjadi error `PlatformException` di Dart. Cari nama channel (misal: `my_app/camera`) di kode native untuk melihat pesan error aslinya.