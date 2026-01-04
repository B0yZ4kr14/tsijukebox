# Button System

**Tipo:** UI Component
**Localização:** `src/components/ui/button.tsx`
**Versão:** 4.2.0

---

## Descrição

O componente `Button` é um elemento fundamental da interface do TSiJUKEBOX, construído com base nos Design Tokens da aplicação. Ele é altamente customizável através de variantes e tamanhos, garantindo consistência visual e funcional em toda a aplicação. O sistema de botões foi desenvolvido com `class-variance-authority` (CVA) para uma gestão de variantes limpa e escalável.

### Principais recursos:
- **Variantes Múltiplas:** Suporte para 11 estilos diferentes (default, secondary, destructive, etc.).
- **Tamanhos Flexíveis:** 6 opções de tamanho, incluindo tamanhos específicos para ícones.
- **Estado de Loading:** Exibe um indicador de carregamento e desabilita o botão.
- **Suporte a Ícones:** Permite adicionar ícones à esquerda ou à direita do texto.
- **Acessibilidade:** Conformidade com WCAG 2.1 AA, incluindo anéis de foco visíveis e atributos ARIA.
- **Composição:** A propriedade `asChild` permite compor o botão com outros componentes, como o `Link` do Next.js.

---

## Variantes e Estilos

O componente `Button` oferece uma ampla gama de variantes para diferentes casos de uso.

| Variante | Descrição | Estilo Principal |
|---|---|---|
| `default` | Botão primário, para as ações mais importantes. | Fundo ciano (`accent-cyan`) com texto escuro. |
| `secondary` | Para ações secundárias. | Fundo cinza escuro (`bg-secondary`) com borda. |
| `ghost` | Para ações de baixa proeminência. | Transparente com texto claro, fundo aparece no hover. |
| `outline` | Alternativa ao secundário, com mais destaque. | Fundo escuro com borda cinza. |
| `kiosk-outline` | Variante especial para o modo Kiosk. | Borda cinza com `box-shadow` ciano no hover. |
| `destructive` | Para ações perigosas (ex: deletar). | Fundo vermelho (`state-error`). |
| `success` | Para ações de sucesso. | Fundo verde (`state-success`). |
| `warning` | Para ações que requerem atenção. | Fundo amarelo (`state-warning`). |
| `link` | Estilo de um link de texto. | Texto ciano com sublinhado no hover. |
| `spotify` | Botão com a cor da marca Spotify. | Fundo verde Spotify (`brand-spotify`). |
| `youtube` | Botão com a cor da marca YouTube. | Fundo vermelho YouTube (`brand-youtube`). |

---

## Tamanhos

| Tamanho | Altura | Uso Recomendado |
|---|---|---|
| `sm` | 32px | Ações menos importantes, em espaços compactos. |
| `default` | 40px | Tamanho padrão para a maioria dos botões. |
| `lg` | 48px | Ações de alta proeminência, como em headers de página. |
| `icon` | 40x40px | Botão quadrado para um ícone. |
| `icon-sm` | 32x32px | Botão de ícone pequeno. |
| `icon-lg` | 48x48px | Botão de ícone grande. |

---

## Propriedades (`ButtonProps`)

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `string` | `default` | A variante de estilo do botão (ver tabela acima). |
| `size` | `string` | `default` | O tamanho do botão (ver tabela acima). |
| `asChild` | `boolean` | `false` | Se `true`, renderiza o componente filho direto, fundindo as props. |
| `loading` | `boolean` | `false` | Se `true`, exibe um spinner e desabilita o botão. |
| `leftIcon` | `React.ReactNode` | `undefined` | Ícone a ser exibido à esquerda do texto. |
| `rightIcon` | `React.ReactNode` | `undefined` | Ícone a ser exibido à direita do texto. |

Além destas, o componente aceita todas as props de um elemento `<button>` HTML padrão (ex: `onClick`, `disabled`, `className`).

---

## Como Usar

### Botão Básico

```typescript
import { Button } from "@/components/ui/button";

<Button>Clique Aqui</Button>
```

### Botão com Variante e Tamanho

```typescript
<Button variant="destructive" size="sm">
  Deletar
</Button>
```

### Botão com Ícone

```typescript
import { Trash } from "lucide-react";

<Button variant="destructive" leftIcon={<Trash />}>
  Deletar Item
</Button>
```

### Botão de Ícone

```typescript
import { Settings } from "lucide-react";

<Button variant="ghost" size="icon">
  <Settings />
</Button>
```

### Botão em Estado de Loading

```typescript
const [isLoading, setIsLoading] = useState(false);

<Button loading={isLoading} onClick={handleSubmit}>
  Salvar
</Button>
```

### Usando com `Link` (Next.js ou React Router)

A propriedade `asChild` permite que o `Button` passe seus estilos para um componente filho, o que é ideal para links de navegação que precisam parecer botões.

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link href="/dashboard">Ir para o Dashboard</Link>
</Button>
```

---

## Relacionados

- **class-variance-authority (CVA):** A biblioteca usada para criar as variantes do botão.
- **Design Tokens:** As cores, fontes e espaçamentos são definidos em `src/lib/design-tokens.ts`.

---

## Changelog

### v4.2.0 (24/12/2024)
- ✅ Refatoração completa para usar Design Tokens.
- ✅ Adição de variantes `kiosk-outline`, `success`, `warning`, `spotify`, e `youtube`.
- ✅ Adição de tamanhos `icon-sm` e `icon-lg`.
- ✅ Implementação do estado de `loading` e suporte a ícones (`leftIcon`, `rightIcon`).
- ✅ Melhorias de acessibilidade e foco.
- ✅ Documentação completa.
