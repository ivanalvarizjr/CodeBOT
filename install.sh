#!/usr/bin/env bash
set -e

# Warna
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'

echo -e "${CYAN}=============================================${NC}"
echo -e "${CYAN}   CodeBOT Agents & Skills Installer         ${NC}"
echo -e "${CYAN}=============================================${NC}"

choice="$1"
if [ -z "$choice" ]; then
    echo ""
    echo "Pilih ekosistem target:"
    echo "[1] GitHub Copilot App (Global)"
    echo "[2] OpenAI Codex CLI (Global + Smart AGENTS.md)"
    if [ -t 0 ]; then 
        read -p "Ketik 1 atau 2: " choice
    else 
        read -p "Ketik 1 atau 2: " choice < /dev/tty
    fi
fi

AGENT_DIR=""; SKILL_DIR=""; EXTRA_SKILL_DIR=""; CONFIG_FILE=""; EXTENSION_DIR=""; INSTRUCTION_FILE=""
case $choice in
    1) 
        AGENT_DIR="$HOME/.copilot/agents"
        SKILL_DIR="$HOME/.copilot/skills"
        EXTENSION_DIR="$HOME/.copilot/extensions"
        INSTRUCTION_FILE="$HOME/.copilot/copilot-instructions.md"
        ;;
    2) 
        AGENT_DIR="$HOME/.codex/agents"
        SKILL_DIR="$HOME/.codex/skills"
        EXTRA_SKILL_DIR="$HOME/.agents/skills"
        CONFIG_FILE="$HOME/.codex/config.toml"
        INSTRUCTION_FILE="$HOME/.codex/AGENTS.md"
        ;;
    *) 
        echo -e "${RED}Pilihan tidak valid.${NC}"; exit 1 
        ;;
esac

command -v git &> /dev/null || { echo -e "${RED}Git tidak ditemukan.${NC}"; exit 1; }
mkdir -p "$AGENT_DIR" "$SKILL_DIR"
[ -n "$EXTRA_SKILL_DIR" ] && mkdir -p "$EXTRA_SKILL_DIR"
[ -n "$EXTENSION_DIR" ] && mkdir -p "$EXTENSION_DIR"
[ -n "$CONFIG_FILE" ] && mkdir -p "$(dirname "$CONFIG_FILE")"

REPO_URL="https://github.com/ivanalvarizjr/CodeBOT.git"
TEMP_DIR=$(mktemp -d)
echo -e "\n${CYAN}Mengkloning repositori...${NC}"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR"

# ==========================================
# FUNGSI UPDATE-SAFE (ANTI-TINDIH)
# ==========================================

safe_copy_file() {
    local src="$1"; local dest="$2"
    if [ -f "$dest" ]; then
        if cmp -s "$src" "$dest"; then
            echo -e "  ${GREEN}[SKIP]${NC} $(basename "$dest") sudah versi terbaru."
        else
            local backup="${dest}.bak.$(date +%Y%m%d%H%M%S)"
            cp "$dest" "$backup"
            cp "$src" "$dest"
            echo -e "  ${YELLOW}[BACKUP]${NC} $(basename "$dest") berbeda. Cadangan dibuat: $(basename "$backup")"
        fi
    else
        cp "$src" "$dest"
        echo -e "  ${CYAN}[NEW]${NC} $(basename "$dest") berhasil ditambahkan."
    fi
}

safe_copy_dir() {
    local src="$1"; local dest="$2"
    local dirname=$(basename "$src")
    local target_dir="$dest/$dirname"
    
    if [ -d "$target_dir" ]; then
        if diff -rq "$src" "$target_dir" >/dev/null 2>&1; then
            echo -e "  ${GREEN}[SKIP]${NC} Direktori/File '$dirname' sudah versi terbaru."
        else
            local backup="${target_dir}.bak.$(date +%Y%m%d%H%M%S)"
            mv "$target_dir" "$backup"
            cp -R "$src" "$target_dir"
            echo -e "  ${YELLOW}[BACKUP]${NC} Direktori/File '$dirname' berbeda. Cadangan dibuat: $(basename "$backup")"
        fi
    else
        cp -R "$src" "$target_dir"
        echo -e "  ${CYAN}[NEW]${NC} Direktori/File '$dirname' berhasil ditambahkan."
    fi
}

merge_md_block() {
    local target_file="$1"; local source_file="$2"
    local begin_marker="<!-- BEGIN CODEBOT ORCHESTRATOR -->"
    local end_marker="<!-- END CODEBOT ORCHESTRATOR -->"

    if [ ! -f "$target_file" ]; then
        echo "$begin_marker" > "$target_file"
        cat "$source_file" >> "$target_file"
        echo "$end_marker" >> "$target_file"
        echo -e "  ${CYAN}[NEW]${NC} $(basename "$target_file") dibuat dengan aturan CodeBOT."
        return 0
    fi

    if grep -qF "$begin_marker" "$target_file" && grep -qF "$end_marker" "$target_file"; then
        local existing_block=$(awk -v begin="$begin_marker" -v end="$end_marker" '$0 == begin {flag=1; next} $0 == end {flag=0} flag' "$target_file")
        local new_block=$(cat "$source_file")
        
        if [ "$existing_block" == "$new_block" ]; then
            echo -e "  ${GREEN}[SKIP]${NC} Aturan CodeBOT di $(basename "$target_file") sudah versi terbaru."
        else
            awk -v begin="$begin_marker" -v end="$end_marker" -v src="$source_file" '
                $0 == begin { print; while ((getline line < src) > 0) print line; skip=1; next }
                $0 == end { skip=0 }
                !skip { print }
            ' "$target_file" > "${target_file}.tmp" && mv "${target_file}.tmp" "$target_file"
            echo -e "  ${YELLOW}[UPDATE]${NC} Aturan CodeBOT di $(basename "$target_file") diperbarui."
        fi
    else
        # PERBAIKAN: Cek apakah isi source_file sudah ada di dalam target_file
        # grep -vxFf akan mengembalikan baris dari source_file yang TIDAK ada di target_file.
        # Jika hasilnya kosong, berarti semua baris sudah ada.
        if [ -z "$(grep -vxFf "$target_file" "$source_file" 2>/dev/null)" ]; then
            echo -e "  ${GREEN}[SKIP]${NC} Aturan CodeBOT sudah ada di $(basename "$target_file") (tanpa marker). Duplikasi dicegah."
        else
            echo "" >> "$target_file"
            echo "$begin_marker" >> "$target_file"
            cat "$source_file" >> "$target_file"
            echo "$end_marker" >> "$target_file"
            echo -e "  ${CYAN}[APPEND]${NC} Aturan CodeBOT ditambahkan ke $(basename "$target_file") yang sudah ada."
        fi
    fi
}

# ==========================================
# LOGIKA INSTALASI
# ==========================================
echo -e "\n${BOLD}Memulai proses instalasi/pembaruan...${NC}"

if [ "$choice" == "1" ]; then
    # --- GITHUB COPILOT APP ---
    if [ -d "$TEMP_DIR/.copilot/agents" ]; then
        echo -e "\n${CYAN}Memeriksa Profil Copilot (.agent.md):${NC}"
        for file in "$TEMP_DIR/.copilot/agents/"*.agent.md; do
            [ -e "$file" ] || continue
            safe_copy_file "$file" "$AGENT_DIR/$(basename "$file")"
        done
    fi

    if [ -d "$TEMP_DIR/.copilot/extensions/CodeBOT" ]; then
        echo -e "\n${CYAN}Memeriksa Ekstensi Copilot (CodeBOT):${NC}"
        safe_copy_dir "$TEMP_DIR/.copilot/extensions/CodeBOT" "$EXTENSION_DIR"
    fi

    if [ -f "$TEMP_DIR/.copilot/copilot-instructions.md" ]; then
        echo -e "\n${CYAN}Memeriksa copilot-instructions.md:${NC}"
        mkdir -p "$(dirname "$INSTRUCTION_FILE")"
        merge_md_block "$INSTRUCTION_FILE" "$TEMP_DIR/.copilot/copilot-instructions.md"
    fi

elif [ "$choice" == "2" ]; then
    # --- OPENAI CODEX CLI ---
    if [ -d "$TEMP_DIR/.codex/agents" ]; then
        echo -e "\n${CYAN}Memeriksa Profil Codex (.toml):${NC}"
        for file in "$TEMP_DIR/.codex/agents/"*.toml; do
            [ -e "$file" ] || continue
            safe_copy_file "$file" "$AGENT_DIR/$(basename "$file")"
        done
    fi
    
    echo -e "\n${CYAN}Memeriksa Konfigurasi Codex:${NC}"
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "  ${GREEN}[SKIP]${NC} config.toml sudah ada. Tidak ada file yang ditimpa."
        if [ -f "$TEMP_DIR/.codex/config.toml" ]; then
            cp "$TEMP_DIR/.codex/config.toml" "${CONFIG_FILE}.new"
            echo -e "         File referensi config terbaru disimpan di: ${YELLOW}${CONFIG_FILE}.new${NC}"
        fi
    else
        if [ -f "$TEMP_DIR/.codex/config.toml" ]; then
            cp "$TEMP_DIR/.codex/config.toml" "$CONFIG_FILE"
            echo -e "  ${CYAN}[NEW]${NC} config.toml berhasil dibuat."
        fi
    fi

    if [ -f "$TEMP_DIR/.codex/AGENTS.md" ]; then
        if [ "$(pwd)" = "$HOME" ]; then
            TARGET_AGENTS_MD="$HOME/.codex/AGENTS.md"
            echo -e "\n${CYAN}Terdeteksi instalasi dari direktori global ($HOME).${NC}"
        else
            TARGET_AGENTS_MD="$(pwd)/AGENTS.md"
            echo -e "\n${CYAN}Terdeteksi instalasi dari direktori proyek.${NC}"
        fi
        echo -e "${CYAN}Menargetkan aturan ke: $TARGET_AGENTS_MD${NC}"
        mkdir -p "$(dirname "$TARGET_AGENTS_MD")"
        merge_md_block "$TARGET_AGENTS_MD" "$TEMP_DIR/.codex/AGENTS.md"
    fi
fi

# --- SKILLS (Berlaku untuk keduanya) ---
if [ -d "$TEMP_DIR/skills" ]; then
    echo -e "\n${CYAN}Memeriksa Modul Skills:${NC}"
    for skill_path in "$TEMP_DIR/skills/"*/; do
        [ -d "$skill_path" ] || continue
        safe_copy_dir "$skill_path" "$SKILL_DIR"
        [ -n "$EXTRA_SKILL_DIR" ] && safe_copy_dir "$skill_path" "$EXTRA_SKILL_DIR"
    done
fi

# Pembersihan
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}✅ PROSES SELESAI!${NC}"
echo -e "Seluruh file Anda aman. Tidak ada modifikasi pengguna yang hilang tanpa cadangan."