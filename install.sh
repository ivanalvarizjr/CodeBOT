#!/usr/bin/env bash

# Menghentikan skrip jika ada error
set -e

# Warna untuk output terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=============================================${NC}"
echo -e "${CYAN}   CodeBOT Agents include skills Installer   ${NC}"
echo -e "${CYAN}=============================================${NC}"

# --- PERBAIKAN DIMULAI DI SINI ---
# Cek jika pengguna memberikan argumen (misal: curl ... | bash -s 1)
choice="$1"

if [ -z "$choice" ]; then
    echo ""
    echo "Silakan pilih ekosistem target instalasi Anda:"
    echo "[1] GitHub Copilot App"
    echo "    - Agents : ~/.copilot/agents/"
    echo "    - Skills : ~/.copilot/skills/"
    echo "[2] OpenAI Codex CLI"
    echo "    - Agents : ~/.codex/agents/"
    echo "    - Skills : ~/.codex/skills/ (serta ~/.agents/skills/)"
    
    # Cek jika skrip dijalankan via pipe (curl | bash)
    if [ -t 0 ]; then
        # Jika dijalankan normal (bash install.sh)
        read -p "Ketik 1 atau 2, lalu tekan Enter: " choice
    else
        # Jika dijalankan via pipe, paksa baca dari terminal (/dev/tty)
        read -p "Ketik 1 atau 2, lalu tekan Enter: " choice < /dev/tty
    fi
fi
# --- PERBAIKAN SELESAI ---

AGENT_DIR=""
SKILL_DIR=""
EXTRA_SKILL_DIR=""

case $choice in
    1)
        AGENT_DIR="$HOME/.copilot/agents"
        SKILL_DIR="$HOME/.copilot/skills"
        echo -e "\n${GREEN}[✓] Anda memilih GitHub Copilot App.${NC}"
        ;;
    2)
        AGENT_DIR="$HOME/.codex/agents"
        SKILL_DIR="$HOME/.codex/skills"
        EXTRA_SKILL_DIR="$HOME/.agents/skills"
        echo -e "\n${GREEN}[✓] Anda memilih OpenAI Codex CLI.${NC}"
        ;;
    *)
        echo -e "\n${RED}[X] Pilihan tidak valid. Instalasi dibatalkan.${NC}"
        exit 1
        ;;
esac

echo -e "Path Instalasi Agents: ${YELLOW}$AGENT_DIR${NC}"
echo -e "Path Instalasi Skills: ${YELLOW}$SKILL_DIR${NC}"
if [ -n "$EXTRA_SKILL_DIR" ]; then
    echo -e "Path Alternatif Skills: ${YELLOW}$EXTRA_SKILL_DIR${NC}"
fi

# 1. Pastikan Git terinstal
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git tidak ditemukan. Silakan instal Git terlebih dahulu.${NC}"
    exit 1
fi

# 2. Buat direktori target jika belum ada
mkdir -p "$AGENT_DIR"
mkdir -p "$SKILL_DIR"
if [ -n "$EXTRA_SKILL_DIR" ]; then
    mkdir -p "$EXTRA_SKILL_DIR"
fi

# 3. Kloning repositori dengan metode --depth 1 (Sangat Cepat & Ringan)
REPO_URL="https://github.com/ivanalvarizjr/CodeBOT.git"
TEMP_DIR=$(mktemp -d)

echo -e "\n${CYAN}Mengkloning repositori dari GitHub...${NC}"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR"

# 4. Menyalin Profil Agent
if [ -d "$TEMP_DIR/profiles/canonical" ]; then
    echo -e "${CYAN}Menyalin profil agen ke $AGENT_DIR...${NC}"
    cp "$TEMP_DIR/profiles/canonical/"*.agent.md "$AGENT_DIR/"
else
    echo -e "${RED}❌ Peringatan: Folder 'profiles/canonical' tidak ditemukan.${NC}"
fi

# 5. Menyalin Skills Modul
if [ -d "$TEMP_DIR/skills" ]; then
    echo -e "${CYAN}Menyalin modul skills ke $SKILL_DIR...${NC}"
    cp -R "$TEMP_DIR/skills/"* "$SKILL_DIR/"
    
    # Khusus Codex: Salin juga ke fallback directory lintas-agen
    if [ -n "$EXTRA_SKILL_DIR" ]; then
        echo -e "${CYAN}Menyalin modul skills ke $EXTRA_SKILL_DIR...${NC}"
        cp -R "$TEMP_DIR/skills/"* "$EXTRA_SKILL_DIR/"
    fi
else
    echo -e "${RED}❌ Peringatan: Folder 'skills' tidak ditemukan di dalam repositori.${NC}"
fi

# 6. Pembersihan folder sementara
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}✅ INSTALASI BERHASIL!${NC}"
echo "Berkas agen dan skills wajib telah siap digunakan di ekosistem Anda."