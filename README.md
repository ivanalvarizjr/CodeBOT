# CodeBOT

CodeBOT adalah paket dokumentasi dan profil agen untuk alur kerja pengembangan perangkat lunak multi-agen yang dikendalikan manusia. Isinya menetapkan peran Orchestrator dan empat spesialis, dengan panduan tentang lingkup tugas, persetujuan, serah terima, dan verifikasi.

## Isi CodeBOT

Profil kanonis menetapkan lima peran:

| Peran | Tanggung jawab |
| --- | --- |
| `orchestrator` | Memperjelas lingkup, merencanakan dan mengarahkan tugas, mengoordinasikan spesialis, memeriksa persetujuan, memverifikasi bukti, dan melaporkan hasil. Tidak menyunting file atau menjalankan perintah shell. |
| `data-analyst-manager` | Menganalisis kebutuhan, data, risiko, bukti, dan rekomendasi. |
| `application-uiux-designer-manager` | Menentukan kebutuhan pengguna, alur UI/UX, arah visual, dan kriteria penerimaan desain. |
| `software-engineer` | Menyelidiki, mengimplementasikan perubahan yang disetujui, melakukan debugging dan pengujian, serta melaporkan bukti teknis. |
| `prompt-engineer` | Menyiapkan prompt dan kontrak keluaran yang tervalidasi untuk serah terima kepada spesialis. |

Profil tersedia di [`profiles/canonical/`](profiles/canonical/).

## Cara menggunakan CodeBOT

**Saat ini, gunakan repositori ini sebagai referensi alur kerja dan profil yang dibaca manusia.** CodeBOT belum memiliki installer atau integrasi runtime yang didukung.

1. Clone atau unduh repositori, lalu baca profil kanonis.
2. Untuk eksperimen dengan runtime agen, sesuaikan profil secara manual ke format yang didukung runtime tersebut. Jangan anggap dokumen adapter kandidat sebagai integrasi yang berfungsi.
3. Ikuti alur kerja yang didokumentasikan: tetapkan lingkup dan kriteria penerimaan; arahkan tugas ke spesialis yang sesuai; minta persetujuan eksplisit sebelum tindakan yang memerlukannya; kembalikan hasil spesialis kepada Orchestrator; verifikasi perubahan dan bukti sebelum melaporkan penyelesaian.

contoh penggunanaan CodeBOT:

>@orchestrator.agent.md redesain website portofolio saya dengan desain Soft Brutalist Editorial Tech dengan code warna DF301C, FF9100, FFF1D1, 00B7CD, namun jangan merubah isi website ini. eksekusi.

**@** digunakan untuk memanggil profile agent orchestrator sebagai leader dari agent spesialis.

## Instalasi

### Repositori CodeBOT

Jalankan perintah berikut untuk menginstal profil agen CodeBOT secara otomatis:

**Untuk macOS / Linux:** Buka aplikasi `Terminal`.
**Untuk Windows:** Buka aplikasi `Git Bash`.

Kopikan perintah di bawah ini dan tekan Enter:
```bash
curl -sSL [https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh](https://raw.githubusercontent.com/ivanalvarizjr/CodeBOT/main/install.sh) | bash
```

### Skill wajib dan skill pendamping

**Graphify wajib untuk pekerjaan yang melibatkan struktur proyek. Agent Reach wajib untuk riset internet, pencarian web/kode, URL, dan platform online, Taste Skill wajib untuk pilar utama design aplikasi.** dan Caveman di bawah adalah skill pendamping opsional, bukan prasyarat umum.

#### Graphify — wajib

Graphify membangun knowledge graph yang dapat ditelusuri dari kode dan dokumentasi proyek. Nama paket PyPI resminya **`graphifyy`** (dua huruf `y`); nama perintahnya `graphify`.

Pasang prasyarat sesuai sistem operasi, lalu instal Graphify:

**Windows (PowerShell):**

```powershell
winget install astral-sh.uv
uv tool install graphifyy
graphify install
```

**macOS (Homebrew):**

```bash
brew install python@3.12 uv
uv tool install graphifyy
graphify install
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt install python3.12 python3-pip pipx
uv tool install graphifyy
graphify install
```

Untuk alternatif instalasi `uv` di Ubuntu/Debian, Graphify juga mendokumentasikan `curl -LsSf https://astral.sh/uv/install.sh | sh`; setelah itu jalankan `uv tool install graphifyy`. Untuk instalasi khusus proyek Codex, gunakan:

```bash
graphify install --project --platform codex
```

Graphify juga menyediakan instruksi untuk GitHub Copilot CLI dan VS Code Copilot Chat. Instruksi tersebut bukan bukti kompatibilitas CodeBOT atau GitHub Copilot App. Lihat [panduan instalasi resmi Graphify](https://github.com/Graphify-Labs/graphify#install).

#### Agent Reach — wajib untuk riset internet

[Agent Reach](https://github.com/Panniantong/agent-reach) adalah router dan pemeriksa kesiapan untuk alat web, GitHub, RSS, video, serta platform lain. Gunakan skill ini untuk riset online, pencarian web/kode, URL, dan platform yang didukung. Agent Reach bukan pembungkus perintah: setelah kanal tersedia, agen memakai alat upstream yang sesuai.

Perlu Python 3.10+. Panduan upstream merekomendasikan `pipx`; paket dipasang langsung dari repositori resmi:

**Windows (PowerShell; metode venv resmi):**

```powershell
py -3 -m venv "$env:USERPROFILE\.agent-reach-venv"
& "$env:USERPROFILE\.agent-reach-venv\Scripts\Activate.ps1"
python -m pip install https://github.com/Panniantong/agent-reach/archive/main.zip
agent-reach install --env=auto
```

**macOS dan Linux (pipx):**

```bash
pipx install https://github.com/Panniantong/agent-reach/archive/main.zip
agent-reach install --env=auto
```

`agent-reach install --env=auto` hanya memeriksa kesiapan dan tidak mengubah sistem. Setelah instalasi, tinjau kanal yang tersedia:

```bash
agent-reach doctor --json
```

Pemasangan dependensi sistem atau kanal opsional memerlukan persetujuan eksplisit. Setelah pengguna menyetujuinya, contoh untuk kanal OpenCLI:

```bash
agent-reach install --env=auto --system --channels=opencli
```

Pilih kanal yang diperlukan saja; `--channels=all` dapat memasang banyak alat dan mengubah konfigurasi sistem. Jika Python Homebrew memblokir instalasi langsung (PEP 668), gunakan `pipx` atau venv. Di Windows, bila `python3` membuka Microsoft Store, gunakan Python Launcher `py -3` seperti pada contoh. Lihat [panduan instalasi resmi Agent Reach](https://github.com/Panniantong/agent-reach/blob/main/docs/install.md) dan [panduan pembaruan](https://github.com/Panniantong/agent-reach/blob/main/docs/update.md).

#### Taste Skill - wajib

[Taste Skill](https://github.com/Leonxlnx/taste-skill) menyediakan `design-taste-frontend` untuk pekerjaan desain antarmuka. Installer resmi Agent Skills tersedia di Windows, macOS, dan Linux; Node.js serta npm diperlukan:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Skrip skill memerlukan Node.js 22+ serta Chrome, Edge, atau Chromium. Untuk Codex, repositori juga mendokumentasikan instalasi plugin:

```bash
codex plugin marketplace add Leonxlnx/taste-skill
codex plugin add taste-skill@taste-skill
```

Mulai sesi Codex baru setelah memasang plugin. Lihat [petunjuk resmi Taste Skill](https://github.com/Leonxlnx/taste-skill#install).

#### Caveman — opsional

[Caveman](https://github.com/JuliusBrussee/caveman) menyediakan skill dan alat agen, termasuk skill untuk jawaban ringkas. Installer interaktif resminya mendukung Windows, macOS, dan Linux. Penggunaan `npx` memerlukan Node.js 22.13+:

```bash
npx @caveman-ai/cli@latest
```

Repositori juga menyediakan installer versi v4.0.1:

**Windows (PowerShell 5.1+):**

```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/v4.0.1/install.ps1 | iex
```

**macOS dan Linux:**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/v4.0.1/install.sh | bash
```

Perintah tersebut menjalankan skrip installer yang diunduh. Tinjau [petunjuk instalasi resmi](https://github.com/JuliusBrussee/caveman/blob/main/INSTALL.md) sebelum menjalankannya jika ingin memeriksa skrip terlebih dahulu. Periksa repositori Caveman untuk daftar agen yang didukung dan opsi konfigurasi terbaru.

## Panduan repositori

- [`profiles/canonical/`](profiles/canonical/) — profil peran kanonis.
- [`languange.md`] bahasa yang ditetapkan untuk agent, saat ini support indonesia dan english. **cukup letakan pada direktori workspace tempat agent bekerja.**