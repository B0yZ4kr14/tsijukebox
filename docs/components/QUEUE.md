# Queue (Fila de Reprodução)

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

O componente `QueuePanel` é responsável por gerenciar a fila de reprodução de músicas.

---

## 🎯 Propósito

Exibir e gerenciar a lista de músicas na fila, permitindo reordenação e remoção.

---

## 📦 Importação

```tsx
import { QueuePanel } from '@/components/player/QueuePanel';
```

---

## 🔧 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `className` | `string` | `""` | Classes CSS adicionais |
| `disabled` | `boolean` | `false` | Desabilita o componente |

---

## 💻 Uso Básico

```tsx
import { QueuePanel } from '@/components/player/QueuePanel';

function MyPlayer() {
  return (
    <QueuePanel />
  );
}
```

---

## 🎨 Variantes

### Padrão

```tsx
<QueuePanel />
```

### Com Customização

```tsx
<QueuePanel className="custom-class" />
```

---

## ♿ Acessibilidade

- Suporte a navegação por teclado
- Atributos ARIA apropriados
- Compatível com leitores de tela

---

## 🔗 Componentes Relacionados

- [PlayerControls](PLAYER_CONTROLS.md)
- [NowPlaying](NOW_PLAYING.md)
- [VolumeSlider](VOLUME_SLIDER.md)
- [ProgressBar](PROGRESS_BAR.md)
- [Queue](QUEUE.md)

---

## 📚 Referências

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
