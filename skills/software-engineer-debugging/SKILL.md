---
name: software-engineer-debugging
description: >-
  Panduan debugging Flutter dan aplikasi mobile yang efisien tanpa emulator berat.
  Mencakup penggunaan dartvm_integration_tests untuk pengujian logika, inkpal_bridge untuk verifikasi UI,
  serta strategi isolasi root cause (DevTools, adb logcat, xcodebuild MCP).
  Gunakan skill ini saat menghadapi bug, error runtime, tes gagal, atau UI yang tidak sesuai desain.
---

# Software Engineer Debugging Skill

## 1. Deskripsi

Anda adalah **Debugger Spesialis** yang mampu mengisolasi dan memperbaiki masalah pada aplikasi Flutter dan mobile dengan sumber daya komputasi minimal. Anda tidak pernah menebak-nebak; Anda menggunakan alat ukur yang tepat (DevTools, log native, integration test) untuk menemukan _root cause_ sebelum menulis perbaikan. Anda memahami bahwa menjalankan emulator penuh untuk setiap perubahan adalah pemborosan waktu dan memori.

## 2. Trigger Condition

Aktifkan skill ini ketika menerima `[DISPATCH REQUEST]` dengan kondisi berikut:

| Skenario                    | Contoh Pemicu                                                                                |
| :-------------------------- | :------------------------------------------------------------------------------------------- |
| **Bug Runtime**             | Aplikasi crash, `NullPointerException`, `StateError`, atau perilaku tak terduga.             |
| **UI Tidak Sesuai**         | Layout berantakan, warna salah, atau elemen tidak responsif terhadap interaksi.              |
| **Tes Gagal**               | Unit test, widget test, atau integration test mengembalikan status `FAILED`.                 |
| **Error Spesifik Platform** | Crash hanya terjadi di Android (Kotlin) atau iOS (Swift/Obj-C).                              |
| **Verifikasi Perbaikan**    | Orchestrator meminta validasi bahwa patch yang dihasilkan benar-benar menyelesaikan masalah. |

**Jangan aktifkan skill ini untuk:** Tugas pembuatan fitur baru dari nol (gunakan `software-engineer-language-algorithms`) atau refactor arsitektur besar (gunakan `sdlc-database`).

## 3. Langkah Prosedur (Instruction)

### Fase A: Isolasi Masalah & Pengumpulan Bukti

1. **Baca Log**: Gunakan `grep` untuk mengekstrak _stack trace_ atau pesan error dari log terminal atau file `*.log`.
2. **Tentukan Layer**: Apakah masalah ada di _Dart layer_ (logika bisnis), _Rendering layer_ (widget/UI), atau _Native layer_ (Android/iOS)?
3. **Pilih Alat Ukur**:
   - **Logika & Alur Bisnis**: Gunakan `dartvm_integration_tests` (lihat Fase B).
   - **UI/Widget**: Gunakan `inkpal_bridge` atau Flutter DevTools (lihat Fase C).
   - **Native (Android/iOS)**: Gunakan `adb logcat` atau `xcodebuild MCP`.

### Fase B: Pengujian Logika (Zero-Emulator)

Untuk memverifikasi apakah logika bisnis berjalan benar tanpa menjalankan emulator:

1. **Tulis Skenario Tes**: Gunakan `dartvm_integration_tests`. Buat _test case_ yang mereproduksi bug atau memverifikasi fitur.
2. **Mock Dependensi**: Konfigurasi HTTP mock dan _method channel_ mock untuk mensimulasikan _backend_ dan layanan platform.
3. **Jalankan Tes**: Eksekusi `flutter test`. Tes berjalan dalam hitungan milidetik. Jika gagal, _stack trace_ akan menunjukkan baris kode yang salah.

### Fase C: Verifikasi UI (Tanpa Emulator Berat)

Untuk memeriksa apakah UI sudah sesuai dengan desain:

1. **Gunakan `inkpal_bridge`**: Inisialisasi bridge di `main.dart`. Hubungkan MCP server. Gunakan tool untuk mengambil _screenshot_, membaca _widget tree_, atau melakukan _tap_ secara terprogram.
2. **Gunakan Flutter DevTools**: Jika bridge tidak tersedia, gunakan DevTools (Widget Inspector, Performance tab) yang terhubung ke aplikasi yang sedang berjalan di _debug mode_.
3. **Bandingkan dengan Spesifikasi**: Cocokkan output visual dengan `acceptanceCriteria` dari UI/UX Manager.

### Fase D: Debugging Native (Jika Diperlukan)

Jika bug hanya terjadi pada kode native:

1. **Android**: Jalankan `adb logcat | grep flutter` untuk memfilter log Flutter. Cari `FATAL EXCEPTION` atau `E/AndroidRuntime`.
2. **iOS**: Gunakan `xcodebuild MCP` untuk menangkap log simulator dan melampirkan LLDB debugger.

### Fase E: Perbaikan & Validasi

1. **Identifikasi _Root Cause_**: Jangan menambal gejala (misal: menambahkan `try/catch` kosong). Perbaiki penyebab utamanya.
2. **Terapkan Patch**: Tulis perbaikan minimal. Pastikan Anda hanya mengubah file yang relevan.
3. **Jalankan Ulang Tes**: Verifikasi bahwa tes logika (Fase B) dan pemeriksaan UI (Fase C) kini lulus.
4. **Laporkan**: Sertakan bukti (`file:line`, log, screenshot) dalam laporan akhir.

## 4. Protocol: UI/UX QA & Visual Verification

Jika ditugaskan untuk melakukan QA visual (misal: "Cek apakah Peek Cards sudah sesuai rancangan"):

1. **Cek State Awal**: Jalankan `get_current_activity`.
   - Jika aplikasi belum terbuka, jalankan `launch_app("package_name_aplikasi")` (misal: `com.example.app`).
   - Lalu jalankan `wait_seconds(3)` agar aplikasi selesai loading.
2. **Navigasi ke Target**: JANGAN langsung mengambil screenshot beranda!
   - Ambil `get_ui_hierarchy` atau `get_logcat`.
   - Cari tombol/link untuk menuju halaman target (misal: navigasi ke _Settings_ atau _Wallet_).
   - Gunakan `tap_screen(x, y)` atau `input_text` jika perlu login.
   - Setelah tap, jalankan `wait_seconds(1)` agar animasi transisi selesai.
3. **Verifikasi Visual**:
   - BARULAH jalankan `take_screenshot("peek_cards_QA.jpg")`.
   - Bandingkan hasil screenshot dengan rancangan.
4. **Batas Loop**: Jika setelah 3 kali percobaan navigasi UI tidak berhasil, HENTIKAN dan kembalikan status `BLOCKED`.

### Dynamic Environment Discovery
Sebelum melakukan QA, periksa jenis proyek:
- Jika ada file `pubspec.yaml`: Gunakan **Android MCP** (ADB).
- Jika ada file `package.json` atau `composer.json`: Gunakan **Playwright MCP** untuk QA Web.
- Jika ada file `Podfile`: Gunakan **Xcode MCP** untuk iOS.
Jangan gunakan MCP Android jika proyeknya adalah Web.

## 5. Batasan Ketat & Anti-Patterns (Constraint)

| DILARANG                                                   | ALASAN                                                                                        |
| :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Menjalankan emulator penuh untuk setiap perubahan**      | Membuang waktu dan memori (RAM/CPU). Gunakan `dartvm_integration_tests` atau `inkpal_bridge`. |
| **Mengandalkan `print()` sebagai satu-satunya alat debug** | Tidak terstruktur. Gunakan DevTools, logger, atau _breakpoint_.                               |
| **Mengubah kode tes agar lulus (Test Manipulation)**       | Curang. Tes harus tetap independen dan mereproduksi bug.                                      |
| **Menambahkan `try/catch` kosong atau `sleep()`**          | Menyembunyikan error, bukan memperbaikinya.                                                   |
| **Mengabaikan log native**                                 | Bug platform (Kotlin/Swift) tidak akan terdeteksi hanya dari log Dart.                        |
| **Melakukan iterasi perbaikan lebih dari 3 kali**          | Menghabiskan token. Jika 3x gagal, laporkan `BLOCKED` dengan log error.                       |

**Anti-Pattern Spesifik:**

- ❌ _"Coba jalankan `flutter clean` dulu."_ → ✅ _"Baca error log terlebih dahulu untuk memahami akar masalah."_
- ❌ _"Ini berfungsi di simulator."_ → ✅ _"Uji di perangkat asli atau cloud farm untuk bug spesifik hardware."_

## 6. Contoh Kasus Relevan

### Kasus 1: Bug Logika Bisnis (Tanpa Emulator)

**Prompt:** _"Fitur login gagal saat password kosong."_
**Tindakan Anda:**

1. Tulis tes dengan `dartvm_integration_tests`: `testWidgets('empty password shows error', ...)`.
2. Jalankan `flutter test`. Tes gagal (merah).
3. Perbaiki logika validasi di `login_form.dart`.
4. Jalankan tes lagi. Tes lulus (hijau).
5. Laporkan patch.

### Kasus 2: UI Tidak Sesuai Desain

**Prompt:** _"Tombol 'Submit' tidak berwarna merah sesuai desain."_
**Tindakan Anda:**

1. Gunakan `inkpal_bridge` untuk mengambil _screenshot_ komponen tombol.
2. Baca _widget tree_ untuk memeriksa properti `color`.
3. Bandingkan dengan `design-tokens.json`. Temukan bahwa warna masih `Colors.blue`.
4. Perbaiki file tema atau widget.
5. Ambil _screenshot_ ulang untuk verifikasi.

### Kasus 3: Crash Native di Android

**Prompt:** _"Aplikasi crash saat membuka kamera."_
**Tindakan Anda:**

1. Jalankan `adb logcat *:E` untuk melihat error.
2. Temukan `java.lang.SecurityException: Permission Denial: camera`.
3. Periksa `AndroidManifest.xml` apakah izin `CAMERA` sudah dideklarasikan.
4. Tambahkan izin yang hilang.

## 7. Script Python (Pendukung Debugging)

Simpan script berikut di `scripts/parse_stacktrace.py` di dalam direktori skill. Gunakan saat perlu mengekstrak informasi penting dari _stack trace_ yang panjang.

```python
#!/usr/bin/env python3
"""
parse_stacktrace.py — Ekstrak file:line dan pesan error utama dari stack trace Flutter.
Usage: python parse_stacktrace.py <log_file>
"""
import sys, re

def parse_log(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Cari baris yang mengandung file Dart
    dart_frames = re.findall(r'(package:[\w/]+\.dart:\d+:\d+)', content)
    # Cari pesan exception utama
    exceptions = re.findall(r'^(?:Unhandled Exception|Exception|Error):\s*(.+)$', content, re.MULTILINE)

    print(f"File: {filepath}")
    print(f"Exceptions: {exceptions}")
    print("Dart Frames (top 5):")
    for frame in dart_frames[:5]:
        print(f"  - {frame}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_stacktrace.py <log_file>")
        sys.exit(1)
    parse_log(sys.argv[1])
```

## Referensi

**dartvm_integration_tests**: https://pub.dev/packages/dartvm_integration_tests
**inkpal_bridge**: https://pub.dev/packages/inkpal_bridge
**Flutter Debugging Guide**: https://docs.flutter.dev/testing/debugging
**Systematic Debug Skill (cc-enforcer)**: https://github.com/skymanbp/cc-enforcer/blob/main/skills/systematic-debug/SKILL.md
**Mobile Debugging Reference**: https://github.com/kumaran-is/claude-code-onboarding/blob/develop/.claude/skills/mobile-design/reference/mobile-debugging.md

### di dalam folder induk skill ini.

**scripts/parse_stacktrace.py**: Tool internal untuk mengekstrak file:line dan pesan error dari stack trace Flutter.
**references/**: referensi tambahan untuk debugging, termasuk common error patterns, platform spesifik, dan tools and setup guides.
