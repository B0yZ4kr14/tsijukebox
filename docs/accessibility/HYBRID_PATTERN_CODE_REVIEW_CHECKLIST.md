# ✅ Checklist de Code Review - Padrão Híbrido de Formulários Acessíveis

**Versão:** 1.0  
**Data:** 2025-12-25  
**Complexidade:** 🟠 Alta  
**Tempo médio de revisão:** 30-45 minutos

---

## 📋 Instruções de Uso

Este checklist deve ser usado durante o Code Review de formulários que implementam o **Padrão Híbrido** (Resumo + Inline). Cada item deve ser verificado e marcado como:

- ✅ **Aprovado** - Implementação correta
- ⚠️ **Atenção** - Funciona, mas pode ser melhorado
- ❌ **Reprovado** - Requer correção antes do merge

---

## 1️⃣ ESTRUTURA DO FORMULÁRIO

### 1.1 Elemento `<form>`

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 1.1.1 | `<form>` possui `noValidate` para desabilitar validação nativa | ☐ | |
| 1.1.2 | `<form>` possui `aria-labelledby` apontando para título | ☐ | |
| 1.1.3 | `onSubmit` usa `handleSubmit` do react-hook-form (ou equivalente) | ☐ | |
| 1.1.4 | Formulário tem título descritivo (`<h1>`, `<h2>`, etc.) | ☐ | |

**Exemplo correto:**
```tsx
<form
  onSubmit={handleSubmit(onSubmit)}
  noValidate
  aria-labelledby="form-title"
>
  <h2 id="form-title">Criar Conta</h2>
  {/* campos */}
</form>
```

### 1.2 Agrupamento de Campos

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 1.2.1 | Campos relacionados agrupados em `<fieldset>` | ☐ | |
| 1.2.2 | Cada `<fieldset>` possui `<legend>` descritivo | ☐ | |
| 1.2.3 | Grupos de radio/checkbox usam `<fieldset>` | ☐ | |

**Exemplo correto:**
```tsx
<fieldset>
  <legend>Informações Pessoais</legend>
  {/* campos de nome, email, etc. */}
</fieldset>
```

---

## 2️⃣ RESUMO DE ERROS (Topo do Formulário)

### 2.1 Container do Resumo

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 2.1.1 | Container possui `role="alert"` | ☐ | |
| 2.1.2 | Container possui `aria-live="assertive"` | ☐ | |
| 2.1.3 | Container possui `tabIndex={-1}` para foco programático | ☐ | |
| 2.1.4 | Container recebe foco automaticamente após submit com erros | ☐ | |
| 2.1.5 | Resumo aparece APENAS após tentativa de submit | ☐ | |
| 2.1.6 | Resumo desaparece quando todos os erros são corrigidos | ☐ | |

**Exemplo correto:**
```tsx
{isSubmitted && errorCount > 0 && (
  <div
    ref={errorSummaryRef}
    role="alert"
    aria-live="assertive"
    tabIndex={-1}
    className="error-summary"
  >
    {/* conteúdo */}
  </div>
)}
```

### 2.2 Conteúdo do Resumo

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 2.2.1 | Título indica quantidade de erros | ☐ | |
| 2.2.2 | Título usa singular/plural corretamente | ☐ | |
| 2.2.3 | Lista de erros usa `<ul>` semântico | ☐ | |
| 2.2.4 | Cada erro é um link/botão clicável | ☐ | |
| 2.2.5 | Clicar no erro move foco para o campo | ☐ | |
| 2.2.6 | Nome do campo é exibido junto com a mensagem | ☐ | |

**Exemplo correto:**
```tsx
<h3>
  {errorCount === 1 
    ? 'Há 1 erro no formulário' 
    : `Há ${errorCount} erros no formulário`}
</h3>
<ul>
  {Object.entries(errors).map(([field, error]) => (
    <li key={field}>
      <button
        type="button"
        onClick={() => setFocus(field)}
      >
        <strong>{fieldLabels[field]}:</strong> {error.message}
      </button>
    </li>
  ))}
</ul>
```

### 2.3 Foco Automático

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 2.3.1 | `useEffect` monitora `isSubmitted` e `errors` | ☐ | |
| 2.3.2 | Foco move para resumo apenas quando há erros | ☐ | |
| 2.3.3 | Ref do container está corretamente definido | ☐ | |

**Exemplo correto:**
```tsx
const errorSummaryRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isSubmitted && Object.keys(errors).length > 0) {
    errorSummaryRef.current?.focus();
  }
}, [isSubmitted, errors]);
```

---

## 3️⃣ ERROS INLINE (Por Campo)

### 3.1 Atributos ARIA do Input

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 3.1.1 | `aria-invalid` é dinâmico: `{!!errors.field}` | ☐ | |
| 3.1.2 | `aria-required` presente em campos obrigatórios | ☐ | |
| 3.1.3 | `aria-describedby` aponta para erro OU dica | ☐ | |
| 3.1.4 | `aria-describedby` é `undefined` quando não há erro nem dica | ☐ | |
| 3.1.5 | `id` único para cada campo | ☐ | |

**Exemplo correto:**
```tsx
<Input
  id="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={
    errors.email 
      ? 'email-error' 
      : hint 
        ? 'email-hint' 
        : undefined
  }
/>
```

### 3.2 Mensagem de Erro Inline

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 3.2.1 | Mensagem possui `role="alert"` | ☐ | |
| 3.2.2 | `id` corresponde ao `aria-describedby` do input | ☐ | |
| 3.2.3 | Mensagem aparece APENAS quando há erro | ☐ | |
| 3.2.4 | Mensagem é descritiva e acionável | ☐ | |
| 3.2.5 | Ícone de erro possui `aria-hidden="true"` | ☐ | |

**Exemplo correto:**
```tsx
{errors.email && (
  <p id="email-error" role="alert" className="text-red-500">
    <AlertCircle aria-hidden="true" />
    {errors.email.message}
  </p>
)}
```

### 3.3 Dica do Campo (Hint)

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 3.3.1 | Dica possui `id` único | ☐ | |
| 3.3.2 | Dica NÃO aparece quando há erro | ☐ | |
| 3.3.3 | Dica é útil e não redundante | ☐ | |

**Exemplo correto:**
```tsx
{!errors.password && (
  <p id="password-hint" className="text-muted">
    Mínimo 8 caracteres, 1 maiúscula e 1 número
  </p>
)}
```

---

## 4️⃣ LABELS E ASSOCIAÇÕES

### 4.1 Labels

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 4.1.1 | Todo input possui `<Label>` associado | ☐ | |
| 4.1.2 | `htmlFor` do Label corresponde ao `id` do input | ☐ | |
| 4.1.3 | Label é visível (não apenas `aria-label`) | ☐ | |
| 4.1.4 | Campos obrigatórios indicados visualmente | ☐ | |
| 4.1.5 | Indicador visual possui `aria-hidden="true"` | ☐ | |

**Exemplo correto:**
```tsx
<Label htmlFor="email">
  E-mail
  <span className="text-red-500" aria-hidden="true">*</span>
</Label>
<Input id="email" />
```

### 4.2 Campos Obrigatórios

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 4.2.1 | `aria-required="true"` em campos obrigatórios | ☐ | |
| 4.2.2 | Indicação visual consistente (asterisco, texto) | ☐ | |
| 4.2.3 | Legenda explicando o indicador (opcional) | ☐ | |

---

## 5️⃣ VALIDAÇÃO E TIMING

### 5.1 Configuração do Formulário

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 5.1.1 | `mode: 'onBlur'` para validação inline | ☐ | |
| 5.1.2 | `reValidateMode: 'onChange'` para revalidação | ☐ | |
| 5.1.3 | Schema de validação (zod/yup) completo | ☐ | |
| 5.1.4 | Mensagens de erro em português | ☐ | |

**Exemplo correto:**
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur',
  reValidateMode: 'onChange',
});
```

### 5.2 Comportamento de Validação

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 5.2.1 | Erro inline aparece ao sair do campo (onBlur) | ☐ | |
| 5.2.2 | Erro desaparece ao corrigir (onChange) | ☐ | |
| 5.2.3 | Resumo aparece apenas após submit | ☐ | |
| 5.2.4 | Resumo atualiza quando erros são corrigidos | ☐ | |

---

## 6️⃣ FEEDBACK VISUAL

### 6.1 Estados de Erro

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 6.1.1 | Borda vermelha em campos com erro | ☐ | |
| 6.1.2 | Ícone de erro no campo (opcional) | ☐ | |
| 6.1.3 | Cor do texto de erro com contraste adequado | ☐ | |
| 6.1.4 | Resumo de erros visualmente destacado | ☐ | |

### 6.2 Estados de Sucesso

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 6.2.1 | Mensagem de sucesso com `role="status"` | ☐ | |
| 6.2.2 | `aria-live="polite"` para sucesso | ☐ | |
| 6.2.3 | Feedback visual de sucesso (cor verde, ícone) | ☐ | |

### 6.3 Estado de Loading

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 6.3.1 | Botão submit possui `aria-busy={isSubmitting}` | ☐ | |
| 6.3.2 | Botão desabilitado durante submit | ☐ | |
| 6.3.3 | Texto do botão indica loading | ☐ | |

**Exemplo correto:**
```tsx
<Button
  type="submit"
  disabled={isSubmitting}
  aria-busy={isSubmitting}
>
  {isSubmitting ? 'Enviando...' : 'Enviar'}
</Button>
```

---

## 7️⃣ AUTOCOMPLETE E TIPOS

### 7.1 Autocomplete

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 7.1.1 | `autoComplete` em campos de identificação | ☐ | |
| 7.1.2 | Valores corretos: `email`, `tel`, `name`, etc. | ☐ | |
| 7.1.3 | `new-password` para campos de nova senha | ☐ | |
| 7.1.4 | `current-password` para login | ☐ | |

### 7.2 Tipos de Input

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 7.2.1 | `type="email"` para e-mails | ☐ | |
| 7.2.2 | `type="tel"` para telefones | ☐ | |
| 7.2.3 | `type="password"` para senhas | ☐ | |
| 7.2.4 | `type="number"` para valores numéricos | ☐ | |

---

## 8️⃣ NAVEGAÇÃO POR TECLADO

### 8.1 Ordem de Tabulação

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 8.1.1 | Ordem de tab segue ordem visual | ☐ | |
| 8.1.2 | Nenhum `tabIndex` positivo usado | ☐ | |
| 8.1.3 | Elementos interativos são focáveis | ☐ | |
| 8.1.4 | Links no resumo de erros são focáveis | ☐ | |

### 8.2 Indicador de Foco

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 8.2.1 | Todos os elementos focáveis têm indicador visível | ☐ | |
| 8.2.2 | `focus:outline-none` tem alternativa visual | ☐ | |
| 8.2.3 | Contraste do indicador de foco adequado | ☐ | |

---

## 9️⃣ TESTES MANUAIS

### 9.1 Teste com Teclado

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 9.1.1 | Formulário pode ser preenchido apenas com teclado | ☐ | |
| 9.1.2 | Tab navega na ordem correta | ☐ | |
| 9.1.3 | Enter submete o formulário | ☐ | |
| 9.1.4 | Escape fecha modais/dropdowns | ☐ | |

### 9.2 Teste com Leitor de Tela

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 9.2.1 | Labels são anunciados corretamente | ☐ | |
| 9.2.2 | Campos obrigatórios são anunciados | ☐ | |
| 9.2.3 | Erros são anunciados ao aparecer | ☐ | |
| 9.2.4 | Resumo de erros é anunciado após submit | ☐ | |
| 9.2.5 | Sucesso é anunciado após submit | ☐ | |

### 9.3 Teste de Contraste

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 9.3.1 | Texto de erro: ratio >= 4.5:1 | ☐ | |
| 9.3.2 | Labels: ratio >= 4.5:1 | ☐ | |
| 9.3.3 | Placeholders: ratio >= 3:1 (texto grande) | ☐ | |
| 9.3.4 | Bordas de erro: ratio >= 3:1 | ☐ | |

---

## 🔟 CÓDIGO LIMPO

### 10.1 Componentização

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 10.1.1 | Componente `FormField` reutilizável | ☐ | |
| 10.1.2 | Componente `ErrorSummary` separado | ☐ | |
| 10.1.3 | Props tipadas corretamente | ☐ | |
| 10.1.4 | `forwardRef` usado quando necessário | ☐ | |

### 10.2 Manutenibilidade

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 10.2.1 | Mapeamento de labels centralizado | ☐ | |
| 10.2.2 | Schema de validação em arquivo separado | ☐ | |
| 10.2.3 | Constantes de mensagens centralizadas | ☐ | |
| 10.2.4 | Comentários explicativos onde necessário | ☐ | |

---

## 📊 RESUMO DA REVISÃO

### Contagem

| Categoria | Total | ✅ | ⚠️ | ❌ |
|-----------|-------|-----|-----|-----|
| 1. Estrutura do Formulário | 7 | | | |
| 2. Resumo de Erros | 15 | | | |
| 3. Erros Inline | 13 | | | |
| 4. Labels e Associações | 8 | | | |
| 5. Validação e Timing | 8 | | | |
| 6. Feedback Visual | 10 | | | |
| 7. Autocomplete e Tipos | 8 | | | |
| 8. Navegação por Teclado | 7 | | | |
| 9. Testes Manuais | 12 | | | |
| 10. Código Limpo | 8 | | | |
| **TOTAL** | **96** | | | |

### Decisão Final

- [ ] ✅ **APROVADO** - Pronto para merge
- [ ] ⚠️ **APROVADO COM RESSALVAS** - Merge permitido, melhorias sugeridas
- [ ] ❌ **REPROVADO** - Requer correções antes do merge

### Comentários do Revisor

```
Data: ___/___/______
Revisor: _________________

Pontos positivos:


Pontos de atenção:


Correções obrigatórias:


```

---

## 📚 Referências

- [WCAG 2.1 - Formulários](https://www.w3.org/WAI/tutorials/forms/)
- [MDN - Acessibilidade de Formulários](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/Forms)
- [React Hook Form - Acessibilidade](https://react-hook-form.com/advanced-usage#AccessibilityA11y)
- [WAI-ARIA Authoring Practices - Forms](https://www.w3.org/WAI/ARIA/apg/patterns/forms/)

---

*Checklist versão 1.0 - TSiJUKEBOX Accessibility*
