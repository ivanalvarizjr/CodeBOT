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
    echo "[1] GitHub Copilot (Global)"
    echo "[2] OpenAI Codex CLI (Global + Smart AGENTS.md)"
    if [ -t 0 ]; then 
        read -p "Ketik 1 atau 2: " choice
    else 
        read -p "Ketik 1 atau 2: " choice < /dev/tty
    fi
fi

AGENT_DIR=""; SKILL_DIR=""; EXTRA_SKILL_DIR=""; CONFIG_FILE=""
case $choice in
    1) AGENT_DIR="$HOME/.copilot/agents"; SKILL_DIR="$HOME/.copilot/skills" ;;
    2) AGENT_DIR="$HOME/.codex/agents"; SKILL_DIR="$HOME/.codex/skills"; EXTRA_SKILL_DIR="$HOME/.agents/skills"; CONFIG_FILE="$HOME/.codex/config.toml" ;;
    *) echo -e "${RED}Pilihan tidak valid.${NC}"; exit 1 ;;
esac

command -v git &> /dev/null || { echo -e "${RED}Git tidak ditemukan. Silakan instal Git terlebih dahulu.${NC}"; exit 1; }
mkdir -p "$AGENT_DIR" "$SKILL_DIR"
[ -n "$EXTRA_SKILL_DIR" ] && mkdir -p "$EXTRA_SKILL_DIR"
[ "$choice" == "2" ] && mkdir -p "$(dirname "$CONFIG_FILE")"

REPO_URL="https://github.com/ivanalvarizjr/CodeBOT.git"
TEMP_DIR=$(mktemp -d)
echo -e "\n${CYAN}Mengkloning repositori...${NC}"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR"


# ==========================================
# FUNGSI UPDATE-SAFE (ANTI-TINDIH)
# ==========================================

# 1. Smart Copy untuk File Tunggal (Agen)
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

# 2. Smart Copy untuk Direktori (Skills)
safe_copy_dir() {
    local src="$1"; local dest="$2"
    local dirname=$(basename "$src")
    local target_dir="$dest/$dirname"
    
    if [ -d "$target_dir" ]; then
        # Cek apakah ada perbedaan menggunakan diff -rq
        if diff -rq "$src" "$target_dir" >/dev/null 2>&1; then
            echo -e "  ${GREEN}[SKIP]${NC} Skill '$dirname' sudah versi terbaru."
        else
            local backup="${target_dir}.bak.$(date +%Y%m%d%H%M%S)"
            mv "$target_dir" "$backup"
            cp -R "$src" "$target_dir"
            echo -e "  ${YELLOW}[BACKUP]${NC} Skill '$dirname' berbeda. Cadangan dibuat: $(basename "$backup")"
        fi
    else
        cp -R "$src" "$target_dir"
        echo -e "  ${CYAN}[NEW]${NC} Skill '$dirname' berhasil ditambahkan."
    fi
}

# 3. Merge AGENTS.md (Managed Block)
merge_agents_md() {
    local target_file="$1"; local source_file="$2"
    local begin_marker="<!-- BEGIN CODEBOT ORCHESTRATOR -->"
    local end_marker="<!-- END CODEBOT ORCHESTRATOR -->"

    if [ ! -f "$target_file" ]; then
        echo "$begin_marker" > "$target_file"
        cat "$source_file" >> "$target_file"
        echo "$end_marker" >> "$target_file"
        echo -e "  ${CYAN}[NEW]${NC} AGENTS.md dibuat dengan aturan CodeBOT."
        return 0
    fi

    if grep -qF "$begin_marker" "$target_file" && grep -qF "$end_marker" "$target_file"; then
        # Cek apakah isinya sama persis
        local existing_block=$(awk -v begin="$begin_marker" -v end="$end_marker" '$0 == begin {flag=1; next} $0 == end {flag=0} flag' "$target_file")
        local new_block=$(cat "$source_file")
        
        if [ "$existing_block" == "$new_block" ]; then
            echo -e "  ${GREEN}[SKIP]${NC} Aturan CodeBOT di AGENTS.md sudah versi terbaru."
        else
            awk -v begin="$begin_marker" -v end="$end_marker" -v src="$source_file" '
                $0 == begin { print; while ((getline line < src) > 0) print line; skip=1; next }
                $0 == end { skip=0 }
                !skip { print }
            ' "$target_file" > "${target_file}.tmp" && mv "${target_file}.tmp" "$target_file"
            echo -e "  ${YELLOW}[UPDATE]${NC} Aturan CodeBOT di AGENTS.md diperbarui."
        fi
    else
        echo "" >> "$target_file"
        echo "$begin_marker" >> "$target_file"
        cat "$source_file" >> "$target_file"
        echo "$end_marker" >> "$target_file"
        echo -e "  ${CYAN}[APPEND]${NC} Aturan CodeBOT ditambahkan ke AGENTS.md yang sudah ada."
    fi
}


# ==========================================
# LOGIKA INSTALASI
# ==========================================
echo -e "\n${BOLD}Memulai proses instalasi/pembaruan...${NC}"

if [ "$choice" == "1" ]; then
    # --- COPILOT ---
    if [ -d "$TEMP_DIR/profiles/canonical" ]; then
        echo -e "\n${CYAN}Memeriksa Profil Copilot:${NC}"
        for file in "$TEMP_DIR/profiles/canonical/"*.agent.md; do
            [ -e "$file" ] || continue
            safe_copy_file "$file" "$AGENT_DIR/$(basename "$file")"
        done
    fi

elif [ "$choice" == "2" ]; then
    # --- CODEX AGENTS ---
    if [ -d "$TEMP_DIR/.codex/agents" ]; then
        echo -e "\n${CYAN}Memeriksa Profil Codex (.toml):${NC}"
        for file in "$TEMP_DIR/.codex/agents/"*.toml; do
            [ -e "$file" ] || continue
            safe_copy_file "$file" "$AGENT_DIR/$(basename "$file")"
        done
    fi
    
    # --- CODEX CONFIG.TOML (STRICT NO OVERWRITE) ---
    echo -e "\n${CYAN}Memeriksa Konfigurasi Codex:${NC}"
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "  ${GREEN}[SKIP]${NC} config.toml sudah ada. Tidak ada file yang ditimpa."
        # Simpan sebagai file referensi di sebelahnya agar user bisa cek manual
        cp "$TEMP_DIR/.codex/config.toml" "${CONFIG_FILE}.new"
        echo -e "         File referensi config terbaru disimpan di: ${YELLOW}${CONFIG_FILE}.new${NC}"
    else
        if [ -f "$TEMP_DIR/.codex/config.toml" ]; then
            cp "$TEMP_DIR/.codex/config.toml" "$CONFIG_FILE"
            echo -e "  ${CYAN}[NEW]${NC} config.toml berhasil dibuat."
        fi
    fi

    # --- CODEX SMART AGENTS.MD ---
    if [ -f "$TEMP_DIR/.codex/AGENTS.md" ]; then
        # Deteksi cerdas lokasi AGENTS.md
        if [ "$(pwd)" = "$HOME" ]; then
            TARGET_AGENTS_MD="$HOME/.codex/AGENTS.md"
            echo -e "\n${CYAN}Terdeteksi instalasi dari direktori global ($HOME).${NC}"
            echo -e "${CYAN}Menargetkan aturan ke: $TARGET_AGENTS_MD${NC}"
        else
            TARGET_AGENTS_MD="$(pwd)/AGENTS.md"
            echo -e "\n${CYAN}Terdeteksi instalasi dari direktori proyek.${NC}"
            echo -e "${CYAN}Menargetkan aturan ke: $TARGET_AGENTS_MD${NC}"
        fi
        
        # Pastikan folder target (jika di .codex) tersedia
        mkdir -p "$(dirname "$TARGET_AGENTS_MD")"
        
        # Jalankan proses merge
        merge_agents_md "$TARGET_AGENTS_MD" "$TEMP_DIR/.codex/AGENTS.md"
    fi
fi

# --- SKILLS ---
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