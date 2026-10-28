import subprocess
import os
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("Android Emulator Control")

# ==========================================
# HELPER: Manajemen Folder Penyimpanan
# ==========================================
def ensure_dir(subfolder: str) -> str:
    """Membuat folder agent-debugging/<subfolder> di working directory saat ini."""
    path = os.path.join(os.getcwd(), "agent-debugging", subfolder)
    os.makedirs(path, exist_ok=True)
    return path

def run_adb(args: list, timeout: int = 30) -> tuple:
    """Helper untuk menjalankan perintah ADB dengan aman."""
    try:
        result = subprocess.run(
            ["adb"] + args,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except FileNotFoundError:
        return 1, "", "Error: ADB tidak ditemukan di PATH."
    except subprocess.TimeoutExpired:
        return 1, "", f"Error: Perintah ADB melebihi batas waktu {timeout} detik."

# ==========================================
# TOOLS: Emulator & Flutter Management
# ==========================================
@mcp.tool()
def list_avds() -> str:
    """Menampilkan daftar Android Virtual Device (AVD) yang tersedia."""
    result = subprocess.run(["emulator", "-list-avds"], capture_output=True, text=True, shell=True)
    return result.stdout if result.returncode == 0 else result.stderr

@mcp.tool()
def start_emulator(avd_name: str = "Pixel_4a") -> str:
    """Menjalankan emulator dengan nama AVD yang ditentukan (default: Pixel_4a)."""
    subprocess.Popen(["emulator", "-avd", avd_name], shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return f"Perintah untuk menjalankan emulator '{avd_name}' telah dikirim. Tunggu hingga emulator siap (booting)."

@mcp.tool()
def flutter_devices() -> str:
    """Menampilkan daftar perangkat Flutter yang tersedia."""
    try:
        result = subprocess.run(["flutter", "devices"], capture_output=True, text=True, timeout=60)
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error: {str(e)}"

# ==========================================
# TOOLS: Visual & Recording (Penyimpanan File)
# ==========================================
@mcp.tool()
def take_screenshot(filename: str = "screen.png") -> str:
    """Mengambil screenshot layar emulator dan menyimpannya ke agent-debugging/screenshot/."""
    dir_path = ensure_dir("screenshot")
    filepath = os.path.join(dir_path, filename)
    
    # Gunakan exec-out untuk mendapatkan data binary langsung
    try:
        with open(filepath, "wb") as f:
            process = subprocess.run(["adb", "exec-out", "screencap", "-p"], stdout=f, stderr=subprocess.PIPE)
        if process.returncode == 0:
            return f"✅ Screenshot berhasil disimpan di: {filepath}"
        return f"❌ Gagal mengambil screenshot: {process.stderr.decode()}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

@mcp.tool()
def record_screen(filename: str = "recording.mp4", duration_seconds: int = 10) -> str:
    """Merekam layar emulator (maksimal 30 detik) dan menyimpannya ke agent-debugging/record/."""
    # Validasi durasi (1 sampai 30 detik)
    duration = max(1, min(duration_seconds, 30))
    dir_path = ensure_dir("record")
    remote_path = f"/sdcard/{filename}"
    local_path = os.path.join(dir_path, filename)
    
    try:
        # 1. Rekam ke storage emulator
        subprocess.run(["adb", "shell", "screenrecord", "--time-limit", str(duration), remote_path], timeout=duration + 5)
        # 2. Tarik ke komputer lokal
        subprocess.run(["adb", "pull", remote_path, local_path], capture_output=True)
        # 3. Hapus dari emulator
        subprocess.run(["adb", "shell", "rm", remote_path])
        return f"✅ Rekaman ({duration}s) berhasil disimpan di: {local_path}"
    except Exception as e:
        return f"❌ Error saat merekam layar: {str(e)}"

# ==========================================
# TOOLS: UI Interaction (ADB Input)
# ==========================================
@mcp.tool()
def get_ui_hierarchy() -> str:
    """Mengambil struktur XML UI saat ini. GUNAKAN INI SEBELUM TAP untuk mencari koordinat/bounds elemen."""
    code, out, err = run_adb(["shell", "uiautomator", "dump", "/sdcard/window_dump.xml"])
    if code != 0: return err
    
    run_adb(["pull", "/sdcard/window_dump.xml", "window_dump.xml"])
    try:
        with open("window_dump.xml", "r", encoding="utf-8") as f:
            content = f.read()
        os.remove("window_dump.xml") # Bersihkan file lokal
        return f"Struktur UI berhasil diambil:\n\n{content}"
    except Exception as e:
        return f"Error membaca file XML: {str(e)}"

@mcp.tool()
def tap_screen(x: int, y: int) -> str:
    """Mengetuk layar pada koordinat (x, y)."""
    code, out, err = run_adb(["shell", "input", "tap", str(x), str(y)])
    return f"✅ Tap di ({x}, {y}) berhasil." if code == 0 else f"❌ Gagal tap: {err}"

@mcp.tool()
def swipe_screen(start_x: int, start_y: int, end_x: int, end_y: int, duration_ms: int = 300) -> str:
    """Menggeser layar (scroll) dari koordinat awal ke koordinat akhir."""
    code, out, err = run_adb(["shell", "input", "swipe", str(start_x), str(start_y), str(end_x), str(end_y), str(duration_ms)])
    return f"✅ Swipe berhasil." if code == 0 else f"❌ Gagal swipe: {err}"

@mcp.tool()
def input_text(text: str) -> str:
    """Mengetikkan teks ke dalam field input yang sedang aktif/fokus."""
    # Spasi harus diganti dengan %s untuk ADB
    formatted_text = text.replace(" ", "%s")
    code, out, err = run_adb(["shell", "input", "text", formatted_text])
    return f"✅ Teks '{text}' berhasil diketik." if code == 0 else f"❌ Gagal mengetik: {err}"

@mcp.tool()
def press_key(keycode: int) -> str:
    """Menekan tombol hardware (contoh: 4 untuk BACK, 3 untuk HOME, 66 untuk ENTER, 67 untuk DELETE)."""
    code, out, err = run_adb(["shell", "input", "keyevent", str(keycode)])
    return f"✅ Keyevent {keycode} berhasil." if code == 0 else f"❌ Gagal keyevent: {err}"

# ==========================================
# TOOLS: Memory / Reporting
# ==========================================
@mcp.tool()
def save_debug_report(filename: str, content: str) -> str:
    """Menyimpan catatan hasil debugging ke agent-debugging/report/ agar agen tidak lupa."""
    dir_path = ensure_dir("report")
    filepath = os.path.join(dir_path, filename)
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return f"✅ Laporan debugging berhasil disimpan di: {filepath}"
    except Exception as e:
        return f"❌ Gagal menyimpan laporan: {str(e)}"

@mcp.tool()
def read_debug_report(filename: str) -> str:
    """Membaca kembali laporan debugging yang pernah disimpan."""
    dir_path = ensure_dir("report")
    filepath = os.path.join(dir_path, filename)
    if not os.path.exists(filepath):
        return f"❌ File {filename} tidak ditemukan di folder report."
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"❌ Gagal membaca laporan: {str(e)}"
    
# ==========================================
# TOOLS: Logcat / Error Reporting
# ==========================================
@mcp.tool()
def get_logcat(lines: int = 100, filter_tag: str = "") -> str:
    """Mengambil log terakhir dari emulator. Sangat berguna untuk mencari pesan error/crash.
    Gunakan filter_tag (misal: 'flutter' atau 'AndroidRuntime') untuk mempersempit hasil."""
    args = ["logcat", "-d", "-t", str(lines)]
    if filter_tag:
        args.extend(["-s", filter_tag])
        
    code, out, err = run_adb(args)
    if code != 0:
        return f"❌ Gagal mengambil log: {err}"
    return f"📋 Log terakhir:\n\n{out}"

if __name__ == "__main__":
    mcp.run(transport="stdio")