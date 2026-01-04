# NowPlaying

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

O componente `NowPlaying` é responsável por exibir informações sobre a música atualmente em reprodução.

---

## 🎯 Propósito

Mostrar ao usuário detalhes da música atual, incluindo título, artista, álbum e capa.

---

## 📦 Importação

```tsx
import { NowPlaying } from '@/components/player/NowPlaying';
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
import { NowPlaying } from '@/components/player/NowPlaying';

function MyPlayer() {
  return (
    <NowPlaying />
  );
}
```

---

## 🎨 Variantes

### Padrão

```tsx
<NowPlaying />
```

### Com Customização

```tsx
<NowPlaying className="custom-class" />
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
