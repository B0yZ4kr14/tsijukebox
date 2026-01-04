# Suporte a Leitores de Tela

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia de suporte a leitores de tela no TSiJUKEBOX.

---

## 🎯 Objetivo

Garantir compatibilidade com NVDA, VoiceOver e outros leitores de tela.

---

## 📚 Índice

1. [Princípios](#princípios)
2. [Implementação](#implementação)
3. [Testes](#testes)
4. [Checklist](#checklist)

---

## 🌟 Princípios

### WCAG 2.1 - Nível AA

O TSiJUKEBOX segue as diretrizes WCAG 2.1 nível AA:

1. **Perceptível:** Informação apresentada de forma que todos possam perceber
2. **Operável:** Interface navegável por todos
3. **Compreensível:** Informação e operação compreensíveis
4. **Robusto:** Conteúdo interpretável por tecnologias assistivas

---

## 💻 Implementação

### Atributos ARIA

```tsx
<button
  aria-label="Reproduzir música"
  aria-pressed={isPlaying}
  role="button"
>
  <PlayIcon />
</button>
```

### Navegação por Teclado

| Tecla | Ação |
|-------|------|
| `Tab` | Navegar entre elementos |
| `Enter` | Ativar elemento |
| `Space` | Alternar estado |
| `Escape` | Fechar modal |

---

## 🧪 Testes

### Ferramentas Recomendadas

- **axe DevTools:** Extensão do Chrome para testes de acessibilidade
- **WAVE:** Ferramenta online de avaliação
- **Lighthouse:** Auditoria de acessibilidade

### Teste Manual

1. Navegue usando apenas o teclado
2. Teste com leitor de tela (NVDA, VoiceOver)
3. Verifique contraste de cores

---

## ✅ Checklist de Acessibilidade

- [ ] Todos os elementos interativos têm `aria-label`
- [ ] Imagens têm texto alternativo (`alt`)
- [ ] Contraste de cores adequado (4.5:1)
- [ ] Navegação por teclado funcional
- [ ] Foco visível em todos os elementos
- [ ] Formulários têm labels associados

---

## 🔗 Recursos Relacionados

- [Guia de Acessibilidade](../ACCESSIBILITY.md)
- [Design System](../DESIGN-SYSTEM.md)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
