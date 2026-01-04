# PlayerControls

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

O componente `PlayerControls` é responsável por gerenciar os controles de reprodução de mídia (play, pause, skip, etc.).

---

## 🎯 Propósito

Fornecer uma interface intuitiva para controlar a reprodução de músicas, incluindo botões de play/pause, anterior, próximo e shuffle.

---

## 📦 Importação

```tsx
import { PlayerControls } from '@/components/player/PlayerControls';
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
import { PlayerControls } from '@/components/player/PlayerControls';

function MyPlayer() {
  return (
    <PlayerControls />
  );
}
```

---

## 🎨 Variantes

### Padrão

```tsx
<PlayerControls />
```

### Com Customização

```tsx
<PlayerControls className="custom-class" />
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
