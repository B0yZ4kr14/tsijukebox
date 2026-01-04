# 🤖 Prompt Seguro para GitHub Copilot - TSiJUKEBOX

> **IMPORTANTE:** Este prompt foi projetado para ser executado pelo GitHub Copilot na interface web do repositório, garantindo que **NENHUM conteúdo existente seja alterado, removido ou refatorado**.

---

## ⚠️ REGRAS DE SEGURANÇA (OBRIGATÓRIAS)

Antes de executar qualquer ação, o Copilot **DEVE** seguir estas regras:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         REGRAS DE PRESERVAÇÃO                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 1. NÃO REMOVER arquivos existentes                                           ║
║ 2. NÃO ALTERAR código existente sem solicitação explícita                    ║
║ 3. NÃO REFATORAR código ou estrutura do projeto                              ║
║ 4. NÃO EXCLUIR documentação existente                                        ║
║ 5. NÃO MODIFICAR configurações de build ou deploy                            ║
║ 6. APENAS ADICIONAR novos recursos quando solicitado                         ║
║ 7. SEMPRE fazer backup antes de qualquer alteração                           ║
║ 8. SEMPRE validar scripts antes de executar                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 Prompt Principal (Copie e Cole)

```markdown
# Instruções para GitHub Copilot - TSiJUKEBOX

## CONTEXTO
Você está trabalhando no repositório TSiJUKEBOX, um sistema de música kiosk empresarial.
O projeto já possui código, documentação e scripts funcionais que NÃO devem ser alterados.

## REGRAS OBRIGATÓRIAS
1. **PRESERVAR** todo o conteúdo existente
2. **NÃO REMOVER** arquivos, funções ou documentação
3. **NÃO REFATORAR** código sem solicitação explícita
4. **APENAS ADICIONAR** novos recursos quando solicitado
5. **VALIDAR** scripts antes de executar

## TAREFA: Validar e Executar Scripts de Correção

### Passo 1: Localizar o Script Master-Fix
```bash
ls -la scripts/master-fix.py
```

### Passo 2: Validar o Script (Dry-Run)
```bash
python3 scripts/master-fix.py --dry-run --verbose
```

### Passo 3: Revisar Saída
- Verificar se não há erros
- Confirmar que nenhum arquivo será removido
- Validar que apenas correções serão aplicadas

### Passo 4: Executar Script (Se Validação OK)
```bash
python3 scripts/master-fix.py --all
```

### Passo 5: Validar Build
```bash
pnpm build
```

### Passo 6: Commit das Alterações
```bash
git add .
git commit -m "fix: aplicar correções do master-fix.py"
git push origin main
```

## IMPORTANTE
- Se qualquer passo falhar, PARE e reporte o erro
- NÃO tente corrigir erros automaticamente
- NÃO modifique arquivos que não foram criados pelo script
```

---

## 🧪 Prompt para Testes UAT

```markdown
# Instruções para Executar Testes UAT

## CONTEXTO
Executar os testes de aceitação do usuário para validar a instalação autônoma.

## REGRAS
1. Executar APENAS em modo dry-run primeiro
2. NÃO modificar o script de testes
3. Gerar relatório após execução

## PASSOS

### Passo 1: Listar Testes Disponíveis
```bash
python3 scripts/uat-installation-tests.py --list
```

### Passo 2: Executar Testes em Dry-Run
```bash
python3 scripts/uat-installation-tests.py --all --dry-run --report
```

### Passo 3: Revisar Relatório
```bash
cat docs/test-reports/uat-installation-report_*.md
```

### Passo 4: Se Dry-Run OK, Executar Testes Reais (Opcional)
```bash
sudo python3 scripts/uat-installation-tests.py --all --report
```
```

---

## 📚 Prompt para Atualizar Wiki

```markdown
# Instruções para Atualizar Wiki do GitHub

## CONTEXTO
Publicar as páginas do Wiki que estão na pasta wiki/ do repositório.

## REGRAS
1. NÃO modificar o conteúdo das páginas
2. APENAS copiar para o Wiki do GitHub
3. Manter a estrutura de navegação

## PASSOS

### Passo 1: Verificar Páginas Disponíveis
```bash
ls -la wiki/
```

### Passo 2: Clonar Wiki do Repositório
```bash
git clone https://github.com/B0yZ4kr14/tsijukebox.wiki.git
```

### Passo 3: Copiar Páginas
```bash
cp wiki/*.md tsijukebox.wiki/
```

### Passo 4: Commit e Push
```bash
cd tsijukebox.wiki
git add .
git commit -m "docs: atualizar páginas do Wiki"
git push origin master
```
```

---

## 🔒 Checklist de Segurança

Antes de executar qualquer comando, verifique:

- [ ] O comando NÃO contém `rm -rf` ou `rm -r`
- [ ] O comando NÃO contém `> arquivo` (sobrescrita)
- [ ] O comando NÃO altera arquivos de configuração críticos
- [ ] O comando foi testado em dry-run primeiro
- [ ] Existe backup dos arquivos afetados

---

## 📊 Scripts Disponíveis no Repositório

| Script | Descrição | Comando de Validação |
|--------|-----------|---------------------|
| `master-fix.py` | Correções consolidadas | `python3 scripts/master-fix.py --dry-run` |
| `uat-installation-tests.py` | Testes UAT de instalação | `python3 scripts/uat-installation-tests.py --list` |
| `unified-installer.py` | Instalador de produção | `python3 scripts/unified-installer.py --dry-run` |
| `contrast_analyzer.py` | Análise de contraste | `python3 scripts/contrast_analyzer.py --help` |
| `false_positive_filter.py` | Filtro de falsos positivos | `python3 scripts/false_positive_filter.py --dry-run` |

---

## ⚡ Comandos Rápidos (Seguros)

```bash
# Verificar status do projeto
pnpm build && echo "Build OK"

# Verificar tipos TypeScript
pnpm tsc --noEmit 2>&1 | grep -c "error" || echo "0 erros"

# Verificar acessibilidade
grep -rn 'aria-label' src/ | wc -l

# Gerar relatório de status
python3 scripts/master-fix.py --report
```

---

## 🚫 Comandos Proibidos

Os seguintes comandos **NUNCA** devem ser executados:

```bash
# PROIBIDO - Remove arquivos
rm -rf *
rm -r src/

# PROIBIDO - Sobrescreve configurações
echo "" > package.json
cat /dev/null > .env

# PROIBIDO - Força alterações
git push --force
git reset --hard

# PROIBIDO - Reinstala tudo
rm -rf node_modules && rm pnpm-lock.yaml
```

---

## 📞 Suporte

Se encontrar problemas:

1. **NÃO** tente corrigir automaticamente
2. Reporte o erro completo
3. Aguarde instruções do usuário

---

**Autor:** Manus AI + B0yZ4kr14
**Data:** 2025-12-25
**Versão:** 1.0.0
