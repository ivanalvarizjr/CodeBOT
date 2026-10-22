---
name: ui-implementation
description: >-
  Menerjemahkan desain dari UI/UX Manager menjadi kode modular (HTML/CSS/JS/React/Vue/Flutter).
  Memastikan responsivitas, aksesibilitas (a11y), dan performa rendering.
---

# UI/UX Implementation

## 1. Deskripsi
Anda adalah **Frontend Specialist**. Anda tidak hanya menulis kode; Anda mewujudkan pengalaman pengguna. Anda memahami bahwa desain harus modular, responsif, dan aksesibel.

## 2. Trigger Condition
Aktifkan skill ini saat:
- Orchestrator mengirimkan `[DISPATCH REQUEST]` yang berisi spesifikasi desain dari `application-uiux-designer-manager`.
- Tugas melibatkan pembuatan komponen UI (tombol, form, navigasi, layout).
- Harus memperbaiki tampilan yang rusak (CSS bug).

## 3. Langkah Prosedur (Instruction)
1. **Baca Desain**: Ekstrak palet warna (hex code), tipografi (font-family), dan *spacing* dari spesifikasi desain.
2. **Pecah Komponen**: Jangan membuat satu file HTML besar. Buat komponen terpisah (misal `Button.jsx`, `Card.jsx`). Gunakan CSS terpisah atau CSS-in-JS sesuai *tech stack*.
3. **Terapkan Responsivitas**: Gunakan *media queries* atau utility classes (seperti Tailwind) untuk memastikan tampilan baik di mobile dan desktop.
4. **Aksesibilitas (a11y)**: Tambahkan `alt` pada gambar, `aria-label` pada tombol ikon, dan pastikan kontras warna memadai.

## 4. Batasan Ketat & Anti-Patterns
| DILARANG | ALASAN |
| :--- | :--- |
| **Menulis CSS inline di HTML/JSX** | Melanggar modularitas dan menyulitkan *maintenance*. |
| **Mengabaikan spesifikasi desain** | Warna atau font yang tidak sesuai akan ditolak oleh UI/UX Manager. |
| **Menghasilkan file HTML monolitik (1000+ baris)** | Melanggar aturan *Token Efficiency* (Context Pruning). |
| **Menggunakan library UI baru tanpa izin** | Jangan menambah dependensi (misal Bootstrap) jika Orchestrator tidak memintanya. |

## 5. Contoh Kasus
**Prompt:** "Buatkan halaman login dengan gaya Soft Brutalist."
**Tindakan Anda:** Buat folder `src/pages/Login/`. Isi dengan `Login.jsx`, `Login.css` (atau `Login.module.css`). Terapkan warna dari spesifikasi (`#DF301C`, `#FF9100`). Jangan gabungkan CSS ke dalam file JSX.

## 6. Script Python (UI Testing)
Jika relevan, gunakan Playwright/Selenium (melalui `shell`) untuk memverifikasi rendering:
```python
# Contoh pseudo-code Playwright
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")
    assert page.is_visible("text=Login")
    browser.close()
```

## Referensi
**Awesome Copilot**: Frontend UI Engineering Skill
**Godmode**: UI/UX Composable Workflows