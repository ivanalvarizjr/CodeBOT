# Tools and Setup for Efficient Debugging

Panduan konfigurasi alat debugging untuk meminimalkan penggunaan resource (RAM/CPU) tanpa harus menyalakan emulator penuh.

## 1. dartvm_integration_tests (Zero-Emulator Testing)

Alat ini menjalankan integration test langsung di Dart VM. Sangat cepat dan tidak memerlukan perangkat fisik.

**Konfigurasi di `pubspec.yaml`:**
```yaml
dev_dependencies:
  dartvm_integration_tests: ^0.0.1
```

### Langkah Penggunaan:
1. Buat file test di `integration_test/app_test.dart`.
2. Inisialisasi `IntegrationTest` dan konfigurasi mock (HTTP, SharedPreferences) agar tidak bergantung pada native platform.
3. Jalankan perintah: 
   ```bash
   flutter test integration_test/app_test.dart
   ```

### Kelebihan dan Kekurangan:
*   **Kelebihan:** Eksekusi kurang dari 5 detik. Tidak memakan RAM emulator.
*   **Kekurangan:** Tidak bisa menguji native code (Kamera, GPS, Bluetooth).

---

## 2. inkpal_bridge (UI Verification)

Alat ini menjembatani aplikasi Flutter yang sedang berjalan (di mode debug) dengan agen AI melalui MCP (Model Context Protocol). Memungkinkan agen untuk "melihat" UI dan melakukan interaksi.

**Konfigurasi di `pubspec.yaml`:**
```yaml
dependencies:
  inkpal_bridge: ^4.0.0
```

**Inisialisasi di `main.dart`:**
```dart
import 'package:inkpal_bridge/inkpal_bridge.dart';

void main() => inkpalRunApp(const MyApp());
```

### Menghubungkan ke Agen (MCP):
Jalankan perintah ini di terminal terpisah:
```bash
npx inkpal start
```
Ikuti instruksi untuk menambahkan konfigurasi ke editor Anda (VS Code / Cursor). Setelah terhubung, agen dapat mengeksekusi tool seperti `take_screenshot`, `tap_widget`, atau `read_widget_tree`.

---

## 3. Flutter DevTools

Jika `inkpal_bridge` tidak tersedia, gunakan DevTools standar yang terintegrasi dengan Flutter.

*   **Widget Inspector**: Untuk melihat *layout tree* dan properti widget.
*   **Performance View**: Untuk mendeteksi *jank* atau *memory leak*.
*   **Network View**: Untuk memantau request HTTP.

**Cara Mengakses:** 
Jalankan `flutter run`, lalu tekan `v` di terminal atau buka URL yang tertera di log.