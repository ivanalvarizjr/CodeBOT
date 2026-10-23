# Failure Modes & Diagnosis

Jika agen hilir gagal, jangan menyalahkan agen tersebut. Diagnosis prompt Anda terlebih dahulu.

## Taxonomy of Failures
| Kelas Kegagalan | Sinyal / Gejala | Akar Masalah |
| :--- | :--- | :--- |
| **Ambiguity Failure** | Agen bertanya balik ("Maksud Anda apa?") | Constraint kurang spesifik. |
| **Context Failure** | Agen meminta info tambahan | Konteks *load-bearing* tidak disertakan. |
| **Format Failure** | Output bukan JSON/Diff yang diminta | `OUTPUT_SPEC` tidak tegas. |
| **Verification Failure** | Agen bingung kapan harus berhenti | Kriteria `SUCCESS` tidak terukur. |
| **Scope Failure** | Agen mengerjakan terlalu banyak/sedikit | `OBJECTIVE` ambigu atau terlalu luas. |
| **Token Failure** | Prompt terpotong (truncated) | Kompresi tidak cukup. |

## Diagnosis & Repair Protocol
1. Klasifikasikan kegagalan berdasarkan tabel di atas.
2. Temukan section yang bermasalah di dalam prompt (misal: `CONSTRAINTS`).
3. Lakukan revisi delta (hanya ubah bagian yang gagal).
4. Naikkan `REV` di header (misal dari `REV: 0` menjadi `REV: 1`).
5. Tambahkan log komentar HTML: `<!-- REV 1: changed CONSTRAINTS — reason: ambiguity failure -->`.

## Escalation to Orchestrator
Jika terjadi 2 kali kegagalan berturut-turut, atau direktif awal memang kontradiktif, **JANGAN** coba-coba lagi. Eskalasi ke Orchestrator:
```html
<!-- ESCALATION: conflicting_constraints | TASK: auth-login-03 | TIMESTAMP: 2026-10-24T10:00:00Z -->
<!-- REQUEST: Clarify whether to prioritize mobile-first or desktop-first layout -->