# Toast System (Sonner)

**Tipo:** UI Component / Notificação
**Localização:** `src/components/ui/sonner.tsx`
**Biblioteca:** [Sonner](https://sonner.emilkowal.ski/)
**Versão:** 1.0.0

---

## Descrição

O sistema de Toasts do TSiJUKEBOX é construído sobre a biblioteca **Sonner**, uma biblioteca de notificações opinativa e elegante para React. Ele fornece feedback não intrusivo ao usuário para ações como sucesso, erro, ou informações gerais. O componente `Toaster` foi estilizado para se integrar perfeitamente ao Design System da aplicação, respeitando o tema (claro/escuro) e a paleta de cores.

### Principais recursos:
- **Integração com o Tema:** Adapta-se automaticamente ao tema da aplicação (`next-themes`).
- **Estilização Centralizada:** As classes de estilo são definidas no componente `Toaster` para garantir consistência.
- **Fácil de Usar:** Uma API simples e direta para disparar notificações de qualquer lugar da aplicação.
- **Tipos de Notificação:** Suporte para diferentes tipos de toasts (success, error, info, warning, etc.).
- **Customizável:** Permite ações, descrições e durações personalizadas.

---

## Instalação e Configuração

O `Toaster` deve ser adicionado ao layout principal da sua aplicação, geralmente no `App.tsx` ou em um componente de layout global.

```typescript
// Em App.tsx
import { Toaster as Sonner } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      {/* ... O resto da sua aplicação ... */}
      <Sonner />
    </ThemeProvider>
  );
}
```

O componente `Toaster` renderiza os toasts que são criados usando a função `toast`.

---

## Como Usar

Para exibir um toast, importe a função `toast` de `sonner` e chame-a com a mensagem desejada.

### Uso Básico

```typescript
import { toast } from "sonner";

function MyComponent() {
  return (
    <Button onClick={() => toast("Este é um toast básico.")}>
      Mostrar Toast
    </Button>
  );
}
```

### Tipos de Toast

A biblioteca `sonner` oferece vários métodos para diferentes tipos de notificações.

#### Sucesso

Para feedback de ações bem-sucedidas.

```typescript
toast.success("Sessão JAM criada com sucesso!");
```

#### Erro

Para reportar falhas ou erros.

```typescript
toast.error("Falha ao conectar com o servidor.");
```

#### Informativo

Para mensagens informativas.

```typescript
toast.info("A nova versão estará disponível amanhã.");
```

#### Aviso

Para alertas que não são necessariamente erros.

```typescript
toast.warning("Sua sessão está prestes a expirar.");
```

---

## Opções Avançadas

A função `toast` pode receber um segundo argumento com opções para customização.

### Adicionando uma Descrição

```typescript
toast("Evento Criado", {
  description: "Seu evento foi adicionado ao calendário.",
});
```

### Adicionando Ações

É possível adicionar um botão de ação ao toast.

```typescript
toast.success("Música adicionada à fila", {
  action: {
    label: "Desfazer",
    onClick: () => console.log("Ação de desfazer clicada"),
  },
});
```

### Customizando a Duração

Pode-se definir por quanto tempo o toast ficará visível (em milissegundos).

```typescript
toast.error("Erro de conexão", {
  duration: 10000, // 10 segundos
});
```

### Toast Persistente

Para toasts que precisam ser dispensados manualmente pelo usuário.

```typescript
toast("Termos e Condições atualizados", {
  duration: Infinity, // ou `Number.POSITIVE_INFINITY`
  action: {
    label: "Ver Termos",
    onClick: () => { /* ... */ },
  },
});
```

---

## Estilização e Design System

O componente `Toaster` em `src/components/ui/sonner.tsx` centraliza a estilização de todos os toasts para que eles sigam a identidade visual do TSiJUKEBOX.

```typescript
// src/components/ui/sonner.tsx

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-kiosk-surface group-[.toaster]:text-kiosk-text group-[.toaster]:border group-[.toaster]:border-cyan-500/30 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};
```

- **`toast`:** A classe base para o container do toast, usando cores e bordas do nosso Design System (`kiosk-surface`, `kiosk-text`, `border-cyan-500/30`).
- **`description`:** Estiliza o texto da descrição.
- **`actionButton` e `cancelButton`:** Estilizam os botões de ação.

---

## Exemplos Práticos no Projeto

- **Feedback de Ações:** Em `CreateJamModal.tsx`, um toast de sucesso é exibido após a criação de uma sessão JAM.
- **Copiar para Área de Transferência:** Em `JamHeader.tsx`, um toast confirma que o código da sessão foi copiado.
- **Validação de Formulário:** Em `CreateJamModal.tsx`, toasts de erro são usados para validar campos de entrada.
- **Notificação de Status:** Em `KioskRemoteControl.tsx`, toasts informam o sucesso ou falha do envio de comandos.

---

## Relacionados

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [next-themes](https://github.com/pacocoursey/next-themes) - Usado para a integração de temas.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação do sistema de Toasts com a biblioteca Sonner.
- ✅ Estilização integrada ao Design System do TSiJUKEBOX.
- ✅ Suporte a temas claro e escuro.
- ✅ Documentação completa.
