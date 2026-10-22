---
name: workspace-mapping
description: >-
  Memetakan struktur folder, dependensi file, dan alur eksekusi sebelum menulis kode.
  Mencegah penulisan kode ke path yang salah atau melanggar arsitektur modular.
---

# Workspace Mapping & Path Tracing

## 1. Deskripsi
Anda adalah **Path Tracer** yang memastikan setiap baris kode yang ditulis ditempatkan pada file dan folder yang tepat. Anda memetakan dependensi (import/require) dan memahami alur data dari *entry point* hingga *output*.

## 2. Trigger Condition
Aktifkan skill ini saat:
- Menerima tugas mutasi (`isMutative: true`) dengan `targetPaths` yang kompleks (lebih dari 3 file).
- Harus membuat file baru dan perlu memahami di mana file tersebut harus diletakkan agar sesuai dengan arsitektur (misal: `src/components/`, `src/services/`).
- Perlu memetakan dependensi sebelum melakukan *refactor*.

## 3. Langkah Prosedur (Instruction)
1. **Gunakan Script Deterministik**: Jalankan script `trace_deps.py` (lihat bagian 6) menggunakan shell (jika diizinkan) untuk mendapatkan *adjacency list* dependensi.
2. **Validasi Path**: Pastikan folder tujuan sudah ada atau bisa dibuat. Jangan pernah menebak path absolut; gunakan path relatif dari workspace root.
3. **Identifikasi *Entry Point***: Temukan file utama (misal `main.py`, `index.js`) dan lacak hingga ke file yang akan Anda ubah.
4. **Buat Peta Modular**: Jika diminta membuat UI, pastikan Anda memecah file menjadi unit modular (misal `Header.jsx`, `styles.css`) sebelum menulis kode monolitik.

## 4. Batasan Ketat & Anti-Patterns
| DILARANG | ALASAN |
| :--- | :--- |
| **Menebak path** | Harus berdasarkan `search` atau `read` yang valid. |
| **Membuat file monolitik raksasa** | Melanggar aturan *Token Efficiency* dan *Modularitas*. |
| **Mengabaikan dependensi** | Mengubah file tanpa mengecek import di file lain akan menyebabkan *runtime error*. |

## 5. Contoh Kasus
**Prompt:** "Buatkan komponen `UserProfile` di React."
**Tindakan Anda:** Cari folder `src/components/`. Jika tidak ada, buat folder tersebut. Buat file `UserProfile.jsx` dan `UserProfile.css` terpisah, jangan gabungkan CSS ke dalam file JSX.

## 6. Script Python (Path Tracer)
Simpan sebagai `trace_deps.py` di direktori skill, pada tempat skill ini diletakkan dengan nama folder `scripts`. Jalankan via shell untuk memetakan dependensi.
```python
import ast, os, json, sys

def extract_imports(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=filepath)
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module.split(".")[0])
    return imports

def build_graph(root):
    graph = {}
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith(".py"):
                fp = os.path.join(dirpath, fn)
                graph[os.path.relpath(fp, root)] = list(extract_imports(fp))
    return graph

if __name__ == "__main__":
    print(json.dumps(build_graph(sys.argv[1] if len(sys.argv) > 1 else "."), indent=2))
```

## Referensi
**Awesome Copilot**: Codebase Documentation Skill (Pemetaan arsitektur)
**Addy Osmani Agent Skills**: SDLC Discovery Phase