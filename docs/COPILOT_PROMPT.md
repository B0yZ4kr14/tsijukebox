# 🤖 Prompt para GitHub Copilot - TSiJUKEBOX

> **Instruções para execução via GitHub Copilot na interface web do repositório**

---

## 📋 Prompt Principal

Copie e cole o seguinte prompt no GitHub Copilot Chat na interface web do repositório:

---

```
Você é um assistente especializado em correção e otimização do projeto TSiJUKEBOX. Execute as seguintes tarefas em sequência para deixar o projeto pronto para produção:

## FASE 1: Correção de Erros de TypeScript

### 1.1 Instalar Tipos de Teste Faltantes
Execute no terminal:
```bash
pnpm add -D @testing-library/jest-dom @testing-library/react @types/testing-library__jest-dom
```

### 1.2 Corrigir Imports de Componentes UI
Nos arquivos que usam componentes como `Switch`, `Card`, `Button`, `Badge`, adicione os imports corretos:
```typescript
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
```

### 1.3 Corrigir Tipos de Props Inválidos
Substitua variantes inválidas:
- `variant="secondary"` → `variant="outline"` (em Badge)
- `variant="kiosk-outline"` → `variant="outline"`
- `variant="kiosk-primary"` → `variant="default"`

### 1.4 Adicionar Tipos Explícitos
Em funções com parâmetros sem tipo, adicione tipos explícitos:
```typescript
// Antes
.map(v => v.name)
// Depois
.map((v: any) => v.name)
```

### 1.5 Corrigir Arquivos de Teste
Adicione no início de cada arquivo `.test.tsx`:
```typescript
import '@testing-library/jest-dom';
```

---

## FASE 2: Atualização de Dependências

### 2.1 Atualizar Vite
```bash
pnpm up vite @vitejs/plugin-react-swc
```

### 2.2 Verificar Vulnerabilidades
```bash
pnpm audit
pnpm audit fix --force
```

---

## FASE 3: Validação Final

### 3.1 Executar Build
```bash
pnpm build
```

### 3.2 Verificar Tipos
```bash
pnpm tsc --noEmit
```

---

## FASE 4: Atualizar Wiki do GitHub

Crie as seguintes páginas no Wiki do repositório:

1. **Home.md** - Página inicial com navegação
2. **Installation-Guide.md** - Guia de instalação completo
3. **Configuration.md** - Configurações e variáveis de ambiente
4. **Design-System.md** - Tokens, cores e componentes
5. **Accessibility.md** - Conformidade WCAG e boas práticas
6. **API-Reference.md** - Documentação da API
7. **Contributing.md** - Como contribuir
8. **Troubleshooting.md** - Solução de problemas
9. **_Sidebar.md** - Navegação lateral
10. **_Footer.md** - Rodapé

Use o conteúdo dos arquivos na pasta `wiki/` do repositório.

---

## FASE 5: Commit e Push

```bash
git add .
git commit -m "feat: correções para produção e documentação completa

- Corrigidos erros de TypeScript (tipos, imports, props)
- Atualizadas dependências (Vite, esbuild)
- Adicionada documentação completa do Wiki
- Atualizado README.md com design moderno
- Adicionado script master-fix.py para correções automatizadas"
git push origin main
```

---

Confirme cada fase antes de prosseguir para a próxima.
```

---

## 🔧 Prompts Específicos por Tarefa

### Prompt para Correção de TypeScript

```
Analise os erros de TypeScript no projeto TSiJUKEBOX e corrija os seguintes tipos de erro:

1. TS2339: Property 'toBeInTheDocument' does not exist
   - Solução: Instalar @testing-library/jest-dom

2. TS2307: Cannot find module '@testing-library/react'
   - Solução: Instalar @testing-library/react

3. TS2304: Cannot find name 'Switch', 'Card', 'Button', 'Badge'
   - Solução: Adicionar imports corretos

4. TS2322: Type '"secondary"' is not assignable
   - Solução: Usar variantes válidas

5. TS7006: Parameter implicitly has 'any' type
   - Solução: Adicionar tipos explícitos

Execute as correções em ordem de prioridade.
```

### Prompt para Atualização de Dependências

```
Atualize as dependências do projeto TSiJUKEBOX para corrigir vulnerabilidades de segurança:

1. Atualize o Vite para a versão mais recente (7.x)
2. Verifique se o esbuild foi atualizado para >= 0.25.0
3. Execute pnpm audit para verificar vulnerabilidades restantes
4. Atualize outras dependências com vulnerabilidades conhecidas

Após cada atualização, execute pnpm build para verificar compatibilidade.
```

### Prompt para Criação do Wiki

```
Crie as páginas do Wiki do GitHub para o projeto TSiJUKEBOX usando o conteúdo da pasta wiki/:

1. Navegue até a aba Wiki do repositório
2. Crie a página Home com o conteúdo de wiki/Home.md
3. Crie as demais páginas na seguinte ordem:
   - Installation-Guide
   - Configuration
   - Design-System
   - Accessibility
   - API-Reference
   - Contributing
   - Troubleshooting
4. Configure a _Sidebar.md para navegação
5. Configure a _Footer.md para rodapé

Mantenha a formatação Markdown e os links internos.
```

### Prompt para Atualização do README

```
Atualize o README.md do projeto TSiJUKEBOX com o seguinte conteúdo:

1. Banner centralizado com logo
2. Badges de versão, licença e tecnologias
3. Links para documentação, demo, issues e discussões
4. Seção de características em tabela 2x2
5. Guia de início rápido com comandos
6. Estrutura do projeto em árvore
7. Tabela do Design System
8. Links para páginas do Wiki
9. Seção de contribuição
10. Licença e agradecimentos

Use o conteúdo do arquivo README.md atual como base.
```

---

## 📝 Checklist de Execução

Use este checklist para acompanhar o progresso:

- [ ] **TypeScript**
  - [ ] Tipos de teste instalados
  - [ ] Imports de UI corrigidos
  - [ ] Props inválidas corrigidas
  - [ ] Tipos explícitos adicionados
  - [ ] Arquivos de teste corrigidos

- [ ] **Dependências**
  - [ ] Vite atualizado
  - [ ] Vulnerabilidades corrigidas
  - [ ] Build passando

- [ ] **Documentação**
  - [ ] README.md atualizado
  - [ ] Wiki criado
  - [ ] CHANGELOG atualizado

- [ ] **Repositório**
  - [ ] Alterações commitadas
  - [ ] Push realizado
  - [ ] Wiki publicado

---

## 🚀 Execução Rápida

Para executar todas as correções de uma vez, use o script master-fix.py:

```bash
# Clone o repositório (se necessário)
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
cd TSiJUKEBOX

# Execute o script de correção completa
python3 scripts/master-fix.py --all

# Ou execute em modo dry-run primeiro
python3 scripts/master-fix.py --all --dry-run
```

---

## 📞 Suporte

Se encontrar problemas durante a execução:

1. Verifique os logs de erro
2. Consulte a documentação em `docs/`
3. Abra uma issue no repositório
4. Consulte o Troubleshooting no Wiki

---

**Autor:** Manus AI + B0yZ4kr14  
**Data:** 2025-12-25  
**Versão:** 1.0.0
