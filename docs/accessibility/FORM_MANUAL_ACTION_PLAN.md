# 📋 Plano de Ação Manual - 32 Problemas de Formulários Restantes

**Data:** 2025-12-25  
**Projeto:** TSiJUKEBOX  
**Status:** Pós-automação

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Problemas totais** | 32 |
| **Categorias** | 3 |
| **Arquivos afetados** | 22 |
| **Tempo total estimado** | **2.5 - 3.5 horas** |

---

## 🎯 Categorização dos Problemas

### Categoria 1: Contexto de Estado (aria-invalid)
| Métrica | Valor |
|---------|-------|
| **Ocorrências** | 26 |
| **Arquivos** | 22 |
| **Complexidade** | 🟡 Média |
| **Tempo estimado** | 1.5 - 2 horas |

### Categoria 2: Decisões de Design (error-association)
| Métrica | Valor |
|---------|-------|
| **Ocorrências** | 5 |
| **Arquivos** | 5 |
| **Complexidade** | 🟠 Alta |
| **Tempo estimado** | 45 min - 1 hora |

### Categoria 3: Reestruturação (placeholder-label)
| Métrica | Valor |
|---------|-------|
| **Ocorrências** | 2 |
| **Arquivos** | 2 |
| **Complexidade** | 🟢 Baixa |
| **Tempo estimado** | 15 - 30 min |

---

## 🔴 Fase 1: Contexto de Estado (aria-invalid)

### Por que não foi automatizado?

O atributo `aria-invalid` precisa ser **dinâmico**, vinculado ao estado de validação do formulário. A automação não consegue:
1. Identificar a variável de estado correta
2. Determinar a lógica de validação existente
3. Integrar com bibliotecas de formulário (react-hook-form, formik, etc.)

### Arquivos Prioritários (Top 10)

| # | Arquivo | Problemas | Tempo Est. | Prioridade |
|---|---------|-----------|------------|------------|
| 1 | `SpicetifySection.tsx` | 3 | 15 min | 🔴 Alta |
| 2 | `WeatherConfigSection.tsx` | 2 | 10 min | 🔴 Alta |
| 3 | `input.tsx` | 2 | 10 min | 🔴 Alta |
| 4 | `ContrastDebugPanel.tsx` | 1 | 5 min | 🟡 Média |
| 5 | `InteractiveTestMode.tsx` | 1 | 5 min | 🟡 Média |
| 6 | `JamAddTrackModal.tsx` | 1 | 5 min | 🟡 Média |
| 7 | `CommandDeck.tsx` | 1 | 5 min | 🟡 Média |
| 8 | `AdvancedDatabaseSection.tsx` | 1 | 5 min | 🟡 Média |
| 9 | `NtpConfigSection.tsx` | 1 | 5 min | 🟡 Média |
| 10 | `SettingsNotificationBanner.tsx` | 1 | 5 min | 🟡 Média |
| | *Outros 12 arquivos* | 12 | 60 min | 🟢 Baixa |

### Padrão de Correção

**Antes:**
```tsx
<Input
  className={cn(
    "base-styles",
    hasError && "border-red-500"
  )}
  {...props}
/>
```

**Depois:**
```tsx
<Input
  className={cn(
    "base-styles",
    hasError && "border-red-500"
  )}
  aria-invalid={hasError}
  aria-describedby={hasError ? `${id}-error` : undefined}
  {...props}
/>
```

### Checklist de Implementação

Para cada arquivo:
- [ ] Identificar variável de estado de erro (ex: `hasError`, `isInvalid`, `errors.fieldName`)
- [ ] Adicionar `aria-invalid={errorState}`
- [ ] Vincular mensagem de erro com `aria-describedby`
- [ ] Testar com leitor de tela

### Tempo Total Fase 1: **1.5 - 2 horas**

---

## 🟠 Fase 2: Decisões de Design (error-association)

### Por que não foi automatizado?

Mensagens de erro requerem decisões de design:
1. **Posicionamento:** Onde a mensagem aparece?
2. **Timing:** Quando anunciar? (imediato vs. on-blur)
3. **Persistência:** Manter visível ou auto-dismiss?
4. **Agrupamento:** Uma mensagem por campo ou resumo?

### Arquivos Afetados

| # | Arquivo | Contexto | Decisão Necessária |
|---|---------|----------|-------------------|
| 1 | `LoginForm.tsx` | Autenticação | Anunciar erros imediatamente |
| 2 | `SettingsForm.tsx` | Configurações | Validar on-blur |
| 3 | `SearchInput.tsx` | Busca | Feedback inline |
| 4 | `PlaylistForm.tsx` | Criação | Resumo de erros |
| 5 | `ContactForm.tsx` | Contato | Validação completa |

### Padrões Recomendados

#### Padrão A: Erro Inline (Recomendado para campos individuais)
```tsx
<div className="space-y-2">
  <Label htmlFor="email">E-mail</Label>
  <Input
    id="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-sm text-red-500">
      {errors.email.message}
    </p>
  )}
</div>
```

#### Padrão B: Resumo de Erros (Recomendado para formulários longos)
```tsx
{Object.keys(errors).length > 0 && (
  <div role="alert" aria-live="polite" className="bg-red-50 p-4 rounded">
    <h3 className="font-semibold">Corrija os seguintes erros:</h3>
    <ul>
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>
          <a href={`#${field}`}>{error.message}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

#### Padrão C: Toast/Notificação (Recomendado para erros de servidor)
```tsx
const { toast } = useToast();

const onError = (error) => {
  toast({
    title: "Erro ao salvar",
    description: error.message,
    variant: "destructive",
    // aria-live é gerenciado pelo componente Toast
  });
};
```

### Matriz de Decisão

| Tipo de Formulário | Padrão Recomendado | Justificativa |
|-------------------|-------------------|---------------|
| Login/Cadastro | A (Inline) | Feedback imediato crítico |
| Configurações | A (Inline) | Campos independentes |
| Busca | C (Toast) | Não bloquear fluxo |
| Formulário longo | B (Resumo) | Visão geral de erros |
| Modal | A (Inline) | Espaço limitado |

### Tempo Total Fase 2: **45 min - 1 hora**

---

## 🟢 Fase 3: Reestruturação (placeholder-label)

### Por que não foi automatizado?

Placeholders como labels são um **anti-pattern** de acessibilidade. A correção ideal é:
1. Adicionar um `<Label>` visível
2. Manter placeholder como dica adicional (opcional)
3. Reestruturar layout se necessário

### Arquivos Afetados

| # | Arquivo | Campo | Solução |
|---|---------|-------|---------|
| 1 | `SearchBar.tsx` | Busca | Label visualmente oculto |
| 2 | `QuickAdd.tsx` | Adicionar item | Label visível |

### Padrões de Correção

#### Padrão A: Label Visualmente Oculto (para campos de busca)
```tsx
<div className="relative">
  <Label htmlFor="search" className="sr-only">
    Pesquisar
  </Label>
  <Input
    id="search"
    placeholder="Digite para pesquisar..."
    aria-label="Pesquisar" // Redundância intencional para compatibilidade
  />
</div>
```

#### Padrão B: Label Visível (para formulários)
```tsx
<div className="space-y-2">
  <Label htmlFor="title">Título</Label>
  <Input
    id="title"
    placeholder="Ex: Minha Playlist"
  />
</div>
```

### CSS para Label Oculto
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Tempo Total Fase 3: **15 - 30 min**

---

## 📅 Cronograma de Execução

| Fase | Descrição | Tempo | Acumulado |
|------|-----------|-------|-----------|
| **1** | Contexto de Estado (aria-invalid) | 1.5-2h | 1.5-2h |
| **2** | Decisões de Design (error-association) | 45min-1h | 2.25-3h |
| **3** | Reestruturação (placeholder-label) | 15-30min | 2.5-3.5h |
| **TOTAL** | | | **2.5-3.5h** |

---

## ✅ Checklist de Validação Final

### Por Arquivo
- [ ] `aria-invalid` vinculado ao estado de erro
- [ ] `aria-describedby` apontando para mensagem de erro
- [ ] Mensagens de erro com `role="alert"` ou `aria-live`
- [ ] Labels associados a todos os inputs
- [ ] Placeholders não são a única identificação

### Testes de Acessibilidade
- [ ] Navegação por teclado funcional
- [ ] Leitor de tela anuncia erros corretamente
- [ ] Foco move para campo com erro
- [ ] Contraste de mensagens de erro adequado

### Validação Técnica
- [ ] Build passa sem erros
- [ ] Testes unitários passam
- [ ] Lighthouse Accessibility > 90

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois (Meta) |
|---------|-------|---------------|
| Problemas de formulário | 32 | 0 |
| aria-invalid implementado | 0% | 100% |
| Erros com role="alert" | 60% | 100% |
| Labels associados | 95% | 100% |
| WCAG 2.1 AA (Forms) | ~70% | 100% |

---

## 🔧 Ferramentas Recomendadas

### Para Desenvolvimento
- **axe DevTools** - Extensão do Chrome para auditoria
- **WAVE** - Avaliador de acessibilidade web
- **Lighthouse** - Auditoria integrada do Chrome

### Para Testes
- **NVDA** (Windows) - Leitor de tela gratuito
- **VoiceOver** (macOS) - Leitor de tela nativo
- **jest-axe** - Testes automatizados de acessibilidade

### Comandos Úteis
```bash
# Verificar progresso
python3 scripts/fix-form-accessibility.py --dry-run

# Gerar relatório atualizado
python3 scripts/fix-form-accessibility.py --report

# Auditoria de contraste
python3 scripts/audit-contrast-issues.py --summary
```

---

*Documento gerado em: 2025-12-25*  
*Projeto: TSiJUKEBOX Accessibility*
