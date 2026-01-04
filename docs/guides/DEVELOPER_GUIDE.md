# Guia do Desenvolvedor do TSiJUKEBOX

**Tipo:** Guia
**Público-alvo:** Desenvolvedores e contribuidores
**Versão:** 1.0.0

---

## 1. Visão Geral da Arquitetura

Este guia fornece as informações essenciais para você começar a desenvolver e contribuir para o TSiJUKEBOX. O projeto é construído com uma stack moderna de frontend, focada em performance, escalabilidade e uma ótima experiência de desenvolvimento (DX).

### Stack Tecnológica Principal

| Tecnologia | Propósito | Por que foi escolhida? |
| --- | --- | --- |
| **React** | Biblioteca de UI | Padrão da indústria, ecossistema robusto. |
| **Vite** | Build Tool | Hot Module Replacement (HMR) extremamente rápido, bundling otimizado. |
| **TypeScript** | Superset de JavaScript | Segurança de tipos, prevenção de bugs, melhor autocompletar. |
| **Tailwind CSS** | Framework CSS | Estilização rápida e consistente diretamente no HTML. |
| **shadcn/ui** | Biblioteca de Componentes | Componentes acessíveis, customizáveis e baseados em Radix UI. |
| **React Query** | Gerenciamento de Estado do Servidor | Facilita o fetch, cache e sincronização de dados da API. |
| **Zustand / Context API** | Gerenciamento de Estado do Cliente | Leve, simples e eficaz para estados globais da UI (tema, sessão, etc.). |

### Estrutura de Diretórios

Compreender a organização das pastas é crucial para navegar no projeto.

```
src/
├── components/    # Componentes React reutilizáveis
│   ├── ui/        # Componentes de base (Button, Card, etc.)
│   ├── player/    # Componentes específicos do player
│   └── settings/  # Componentes da página de configurações
├── contexts/      # Contextos React para estado global
├── hooks/         # Hooks customizados para encapsular lógica
├── lib/           # Funções utilitárias, clientes de API
├── pages/         # Componentes de página (rotas)
├── styles/        # Estilos globais e configurações do Tailwind
└── types/         # Definições de tipos globais
```

---

## 2. Configurando o Ambiente de Desenvolvimento

Siga estes passos para ter o projeto rodando localmente.

1.  **Pré-requisitos:**
    - Node.js (versão 18 ou superior)
    - Git

2.  **Clone o repositório:**

    ```bash
    git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
    cd TSiJUKEBOX
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:5173`.

---

## 3. Padrões de Código e Boas Práticas

Manter um código consistente é fundamental para a colaboração.

### Nomenclatura

-   **Componentes:** `PascalCase` (ex: `PlayerControls.tsx`)
-   **Hooks:** `useCamelCase` (ex: `usePlayerStatus.ts`)
-   **Tipos e Interfaces:** `PascalCase` (ex: `interface TrackData`)

### Estilo de Componentes

-   **Componentes Funcionais:** Sempre use componentes funcionais com hooks.
-   **Tipagem de Props:** Defina uma `interface` para as props de cada componente.
-   **Estilização:** Use as classes do Tailwind CSS. Evite CSS inline ou arquivos `.css` separados, a menos que seja estritamente necessário para animações complexas.

    ```tsx
    // ✅ Bom
    <div className="bg-kiosk-surface text-kiosk-text p-4">
      <h2 className="text-gold-neon">Título</h2>
    </div>

    // ❌ Ruim
    <div style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '16px' }}>
      <h2 style={{ color: '#ffdf00' }}>Título</h2>
    </div>
    ```

### Gerenciamento de Estado

-   **Estado do Servidor:** Use `React Query` para qualquer dado que venha de uma API. Ele gerencia cache, revalidação e estado de loading/error automaticamente.
-   **Estado Global da UI:** Para estados que precisam ser compartilhados entre componentes não relacionados (ex: tema, informações do usuário logado), use a **Context API** ou **Zustand**.
-   **Estado Local:** Para estados contidos em um único componente (ex: visibilidade de um modal, valor de um input), use `useState`.

---

## 4. Criando um Novo Componente

Siga este fluxo de trabalho para criar um novo componente.

1.  **Crie o arquivo:** `src/components/ui/MyNewComponent.tsx`.
2.  **Defina a estrutura básica:**

    ```tsx
    import React from 'react';

    interface MyNewComponentProps {
      title: string;
    }

    export function MyNewComponent({ title }: MyNewComponentProps) {
      return (
        <div>
          <h1>{title}</h1>
        </div>
      );
    }
    ```

3.  **Adicione ao "barrel file":** Exporte o novo componente a partir do `index.ts` do diretório `ui` para facilitar as importações.

    ```typescript
    // Em src/components/ui/index.ts
    export * from './MyNewComponent';
    ```

---

## 5. Testes

O projeto utiliza **Vitest** para testes unitários e de integração, e **Playwright** para testes end-to-end (E2E).

-   **Testes Unitários:** Focam em uma única unidade de código (um hook, uma função utilitária).
-   **Testes de Integração:** Testam como múltiplos componentes funcionam juntos.
-   **Testes E2E:** Simulam o fluxo completo de um usuário na aplicação real.

### Comandos de Teste

-   `npm run test`: Roda todos os testes unitários e de integração.
-   `npm run test:watch`: Roda os testes em modo de observação, re-executando a cada alteração.
-   `npm run test:coverage`: Gera um relatório de cobertura de testes.
-   `npm run test:e2e`: Roda os testes end-to-end com o Playwright.

---

## 6. Contribuindo

As contribuições são muito bem-vindas! Por favor, siga o fluxo de trabalho padrão do GitHub:

1.  **Fork** o repositório.
2.  Crie uma nova **branch** para sua feature ou correção (`git checkout -b feature/nome-da-feature`).
3.  Faça seus commits seguindo o padrão de [Commits Convencionais](https://www.conventionalcommits.org/).
4.  Envie suas alterações (`git push origin feature/nome-da-feature`).
5.  Abra um **Pull Request**.

Certifique-se de que todos os testes estão passando e que a documentação foi atualizada, se aplicável.
