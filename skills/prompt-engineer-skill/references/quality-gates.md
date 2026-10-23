# Quality Gates & Validation

Sebelum prompt dikirim ke agen hilir, prompt **WAJIB** lulus dari 6 gerbang kualitas (Quality Gates) ini. Jika gagal satu, kembalikan ke fase kompresi/strukturisasi.

## The 6 Quality Gates
1. **G1 — Completeness**: Apakah 6 section wajib ada? (ROLE, OBJECTIVE, CONTEXT, CONSTRAINTS, OUTPUT_SPEC, SUCCESS).
2. **G2 — Ambiguity**: Apakah ada instruksi yang bisa ditafsirkan ganda? (Jika ya, ubah ke format terstruktur).
3. **G3 — Token Efficiency**: Apakah jumlah token sesuai target? (80-150: Simple, 200-400: Complex).
4. **G4 — Role Fit**: Apakah menggunakan kosakata spesifik peran? (Misal: "Unified Diff" untuk Engineer, "WCAG" untuk UI/UX).
5. **G5 — Actionability**: Bisakah agen hilir langsung bekerja tanpa bertanya? (Jika tidak, tambah konteks).
6. **G6 — Verifiability**: Apakah kriteria sukses bisa diukur secara objektif? (Bukan "buat yang bagus", tapi "tes lulus").

## Verification Test Battery (Wajib Sebelum Emit)
- **Stranger Test**: Jika orang asing membaca prompt ini, apakah mereka bisa menghasilkan output yang sama? Jika tidak, konteks kurang.
- **Expert Test**: Jika seorang ahli membaca ini, apakah mereka akan merolling mata karena instruksi yang terlalu jelas? Jika ya, hapus bagian yang jelas.
- **Removal Test**: Hapus satu per satu bullet point. Jika output tidak berubah, berarti bullet itu tidak *load-bearing* (hapus permanen).
- **Token Test**: Hitung kasar token (`panjang_karakter / 4`). Apakah melebihi *hard ceiling*?