# TSiJUKEBOX - Guia de Acessibilidade WCAG 2.1 AA

> Documentação das práticas de acessibilidade implementadas e guidelines para contribuidores

## Conformidade Atual

O TSiJUKEBOX segue as diretrizes WCAG 2.1 nível AA para garantir que a interface seja acessível a todos os usuários.

---

## Implementações Atuais

### 1. Aria-labels

Todos os botões sem texto visível possuem `aria-label` descritivos:

| Componente | Elementos | Status |
|------------|-----------|--------|
| **PlayerControls** | Play/Pause, Next, Previous, Stop | ✅ |
| **PlaybackControls** | Shuffle, Repeat, Queue | ✅ |
| **VolumeSlider** | Mute/Unmute, Slider | ✅ |
| **CommandDeck** | Expand/Collapse, todos os botões | ✅ |
| **DigitalClock** | Botão do calendário | ✅ |

**Exemplo de implementação:**

```tsx
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();

<Button
  aria-label={shuffle ? t('player.shuffleOn') : t('player.shuffleOff')}
  aria-pressed={shuffle}
  onClick={toggleShuffle}
>
  <Shuffle className="w-5 h-5" />
</Button>
```

### 2. Skip Link

O componente `SkipLink` permite que usuários de teclado pulem diretamente para o conteúdo principal:

```tsx
// src/components/ui/SkipLink.tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Pular para conteúdo principal
</a>
```

### 3. Contraste de Cores

O sistema de cores foi projetado para atender aos requisitos mínimos:

| Tipo de Conteúdo | Ratio Mínimo | Implementação |
|------------------|--------------|---------------|
| Texto normal | 4.5:1 | `text-kiosk-text` (96% lightness) |
| Texto grande (≥18px bold) | 3:1 | Classes `text-gold-neon`, `text-label-yellow` |
| Componentes de UI | 3:1 | Bordas neon, ícones com glow |
| Estados de foco | 3:1 | Ring customizado com cor primária |

**Classes de alta visibilidade:**
- `text-label-yellow` - Labels de formulário (HSL 45 100% 65%)
- `text-label-orange` - Labels secundários (HSL 30 100% 60%)
- `icon-neon-blue` - Ícones com glow ciano

### 3.1 Exceções Intencionais de Contraste WCAG

Alguns elementos utilizam contraste reduzido intencionalmente para criar hierarquia visual. 
Todas as exceções são documentadas no código com comentários `/* WCAG Exception: */`.

#### Critérios para Exceções Válidas

Uma exceção de contraste é válida quando:
1. O elemento é **puramente decorativo** (não transmite informação crítica)
2. O elemento possui **estado alternativo** com contraste adequado (hover, focus, active)
3. O elemento é **redundante** (informação disponível por outros meios)
4. O elemento está em **estado desabilitado** (intencionalmente dimmed)

<!-- WCAG-EXCEPTIONS-START -->
<!-- Auto-generated section - DO NOT EDIT MANUALLY -->
<!-- Run: node scripts/generate-accessibility-docs.js -->

#### Lista Completa de Exceções (13 total)

| # | Arquivo | Opacidade | Elemento | Justificativa |
|---|---------|-----------|----------|---------------|
| 1 | `QueuePanel.tsx` | `/20` | GripVertical icon | Visível via `group-hover:opacity-100` |
| 2 | `CloudConnectionSection.tsx` | `/20` | Cloud icon | Ícone decorativo em estado não configurado |
| 3 | `InteractiveTestMode.tsx` | `/40` | Gesture demo icons | Demonstração visual não-crítica |
| 4 | `WikiArticle.tsx` | `/40` | Bookmark inactive | Transição hover → `text-yellow-500` |
| 5 | `LogoBrand.tsx` | `/60` | Tagline | Texto secundário; logo principal tem contraste adequado |
| 6 | `AccessibilitySection.tsx` | `/80` | VolumeX icon | Estado desabilitado distinto do ativado |
| 7 | `AccessibilitySection.tsx` | `/80` | Sparkles icon | Estado desabilitado distinto do ativado |
| 8 | `YouTubeMusicBrowser.tsx` | `opacity-30` | Library icon | Ícone decorativo em estado vazio |
| 9 | `SetupWizard.tsx` | `/30` | Achievement locked | Estado bloqueado; desbloqueado usa `yellow-400` |
| 10 | `ClientsMonitorDashboard.tsx` | `/30` | Building2 icon | Ícone decorativo em estado vazio |
| 11 | `SpotifySearch.tsx` | `/30` | Music/Search icons | Ícones decorativos em estados vazios |
| 12 | `SpotifyPanel.tsx` | `/40→/60` | Botão desconectado | Hover aumenta contraste; estado conectado usa `#1DB954` |
| 13 | `AddToPlaylistModal.tsx` | `/30` | Loader2/Plus icons | Tornam-se `#FF0000` quando adicionado |

<!-- WCAG-EXCEPTIONS-END -->

#### Regras de Substituição Padrão

Se um elemento **não se qualifica** como exceção válida, use estas substituições:

| Opacidade Original | Substituição | Ratio Aproximado |
|--------------------|--------------|------------------|
| `/20`, `/30`, `/40` | `/80` | ~4.5:1 |
| `/50` | `/85` | ~5:1 |
| `/60` | `/85` | ~5:1 |
| `/70`, `/74` | `/90` | ~6:1 |

#### Como Documentar Novas Exceções

Ao criar uma nova exceção, adicione um comentário no código:

```tsx
{/* WCAG Exception: [opacidade] [elemento] porque [justificativa específica] */}
<Icon className="text-kiosk-text/40" />
```

E adicione a entrada na tabela acima neste documento.

#### Página de Visualização Interativa

Acesse `/wcag-exceptions` na aplicação para ver demonstrações visuais de todas as exceções WCAG com:
- Estados normal vs hover comparados lado a lado
- Categorização por tipo (decorativo, mudança de estado, desabilitado, secundário)
- Código de comentário WCAG para copiar
- Filtros por categoria

#### Validação Automatizada

Execute `npm run wcag:validate` para verificar que todas as exceções estão documentadas.
O CI/CD bloqueia PRs com exceções não documentadas.

Todos os elementos interativos atendem ao tamanho mínimo de 44x44px:

| Elemento | Tamanho Mínimo | Implementação |
|----------|---------------|---------------|
| Botões de player | 56-64px | Classes CSS customizadas |
| CommandDeck | 88x88px | `.deck-button-3d-ultra` |
| Links de navegação | 44x44px | Padding adequado |
| Checkboxes/Switches | 44x44px | Área de toque expandida |

### 5. Navegação por Teclado

#### Atalhos Globais

| Tecla | Ação |
|-------|------|
| `Space` | Play/Pause |
| `→` | Próxima faixa |
| `←` | Faixa anterior |
| `↑` ou `+` | Aumentar volume 5% |
| `↓` ou `-` | Diminuir volume 5% |
| `Tab` | Navegar entre elementos |
| `Escape` | Fechar modais/popovers |

### 6. Estados de Foco Visíveis

Todos os elementos focáveis possuem indicadores visuais claros:

```css
/* Exemplo de focus ring */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 7. Modo Alto Contraste

Disponível em Configurações > Aparência > Acessibilidade:

- Aumenta contraste de cores
- Bordas mais visíveis
- Tamanho de fonte ajustável (80% - 150%)

---

## Scripts de Auditoria

### Auditoria Local

```bash
# Auditoria completa com Puppeteer + axe-core
npm run a11y

# Auditoria simples (sem Puppeteer)
npm run a11y:simple

# Verificação de contraste CSS
npm run contrast
```

### Auditoria no CI/CD

O workflow `.github/workflows/accessibility.yml` executa automaticamente em cada PR:

1. Build do projeto
2. Execução do axe-core em 6 rotas principais
3. Upload de relatório JSON como artifact
4. Comentário automático no PR com resultados

---

## Checklist para Contribuidores

### Ao Criar Botões Icon-Only

- [ ] Adicionar `aria-label` descritivo usando `useTranslation()`
- [ ] Usar `aria-pressed` para toggles (shuffle, repeat, mute)
- [ ] Garantir área de toque mínima de 44x44px
- [ ] Incluir estado de foco visível

```tsx
// ✅ Correto
<Button
  aria-label={t('player.shuffleOn')}
  aria-pressed={isShuffleOn}
  className="min-w-[44px] min-h-[44px]"
>
  <Shuffle />
</Button>

// ❌ Incorreto
<Button>
  <Shuffle />
</Button>
```

### Ao Criar Formulários

- [ ] Associar labels com `htmlFor` correspondente ao `id` do input
- [ ] Usar `aria-describedby` para hints e mensagens de erro
- [ ] Adicionar `role="alert"` em mensagens de erro dinâmicas
- [ ] Marcar campos obrigatórios com `aria-required="true"`

```tsx
// ✅ Correto
<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    aria-describedby="email-hint email-error"
    aria-required="true"
  />
  <p id="email-hint" className="text-sm">Seu email institucional</p>
  {error && <p id="email-error" role="alert">{error}</p>}
</div>
```

### Ao Usar Cores

- [ ] Verificar contraste com ferramentas (axe DevTools, Lighthouse)
- [ ] Usar classes do design system (não cores diretas)
- [ ] Nunca transmitir informação apenas por cor
- [ ] Adicionar indicadores textuais ou ícones quando necessário

```tsx
// ✅ Correto - Cor + ícone + texto
<Badge className="bg-green-500">
  <Check className="w-3 h-3 mr-1" />
  Conectado
</Badge>

// ❌ Incorreto - Apenas cor
<div className="w-3 h-3 rounded-full bg-green-500" />
```

### Ao Criar Modais/Dialogs

- [ ] Usar componente `Dialog` do Radix (gerencia foco automaticamente)
- [ ] Adicionar `aria-labelledby` apontando para o título
- [ ] Permitir fechamento com `Escape`
- [ ] Retornar foco ao elemento que abriu o modal

### Ao Adicionar Animações

- [ ] Respeitar `prefers-reduced-motion`
- [ ] Usar `animationsEnabled` do SettingsContext
- [ ] Não usar animações que pisquem mais de 3x por segundo

```tsx
// ✅ Correto
const { animationsEnabled } = useSettings();

<motion.div
  animate={animationsEnabled ? { scale: [1, 1.1, 1] } : {}}
/>
```

### Ao Criar Tabelas/Listas

- [ ] Usar elementos semânticos (`<table>`, `<th>`, `<ul>`, `<li>`)
- [ ] Adicionar `scope="col"` ou `scope="row"` em headers de tabela
- [ ] Usar `aria-sort` para colunas ordenáveis

---

## Ferramentas Recomendadas

### Para Desenvolvimento

1. **axe DevTools** (extensão Chrome/Firefox)
   - Auditoria em tempo real
   - Destaca elementos com problemas

2. **Lighthouse** (DevTools > Lighthouse)
   - Auditoria completa de acessibilidade
   - Score de 0-100

3. **WAVE** (extensão)
   - Visualização de estrutura de headings
   - Contraste checker

### Para Testes

1. **VoiceOver** (macOS) / **NVDA** (Windows)
   - Testar navegação com screen reader

2. **Keyboard-only navigation**
   - Desabilitar mouse e testar com Tab/Enter/Arrows

---

## Recursos Adicionais

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Authoring Practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)

---

## Traduções de Aria-labels

As traduções para aria-labels estão em:
- `src/i18n/locales/pt-BR.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`

**Chaves de player:**
```json
{
  "player": {
    "shuffleOn": "Aleatório: Ativado",
    "shuffleOff": "Aleatório: Desativado",
    "repeatOff": "Repetição: Desligada",
    "repeatTrack": "Repetição: Faixa atual",
    "repeatContext": "Repetição: Playlist",
    "openQueue": "Abrir fila de reprodução"
  }
}
```

---

**Última atualização:** Dezembro 2024  
**Conformidade alvo:** WCAG 2.1 AA
