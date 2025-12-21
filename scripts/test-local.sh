#!/bin/bash
#
# TSiJUKEBOX - Local Test Runner
# Compatível com Arch Linux, CachyOS, Manjaro e derivados
#
# Uso: ./scripts/test-local.sh [comando]
#
# Comandos:
#   unit         - Executar testes unitários
#   integration  - Executar testes de integração
#   e2e          - Executar testes E2E (Playwright)
#   e2e:headed   - Executar E2E com navegador visível
#   coverage     - Gerar relatório de cobertura
#   all          - Executar todos os testes
#   install      - Instalar dependências
#   help         - Mostrar esta ajuda
#

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║           TSiJUKEBOX - Test Runner                       ║"
    echo "║           CachyOS / Arch Linux                           ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js não encontrado!${NC}"
        echo ""
        echo "Instale com:"
        echo "  sudo pacman -S nodejs npm"
        echo ""
        echo "Ou via nvm:"
        echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "  nvm install 20"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}⚠️  Node.js versão $NODE_VERSION detectada. Recomendado: 18+${NC}"
    else
        echo -e "${GREEN}✅ Node.js $(node -v) encontrado${NC}"
    fi
}

# Verificar npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm não encontrado!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm $(npm -v) encontrado${NC}"
}

# Verificar dependências de sistema para Playwright
check_playwright_deps() {
    echo -e "${BLUE}Verificando dependências do Playwright...${NC}"
    
    MISSING_DEPS=()
    
    # Verificar bibliotecas necessárias para Chromium
    if ! ldconfig -p | grep -q "libnss3"; then
        MISSING_DEPS+=("nss")
    fi
    if ! ldconfig -p | grep -q "libatk-1.0"; then
        MISSING_DEPS+=("at-spi2-atk")
    fi
    if ! ldconfig -p | grep -q "libcups"; then
        MISSING_DEPS+=("cups")
    fi
    if ! ldconfig -p | grep -q "libdrm"; then
        MISSING_DEPS+=("libdrm")
    fi
    if ! ldconfig -p | grep -q "libxkbcommon"; then
        MISSING_DEPS+=("libxkbcommon")
    fi
    
    if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Dependências faltando para Playwright:${NC}"
        echo "   sudo pacman -S ${MISSING_DEPS[*]}"
        echo ""
    else
        echo -e "${GREEN}✅ Dependências do Playwright OK${NC}"
    fi
}

# Instalar dependências do projeto
install_deps() {
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    npm ci --legacy-peer-deps
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
}

# Instalar browsers do Playwright
install_playwright() {
    echo -e "${BLUE}🎭 Instalando Playwright browsers...${NC}"
    npx playwright install chromium
    echo -e "${GREEN}✅ Playwright pronto${NC}"
}

# Executar testes unitários
run_unit() {
    echo -e "${BLUE}🧪 Executando testes unitários...${NC}"
    npx vitest run --exclude="**/*.integration.test.ts" --reporter=verbose
}

# Executar testes de integração
run_integration() {
    echo -e "${BLUE}🔗 Executando testes de integração...${NC}"
    npx vitest run --testPathPattern="integration" --reporter=verbose
}

# Executar testes E2E
run_e2e() {
    echo -e "${BLUE}🎭 Executando testes E2E...${NC}"
    npx playwright test
}

# Executar testes E2E com navegador visível
run_e2e_headed() {
    echo -e "${BLUE}🎭 Executando testes E2E (headed)...${NC}"
    npx playwright test --headed
}

# Gerar relatório de cobertura
run_coverage() {
    echo -e "${BLUE}📊 Gerando relatório de cobertura...${NC}"
    npx vitest run --coverage
    
    if [ -f "coverage/index.html" ]; then
        echo ""
        echo -e "${GREEN}✅ Relatório gerado em: coverage/index.html${NC}"
        echo ""
        
        # Tentar abrir no navegador
        if command -v xdg-open &> /dev/null; then
            read -p "Abrir relatório no navegador? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                xdg-open coverage/index.html
            fi
        fi
    fi
}

# Executar todos os testes
run_all() {
    echo -e "${BLUE}🚀 Executando todos os testes...${NC}"
    echo ""
    
    echo -e "${CYAN}[1/4] Testes Unitários${NC}"
    run_unit
    echo ""
    
    echo -e "${CYAN}[2/4] Testes de Integração${NC}"
    run_integration
    echo ""
    
    echo -e "${CYAN}[3/4] Cobertura${NC}"
    run_coverage
    echo ""
    
    echo -e "${CYAN}[4/4] Testes E2E${NC}"
    run_e2e
    echo ""
    
    echo -e "${GREEN}✅ Todos os testes concluídos!${NC}"
}

# Mostrar ajuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  unit         Executar testes unitários"
    echo "  integration  Executar testes de integração"
    echo "  e2e          Executar testes E2E (Playwright)"
    echo "  e2e:headed   Executar E2E com navegador visível"
    echo "  coverage     Gerar relatório de cobertura"
    echo "  all          Executar todos os testes"
    echo "  install      Instalar dependências"
    echo "  check        Verificar ambiente"
    echo "  help         Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 unit          # Rodar testes unitários"
    echo "  $0 coverage      # Gerar cobertura"
    echo "  $0 e2e:headed    # E2E com navegador"
}

# Verificar ambiente
check_env() {
    print_banner
    echo -e "${BLUE}Verificando ambiente...${NC}"
    echo ""
    check_node
    check_npm
    check_playwright_deps
    echo ""
    echo -e "${GREEN}✅ Ambiente verificado${NC}"
}

# Main
main() {
    case "${1:-help}" in
        unit)
            print_banner
            run_unit
            ;;
        integration)
            print_banner
            run_integration
            ;;
        e2e)
            print_banner
            run_e2e
            ;;
        e2e:headed)
            print_banner
            run_e2e_headed
            ;;
        coverage)
            print_banner
            run_coverage
            ;;
        all)
            print_banner
            run_all
            ;;
        install)
            print_banner
            check_env
            install_deps
            install_playwright
            ;;
        check)
            check_env
            ;;
        help|--help|-h)
            print_banner
            show_help
            ;;
        *)
            echo -e "${RED}Comando desconhecido: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
