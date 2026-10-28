# Emulator MCP Server

MCP (Model Context Protocol) server lokal untuk mengontrol **Android Emulator** langsung dari **GitHub Copilot** (Agent Mode). Memungkinkan agen AI untuk melihat daftar AVD yang tersedia dan menjalankan emulator tertentu (misalnya `Pixel_4a`) sebagai bagian dari alur debugging aplikasi.

## ✨ Fitur

- 📋 **`list_avds`** — Menampilkan daftar Android Virtual Device (AVD) yang tersedia.
- 🚀 **`start_emulator`** — Menjalankan emulator berdasarkan nama AVD (default: `Pixel_4a`).

## 📋 Prasyarat

Pastikan semua sudah terpasang dan terkonfigurasi sebelum memulai:

| Kebutuhan | Versi Minimal | Cara Cek |
|---|---|---|
| **Python** | 3.10+ | `python --version` |
| **Android SDK** | — | `emulator -version` |
| **Emulator di PATH** | — | `emulator -list-avds` (harus tampil daftar AVD) |
| **AVD `Pixel_4a`** | — | Sudah dibuat via Android Studio Device Manager |
| **GitHub Copilot** | Versi terbaru | Terpasang di VS Code |

> ⚠️ Jika `emulator -list-avds` masih error "not recognized", tambahkan `%LOCALAPPDATA%\Android\Sdk\emulator` ke PATH Windows terlebih dahulu.

## 📁 Struktur Proyek
emulator-mcp/
├── venv/ # Virtual environment Python (tidak di-commit)
├── server.py # Kode utama MCP server
├── requirements.txt # Dependensi Python
├── .gitignore # File yang diabaikan Git
└── README.md # Dokumentasi ini

text

## 🚀 Instalasi

### 1. Clone atau buat folder proyek

```powershell
cd C:\Users\%USERPROFILE%\mcp-local
mkdir emulator-mcp
cd emulator-mcp
```

## 2. Buat virtual environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
Jika muncul error eksekusi PowerShell, jalankan dulu:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
## 3. Instal dependensi
```powershell
pip install -r requirements.txt
```
Atau langsung:
```powershell
pip install mcp
```
## 4. Verifikasi instalasi
```powershell
python -c "import mcp; print('MCP terinstal:', mcp.__version__)"
```
### ⚙️ Konfigurasi di GitHub Copilot
Ada dua cara mendaftarkan server MCP ke GitHub Copilot di VS Code.

### Opsi A: Konfigurasi per Proyek (.vscode/mcp.json)
Buat file .vscode/mcp.json di root proyek aplikasi yang akan Anda debug (bukan di folder emulator-mcp):

```json
{
  "servers": {
    "emulator-control": {
      "type": "stdio",
      "command": "C:\\Users\\%USERPROFILE%\\mcp-local\\emulator-mcp\\venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\%USERPROFILE%\\mcp-local\\emulator-mcp\\server.py"]
    }
  }
}
```
### Opsi B: Konfigurasi Global (berlaku semua proyek)
Tekan Ctrl+Shift+P → cari MCP: Add Server

Pilih Command (stdio)

Isi field berikut:

Field	Nilai
Command	C:\Users\%USERPROFILE%\mcp-local\emulator-mcp\venv\Scripts\python.exe
Args	C:\Users\%USERPROFILE%\mcp-local\emulator-mcp\server.py
Name	emulator-control
Scope	User (global)

### 🎯 Cara Pakai
Buka GitHub Copilot Chat di VS Code.

Pastikan Anda berada di Agent Mode (ikon di kotak input chat).

Aktifkan tool dari server emulator-control lewat ikon tools/🔧.

Berikan prompt seperti contoh di bawah.

Contoh Prompt
Melihat daftar emulator:

"Gunakan tool list_avds untuk melihat emulator Android yang tersedia."

Menjalankan emulator Pixel_4a:

"Jalankan emulator Pixel_4a menggunakan tool start_emulator."

Alur debugging lengkap:

"Cek dulu emulator yang tersedia dengan list_avds. Jika ada Pixel_4a, jalankan dengan start_emulator. Setelah emulator siap, bantu saya jalankan aplikasi Flutter dan periksa apakah ada error di log."

### 🐛 Troubleshooting
### ❌ emulator: The term 'emulator' is not recognized
Emulator tidak ada di PATH. Perbaiki dengan:

```powershell
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$userPath;$emulatorPath", "User")
```
Tutup semua jendela PowerShell, buka baru, lalu verifikasi emulator -list-avds.

### ❌ Server MCP tidak muncul di Copilot
Pastikan path python.exe di config mengarah ke venv, bukan Python global.

Cek log di VS Code: Ctrl+Shift+P → MCP: List Servers → lihat status server.

Pastikan mcp terinstal di venv yang sama:

```powershell
.\venv\Scripts\pip.exe list | findstr mcp
```
### ❌ Emulator tidak muncul di flutter devices
Pastikan emulator benar-benar sudah booting penuh (tunggu 30–60 detik).

Jalankan adb devices — perangkat harus muncul dengan status device.

Jika offline, jalankan adb kill-server && adb start-server.

### ❌ ModuleNotFoundError: No module named 'mcp'
Anda menjalankan Python global, bukan Python dari venv. Perbaiki path command di config MCP agar mengarah ke venv\Scripts\python.exe.

### ❌ Emulator gagal start (proses langsung exit)
Jalankan manual untuk melihat error lengkap:

```powershell
emulator -avd Pixel_4a -verbose
```
### Penyebab umum:

AVD belum dibuat → buat via Android Studio Device Manager.

Virtualisasi (HAXM/WHPX) belum aktif → aktifkan di BIOS atau Windows Features.

Tidak ada ruang disk → cek dengan Get-PSDrive C.

### 🔧 Pengembangan Lanjutan
Ingin menambah tool baru? Tambahkan fungsi berdekorasi @mcp.tool() di server.py, lalu restart server (di VS Code: MCP: Restart Server).

Contoh tool tambahan yang berguna untuk debugging:

```python
@mcp.tool()
def install_apk(apk_path: str) -> str:
    """Menginstal file APK ke emulator yang sedang berjalan."""
    result = subprocess.run(
        ["adb", "install", "-r", apk_path],
        capture_output=True, text=True, shell=True
    )
    return result.stdout if result.returncode == 0 else result.stderr

@mcp.tool()
def get_logcat(lines: int = 100) -> str:
    """Mengambil N baris terakhir dari logcat emulator."""
    result = subprocess.run(
        ["adb", "logcat", "-d", "-t", str(lines)],
        capture_output=True, text=True, shell=True
    )
    return result.stdout
📄 Lisensi
MIT — bebas digunakan dan dimodifikasi.
```

### 🙏 Referensi
Model Context Protocol

GitHub Copilot MCP Documentation

VS Code MCP Servers

Android Emulator Command Line

text

---

### 📝 Bonus: `.gitignore` dan `requirements.txt`

Jangan lupa tambahkan dua file pendukung ini di folder yang sama:

**`.gitignore`**
venv/
pycache/
*.pyc
.env
.vscode/

text

**`requirements.txt`**
mcp>=1.0.0