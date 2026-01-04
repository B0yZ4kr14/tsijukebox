#!/bin/bash
# =============================================================================
# TSiJUKEBOX - Setup CI/CD Workflow Script
# =============================================================================
# Este script automatiza a cópia do arquivo ci-cd-tests.yml para o diretório
# .github/workflows/ e faz o commit da alteração.
#
# Uso:
#   ./scripts/setup-cicd-workflow.sh [--dry-run] [--force]
#
# Opções:
#   --dry-run   Mostra o que seria feito sem executar
#   --force     Sobrescreve o arquivo existente sem perguntar
#   --help      Mostra esta mensagem de ajuda
#
# Autor: Manus AI
# Versão: 1.0.0
# Data: 24 de Dezembro de 2024
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variáveis
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SOURCE_FILE="$PROJECT_ROOT/docs/workflows/ci-cd-tests.yml"
TARGET_DIR="$PROJECT_ROOT/.github/workflows"
TARGET_FILE="$TARGET_DIR/ci-cd-tests.yml"

DRY_RUN=false
FORCE=false

# =============================================================================
# FUNÇÕES
# =============================================================================

print_header() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║           TSiJUKEBOX - Setup CI/CD Workflow Script                ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

show_help() {
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  --dry-run   Mostra o que seria feito sem executar"
    echo "  --force     Sobrescreve o arquivo existente sem perguntar"
    echo "  --help      Mostra esta mensagem de ajuda"
    echo ""
    echo "Descrição:"
    echo "  Este script copia o arquivo ci-cd-tests.yml de docs/workflows/"
    echo "  para .github/workflows/ e faz o commit da alteração."
    echo ""
    echo "Requisitos:"
    echo "  - Git instalado e configurado"
    echo "  - Permissão de escrita no repositório"
    echo "  - Arquivo fonte existente em docs/workflows/"
    echo ""
    echo "Secrets necessários no GitHub:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_ACCESS_TOKEN"
    echo "  - SUPABASE_PROJECT_ID"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - VERCEL_TOKEN"
    echo "  - VERCEL_ORG_ID"
    echo "  - VERCEL_PROJECT_ID"
    echo "  - CODECOV_TOKEN (opcional)"
    echo "  - SLACK_WEBHOOK_URL (opcional)"
}

check_prerequisites() {
    print_info "Verificando pré-requisitos..."
    
    # Verificar se está no diretório do projeto
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "Não foi possível encontrar o diretório raiz do projeto"
        exit 1
    fi
    print_success "Diretório do projeto encontrado: $PROJECT_ROOT"
    
    # Verificar se o arquivo fonte existe
    if [ ! -f "$SOURCE_FILE" ]; then
        print_error "Arquivo fonte não encontrado: $SOURCE_FILE"
        exit 1
    fi
    print_success "Arquivo fonte encontrado: $SOURCE_FILE"
    
    # Verificar se git está instalado
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado"
        exit 1
    fi
    print_success "Git está instalado"
    
    # Verificar se está em um repositório git
    if ! git -C "$PROJECT_ROOT" rev-parse --git-dir &> /dev/null; then
        print_error "Não está em um repositório Git"
        exit 1
    fi
    print_success "Repositório Git válido"
    
    # Verificar branch atual
    CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current)
    print_info "Branch atual: $CURRENT_BRANCH"
}

check_existing_file() {
    if [ -f "$TARGET_FILE" ]; then
        if [ "$FORCE" = true ]; then
            print_warning "Arquivo existente será sobrescrito (--force)"
            return 0
        fi
        
        print_warning "O arquivo já existe: $TARGET_FILE"
        
        # Comparar arquivos
        if cmp -s "$SOURCE_FILE" "$TARGET_FILE"; then
            print_info "Os arquivos são idênticos. Nenhuma ação necessária."
            exit 0
        fi
        
        echo ""
        read -p "Deseja sobrescrever o arquivo existente? (s/N) " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Operação cancelada pelo usuário"
            exit 0
        fi
    fi
}

copy_workflow_file() {
    print_info "Copiando arquivo de workflow..."
    
    if [ "$DRY_RUN" = true ]; then
        print_info "[DRY-RUN] Criaria diretório: $TARGET_DIR"
        print_info "[DRY-RUN] Copiaria: $SOURCE_FILE -> $TARGET_FILE"
        return 0
    fi
    
    # Criar diretório se não existir
    mkdir -p "$TARGET_DIR"
    print_success "Diretório criado/verificado: $TARGET_DIR"
    
    # Copiar arquivo
    cp "$SOURCE_FILE" "$TARGET_FILE"
    print_success "Arquivo copiado: $TARGET_FILE"
    
    # Verificar cópia
    if [ -f "$TARGET_FILE" ]; then
        print_success "Verificação: arquivo copiado com sucesso"
    else
        print_error "Falha na cópia do arquivo"
        exit 1
    fi
}

commit_changes() {
    print_info "Preparando commit..."
    
    # Verificar se há mudanças
    cd "$PROJECT_ROOT"
    
    if git diff --quiet "$TARGET_FILE" 2>/dev/null && git diff --cached --quiet "$TARGET_FILE" 2>/dev/null; then
        if [ -f "$TARGET_FILE" ] && git ls-files --error-unmatch "$TARGET_FILE" &>/dev/null; then
            print_info "Nenhuma mudança detectada no arquivo"
            return 0
        fi
    fi
    
    if [ "$DRY_RUN" = true ]; then
        print_info "[DRY-RUN] Adicionaria ao staging: $TARGET_FILE"
        print_info "[DRY-RUN] Faria commit com mensagem: 'ci: Adicionar pipeline CI/CD completo'"
        return 0
    fi
    
    # Adicionar ao staging
    git add "$TARGET_FILE"
    print_success "Arquivo adicionado ao staging"
    
    # Fazer commit
    COMMIT_MSG="ci: Adicionar pipeline CI/CD completo

- Configurar workflow de CI/CD com GitHub Actions
- Incluir testes de unidade, integração e E2E
- Configurar cobertura de código com Codecov
- Adicionar deploy automático para Vercel
- Configurar notificações de sucesso/falha

Jobs incluídos:
- Lint & Type Check
- Unit Tests (4 shards paralelos)
- Integration Tests (Supabase local)
- Edge Function Tests (Deno)
- E2E Tests (Playwright)
- Coverage Report
- Build
- Deploy Preview
- Deploy Production
- Notify Failure"

    git commit -m "$COMMIT_MSG"
    print_success "Commit realizado com sucesso"
    
    # Mostrar hash do commit
    COMMIT_HASH=$(git rev-parse --short HEAD)
    print_info "Commit hash: $COMMIT_HASH"
}

push_changes() {
    print_info "Deseja fazer push das alterações? (s/N)"
    
    if [ "$DRY_RUN" = true ]; then
        print_info "[DRY-RUN] Faria push para origin"
        return 0
    fi
    
    read -p "" -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Fazendo push..."
        
        CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current)
        
        if git push origin "$CURRENT_BRANCH"; then
            print_success "Push realizado com sucesso"
        else
            print_error "Falha no push. Verifique suas permissões."
            print_info "Você pode tentar manualmente: git push origin $CURRENT_BRANCH"
        fi
    else
        print_info "Push não realizado. Execute manualmente quando desejar:"
        print_info "  git push origin $(git branch --show-current)"
    fi
}

show_next_steps() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Setup concluído com sucesso!${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Próximos passos:${NC}"
    echo ""
    echo "1. Configure os secrets no GitHub:"
    echo "   Vá para: Settings > Secrets and variables > Actions"
    echo ""
    echo "   Secrets obrigatórios:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_ACCESS_TOKEN"
    echo "   - SUPABASE_PROJECT_ID"
    echo ""
    echo "   Secrets opcionais (para deploy):"
    echo "   - VERCEL_TOKEN"
    echo "   - VERCEL_ORG_ID"
    echo "   - VERCEL_PROJECT_ID"
    echo "   - CODECOV_TOKEN"
    echo "   - SLACK_WEBHOOK_URL"
    echo ""
    echo "2. Verifique o workflow no GitHub Actions:"
    echo "   https://github.com/B0yZ4kr14/tsijukebox/actions"
    echo ""
    echo "3. O pipeline será executado automaticamente em:"
    echo "   - Push para main, develop, feature/*, release/*"
    echo "   - Pull Requests para main ou develop"
    echo "   - Execução manual via workflow_dispatch"
    echo ""
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    # Processar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                print_error "Opção desconhecida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header
    
    if [ "$DRY_RUN" = true ]; then
        print_warning "Modo DRY-RUN ativado - nenhuma alteração será feita"
        echo ""
    fi
    
    check_prerequisites
    echo ""
    
    check_existing_file
    echo ""
    
    copy_workflow_file
    echo ""
    
    commit_changes
    echo ""
    
    push_changes
    
    if [ "$DRY_RUN" = false ]; then
        show_next_steps
    fi
}

# Executar main
main "$@"
