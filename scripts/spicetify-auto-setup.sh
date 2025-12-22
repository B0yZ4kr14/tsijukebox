#!/bin/bash
# ============================================
# TSiJUKEBOX Enterprise - Spicetify Auto-Setup
# ============================================
# Script standalone para configurar automaticamente o Spicetify
# Detecta caminhos do Spotify baseado no usuário atual
#
# Uso:
#   sudo bash spicetify-auto-setup.sh
#   # ou
#   ./spicetify-auto-setup.sh  (se já tiver permissões)
#
# Autor: TSiJUKEBOX Team
# Licença: Domínio Público
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     🎵 TSiJUKEBOX - Spicetify Auto-Setup                 ║"
echo "║     Configuração automática do Spicetify                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# DETECÇÃO DE USUÁRIO
# ============================================

if [ "$EUID" -eq 0 ]; then
    # Se root, usar SUDO_USER ou detectar
    if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
        TARGET_USER="$SUDO_USER"
    else
        # Tentar detectar primeiro usuário logado
        TARGET_USER=$(who | head -1 | awk '{print $1}' 2>/dev/null || echo "")
        
        if [ -z "$TARGET_USER" ] || [ "$TARGET_USER" == "root" ]; then
            # Fallback: primeiro usuário com UID >= 1000
            TARGET_USER=$(awk -F: '$3 >= 1000 && $3 < 60000 {print $1; exit}' /etc/passwd)
        fi
    fi
    RUN_AS_USER="sudo -u $TARGET_USER"
else
    TARGET_USER="$USER"
    RUN_AS_USER=""
fi

USER_HOME=$(eval echo ~$TARGET_USER)

echo -e "${BLUE}→ Usuário alvo:${NC} $TARGET_USER"
echo -e "${BLUE}→ Home:${NC} $USER_HOME"
echo ""

# ============================================
# FUNÇÕES DE DETECÇÃO
# ============================================

detect_spotify_path() {
    local paths=(
        "$USER_HOME/.local/share/spotify-launcher/install/usr/share/spotify"
        "/opt/spotify"
        "/opt/spotify-dev"
        "/usr/share/spotify"
        "$USER_HOME/.var/app/com.spotify.Client/config/spotify"
        "/snap/spotify/current/usr/share/spotify"
    )
    
    for p in "${paths[@]}"; do
        if [ -d "$p" ] && [ -d "$p/Apps" ]; then
            echo "$p"
            return 0
        fi
    done
    
    # Fallback: procurar via which
    local spotify_bin=$(which spotify 2>/dev/null)
    if [ -n "$spotify_bin" ]; then
        local resolved=$(readlink -f "$spotify_bin" 2>/dev/null || echo "$spotify_bin")
        local base_dir=$(dirname "$resolved")
        
        # Procurar diretório Apps nos parents
        while [ "$base_dir" != "/" ]; do
            if [ -d "$base_dir/Apps" ]; then
                echo "$base_dir"
                return 0
            fi
            base_dir=$(dirname "$base_dir")
        done
    fi
    
    return 1
}

detect_prefs_path() {
    local paths=(
        "$USER_HOME/.config/spotify/prefs"
        "$USER_HOME/.var/app/com.spotify.Client/config/spotify/prefs"
        "$USER_HOME/snap/spotify/current/.config/spotify/prefs"
        "$USER_HOME/.spotify/prefs"
    )
    
    for p in "${paths[@]}"; do
        if [ -f "$p" ]; then
            echo "$p"
            return 0
        fi
    done
    
    # Fallback: procurar recursivamente
    local found=$(find "$USER_HOME/.config" "$USER_HOME/.var" "$USER_HOME/.local" \
        -name "prefs" -type f 2>/dev/null | grep -i spotify | head -1)
    
    if [ -n "$found" ]; then
        echo "$found"
        return 0
    fi
    
    return 1
}

start_spotify_briefly() {
    echo -e "${YELLOW}→ Iniciando Spotify para criar arquivo de configuração...${NC}"
    
    if [ "$EUID" -eq 0 ]; then
        $RUN_AS_USER spotify --no-zygote &>/dev/null &
    else
        spotify --no-zygote &>/dev/null &
    fi
    
    local spotify_pid=$!
    sleep 5
    
    # Encerrar Spotify
    pkill -f spotify 2>/dev/null || true
    sleep 1
    
    echo -e "${GREEN}✓ Spotify iniciado e encerrado${NC}"
}

# ============================================
# VERIFICAÇÕES INICIAIS
# ============================================

echo -e "${BLUE}📍 Verificando dependências...${NC}"

# Verificar Spotify
if ! command -v spotify &> /dev/null; then
    echo -e "${RED}❌ Spotify não está instalado!${NC}"
    echo "   Instale com: pacman -S spotify-launcher"
    echo "   Ou: paru -S spotify"
    exit 1
fi
echo -e "${GREEN}✓ Spotify instalado${NC}"

# Verificar Spicetify
if ! command -v spicetify &> /dev/null; then
    echo -e "${RED}❌ Spicetify não está instalado!${NC}"
    echo "   Instalando Spicetify..."
    
    if [ "$EUID" -eq 0 ]; then
        $RUN_AS_USER bash -c 'curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh'
    else
        curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
    fi
    
    if ! command -v spicetify &> /dev/null; then
        echo -e "${RED}❌ Falha ao instalar Spicetify${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Spicetify instalado${NC}"
echo ""

# ============================================
# DETECÇÃO DE CAMINHOS
# ============================================

echo -e "${BLUE}📍 Detectando caminhos do Spotify...${NC}"

SPOTIFY_PATH=$(detect_spotify_path) || {
    echo -e "${RED}❌ Não foi possível detectar o caminho do Spotify!${NC}"
    echo "   Por favor, forneça o caminho manualmente:"
    echo "   spicetify config spotify_path <caminho>"
    exit 1
}
echo -e "${GREEN}✓ Spotify encontrado:${NC} $SPOTIFY_PATH"

PREFS_PATH=$(detect_prefs_path) || {
    echo -e "${YELLOW}⚠️  Arquivo prefs não encontrado${NC}"
    start_spotify_briefly
    
    PREFS_PATH=$(detect_prefs_path) || {
        echo -e "${RED}❌ Ainda não foi possível encontrar o arquivo prefs${NC}"
        echo "   Inicie o Spotify manualmente e tente novamente."
        exit 1
    }
}
echo -e "${GREEN}✓ Prefs encontrado:${NC} $PREFS_PATH"
echo ""

# ============================================
# CONFIGURAÇÃO DE PERMISSÕES
# ============================================

echo -e "${BLUE}🔐 Configurando permissões...${NC}"

if [ "$EUID" -eq 0 ]; then
    chmod a+wr "$SPOTIFY_PATH" 2>/dev/null || true
    chmod -R a+wr "$SPOTIFY_PATH/Apps" 2>/dev/null || true
    echo -e "${GREEN}✓ Permissões configuradas via root${NC}"
else
    if [ -w "$SPOTIFY_PATH" ]; then
        echo -e "${GREEN}✓ Permissões já estão OK${NC}"
    else
        echo -e "${YELLOW}→ Solicitando permissões via sudo...${NC}"
        sudo chmod a+wr "$SPOTIFY_PATH" 2>/dev/null || true
        sudo chmod -R a+wr "$SPOTIFY_PATH/Apps" 2>/dev/null || true
        echo -e "${GREEN}✓ Permissões configuradas${NC}"
    fi
fi
echo ""

# ============================================
# CONFIGURAÇÃO DO SPICETIFY
# ============================================

echo -e "${BLUE}⚙️  Configurando Spicetify...${NC}"

if [ "$EUID" -eq 0 ]; then
    $RUN_AS_USER spicetify config spotify_path "$SPOTIFY_PATH"
    $RUN_AS_USER spicetify config prefs_path "$PREFS_PATH"
else
    spicetify config spotify_path "$SPOTIFY_PATH"
    spicetify config prefs_path "$PREFS_PATH"
fi

echo -e "${GREEN}✓ Caminhos configurados${NC}"
echo ""

# ============================================
# BACKUP E APPLY
# ============================================

echo -e "${BLUE}💾 Criando backup e aplicando customizações...${NC}"

apply_spicetify() {
    if [ "$EUID" -eq 0 ]; then
        $RUN_AS_USER spicetify backup apply
    else
        spicetify backup apply
    fi
}

if apply_spicetify; then
    echo -e "${GREEN}✓ Spicetify aplicado com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  Primeira tentativa falhou, restaurando e tentando novamente...${NC}"
    
    if [ "$EUID" -eq 0 ]; then
        $RUN_AS_USER spicetify restore 2>/dev/null || true
        sleep 1
        $RUN_AS_USER spicetify backup apply
    else
        spicetify restore 2>/dev/null || true
        sleep 1
        spicetify backup apply
    fi
    
    echo -e "${GREEN}✓ Spicetify aplicado na segunda tentativa${NC}"
fi
echo ""

# ============================================
# INSTALAÇÃO DO MARKETPLACE (OPCIONAL)
# ============================================

echo -e "${BLUE}🏪 Instalando Spicetify Marketplace...${NC}"

MARKETPLACE_CMD="curl -fsSL https://raw.githubusercontent.com/spicetify/marketplace/main/resources/install.sh | sh"

if [ "$EUID" -eq 0 ]; then
    $RUN_AS_USER bash -c "$MARKETPLACE_CMD" 2>/dev/null || true
else
    bash -c "$MARKETPLACE_CMD" 2>/dev/null || true
fi

echo -e "${GREEN}✓ Marketplace instalado${NC}"
echo ""

# ============================================
# RESUMO FINAL
# ============================================

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ CONFIGURAÇÃO COMPLETA               ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Spotify Path:  $SPOTIFY_PATH"
echo "║  Prefs Path:    $PREFS_PATH"
echo "║  Usuário:       $TARGET_USER"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Próximos passos:                                         ║"
echo "║  1. Abra o Spotify                                        ║"
echo "║  2. Acesse o Marketplace (menu lateral)                   ║"
echo "║  3. Instale temas e extensões!                            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}🎉 Spicetify configurado com sucesso para TSiJUKEBOX!${NC}"
