# Relatório de Refatoração de Cores Hardcoded

> **Gerado em:** 24/12/2025 01:59  
> **Total de Ocorrências:** 360  
> **Com Sugestão:** 311  
> **Sem Sugestão:** 49

---

## 📊 Resumo por Categoria

| Categoria | Quantidade |
|-----------|------------|
| Accent | 20 |
| Background | 59 |
| Brand | 147 |
| Gradient | 3 |
| Language | 18 |
| Overlay | 1 |
| State | 22 |
| Text | 6 |
| Theme | 22 |
| Unknown | 49 |
| Weather | 13 |

---

## 🎨 Cores Mais Frequentes

| Cor | Ocorrências | Token Sugerido | Tailwind |
|-----|-------------|----------------|----------|
| `#1DB954` | 100 | `spotify-green` | `text-spotify-green` |
| `#FF0000` | 38 | `youtube-red` | `text-youtube-red` |
| `#333333` | 32 | `background-active` | `bg-accent` |
| `#444444` | 12 | `background-elevated-hover` | `bg-zinc-700` |
| `rgba(0,212,255,0.6)` | 10 | `accent-cyan-60` | `bg-cyan-400/60` |
| `#FFD93D` | 7 | `weather-sun` | `text-yellow-300` |
| `#3ECF8E` | 6 | `success-light` | `text-emerald-400` |
| `#00FF88` | 4 | `success-bright` | `text-emerald-300` |
| `#00D4FF` | 4 | `accent-cyan` | `text-cyan-400` |
| `#050508` | 4 | `background-black-elevated` | `bg-zinc-950` |
| `#222222` | 4 | `background-darker` | `bg-zinc-900` |
| `#000000` | 3 | `background-black` | `bg-black` |
| `rgba(29,185,84,0.6)` | 3 | `spotify-green-60` | `bg-spotify-green/60` |
| `#1ED760` | 3 | `spotify-green-light` | `text-spotify-green-light` |
| `rgba(255,0,0,0.5)` | 3 | `youtube-red-50` | `bg-youtube-red/50` |
| `#FFFFFF` | 3 | `text-primary` | `text-foreground` |
| `#CCCCCC` | 3 | `text-light` | `text-gray-300` |
| `#3178C6` | 2 | `lang-typescript` | `text-[#3178C6]` |
| `#F7DF1E` | 2 | `lang-javascript` | `text-[#F7DF1E]` |
| `#3776AB` | 2 | `lang-python` | `text-[#3776AB]` |

---

## 📁 Ocorrências por Arquivo

### `src/components/settings/SpotifySetupWizard.tsx` (43 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 171 | `#1DB954` | `text-spotify-green` |
| 171 | `#1DB954` | `text-spotify-green` |
| 171 | `#1DB954` | `text-spotify-green` |
| 173 | `#1DB954` | `text-spotify-green` |
| 174 | `#1DB954` | `text-spotify-green` |
| 195 | `#1DB954` | `text-spotify-green` |
| 199 | `#1DB954` | `text-spotify-green` |
| 203 | `#1DB954` | `text-spotify-green` |
| 211 | `#1DB954` | `text-spotify-green` |
| 245 | `#1DB954` | `text-spotify-green` |

*... e mais 33 ocorrências*

### `src/components/settings/ThemeCustomizer.tsx` (23 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 30 | `#00BFFF` | `text-sky-400` |
| 30 | `#00FF7F` | `text-[#00FF7F]` |
| 30 | `#9B59B6` | `text-[#9B59B6]` |
| 30 | `#FF6B35` | `text-[#FF6B35]` |
| 30 | `#FF1493` | `text-[#FF1493]` |
| 30 | `#FFD700` | `text-[#FFD700]` |
| 31 | `#3B82F6` | `text-blue-500` |
| 31 | `#10B981` | `text-emerald-500` |
| 31 | `#8B5CF6` | `text-violet-500` |
| 31 | `#F59E0B` | `text-yellow-500` |

*... e mais 13 ocorrências*

### `src/components/player/PlaybackControls.tsx` (20 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 55 | `#1DB954` | `text-spotify-green` |
| 55 | `#1DB954` | `text-spotify-green` |
| 55 | `#1DB954` | `text-spotify-green` |
| 55 | `#1DB954` | `text-spotify-green` |
| 55 | `#1DB954` | `text-spotify-green` |
| 65 | `#1DB954` | `text-spotify-green` |
| 98 | `#1DB954` | `text-spotify-green` |
| 98 | `#1DB954` | `text-spotify-green` |
| 98 | `#1DB954` | `text-spotify-green` |
| 98 | `#1DB954` | `text-spotify-green` |

*... e mais 10 ocorrências*

### `src/components/weather/AnimatedWeatherIcon.tsx` (17 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 32 | `#FFD93D` | `text-yellow-300` |
| 46 | `#FFD93D` | `text-yellow-300` |
| 49 | `#FFD93D` | `text-yellow-300` |
| 49 | `#FFD93D` | `text-yellow-300` |
| 49 | `#FFD93D` | `text-yellow-300` |
| 58 | `#B0BEC5` | `text-gray-400` |
| 85 | `#78909C` | `text-gray-500` |
| 97 | `#4FC3F7` | `text-cyan-300` |
| 121 | `#90A4AE` | `text-gray-400` |
| 130 | `#E3F2FD` | `text-blue-50` |

*... e mais 7 ocorrências*

### `src/components/settings/DatabaseConfigSection.tsx` (13 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 115 | `#333333` | `bg-accent` |
| 142 | `#333333` | `bg-accent` |
| 169 | `#333333` | `bg-accent` |
| 196 | `#333333` | `bg-accent` |
| 219 | `#333333` | `bg-accent` |
| 239 | `#333333` | `bg-accent` |
| 307 | `#333333` | `bg-accent` |
| 362 | `#333333` | `bg-accent` |
| 99 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |
| 123 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |

*... e mais 3 ocorrências*

### `src/components/youtube/AddToPlaylistModal.tsx` (12 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 88 | `#FF0000` | `text-youtube-red` |
| 137 | `#FF0000` | `text-youtube-red` |
| 137 | `#FF0000` | `text-youtube-red` |
| 158 | `#FF0000` | `text-youtube-red` |
| 158 | `#FF0000` | `text-youtube-red` |
| 158 | `#FF0000` | `text-youtube-red` |
| 179 | `#FF0000` | `text-youtube-red` |
| 179 | `#FF0000` | `text-youtube-red` |
| 192 | `#FF0000` | `text-youtube-red` |
| 205 | `#FF0000` | `text-youtube-red` |

*... e mais 2 ocorrências*

### `src/components/spotify/SpotifyPanel.tsx` (11 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 248 | `#1DB954` | `text-spotify-green` |
| 273 | `#1DB954` | `text-spotify-green` |
| 276 | `#1DB954` | `text-spotify-green` |
| 279 | `#1DB954` | `text-spotify-green` |
| 282 | `#1DB954` | `text-spotify-green` |
| 285 | `#1DB954` | `text-spotify-green` |
| 288 | `#1DB954` | `text-spotify-green` |
| 291 | `#1DB954` | `text-spotify-green` |
| 501 | `#1DB954` | `text-spotify-green` |
| 502 | `#1DB954` | `text-spotify-green` |

*... e mais 1 ocorrências*

### `src/components/github/GitHubDashboardCharts.tsx` (10 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 31 | `#3178C6` | `text-[#3178C6]` |
| 32 | `#F7DF1E` | `text-[#F7DF1E]` |
| 33 | `#3776AB` | `text-[#3776AB]` |
| 34 | `#E34C26` | `text-[#E34C26]` |
| 35 | `#1572B6` | `text-[#1572B6]` |
| 36 | `#89E051` | `text-[#89E051]` |
| 37 | `#2496ED` | `text-[#2496ED]` |
| 38 | `#CB171E` | `text-[#CB171E]` |
| 39 | `#000000` | `bg-black` |
| 40 | `#083FA1` | `text-[#083FA1]` |

### `src/components/github/LanguagesChart.tsx` (10 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 8 | `#3178C6` | `text-[#3178C6]` |
| 9 | `#F7DF1E` | `text-[#F7DF1E]` |
| 10 | `#264DE4` | `text-[#264DE4]` |
| 11 | `#E34C26` | `text-[#E34C26]` |
| 12 | `#3776AB` | `text-[#3776AB]` |
| 13 | `#89E051` | `text-[#89E051]` |
| 14 | `#2496ED` | `text-[#2496ED]` |
| 15 | `#000000` | `bg-black` |
| 16 | `#083FA1` | `text-[#083FA1]` |
| 17 | `#CB171E` | `text-[#CB171E]` |

### `src/components/settings/UserManagementSection.tsx` (10 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 265 | `#333333` | `bg-accent` |
| 280 | `#333333` | `bg-accent` |
| 313 | `#333333` | `bg-accent` |
| 390 | `#333333` | `bg-accent` |
| 270 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |
| 303 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |
| 322 | `rgba(0,212,255,0.3)` | `bg-cyan-400/30` |
| 359 | `rgba(239,68,68,0.3)` | `bg-red-500/30` |
| 521 | `rgba(239,68,68,0.3)` | `bg-red-500/30` |
| 522 | `rgba(239,68,68,0.5)` | `bg-red-500/50` |

### `src/components/ui/button.tsx` (10 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 26 | `#00B8E6` | `text-cyan-500` |
| 30 | `#333333` | `bg-accent` |
| 30 | `#444444` | `bg-zinc-700` |
| 38 | `#333333` | `bg-accent` |
| 38 | `#444444` | `bg-zinc-700` |
| 42 | `#333333` | `bg-accent` |
| 46 | `#FF3333` | `text-red-500` |
| 50 | `#00E63D` | `text-green-400` |
| 54 | `#E6BD00` | `text-yellow-600` |
| 58 | `#00B8E6` | `text-cyan-500` |

### `src/components/ui/__tests__/SectionIconsShowcase.test.tsx` (10 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 115 | `#00FF88` | `text-emerald-300` |
| 116 | `#00D4FF` | `text-cyan-400` |
| 117 | `#FF00D4` | `text-[#FF00D4]` |
| 118 | `#FFD400` | `text-[#FFD400]` |
| 119 | `#D400FF` | `text-[#D400FF]` |
| 120 | `#FF4400` | `text-[#FF4400]` |
| 121 | `#00FF44` | `text-green-300` |
| 122 | `#4400FF` | `text-[#4400FF]` |
| 325 | `#00FF88` | `text-emerald-300` |
| 334 | `#00D4FF` | `text-cyan-400` |

### `src/components/ui/card.tsx` (9 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 25 | `#333333` | `bg-accent` |
| 25 | `#444444` | `bg-zinc-700` |
| 29 | `#444444` | `bg-zinc-700` |
| 33 | `#333333` | `bg-accent` |
| 33 | `#444444` | `bg-zinc-700` |
| 37 | `#444444` | `bg-zinc-700` |
| 41 | `#333333` | `bg-accent` |
| 41 | `#444444` | `bg-zinc-700` |
| 45 | `#333333` | `bg-accent` |

### `src/components/settings/ColorPicker.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 76 | `#00BFFF` | `text-sky-400` |
| 107 | `#FF0000` | `text-youtube-red` |
| 107 | `#FFFF00` | `text-yellow-400` |
| 107 | `#00FF00` | `text-green-400` |
| 107 | `#00FFFF` | `text-cyan-400` |
| 107 | `#0000FF` | `text-blue-500` |
| 107 | `#FF00FF` | `text-fuchsia-500` |
| 107 | `#FF0000` | `text-youtube-red` |

### `src/components/settings/MusicIntegrationsSection.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 46 | `#1DB954` | `text-spotify-green` |
| 59 | `#FF0000` | `text-youtube-red` |
| 68 | `#1ED760` | `text-spotify-green-light` |
| 77 | `#6366F1` | `text-indigo-500` |
| 252 | `#1DB954` | `text-spotify-green` |
| 252 | `#1DB954` | `text-spotify-green` |
| 262 | `#FF0000` | `text-youtube-red` |
| 262 | `#FF0000` | `text-youtube-red` |

### `src/components/settings/SettingsSidebar.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 91 | `#222222` | `bg-zinc-900` |
| 177 | `#333333` | `bg-accent` |
| 202 | `#222222` | `bg-zinc-900` |
| 246 | `#333333` | `bg-accent` |
| 266 | `#222222` | `bg-zinc-900` |
| 268 | `#222222` | `bg-zinc-900` |
| 300 | `#333333` | `bg-accent` |
| 227 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |

### `src/components/ui/SectionIconsShowcase.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 31 | `#00FF88` | `text-emerald-300` |
| 41 | `#00D4FF` | `text-cyan-400` |
| 51 | `#FF00D4` | `text-[#FF00D4]` |
| 61 | `#FFD400` | `text-[#FFD400]` |
| 71 | `#D400FF` | `text-[#D400FF]` |
| 81 | `#FF4400` | `text-[#FF4400]` |
| 91 | `#00FF44` | `text-green-300` |
| 101 | `#4400FF` | `text-[#4400FF]` |

### `src/components/youtube/YouTubeMusicPlaylistCard.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 36 | `#FF0000` | `text-youtube-red` |
| 54 | `#FF0000` | `text-youtube-red` |
| 54 | `#FF0000` | `text-youtube-red` |
| 140 | `#FF0000` | `text-youtube-red` |
| 140 | `#FF0000` | `text-youtube-red` |
| 141 | `#FF0000` | `text-youtube-red` |
| 152 | `#FF0000` | `text-youtube-red` |
| 152 | `rgba(255,0,0,0.5)` | `bg-youtube-red/50` |

### `src/components/player/NowPlaying.tsx` (7 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 35 | `#050508` | `bg-zinc-950` |
| 36 | `#0A0A12` | `bg-slate-950` |
| 36 | `#000000` | `bg-black` |
| 46 | `#050508` | `bg-zinc-950` |
| 52 | `#050508` | `bg-zinc-950` |
| 52 | `#050508` | `bg-zinc-950` |
| 55 | `rgba(0,0,0,0.6)` | `bg-black/60` |

### `src/components/youtube/YouTubeMusicAlbumCard.tsx` (7 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 22 | `#FF0000` | `text-youtube-red` |
| 22 | `#FF0000` | `text-youtube-red` |
| 100 | `#FF0000` | `text-youtube-red` |
| 100 | `#FF0000` | `text-youtube-red` |
| 101 | `#FF0000` | `text-youtube-red` |
| 112 | `#FF0000` | `text-youtube-red` |
| 112 | `rgba(255,0,0,0.5)` | `bg-youtube-red/50` |


---

## 🔧 Design Tokens Recomendados

### CSS Variables

```css
:root {
  /* Background */
  --background: #0a0a0a;
  --background-dark: #121212;
  --background-elevated: #1a1a1a;
  --background-surface: #181818;
  --background-hover: #282828;
  
  /* Text */
  --foreground: #ffffff;
  --muted-foreground: #b3b3b3;
  
  /* Border */
  --border: #404040;
  
  /* Brand */
  --spotify-green: #1DB954;
  --youtube-red: #FF0000;
  
  /* State */
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'youtube-red': '#FF0000',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
    },
  },
};
```

---

## ✅ Próximos Passos

1. **Prioridade Alta:** Refatorar cores de background (mais frequentes)
2. **Prioridade Média:** Refatorar cores de texto
3. **Prioridade Baixa:** Refatorar cores de borda e estado

### Exemplo de Refatoração

**Antes:**
```tsx
<div style={{ backgroundColor: '#121212' }}>
```

**Depois:**
```tsx
<div className="bg-card">
```

---

## 📚 Referências

- [Design System](../DESIGN-SYSTEM.md)
- [Tailwind CSS](https://tailwindcss.com/docs/customizing-colors)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
