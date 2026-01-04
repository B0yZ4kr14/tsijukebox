# ProgressBar

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

O componente `ProgressBar` é responsável por exibir e controlar o progresso da reprodução.

---

## 🎯 Propósito

Mostrar o progresso atual da música e permitir que o usuário navegue para diferentes partes da faixa.

---

## 📦 Importação

```tsx
import { ProgressBar } from '@/components/player/ProgressBar';
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
import { ProgressBar } from '@/components/player/ProgressBar';

function MyPlayer() {
  return (
    <ProgressBar />
  );
}
```

---

## 🎨 Variantes

### Padrão

```tsx
<ProgressBar />
```

### Com Customização

```tsx
<ProgressBar className="custom-class" />
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
