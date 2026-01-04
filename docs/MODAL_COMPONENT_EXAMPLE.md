# 🧩 Exemplo de Componente Modal

## 🚀 Padrão "Dark Neon Gold Black"

Este é um exemplo de como criar um componente de Modal reutilizável em React/TypeScript com Tailwind CSS, seguindo o guia de migração do Design System.

### Estrutura do Arquivo

- `src/components/ui/modal.tsx`

### Código de Exemplo

```tsx
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Modal Component
 * 
 * Modal reutilizável com Glassmorphism, Glow effects e animações.
 * 
 * @component
 * @example
 * ```tsx
 * <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Ação">
 *   <p>Tem certeza que deseja excluir este item?</p>
 * </Modal>
 * ```
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Dialog.Overlay className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-40" />
            </motion.div>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md"
              >
                <div className="bg-bg-secondary/70 backdrop-blur-lg border border-border-primary rounded-lg shadow-glow-cyan-strong p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-xl font-bold text-accent-gold font-display">
                      {title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button 
                        className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                        aria-label="Fechar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Body */}
                  <div className="text-text-primary">
                    {children}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
}
```

### Principais Features do Design System

1.  **Glassmorphism no Overlay:**
    -   `bg-bg-primary/80 backdrop-blur-sm` cria um fundo translúcido e fosco.

2.  **Glassmorphism no Conteúdo:**
    -   `bg-bg-secondary/70 backdrop-blur-lg` para o container do modal.

3.  **Glow Effect:**
    -   `shadow-glow-cyan-strong` no container principal para um brilho neon sutil.

4.  **Tokens de Cor:**
    -   `bg-bg-primary`, `bg-bg-secondary`, `border-border-primary`.
    -   `text-accent-gold` para o título.
    -   `text-text-primary` e `text-text-secondary` para o conteúdo.

5.  **Tipografia:**
    -   `font-display` (Space Grotesk) para o título.

6.  **Animações com Framer Motion:**
    -   `AnimatePresence` para controlar a montagem/desmontagem.
    -   `motion.div` para animar `opacity` e `scale` na entrada e saída.

7.  **Acessibilidade:**
    -   Uso de `@radix-ui/react-dialog` para gerenciar foco, trap e ARIA attributes.
    -   `aria-label` no botão de fechar.

### Como Usar

```tsx
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Exemplo de Modal"
      >
        <div className="space-y-4">
          <p>Este é o conteúdo do modal. Ele utiliza os tokens de cor e efeitos do novo Design System.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="bg-accent-red hover:bg-accent-red/90">Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```
