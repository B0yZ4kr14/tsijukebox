# Mapeamento de Design Tokens - Cores Não Mapeadas

> **Última Atualização:** 24/12/2025  
> **Status:** 📝 Em Desenvolvimento  
> **Objetivo:** Mapear as 171 cores hardcoded sem sugestão para design tokens apropriados

---

## 📊 Análise das Cores Não Mapeadas

Com base no relatório `COLOR_REFACTOR_REPORT.md`, identificamos **171 ocorrências** de cores sem mapeamento. Abaixo está a análise categorizada e as sugestões de design tokens.

---

## 🎨 Categorias de Cores Não Mapeadas

### 1. **Cores de Background/UI (Prioridade Alta)**

| Cor Original | Ocorrências | Token Sugerido | Tailwind | CSS Variable | Categoria |
|--------------|-------------|----------------|----------|--------------|-----------|
| `#444444` | 12 | `background-elevated-hover` | `bg-zinc-700` | `var(--background-elevated-hover)` | background |
| `#222222` | 4 | `background-darker` | `bg-zinc-900` | `var(--background-darker)` | background |
| `#050508` | 4 | `background-black-elevated` | `bg-zinc-950` | `var(--background-black-elevated)` | background |
| `#0A0A12` | 1 | `background-deep` | `bg-slate-950` | `var(--background-deep)` | background |
| `#CCCCCC` | 3 | `text-light` | `text-gray-300` | `var(--text-light)` | text |

**Justificativa:**
- `#444444`: Cor intermediária entre `#333333` (background-active) e `#535353` (border-hover), ideal para estados de hover em backgrounds elevados
- `#222222`: Mais escuro que `#282828` (background-hover), usado para backgrounds mais profundos
- `#050508`: Quase preto, usado para overlays e backgrounds de alto contraste
- `#CCCCCC`: Cinza claro para texto secundário em fundos escuros

---

### 2. **Cores de Accent/Highlight (Prioridade Alta)**

| Cor Original | Ocorrências | Token Sugerido | Tailwind | CSS Variable | Categoria |
|--------------|-------------|----------------|----------|--------------|-----------|
| `rgba(0,212,255,0.6)` | 10 | `accent-cyan-60` | `bg-cyan-400/60` | `var(--accent-cyan-60)` | accent |
| `rgba(0,212,255,0.3)` | 1 | `accent-cyan-30` | `bg-cyan-400/30` | `var(--accent-cyan-30)` | accent |
| `#00D4FF` | 4 | `accent-cyan` | `text-cyan-400` | `var(--accent-cyan)` | accent |
| `#00B8E6` | 2 | `accent-cyan-dark` | `text-cyan-500` | `var(--accent-cyan-dark)` | accent |
| `#00BFFF` | 2 | `accent-sky` | `text-sky-400` | `var(--accent-sky)` | accent |

**Justificativa:**
- Cores ciano/azul claro são usadas para destacar elementos interativos (ex: DatabaseConfigSection)
- Variações de opacidade (60%, 30%) para overlays e estados hover
- Consistente com o tema dark do TSiJUKEBOX

---

### 3. **Cores de Estado/Feedback (Prioridade Média)**

| Cor Original | Ocorrências | Token Sugerido | Tailwind | CSS Variable | Categoria |
|--------------|-------------|----------------|----------|--------------|-----------|
| `#3ECF8E` | 6 | `success-light` | `text-emerald-400` | `var(--success-light)` | state |
| `#00FF88` | 4 | `success-bright` | `text-emerald-300` | `var(--success-bright)` | state |
| `#00E63D` | 1 | `success-neon` | `text-green-400` | `var(--success-neon)` | state |
| `#00FF44` | 1 | `success-vivid` | `text-green-300` | `var(--success-vivid)` | state |
| `#FF3333` | 1 | `error-light` | `text-red-500` | `var(--error-light)` | state |
| `rgba(239,68,68,0.3)` | 2 | `error-overlay-30` | `bg-red-500/30` | `var(--error-overlay-30)` | state |
| `rgba(239,68,68,0.5)` | 1 | `error-overlay-50` | `bg-red-500/50` | `var(--error-overlay-50)` | state |
| `#E6BD00` | 1 | `warning-dark` | `text-yellow-600` | `var(--warning-dark)` | state |

**Justificativa:**
- Variações de verde para estados de sucesso/confirmação
- Variações de vermelho para erros e alertas
- Overlays com opacidade para feedback visual não intrusivo

---

### 4. **Cores de Brand/Integração (Prioridade Média)**

| Cor Original | Ocorrências | Token Sugerido | Tailwind | CSS Variable | Categoria |
|--------------|-------------|----------------|----------|--------------|-----------|
| `rgba(29,185,84,0.6)` | 3 | `spotify-green-60` | `bg-spotify-green/60` | `var(--spotify-green-60)` | brand |
| `rgba(255,0,0,0.5)` | 3 | `youtube-red-50` | `bg-youtube-red/50` | `var(--youtube-red-50)` | brand |

**Justificativa:**
- Versões com opacidade das cores de marca para overlays e estados hover
- Mantém consistência visual com as marcas Spotify e YouTube

---

### 5. **Cores de Linguagens de Programação (Prioridade Baixa)**

Estas cores são usadas em `GitHubDashboardCharts.tsx` e `LanguagesChart.tsx` para representar linguagens de programação. **Recomendação:** Manter as cores originais, pois são padrões da comunidade.

| Cor Original | Linguagem | Token Sugerido | Manter Original? |
|--------------|-----------|----------------|------------------|
| `#3178C6` | TypeScript | `lang-typescript` | ✅ Sim |
| `#F7DF1E` | JavaScript | `lang-javascript` | ✅ Sim |
| `#3776AB` | Python | `lang-python` | ✅ Sim |
| `#E34C26` | HTML | `lang-html` | ✅ Sim |
| `#1572B6` | CSS | `lang-css` | ✅ Sim |
| `#264DE4` | CSS3 | `lang-css3` | ✅ Sim |
| `#89E051` | Node.js | `lang-nodejs` | ✅ Sim |
| `#2496ED` | Docker | `lang-docker` | ✅ Sim |
| `#CB171E` | Ruby | `lang-ruby` | ✅ Sim |
| `#083FA1` | Markdown | `lang-markdown` | ✅ Sim |

**Justificativa:**
- Cores oficiais das linguagens, reconhecidas pela comunidade
- Criar tokens para manutenibilidade, mas manter valores originais

---

### 6. **Cores de Weather/UI Decorativo (Prioridade Baixa)**

Usadas em `AnimatedWeatherIcon.tsx` para representar elementos climáticos.

| Cor Original | Elemento | Token Sugerido | Tailwind | CSS Variable |
|--------------|----------|----------------|----------|--------------|
| `#FFD93D` | Sol | `weather-sun` | `text-yellow-300` | `var(--weather-sun)` |
| `#B0BEC5` | Nuvem | `weather-cloud` | `text-gray-400` | `var(--weather-cloud)` |
| `#78909C` | Nuvem escura | `weather-cloud-dark` | `text-gray-500` | `var(--weather-cloud-dark)` |
| `#90A4AE` | Nuvem média | `weather-cloud-medium` | `text-gray-400` | `var(--weather-cloud-medium)` |
| `#4FC3F7` | Chuva | `weather-rain` | `text-cyan-300` | `var(--weather-rain)` |
| `#E3F2FD` | Neve | `weather-snow` | `text-blue-50` | `var(--weather-snow)` |

**Justificativa:**
- Cores representativas dos elementos naturais
- Mantém consistência visual com ícones de clima

---

### 7. **Cores de Theme Customizer (Prioridade Baixa)**

Usadas em `ThemeCustomizer.tsx` e `ColorPicker.tsx` como opções de personalização.

| Cor Original | Descrição | Token Sugerido | Categoria |
|--------------|-----------|----------------|-----------|
| `#00BFFF` | Deep Sky Blue | `theme-sky` | theme |
| `#00FF7F` | Spring Green | `theme-spring` | theme |
| `#9B59B6` | Amethyst | `theme-amethyst` | theme |
| `#FF6B35` | Orange Red | `theme-orange` | theme |
| `#FF1493` | Deep Pink | `theme-pink` | theme |
| `#FFD700` | Gold | `theme-gold` | theme |
| `#10B981` | Emerald | `theme-emerald` | theme |
| `#FF00D4` | Magenta | `theme-magenta` | theme |
| `#FFD400` | Yellow | `theme-yellow` | theme |
| `#D400FF` | Violet | `theme-violet` | theme |
| `#FF4400` | Orange | `theme-orange-bright` | theme |
| `#4400FF` | Blue Violet | `theme-blue-violet` | theme |
| `#FFFF00` | Pure Yellow | `theme-pure-yellow` | theme |
| `#00FF00` | Pure Green | `theme-pure-green` | theme |
| `#00FFFF` | Cyan | `theme-cyan` | theme |
| `#0000FF` | Pure Blue | `theme-pure-blue` | theme |
| `#FF00FF` | Magenta | `theme-pure-magenta` | theme |

**Justificativa:**
- Cores de personalização do usuário, devem permanecer vibrantes
- Criar tokens para facilitar manutenção, mas manter valores originais

---

### 8. **Cores de Overlay/Transparência (Prioridade Média)**

| Cor Original | Token Sugerido | Tailwind | CSS Variable |
|--------------|----------------|----------|--------------|
| `rgba(0,0,0,0.6)` | `overlay-dark-60` | `bg-black/60` | `var(--overlay-dark-60)` |

**Justificativa:**
- Variação do overlay padrão (0.5) para maior contraste

---

## 🔧 Implementação Recomendada

### 1. Atualizar CSS Variables

Adicionar ao arquivo `src/styles/globals.css` ou similar:

```css
:root {
  /* Background Extensions */
  --background-elevated-hover: #444444;
  --background-darker: #222222;
  --background-black-elevated: #050508;
  --background-deep: #0A0A12;
  
  /* Text Extensions */
  --text-light: #CCCCCC;
  
  /* Accent Colors */
  --accent-cyan: #00D4FF;
  --accent-cyan-dark: #00B8E6;
  --accent-sky: #00BFFF;
  --accent-cyan-60: rgba(0, 212, 255, 0.6);
  --accent-cyan-30: rgba(0, 212, 255, 0.3);
  
  /* State Extensions */
  --success-light: #3ECF8E;
  --success-bright: #00FF88;
  --success-neon: #00E63D;
  --success-vivid: #00FF44;
  --error-light: #FF3333;
  --error-overlay-30: rgba(239, 68, 68, 0.3);
  --error-overlay-50: rgba(239, 68, 68, 0.5);
  --warning-dark: #E6BD00;
  
  /* Brand Extensions */
  --spotify-green-60: rgba(29, 185, 84, 0.6);
  --youtube-red-50: rgba(255, 0, 0, 0.5);
  
  /* Weather Colors */
  --weather-sun: #FFD93D;
  --weather-cloud: #B0BEC5;
  --weather-cloud-dark: #78909C;
  --weather-cloud-medium: #90A4AE;
  --weather-rain: #4FC3F7;
  --weather-snow: #E3F2FD;
  
  /* Programming Languages */
  --lang-typescript: #3178C6;
  --lang-javascript: #F7DF1E;
  --lang-python: #3776AB;
  --lang-html: #E34C26;
  --lang-css: #1572B6;
  --lang-css3: #264DE4;
  --lang-nodejs: #89E051;
  --lang-docker: #2496ED;
  --lang-ruby: #CB171E;
  --lang-markdown: #083FA1;
  
  /* Overlay Extensions */
  --overlay-dark-60: rgba(0, 0, 0, 0.6);
}
```

---

### 2. Atualizar Tailwind Config

Adicionar ao `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Background extensions
        'background-elevated-hover': '#444444',
        'background-darker': '#222222',
        
        // Accent colors
        'accent-cyan': '#00D4FF',
        'accent-sky': '#00BFFF',
        
        // State extensions
        'success-light': '#3ECF8E',
        'success-bright': '#00FF88',
        'error-light': '#FF3333',
        
        // Weather
        'weather-sun': '#FFD93D',
        'weather-cloud': '#B0BEC5',
        'weather-rain': '#4FC3F7',
        
        // Languages
        'lang-typescript': '#3178C6',
        'lang-javascript': '#F7DF1E',
        'lang-python': '#3776AB',
        'lang-html': '#E34C26',
        'lang-css': '#1572B6',
        'lang-nodejs': '#89E051',
        'lang-docker': '#2496ED',
        'lang-ruby': '#CB171E',
      },
    },
  },
};
```

---

## 📋 Checklist de Implementação

### Prioridade Alta (Impacto Imediato)
- [ ] Implementar cores de background (`#444444`, `#222222`, `#050508`)
- [ ] Implementar cores de accent cyan (`rgba(0,212,255,0.6)`, `#00D4FF`)
- [ ] Atualizar `DatabaseConfigSection.tsx` com novos tokens
- [ ] Atualizar `button.tsx` e `card.tsx` com novos tokens
- [ ] Atualizar `SettingsSidebar.tsx` com novos tokens

### Prioridade Média (Consistência Visual)
- [ ] Implementar cores de estado (`#3ECF8E`, `#00FF88`, etc.)
- [ ] Implementar overlays de brand (`spotify-green-60`, `youtube-red-50`)
- [ ] Atualizar `UserManagementSection.tsx` com novos tokens
- [ ] Atualizar componentes de feedback visual

### Prioridade Baixa (Manutenibilidade)
- [ ] Criar tokens para cores de linguagens de programação
- [ ] Criar tokens para cores de weather
- [ ] Documentar cores de theme customizer
- [ ] Atualizar `ThemeCustomizer.tsx` e `ColorPicker.tsx`

---

## 📊 Estatísticas Após Mapeamento

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Cores sem sugestão | 171 | 0 | 100% |
| Cobertura de tokens | 52.5% | 100% | +47.5% |
| Cores mapeadas | 189 | 360 | +90.5% |

---

## 🔗 Próximos Passos

1. **Atualizar o script `refactor-hardcoded-colors.py`** com os novos mapeamentos
2. **Executar o script em modo `--dry-run`** para verificar as alterações
3. **Aplicar refatorações gradualmente** por categoria de prioridade
4. **Testar visualmente** cada componente após refatoração
5. **Atualizar documentação** do design system

---

## 📚 Referências

- [COLOR_REFACTOR_REPORT.md](COLOR_REFACTOR_REPORT.md)
- [Design System](DESIGN-SYSTEM.md)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [GitHub Language Colors](https://github.com/ozh/github-colors)
