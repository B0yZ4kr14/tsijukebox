# Relatório de Refatoração de Cores Hardcoded

> **Gerado em:** 25/12/2025 01:36  
> **Total de Ocorrências:** 367  
> **Com Sugestão:** 312  
> **Sem Sugestão:** 55

---

## 📊 Resumo por Categoria

| Categoria | Quantidade |
|-----------|------------|
| Accent | 20 |
| Background | 59 |
| Brand | 151 |
| Gradient | 3 |
| Language | 18 |
| Overlay | 1 |
| State | 22 |
| Text | 6 |
| Theme | 27 |
| Unknown | 55 |
| Weather | 5 |

---

## 🎨 Cores Mais Frequentes

| Cor | Ocorrências | Token Sugerido | Tailwind |
|-----|-------------|----------------|----------|
| `#1DB954` | 102 | `spotify-green` | `text-spotify-green` |
| `#FF0000` | 40 | `youtube-red` | `text-youtube-red` |
| `#333333` | 32 | `background-active` | `bg-accent` |
| `#444444` | 12 | `background-elevated-hover` | `bg-zinc-700` |
| `rgba(0,212,255,0.6)` | 10 | `accent-cyan-60` | `bg-cyan-400/60` |
| `#3ECF8E` | 6 | `success-light` | `text-emerald-400` |
| `#FF6B35` | 6 | `theme-orange` | `text-[#FF6B35]` |
| `#00D4FF` | 5 | `accent-cyan` | `text-cyan-400` |
| `#00FF88` | 4 | `success-bright` | `text-emerald-300` |
| `#050508` | 4 | `background-black-elevated` | `bg-zinc-950` |
| `#222222` | 4 | `background-darker` | `bg-zinc-900` |
| `#FFD93D` | 4 | `weather-sun` | `text-yellow-300` |
| `#000000` | 3 | `background-black` | `bg-black` |
| `rgba(29,185,84,0.6)` | 3 | `spotify-green-60` | `bg-spotify-green/60` |
| `#1ED760` | 3 | `spotify-green-light` | `text-spotify-green-light` |
| `rgba(255,0,0,0.5)` | 3 | `youtube-red-50` | `bg-youtube-red/50` |
| `#FFFFFF` | 3 | `text-primary` | `text-foreground` |
| `#CCCCCC` | 3 | `text-light` | `text-gray-300` |
| `#FBBF24` | 3 | `❌ Não mapeado` | `-` |
| `#3178C6` | 2 | `lang-typescript` | `text-[#3178C6]` |

---

## 📁 Ocorrências por Arquivo

### `src/components/settings/SpotifySetupWizard.tsx` (43 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 172 | `#1DB954` | `text-spotify-green` |
| 172 | `#1DB954` | `text-spotify-green` |
| 172 | `#1DB954` | `text-spotify-green` |
| 174 | `#1DB954` | `text-spotify-green` |
| 175 | `#1DB954` | `text-spotify-green` |
| 196 | `#1DB954` | `text-spotify-green` |
| 200 | `#1DB954` | `text-spotify-green` |
| 204 | `#1DB954` | `text-spotify-green` |
| 212 | `#1DB954` | `text-spotify-green` |
| 246 | `#1DB954` | `text-spotify-green` |

*... e mais 33 ocorrências*

### `src/components/settings/ThemeCustomizer.tsx` (23 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 31 | `#00BFFF` | `text-sky-400` |
| 31 | `#00FF7F` | `text-[#00FF7F]` |
| 31 | `#9B59B6` | `text-[#9B59B6]` |
| 31 | `#FF6B35` | `text-[#FF6B35]` |
| 31 | `#FF1493` | `text-[#FF1493]` |
| 31 | `#FFD700` | `text-[#FFD700]` |
| 32 | `#3B82F6` | `text-blue-500` |
| 32 | `#10B981` | `text-emerald-500` |
| 32 | `#8B5CF6` | `text-violet-500` |
| 32 | `#F59E0B` | `text-yellow-500` |

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

### `src/components/settings/DatabaseConfigSection.tsx` (13 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 116 | `#333333` | `bg-accent` |
| 143 | `#333333` | `bg-accent` |
| 170 | `#333333` | `bg-accent` |
| 197 | `#333333` | `bg-accent` |
| 220 | `#333333` | `bg-accent` |
| 240 | `#333333` | `bg-accent` |
| 308 | `#333333` | `bg-accent` |
| 363 | `#333333` | `bg-accent` |
| 100 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |
| 124 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |

*... e mais 3 ocorrências*

### `src/components/ui/TSiLogo.tsx` (12 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 73 | `#1A1A2E` | `❌` |
| 74 | `#16213E` | `❌` |
| 77 | `#FF6B35` | `text-[#FF6B35]` |
| 78 | `#FBBF24` | `❌` |
| 79 | `#FF6B35` | `text-[#FF6B35]` |
| 82 | `#00D4FF` | `text-cyan-400` |
| 83 | `#00B4D8` | `❌` |
| 166 | `#FF6B35` | `text-[#FF6B35]` |
| 166 | `#FBBF24` | `❌` |
| 166 | `#FF6B35` | `text-[#FF6B35]` |

*... e mais 2 ocorrências*

### `src/components/youtube/AddToPlaylistModal.tsx` (12 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 89 | `#FF0000` | `text-youtube-red` |
| 138 | `#FF0000` | `text-youtube-red` |
| 138 | `#FF0000` | `text-youtube-red` |
| 159 | `#FF0000` | `text-youtube-red` |
| 159 | `#FF0000` | `text-youtube-red` |
| 159 | `#FF0000` | `text-youtube-red` |
| 180 | `#FF0000` | `text-youtube-red` |
| 180 | `#FF0000` | `text-youtube-red` |
| 193 | `#FF0000` | `text-youtube-red` |
| 206 | `#FF0000` | `text-youtube-red` |

*... e mais 2 ocorrências*

### `src/components/spotify/SpotifyPanel.tsx` (11 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 249 | `#1DB954` | `text-spotify-green` |
| 274 | `#1DB954` | `text-spotify-green` |
| 277 | `#1DB954` | `text-spotify-green` |
| 280 | `#1DB954` | `text-spotify-green` |
| 283 | `#1DB954` | `text-spotify-green` |
| 286 | `#1DB954` | `text-spotify-green` |
| 289 | `#1DB954` | `text-spotify-green` |
| 292 | `#1DB954` | `text-spotify-green` |
| 502 | `#1DB954` | `text-spotify-green` |
| 503 | `#1DB954` | `text-spotify-green` |

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
| 266 | `#333333` | `bg-accent` |
| 281 | `#333333` | `bg-accent` |
| 314 | `#333333` | `bg-accent` |
| 391 | `#333333` | `bg-accent` |
| 271 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |
| 304 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |
| 323 | `rgba(0,212,255,0.3)` | `bg-cyan-400/30` |
| 360 | `rgba(239,68,68,0.3)` | `bg-red-500/30` |
| 522 | `rgba(239,68,68,0.3)` | `bg-red-500/30` |
| 523 | `rgba(239,68,68,0.5)` | `bg-red-500/50` |

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

### `src/components/weather/AnimatedWeatherIcon.tsx` (9 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 49 | `#FFD93D` | `text-yellow-300` |
| 49 | `#FFD93D` | `text-yellow-300` |
| 49 | `#FFD93D` | `text-yellow-300` |
| 58 | `#B0BEC5` | `text-gray-400` |
| 158 | `#546E7A` | `❌` |
| 163 | `#FFC107` | `❌` |
| 173 | `#FFC107` | `❌` |
| 220 | `#FFD93D` | `text-yellow-300` |
| 225 | `#ECEFF1` | `❌` |

### `src/components/settings/MusicIntegrationsSection.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 47 | `#1DB954` | `text-spotify-green` |
| 60 | `#FF0000` | `text-youtube-red` |
| 69 | `#1ED760` | `text-spotify-green-light` |
| 78 | `#6366F1` | `text-indigo-500` |
| 253 | `#1DB954` | `text-spotify-green` |
| 253 | `#1DB954` | `text-spotify-green` |
| 263 | `#FF0000` | `text-youtube-red` |
| 263 | `#FF0000` | `text-youtube-red` |

### `src/components/settings/SettingsSidebar.tsx` (8 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 92 | `#222222` | `bg-zinc-900` |
| 178 | `#333333` | `bg-accent` |
| 203 | `#222222` | `bg-zinc-900` |
| 247 | `#333333` | `bg-accent` |
| 267 | `#222222` | `bg-zinc-900` |
| 269 | `#222222` | `bg-zinc-900` |
| 301 | `#333333` | `bg-accent` |
| 228 | `rgba(0,212,255,0.6)` | `bg-cyan-400/60` |

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

### `src/components/settings/ColorPicker.tsx` (7 ocorrências)

| Linha | Cor | Sugestão |
|-------|-----|----------|
| 108 | `#FF0000` | `text-youtube-red` |
| 108 | `#FFFF00` | `text-yellow-400` |
| 108 | `#00FF00` | `text-green-400` |
| 108 | `#00FFFF` | `text-cyan-400` |
| 108 | `#0000FF` | `text-blue-500` |
| 108 | `#FF00FF` | `text-fuchsia-500` |
| 108 | `#FF0000` | `text-youtube-red` |


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
