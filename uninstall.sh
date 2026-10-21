#!/usr/bin/env bash
set -e

# Warna
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'

echo -e "${CYAN}=============================================${NC}"
echo -e "${CYAN}   CodeBOT Agents & Skills Uninstaller       ${NC}"
echo -e "${CYAN}=============================================${NC}"

choice="$1"
if [ -z "$choice" ]; then
    echo ""
    echo "Pilih ekosistem yang ingin di-uninstall:"
    echo "[1] GitHub Copilot App"
    echo "[2] OpenAI Codex CLI"
    echo "[3] Keduanya (Copilot & Codex)"
    if [ -t 0 ]; then 
        read -p "Ketik 1, 2, atau 3: " choice
    else 
        read -p "Ketik 1, 2, atau 3: " choice < /dev/tty
    fi
fi

if [ "$choice" != "1" ] && [ "$choice" != "2" ] && [ "$choice" != "3" ]; then
    echo -e "${RED}Pilihan tidak valid. Proses dibatalkan.${NC}"
    exit 1
fi

command -v git &> /dev/null || { echo -e "${RED}Git tidak ditemukan.${NC}"; exit 1; }

# Fungsi untuk menghapus Managed Block di Markdown
remove_md_block() {
    local target_file="$1"
    local begin_marker="<!-- BEGIN CODEBOT ORCHESTRATOR -->"
    local end_marker="<!-- END CODEBOT ORCHESTRATOR -->"

    if [ ! -f "$target_file" ]; then
        return 0
    fi

    if grep -qF "$begin_marker" "$target_file" && grep -qF "$end_marker" "$target_file"; then
        awk -v begin="$begin_marker" -v end="$end_marker" '
            $0 == begin { skip=1; next }
            $0 == end { skip=0; next }
            !skip { print }
        ' "$target_file" > "${target_file}.tmp"
        
        # Cek jika file menjadi kosong setelah dihapus, hapus filenya. Jika tidak, ganti.
        if [ -s "${target_file}.tmp" ]; then
            mv "${target_file}.tmp" "$target_file"
            echo -e "  ${GREEN}[CLEANED]${NC} Aturan CodeBOT dihapus dari $(basename "$target_file")."
        else
            rm "$target_file" "${target_file}.tmp"
            echo -e "  ${CYAN}[DELETED]${NC} $(basename "$target_file") kosong dan telah dihapus."
        fi
    fi
}

# Mengkloning repo sebentar untuk melihat daftar file asli CodeBOT
REPO_URL="https://github.com/ivanalvarizjr/CodeBOT.git"
TEMP_DIR=$(mktemp -d)
echo -e "\n${CYAN}Mengambil daftar file CodeBOT dari repositori...${NC}"
git clone --depth 1 "$REPO_URL" "$TEMP_DIR" &>/dev/null

# ==========================================
# UNINSTALL GITHUB COPILOT
# ==========================================
if [ "$choice" == "1" ] || [ "$choice" == "3" ]; then
    echo -e "\n${BOLD}Memproses uninstall GitHub Copilot App...${NC}"
    COPILOT_DIR="$HOME/.copilot"

    # 1. Hapus Agen
    if [ -d "$TEMP_DIR/.copilot/agents" ]; then
        for file in "$TEMP_DIR/.copilot/agents/"*.agent.md; do
            [ -e "$file" ] || continue
            filename=$(basename "$file")
            if [ -f "$COPILOT_DIR/agents/$filename" ]; then
                rm "$COPILOT_DIR/agents/$filename"
                echo -e "  ${RED}[REMOVED]${NC} Agen $filename"
            fi
        done
    fi

    # 2. Hapus Ekstensi CodeBOT
    if [ -d "$COPILOT_DIR/extensions/CodeBOT" ]; then
        rm -rf "$COPILOT_DIR/extensions/CodeBOT"
        echo -e "  ${RED}[REMOVED]${NC} Ekstensi CodeBOT"
    fi

    # 3. Bersihkan copilot-instructions.md
    remove_md_block "$COPILOT_DIR/copilot-instructions.md"

    # 4. Hapus Skills
    if [ -d "$TEMP_DIR/skills" ]; then
        for skill_path in "$TEMP_DIR/skills/"*/; do
            [ -d "$skill_path" ] || continue
            skill_name=$(basename "$skill_path")
            if [ -d "$COPILOT_DIR/skills/$skill_name" ]; then
                rm -rf "$COPILOT_DIR/skills/$skill_name"
                echo -e "  ${RED}[REMOVED]${NC} Skill $skill_name"
            fi
        done
    fi
fi

# ==========================================
# UNINSTALL OPENAI CODEX CLI
# ==========================================
if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
    echo -e "\n${BOLD}Memproses uninstall OpenAI Codex CLI...${NC}"
    CODEX_DIR="$HOME/.codex"

    # 1. Hapus Agen TOML
    if [ -d "$TEMP_DIR/.codex/agents" ]; then
        for file in "$TEMP_DIR/.codex/agents/"*.toml; do
            [ -e "$file" ] || continue
            filename=$(basename "$file")
            if [ -f "$CODEX_DIR/agents/$filename" ]; then
                rm "$CODEX_DIR/agents/$filename"
                echo -e "  ${RED}[REMOVED]${NC} Agen $filename"
            fi
        done
    fi

    # 2. Bersihkan AGENTS.md Global
    remove_md_block "$CODEX_DIR/AGENTS.md"

    # 3. Bersihkan AGENTS.md di direktori proyek saat ini (jika ada)
    if [ -f "$(pwd)/AGENTS.md" ]; then
        remove_md_block "$(pwd)/AGENTS.md"
    fi

    # 4. Hapus Skills (Codex & Agents)
    if [ -d "$TEMP_DIR/skills" ]; then
        for skill_path in "$TEMP_DIR/skills/"*/; do
            [ -d "$skill_path" ] || continue
            skill_name=$(basename "$skill_path")
            if [ -d "$CODEX_DIR/skills/$skill_name" ]; then
                rm -rf "$CODEX_DIR/skills/$skill_name"
                echo -e "  ${RED}[REMOVED]${NC} Skill $skill_name (Codex)"
            fi
            if [ -d "$HOME/.agents/skills/$skill_name" ]; then
                rm -rf "$HOME/.agents/skills/$skill_name"
                echo -e "  ${RED}[REMOVED]${NC} Skill $skill_name (Agents)"
            fi
        done
    fi

    echo -e "\n  ${YELLOW}[PERHATIAN]${NC} File ~/.codex/config.toml TIDAK dihapus."
    echo -e "  Jika Anda ingin menghapus registrasi CodeBOT, silakan buka config.toml"
    echo -e "  dan hapus bagian [agents.orchestrator] hingga [agents.software-engineer]."
fi

# Pembersihan folder temporary
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}✅ PROSES UNINSTALL SELESAI!${NC}"
echo -e "Seluruh file CodeBOT telah dihapus. Konfigurasi pribadi Anda aman."