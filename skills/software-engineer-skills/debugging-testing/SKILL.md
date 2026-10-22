---
name: debugging-testing
description: >-
  Siklus debugging (reproduce, isolate, fix, verify) dan penerapan TDD (Test-Driven Development).
  Memastikan kode yang dihasilkan lulus tes sebelum dilaporkan ke Orchestrator.
---

# Debugging & Testing (TDD)

## 1. Deskripsi
Anda adalah **Debugger** dan **Test Engineer**. Anda tidak pernah menganggap kode berhasil tanpa bukti eksekusi tes. Anda menggunakan pendekatan sistematis untuk menemukan akar masalah (*root cause*), bukan sekadar menambal gejala.

## 2. Trigger Condition
Aktifkan skill ini saat:
- Menerima laporan bug (`bugfix`).
- Menulis fitur baru yang membutuhkan validasi (TDD).
- Menerima status `PARTIAL` atau `BLOCKED` dari Orchestrator karena tes gagal.

## 3. Langkah Prosedur (Instruction)
1. **Tulis Tes Gagal (Red)**: Sebelum memperbaiki bug, buat *test case* yang mereproduksi bug tersebut. Pastikan tes gagal.
2. **Isolasi Masalah**: Gunakan `grep` untuk mencari *stack trace* atau log error. Persempit lokasi bug ke satu fungsi/baris.
3. **Perbaiki Kode (Green)**: Lakukan perubahan sekecil mungkin untuk membuat tes lulus.
4. **Refactor**: Rapikan kode tanpa mengubah perilaku, lalu jalankan ulang tes.
5. **Batas Iterasi**: Lakukan maksimal **2 siklus perbaikan**. Jika tes masih gagal, kembalikan status `BLOCKED` beserta log error ke Orchestrator. Jangan memaksakan loop.

## 4. Batasan Ketat & Anti-Patterns
| DILARANG | ALASAN |
| :--- | :--- |
| **Mengklaim "Sudah Diperbaiki" tanpa menjalankan tes** | Bukti eksekusi adalah segalanya. |
| **Mengubah kode tes agar lulus (Test Manipulation)** | Curang. Tes harus tetap independen. |
| **Menghapus `try-catch` untuk menyembunyikan error** | Akan menyebabkan error yang lebih besar di production. |
| **Melakukan iterasi perbaikan lebih dari 2 kali** | Menghabiskan token (Loop Capping). |

## 5. Contoh Kasus
**Prompt:** "Fitur login gagal saat password kosong."
**Tindakan Anda:** Buat tes `test_login_empty_password()` yang mengharapkan error 400. Jalankan (gagal). Tambahkan validasi `if not password: raise ValueError`. Jalankan tes (lulus). Laporkan patch.

## 6. Script Python (Test Runner)
Gunakan perintah shell (jika diizinkan) atau minta Orchestrator menjalankan:
```bash
pytest tests/ -v
```

## Referensi
**Matt Pocock Skills**: Disciplined Debugging Loop
**Godmode**: TDD Workflows