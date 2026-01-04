# 📋 Plano de Ação - Correção de Opacidade para Acessibilidade

**Projeto:** TSiJUKEBOX  
**Data:** 2025-12-25  
**Autor:** Auditoria Automatizada  

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de ocorrências** | 107 |
| **Requer correção** | 13 |
| **Requer análise** | 74 |
| **Não requer ação** | 20 |
| **Tempo estimado total** | ~4.8 horas |

---

## 🚨 Classificação por Severidade

| Severidade | Padrão | Ocorrências | Contraste Efetivo |
|------------|--------|-------------|-------------------|
| 🔴 CRÍTICA | `opacity-30` | 15 | ~2.5:1 (FALHA) |
| 🔴 CRÍTICA | `opacity-40` | 1 | ~3.2:1 (FALHA) |
| 🟠 ALTA | `opacity-50` | 85 | ~4.0:1 (FALHA) |
| 🟡 MÉDIA | `opacity-60` | 6 | ~5.5:1 (PASSA) |

---

## 📋 Classificação por Categoria

| Categoria | Ocorrências | Ação | Prioridade |
|-----------|-------------|------|------------|
| **TEXTO** | 13 | ⚠️ CORRIGIR | Alta |
| **OUTRO** | 74 | 🟡 ANALISAR | Média |
| **DISABLED** | 13 | ✅ OK | - |
| **ÍCONE** | 5 | ✅ OK | - |
| **HOVER** | 2 | ✅ OK | - |

---

## 🎯 Fase 1: Correções Críticas (Prioridade Alta)

### 1.1 Corrigir `opacity-30` (15 ocorrências)

**Tempo estimado:** 45 minutos

| Arquivo | Linha | Ação Recomendada |
|---------|-------|------------------|
| `GlobalSearchModal.tsx` | 2 | Substituir por `text-muted/70` |
| `YouTubeMusicLibrary.tsx` | 4 | Substituir por `text-muted/70` |
| `calendar.tsx` | 1 | Verificar se é estado disabled |
| Outros | 8 | Analisar contexto |

**Solução padrão:**
```tsx
// ❌ Antes
<span className="opacity-30">Texto</span>

// ✅ Depois - Opção 1: Cor sólida
<span className="text-zinc-600 dark:text-zinc-400">Texto</span>

// ✅ Depois - Opção 2: Variável CSS
<span className="text-[hsl(var(--muted-foreground)/0.7)]">Texto</span>
```

### 1.2 Corrigir `opacity-40` (1 ocorrência)

**Tempo estimado:** 5 minutos

| Arquivo | Ação |
|---------|------|
| Identificar arquivo | Substituir por cor sólida |

---

## 🎯 Fase 2: Correções de Alta Prioridade (85 ocorrências)

### 2.1 Análise de `opacity-50`

**Tempo estimado:** 2 horas

#### Arquivos com mais ocorrências:

| Arquivo | Ocorrências | Categoria | Ação |
|---------|-------------|-----------|------|
| `LibraryPanel.tsx` | 4 | OUTRO | Analisar |
| `PlayerControls.tsx` | 4 | DISABLED | ✅ OK |
| `calendar.tsx` | 3 | TEXTO | Corrigir |
| `sidebar.tsx` | 4 | OUTRO | Analisar |
| `command.tsx` | 3 | MISTO | Analisar |
| `context-menu.tsx` | 3 | OUTRO | Analisar |
| `dropdown-menu.tsx` | 3 | OUTRO | Analisar |
| `menubar.tsx` | 3 | OUTRO | Analisar |
| `themed/index.tsx` | 3 | DISABLED | ✅ OK |

#### Regras de decisão:

1. **Se `disabled` ou `cursor-not-allowed`** → ✅ Manter (estado visual válido)
2. **Se `hover:` ou `group-hover`** → ✅ Manter (efeito de interação)
3. **Se ícone decorativo** → ✅ Manter (não afeta leitura)
4. **Se texto legível** → ⚠️ Corrigir para cor sólida
5. **Se background/border** → 🟡 Verificar contexto

---

## 🎯 Fase 3: Correções de Média Prioridade (6 ocorrências)

### 3.1 Análise de `opacity-60`

**Tempo estimado:** 20 minutos

`opacity-60` resulta em contraste ~5.5:1, que **passa** WCAG AA para texto normal.

**Ação:** Verificar se está aplicado a texto pequeno ou em contextos críticos.

---

## 📁 Arquivos Prioritários (Top 10)

| # | Arquivo | Ocorrências | Complexidade | Tempo Est. |
|---|---------|-------------|--------------|------------|
| 1 | `calendar.tsx` | 4 | 🟡 Média | 15 min |
| 2 | `LibraryPanel.tsx` | 4 | 🟡 Média | 15 min |
| 3 | `YouTubeMusicLibrary.tsx` | 4 | 🔴 Alta | 20 min |
| 4 | `sidebar.tsx` | 4 | 🟡 Média | 15 min |
| 5 | `command.tsx` | 3 | 🟢 Baixa | 10 min |
| 6 | `context-menu.tsx` | 3 | 🟢 Baixa | 10 min |
| 7 | `dropdown-menu.tsx` | 3 | 🟢 Baixa | 10 min |
| 8 | `GlobalSearchModal.tsx` | 2 | 🔴 Alta | 15 min |
| 9 | `QueuePanel.tsx` | 3 | 🟡 Média | 10 min |
| 10 | `ScriptRefactorSection.tsx` | 3 | 🟡 Média | 10 min |

---

## 🔧 Soluções Recomendadas

### Substituições de Cor

| Padrão Original | Substituição Recomendada | Contraste |
|-----------------|--------------------------|-----------|
| `opacity-30` | `text-zinc-600 dark:text-zinc-400` | ~4.5:1 |
| `opacity-40` | `text-zinc-500 dark:text-zinc-400` | ~4.5:1 |
| `opacity-50` | `text-zinc-500 dark:text-zinc-300` | ~5.0:1 |
| `opacity-60` | ✅ Manter ou `text-muted` | ~5.5:1 |

### Criar Utilitário CSS

```css
/* src/index.css */
@layer utilities {
  .text-subtle {
    color: hsl(var(--muted-foreground) / 0.7);
  }
  
  .text-very-subtle {
    color: hsl(var(--muted-foreground) / 0.5);
  }
}
```

---

## ⏱️ Cronograma de Execução

| Fase | Descrição | Tempo | Prioridade |
|------|-----------|-------|------------|
| **1** | Correções críticas (opacity-30/40) | 50 min | 🔴 Alta |
| **2** | Análise de opacity-50 | 2h | 🟠 Alta |
| **3** | Correções de opacity-50 em texto | 1h | 🟠 Alta |
| **4** | Verificação de opacity-60 | 20 min | 🟡 Média |
| **5** | Testes e validação | 30 min | 🟢 Baixa |
| **TOTAL** | | **~4.8h** | |

---

## ✅ Checklist de Validação

- [ ] Executar build após correções
- [ ] Verificar contraste com DevTools
- [ ] Testar em tema claro e escuro
- [ ] Validar com Lighthouse Accessibility
- [ ] Revisar estados disabled/hover

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois (Meta) |
|---------|-------|---------------|
| Ocorrências críticas | 16 | 0 |
| Ocorrências em texto | 13 | 0 |
| WCAG AA Compliance | ~75% | ~95% |

