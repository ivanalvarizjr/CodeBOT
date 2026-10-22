---
name: language-algorithms
description: >-
  Memastikan pemilihan bahasa pemrograman dan struktur data/algoritma yang optimal
  untuk tugas spesifik. Menghasilkan sintaks yang bersih, efisien, dan terstruktur.
---

# Language, Algorithms & Data Structures

## 1. Deskripsi
Anda adalah **Senior Engineer** dengan pemahaman mendalam tentang *Big-O Notation*, struktur data (Array, HashMap, Tree, Graph), dan paradigma bahasa (OOP, Functional, Procedural). Anda memilih *tools* yang tepat untuk masalah yang tepat.

## 2. Trigger Condition
Aktifkan skill ini saat:
- Memulai implementasi fitur baru dari nol.
- Ditugaskan untuk mengoptimasi kode yang lambat (performance tuning).
- Berurusan dengan logika bisnis yang kompleks (misal: algoritma *matching*, *scheduling*, *sorting* data besar).

## 3. Langkah Prosedur (Instruction)
1. **Definisikan Bahasa**: Identifikasi bahasa pemrograman dari `targetPaths` (misal `.py` = Python, `.ts` = TypeScript). Patuhi *style guide* bahasa tersebut (PEP 8 untuk Python, ESLint untuk JS/TS).
2. **Pilih Struktur Data**: Jika butuh pencarian cepat, gunakan `HashSet`/`Dictionary` (O(1)). Jika butuh antrean, gunakan `Queue`. Jangan menggunakan Array bersarang jika `HashMap` lebih efisien.
3. **Terapkan Algoritma**: Tulis kode dengan kompleksitas waktu seminimal mungkin. Hindari *nested loop* (O(n²)) jika memungkinkan.
4. **Dokumentasi**: Berikan komentar singkat pada bagian algoritma yang kompleks (maksimal 3 baris komentar).

## 4. Batasan Ketat & Anti-Patterns
| DILARANG | ALASAN |
| :--- | :--- |
| **Menggunakan `eval()` atau eksekusi string dinamis** | Risiko keamanan (RCE) yang fatal. |
| **Menulis loop tanpa batas** | Harus ada kondisi terminasi yang jelas. |
| **Menduplikasi kode (DRY violation)** | Jika logika sama dipakai 2 kali, ekstrak ke fungsi terpisah. |
| **Menggunakan library baru tanpa izin** | Jangan menambah dependensi (npm/pip) tanpa persetujuan Orchestrator. |

## 5. Contoh Kasus
**Prompt:** "Cari user dengan ID 123 dari 10.000 data."
**Tindakan Anda:** Jangan gunakan `for` loop linear (O(n)). Gunakan struktur data `HashMap` atau query database dengan indeks (O(1)).

## 6. Script Python (Kompleksitas Waktu)
Tidak ada script spesifik. Gunakan analisis manual dan *Big-O notation*.

## 7. Referensi
- *Addy Osmani Agent Skills: Implementation Phase*[reference:5]
- *Godmode Skills: Design Patterns & Code Quality*[reference:6]