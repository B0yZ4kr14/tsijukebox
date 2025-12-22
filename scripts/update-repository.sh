#!/bin/bash
# =============================================================================
# TSiJUKEBOX - Script de Atualização do Repositório
# =============================================================================
# Automatiza commit e push de alterações para o repositório GitHub.
#
# USO:
#   ./scripts/update-repository.sh [mensagem de commit]
#   ./scripts/update-repository.sh "feat: Add new feature"
#
# OPÇÕES:
#   -h, --help      Mostra esta ajuda
#   -d, --dry-run   Mostra o que seria feito sem executar
#   -f, --force     Força push (use com cuidado!)
#   -t, --tag       Cria tag com a versão atual
#
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variáveis
DRY_RUN=false
FORCE_PUSH=false
CREATE_TAG=false
COMMIT_MSG=""

# Funções de log
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${CYAN}🔧 $1${NC}"; }

# Mostrar ajuda
show_help() {
    head -25 "$0" | tail -20
    exit 0
}

# Parse argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE_PUSH=true
            shift
            ;;
        -t|--tag)
            CREATE_TAG=true
            shift
            ;;
        *)
            COMMIT_MSG="$1"
            shift
            ;;
    esac
done

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      📦 TSiJUKEBOX - Atualização de Repositório             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    log_error "Não é um repositório Git. Execute a partir da raiz do projeto."
    exit 1
fi

# Obter branch atual
CURRENT_BRANCH=$(git branch --show-current)
log_info "Branch atual: ${CURRENT_BRANCH}"

# Verificar status
log_step "Verificando status do repositório..."
echo ""
git status --short

# Contar alterações
CHANGES=$(git status --porcelain | wc -l)
if [ "$CHANGES" -eq 0 ]; then
    log_info "Nenhuma alteração para commit."
    exit 0
fi

log_info "Encontradas $CHANGES alterações."
echo ""

# Mensagem de commit padrão
if [ -z "$COMMIT_MSG" ]; then
    # Gerar mensagem baseada nas alterações
    ADDED=$(git status --porcelain | grep -c "^A" || true)
    MODIFIED=$(git status --porcelain | grep -c "^M" || true)
    DELETED=$(git status --porcelain | grep -c "^D" || true)
    
    COMMIT_MSG="chore: Update project files"
    
    if [ "$ADDED" -gt 0 ]; then
        COMMIT_MSG="feat: Add $ADDED new file(s)"
    elif [ "$MODIFIED" -gt 0 ]; then
        COMMIT_MSG="refactor: Update $MODIFIED file(s)"
    fi
    
    log_info "Mensagem de commit gerada: $COMMIT_MSG"
fi

# Dry run - apenas mostra o que seria feito
if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Os seguintes comandos seriam executados:"
    echo ""
    echo "  git add -A"
    echo "  git commit -m \"$COMMIT_MSG\""
    if [ "$FORCE_PUSH" = true ]; then
        echo "  git push origin $CURRENT_BRANCH --force"
    else
        echo "  git push origin $CURRENT_BRANCH"
    fi
    if [ "$CREATE_TAG" = true ]; then
        VERSION=$(grep -o 'VERSION = "[^"]*"' scripts/install.py | cut -d'"' -f2 || echo "v1.0.0")
        echo "  git tag -a $VERSION -m \"Release $VERSION\""
        echo "  git push origin $VERSION"
    fi
    echo ""
    exit 0
fi

# Adicionar todas as alterações
log_step "Adicionando alterações..."
git add -A

# Commit
log_step "Criando commit..."
git commit -m "$COMMIT_MSG"

# Push
log_step "Enviando para origin/$CURRENT_BRANCH..."
if [ "$FORCE_PUSH" = true ]; then
    log_warning "Executando force push!"
    git push origin "$CURRENT_BRANCH" --force
else
    git push origin "$CURRENT_BRANCH"
fi

# Criar tag se solicitado
if [ "$CREATE_TAG" = true ]; then
    # Extrair versão do install.py
    VERSION=$(grep -o 'VERSION = "[^"]*"' scripts/install.py | cut -d'"' -f2 || echo "v1.0.0")
    
    log_step "Criando tag $VERSION..."
    git tag -a "$VERSION" -m "Release $VERSION"
    git push origin "$VERSION"
    log_success "Tag $VERSION criada e enviada."
fi

echo ""
log_success "Repositório atualizado com sucesso!"
echo ""

# Mostrar último commit
log_info "Último commit:"
git log -1 --oneline

echo ""
