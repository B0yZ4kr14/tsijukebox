# useModal

**Tipo:** React Hook  
**Localização:** `src/hooks/useModal.ts`  
**Versão:** 1.0.0

---

## Descrição

Hook para gerenciar estado de modais. Fornece funções para abrir, fechar e alternar modais.

---

## Uso

```typescript
import { useModal } from '@/hooks/useModal';

function MyComponent() {
  const modal = useModal(initialState);
  
  return (
    <div>
      {/* Use modal here */}
    </div>
  );
}
```

---

## Parâmetros

### `initialState`: `boolean`

Estado inicial do modal

**Padrão:** `false`

---

## Retorno

### `modal`: `UseModalReturn`

Objeto com estado e controles do modal

**Propriedades:**

- **`isOpen`**: `boolean` - Se o modal está aberto
- **`open`**: `() => void` - Abre o modal
- **`close`**: `() => void` - Fecha o modal
- **`toggle`**: `() => void` - Alterna estado do modal

---

## Exemplo Completo

```typescript
import { useModal } from '@/hooks/useModal';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';

function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button onClick={open}>Abrir Modal</button>
      
      <Modal isOpen={isOpen} onClose={close}>
        <ModalHeader>Título do Modal</ModalHeader>
        <ModalBody>Conteúdo do modal aqui...</ModalBody>
        <ModalFooter>
          <button onClick={close}>Fechar</button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

---

## Notas

- Este hook utiliza React Context internamente
- Certifique-se de que o Provider correspondente está configurado
- Suporta TypeScript com tipagem completa

---

## Relacionados

- [Documentação de Hooks](../HOOKS-ARCHITECTURE.md)
- [Guia de Desenvolvimento](../guides/GETTING_STARTED_DEV.md)
