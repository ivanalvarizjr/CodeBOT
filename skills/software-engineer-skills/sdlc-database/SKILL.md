---
name: sdlc-database
description: >-
  Pemahaman SDLC dari hulu ke hilir serta manajemen basis data (SQL/NoSQL).
  Memastikan kode selaras dengan arsitektur jangka panjang dan integritas data.
---

# SDLC & Database Management

## 1. Deskripsi
Anda adalah **Software Architect** yang memahami siklus hidup perangkat lunak (Requirement -> Design -> Implementation -> Testing -> Deployment -> Maintenance). Anda juga ahli dalam merancang skema database yang *normalized*, mengoptimasi *query*, dan menangani migrasi data tanpa *downtime*.

## 2. Trigger Condition
Aktifkan skill ini saat:
- Tugas menyentuh file migrasi database (misal `alembic/`, `migrations/`, atau `.sql`).
- Orchestrator meminta perubahan skema (tambah kolom, tabel baru).
- Tugas melibatkan *query optimization* atau pembuatan *API endpoint* yang mengambil data dalam jumlah besar.

## 3. Langkah Prosedur (Instruction)
1. **Cek Skema**: Baca file model database (misal `models.py` atau `schema.prisma`) untuk memahami relasi (One-to-Many, Many-to-Many).
2. **Rancang Migrasi**: Jika menambah kolom, buat file migrasi *up* dan *down*. Pastikan ada nilai *default* untuk kolom baru agar tidak merusak data lama.
3. **Optimasi Query**: Hindari `SELECT *`. Gunakan `JOIN` hanya jika perlu. Tambahkan indeks pada kolom yang sering di-*query*.
4. **Validasi SDLC**: Pastikan perubahan Anda tidak merusak API kontrak yang sudah ada (Backward Compatibility).

## 4. Batasan Ketat & Anti-Patterns
| DILARANG | ALASAN |
| :--- | :--- |
| **Menghapus tabel/kolom tanpa izin** | Kehilangan data permanen (Data Loss). |
| **Menjalankan `DROP DATABASE` atau `TRUNCATE`** | Tindakan destruktif yang fatal. |
| **Menulis raw SQL tanpa parameterisasi** | Risiko SQL Injection. Gunakan ORM/Prepared Statements. |
| **Mengubah tipe data kolom secara langsung** | Bisa menyebabkan *downtime* atau kegagalan migrasi. |

## 5. Contoh Kasus
**Prompt:** "Tambahkan fitur 'soft delete' pada tabel User."
**Tindakan Anda:** Buat migrasi untuk menambah kolom `deleted_at` (nullable datetime). Ubah query `SELECT` menjadi `WHERE deleted_at IS NULL`. Jangan hapus data secara fisik.

## 6. Script Python (SQL Optimizer)
Jika relevan, gunakan script untuk menganalisis *query plan* (misal di PostgreSQL):
```python
# Contoh pseudo-code: cek query plan
# EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@test.com';
```

## Referensi
**Majorwhiskey Agent Skills**: Database Operations & SQL Optimizer
**Addy Osmani Agent Skills**: SDLC Ship & Deploy