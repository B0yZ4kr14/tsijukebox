# VolumeSlider

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

O componente `VolumeSlider` é responsável por controlar o volume de reprodução.

---

## 🎯 Propósito

Permitir que o usuário ajuste o volume de forma intuitiva através de um slider.

---

## 📦 Importação

```tsx
import { VolumeSlider } from '@/components/player/VolumeSlider';
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
import { VolumeSlider } from '@/components/player/VolumeSlider';

function MyPlayer() {
  return (
    <VolumeSlider />
  );
}
```

---

## 🎨 Variantes

### Padrão

```tsx
<VolumeSlider />
```

### Com Customização

```tsx
<VolumeSlider className="custom-class" />
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
