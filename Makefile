# ============================================================================
# TSiJUKEBOX - Makefile para Testes
# ============================================================================

.PHONY: help test test-watch test-ui test-unit test-integration \
        test-coverage test-e2e test-e2e-headed test-all \
        test-schemas test-spotify test-youtube test-lyrics test-jam test-playback \
        coverage-report clean-coverage setup-e2e install ci-test ci-coverage

# Cores para output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# ============================================================================
# Ajuda
# ============================================================================

help: ## Mostrar ajuda
	@echo "$(CYAN)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║          TSiJUKEBOX - Comandos de Teste                  ║$(NC)"
	@echo "$(CYAN)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# Testes Gerais
# ============================================================================

test: ## Executar todos os testes
	@echo "$(CYAN)▶ Executando todos os testes...$(NC)"
	npx vitest run

test-watch: ## Modo watch (desenvolvimento)
	@echo "$(CYAN)▶ Iniciando modo watch...$(NC)"
	npx vitest

test-ui: ## Abrir Vitest UI no navegador
	@echo "$(CYAN)▶ Abrindo Vitest UI...$(NC)"
	npx vitest --ui

test-unit: ## Apenas testes unitários
	@echo "$(CYAN)▶ Executando testes unitários...$(NC)"
	npx vitest run --exclude="**/*.integration.test.ts"

test-integration: ## Apenas testes de integração
	@echo "$(CYAN)▶ Executando testes de integração...$(NC)"
	npx vitest run --testPathPattern="integration"

test-coverage: ## Gerar relatório de cobertura
	@echo "$(CYAN)▶ Gerando relatório de cobertura...$(NC)"
	npx vitest run --coverage

test-e2e: ## Executar testes E2E (Playwright)
	@echo "$(CYAN)▶ Executando testes E2E...$(NC)"
	npx playwright test

test-e2e-headed: ## E2E com navegador visível
	@echo "$(CYAN)▶ Executando E2E com navegador...$(NC)"
	npx playwright test --headed

test-all: ## Executar todos (unit + integration + e2e)
	@echo "$(CYAN)▶ Executando suíte completa de testes...$(NC)"
	npx vitest run --coverage && npx playwright test

# ============================================================================
# Testes por Edge Function
# ============================================================================

test-schemas: ## Testes de schema (Zod validation)
	@echo "$(CYAN)▶ Executando testes de schema...$(NC)"
	npx vitest run src/test/schemas/

test-spotify: ## Testes da edge function spotify-auth
	@echo "$(CYAN)▶ Executando testes spotify-auth...$(NC)"
	npx vitest run --testPathPattern="spotify-auth"

test-youtube: ## Testes da edge function youtube-music-auth
	@echo "$(CYAN)▶ Executando testes youtube-music-auth...$(NC)"
	npx vitest run --testPathPattern="youtube-music-auth"

test-lyrics: ## Testes da edge function lyrics-search
	@echo "$(CYAN)▶ Executando testes lyrics-search...$(NC)"
	npx vitest run --testPathPattern="lyrics-search"

test-jam: ## Testes da edge function analyze-jam
	@echo "$(CYAN)▶ Executando testes analyze-jam...$(NC)"
	npx vitest run --testPathPattern="analyze-jam"

test-playback: ## Testes da edge function track-playback
	@echo "$(CYAN)▶ Executando testes track-playback...$(NC)"
	npx vitest run --testPathPattern="track-playback"

# ============================================================================
# Relatórios de Cobertura
# ============================================================================

coverage-report: ## Gerar e abrir dashboard de cobertura
	@echo "$(CYAN)▶ Gerando dashboard de cobertura...$(NC)"
	./scripts/coverage-report.sh

clean-coverage: ## Limpar relatórios de cobertura
	@echo "$(YELLOW)▶ Limpando relatórios de cobertura...$(NC)"
	rm -rf coverage/
	@echo "$(GREEN)✓ Relatórios removidos$(NC)"

# ============================================================================
# Instalação e Setup
# ============================================================================

setup-e2e: ## Instalar browsers do Playwright
	@echo "$(CYAN)▶ Instalando browsers Playwright...$(NC)"
	npx playwright install

install: ## Instalar dependências
	@echo "$(CYAN)▶ Instalando dependências...$(NC)"
	npm ci --legacy-peer-deps

# ============================================================================
# CI/CD
# ============================================================================

ci-test: ## Testes para CI (sem UI)
	@echo "$(CYAN)▶ Executando testes para CI...$(NC)"
	npx vitest run --reporter=verbose

ci-coverage: ## Coverage para CI (com JSON summary)
	@echo "$(CYAN)▶ Gerando coverage para CI...$(NC)"
	npx vitest run --coverage --reporter=verbose

# ============================================================================
# Atalhos
# ============================================================================

# ============================================================================
# Testes Python (Instalador)
# ============================================================================

test-python: ## Testes do instalador Python
	@echo "$(CYAN)▶ Executando testes Python do instalador...$(NC)"
	@cd scripts && \
		python3 -m pytest tests/ -v

test-python-coverage: ## Testes Python com cobertura
	@echo "$(CYAN)▶ Gerando cobertura Python...$(NC)"
	@cd scripts && \
		python3 -m pytest tests/ --cov=. --cov-report=html:../coverage-python --cov-report=term-missing

clean-python-coverage: ## Limpar cobertura Python
	@echo "$(YELLOW)▶ Limpando cobertura Python...$(NC)"
	rm -rf coverage-python/
	@echo "$(GREEN)✓ Cobertura Python removida$(NC)"

# ============================================================================
# Atalhos
# ============================================================================

t: test ## Atalho para test
tw: test-watch ## Atalho para test-watch
tc: test-coverage ## Atalho para test-coverage
tu: test-ui ## Atalho para test-ui
tp: test-python ## Atalho para test-python
