# Testes de Integração

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia para escrita de testes de integração no TSiJUKEBOX.

---

## 🎯 Objetivo

Garantir que diferentes partes do sistema funcionem bem juntas.

---

## 📚 Índice

1. [Configuração](#configuração)
2. [Estrutura](#estrutura)
3. [Exemplos](#exemplos)
4. [Boas Práticas](#boas-práticas)

---

## ⚙️ Configuração

### Dependências

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Configuração do Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

## 📁 Estrutura de Testes

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── hooks/
│   └── __tests__/
│       └── usePlayer.test.ts
└── test/
    ├── setup.ts
    └── __mocks__/
```

---

## 💻 Exemplos

### Teste de Componente

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('deve renderizar corretamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Teste de Hook

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('deve incrementar o contador', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });
});
```

---

## ✅ Boas Práticas

1. **Teste comportamento, não implementação**
2. **Use data-testid para seletores estáveis**
3. **Mantenha testes independentes**
4. **Evite mocks excessivos**
5. **Escreva testes legíveis**

---

## 📊 Cobertura de Código

```bash
# Executar testes com cobertura
npm run test:coverage
```

### Metas de Cobertura

| Categoria | Meta |
|-----------|------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

---

## 🔗 Recursos Relacionados

- [Plano de Testes Completo](TEST_PLAN_COMPLETE.md)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
