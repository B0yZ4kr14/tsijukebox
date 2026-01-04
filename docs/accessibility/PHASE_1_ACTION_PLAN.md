# Fase 1: Correções Críticas - Plano de Ação Detalhado

> **Objetivo:** Resolver problemas que impedem o uso por tecnologias assistivas  
> **Prazo:** 2 semanas (10 dias úteis)  
> **Responsável:** Equipe de Frontend  
> **Status:** 📅 Planejado

---

## 📋 Visão Geral

Esta fase foca na correção dos **problemas críticos de acessibilidade** identificados na análise do frontend, priorizando os 202 componentes sem `aria-label` que impedem o uso adequado por leitores de tela e outras tecnologias assistivas.

---

## 🎯 Objetivos Específicos

### Objetivo Principal
Adicionar atributos ARIA apropriados a todos os componentes interativos, garantindo que usuários de tecnologias assistivas possam compreender e interagir com a interface.

### Metas Mensuráveis
- ✅ **202 componentes** com `aria-label` adicionado
- ✅ **27 imagens** com `alt` text descritivo
- ✅ **68 botões** com `type` explícito
- ✅ **Skip links** implementados em todas as páginas
- ✅ **Ordem de foco** corrigida em componentes complexos
- ✅ **100% dos componentes críticos** acessíveis via teclado

---

## 📊 Análise de Impacto

### Componentes Afetados por Categoria

| Categoria | Quantidade | Prioridade | Esforço Estimado |
|-----------|------------|------------|------------------|
| **Botões de ação** | 68 | 🔴 Crítica | 4 horas |
| **Ícones interativos** | 45 | 🔴 Crítica | 6 horas |
| **Cards clicáveis** | 32 | 🟡 Alta | 4 horas |
| **Inputs de formulário** | 28 | 🔴 Crítica | 5 horas |
| **Modais e diálogos** | 12 | 🔴 Crítica | 3 horas |
| **Navegação e menus** | 10 | 🔴 Crítica | 2 horas |
| **Controles de mídia** | 7 | 🔴 Crítica | 2 horas |
| **Imagens sem alt** | 27 | 🟡 Alta | 2 horas |
| **Skip links** | 8 páginas | 🟡 Alta | 1 hora |

**Total Estimado:** **29 horas** (aproximadamente 4 dias de trabalho)

---

## 📅 Cronograma Detalhado

### Semana 1: Componentes Críticos

#### Dia 1-2: Botões e Ícones Interativos (10h)

**Tarefas:**
1. Auditar todos os botões sem `type` explícito
2. Adicionar `type="button"` aos 68 botões
3. Adicionar `aria-label` aos 45 ícones interativos
4. Adicionar `aria-pressed` para botões de toggle
5. Adicionar `aria-expanded` para botões de expansão

**Componentes Prioritários:**
- `src/components/player/PlaybackControls.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/sidebar/GlobalSidebar.tsx`
- `src/components/header/Header.tsx`

**Exemplo de Correção:**
```tsx
// ❌ Antes
<button onClick={handlePlay}>
  <PlayIcon />
</button>

// ✅ Depois
<button
  type="button"
  aria-label={isPlaying ? "Pausar reprodução" : "Reproduzir música"}
  aria-pressed={isPlaying}
  onClick={handlePlay}
>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>
```

**Entregável:** PR #1 - Botões e Ícones Acessíveis

---

#### Dia 3: Inputs de Formulário (5h)

**Tarefas:**
1. Adicionar `aria-label` ou `<label>` associado a todos os inputs
2. Adicionar `aria-required` para campos obrigatórios
3. Adicionar `aria-invalid` e `aria-describedby` para validação
4. Garantir que todos os inputs tenham `id` único
5. Adicionar `autocomplete` apropriado

**Componentes Prioritários:**
- `src/components/settings/SpotifySetupWizard.tsx`
- `src/components/settings/DatabaseConfigSection.tsx`
- `src/components/settings/UserManagementSection.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/search/SearchBar.tsx`

**Exemplo de Correção:**
```tsx
// ❌ Antes
<input
  placeholder="Digite seu e-mail"
  onChange={handleChange}
/>

// ✅ Depois
<div className="form-group">
  <label htmlFor="email">
    E-mail
    <span aria-label="obrigatório">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={errors.email ? "true" : "false"}
    aria-describedby="email-hint email-error"
    autoComplete="email"
    placeholder="exemplo@email.com"
    onChange={handleChange}
  />
  <p id="email-hint" className="hint">
    Usaremos para notificações importantes
  </p>
  {errors.email && (
    <p id="email-error" role="alert" className="error">
      {errors.email}
    </p>
  )}
</div>
```

**Entregável:** PR #2 - Formulários Acessíveis

---

#### Dia 4: Modais, Diálogos e Cards (7h)

**Tarefas:**
1. Adicionar `role="dialog"` e `aria-modal="true"` aos modais
2. Adicionar `aria-labelledby` e `aria-describedby` aos diálogos
3. Implementar trap de foco nos modais
4. Adicionar `aria-label` aos cards clicáveis
5. Garantir que `Escape` fecha modais

**Componentes Prioritários:**
- `src/components/modals/Modal.tsx`
- `src/components/modals/ConfirmDialog.tsx`
- `src/components/ui/Dialog.tsx`
- `src/components/cards/AlbumCard.tsx`
- `src/components/cards/PlaylistCard.tsx`

**Exemplo de Correção:**
```tsx
// ❌ Antes
<div className="modal" onClick={onClose}>
  <div className="modal-content">
    <h2>Título</h2>
    <p>Conteúdo</p>
    <button onClick={onClose}>Fechar</button>
  </div>
</div>

// ✅ Depois
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  className="modal"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <div className="modal-content">
    <h2 id="dialog-title">Título</h2>
    <p id="dialog-description">Conteúdo</p>
    <button
      type="button"
      onClick={onClose}
      aria-label="Fechar diálogo"
    >
      Fechar
    </button>
  </div>
</div>
```

**Entregável:** PR #3 - Modais e Cards Acessíveis

---

#### Dia 5: Navegação e Controles de Mídia (4h)

**Tarefas:**
1. Adicionar `aria-label` aos elementos de navegação
2. Adicionar `aria-current="page"` ao item ativo
3. Adicionar `aria-label` aos controles de mídia
4. Adicionar `aria-valuemin`, `aria-valuemax`, `aria-valuenow` aos sliders
5. Garantir navegação por teclado nos menus

**Componentes Prioritários:**
- `src/components/sidebar/GlobalSidebar.tsx`
- `src/components/header/Header.tsx`
- `src/components/player/VolumeSlider.tsx`
- `src/components/player/ProgressBar.tsx`
- `src/components/player/PlaybackControls.tsx`

**Exemplo de Correção:**
```tsx
// ❌ Antes
<nav>
  <a href="/dashboard">Dashboard</a>
  <a href="/player">Player</a>
  <a href="/settings">Settings</a>
</nav>

// ✅ Depois
<nav aria-label="Menu principal">
  <ul role="list">
    <li>
      <a
        href="/dashboard"
        aria-current={currentPage === 'dashboard' ? 'page' : undefined}
      >
        Dashboard
      </a>
    </li>
    <li>
      <a
        href="/player"
        aria-current={currentPage === 'player' ? 'page' : undefined}
      >
        Player
      </a>
    </li>
    <li>
      <a
        href="/settings"
        aria-current={currentPage === 'settings' ? 'page' : undefined}
      >
        Configurações
      </a>
    </li>
  </ul>
</nav>

// Slider de volume
<input
  type="range"
  min="0"
  max="100"
  value={volume}
  aria-label="Volume"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={volume}
  aria-valuetext={`${volume}%`}
  onChange={handleVolumeChange}
/>
```

**Entregável:** PR #4 - Navegação e Controles Acessíveis

---

### Semana 2: Imagens, Skip Links e Validação

#### Dia 6-7: Imagens e Alt Text (3h)

**Tarefas:**
1. Auditar todas as 27 imagens sem `alt`
2. Adicionar `alt` text descritivo
3. Usar `alt=""` para imagens decorativas
4. Adicionar `loading="lazy"` quando apropriado
5. Garantir que imagens de conteúdo tenham descrições significativas

**Componentes Prioritários:**
- `src/components/cards/AlbumCard.tsx`
- `src/components/cards/ArtistCard.tsx`
- `src/components/player/NowPlaying.tsx`
- `src/components/weather/AnimatedWeatherIcon.tsx`
- `src/pages/Dashboard.tsx`

**Diretrizes para Alt Text:**

| Tipo de Imagem | Exemplo de Alt Text |
|----------------|---------------------|
| **Capa de álbum** | `"Capa do álbum Thriller de Michael Jackson"` |
| **Foto de artista** | `"Foto de Taylor Swift"` |
| **Ícone funcional** | `"Ícone de configurações"` |
| **Logo** | `"Logo do TSiJUKEBOX"` |
| **Decorativa** | `""` (alt vazio) |
| **Gráfico/Chart** | `"Gráfico de barras mostrando reproduções por mês"` |

**Exemplo de Correção:**
```tsx
// ❌ Antes
<img src={albumCover} />

// ✅ Depois
<img
  src={albumCover}
  alt={`Capa do álbum ${albumName} de ${artistName}`}
  loading="lazy"
/>

// Imagem decorativa
<img src={decorativePattern} alt="" role="presentation" />
```

**Entregável:** PR #5 - Imagens com Alt Text

---

#### Dia 8: Skip Links e Landmarks (2h)

**Tarefas:**
1. Adicionar skip link "Pular para conteúdo principal" em todas as páginas
2. Adicionar landmarks ARIA apropriados (`<main>`, `<nav>`, `<aside>`, `<footer>`)
3. Garantir que skip links sejam visíveis ao receber foco
4. Adicionar `aria-label` aos landmarks quando houver múltiplos do mesmo tipo
5. Testar navegação por landmarks com leitores de tela

**Páginas Prioritárias:**
- `src/pages/Dashboard.tsx`
- `src/pages/Player.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Help.tsx`
- `src/App.tsx` (layout principal)

**Exemplo de Implementação:**
```tsx
// Layout principal
<>
  {/* Skip link - sempre o primeiro elemento */}
  <a href="#main-content" className="skip-link">
    Pular para conteúdo principal
  </a>
  
  <header role="banner">
    <nav aria-label="Menu principal">
      {/* Navegação */}
    </nav>
  </header>
  
  <aside aria-label="Barra lateral">
    {/* Sidebar */}
  </aside>
  
  <main id="main-content" role="main">
    {/* Conteúdo principal */}
  </main>
  
  <footer role="contentinfo">
    {/* Rodapé */}
  </footer>
</>
```

**CSS para Skip Link:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #1DB954;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 9999;
  font-weight: 600;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
```

**Entregável:** PR #6 - Skip Links e Landmarks

---

#### Dia 9: Ordem de Foco e Testes (4h)

**Tarefas:**
1. Auditar ordem de foco em componentes complexos
2. Corrigir ordem de foco usando `tabindex` quando necessário
3. Implementar trap de foco em modais
4. Garantir que foco retorna ao elemento correto ao fechar modais
5. Testar navegação por teclado em todos os fluxos principais

**Componentes Prioritários:**
- Modais e diálogos
- Menus dropdown
- Tabs
- Accordions
- Formulários complexos

**Exemplo de Trap de Foco:**
```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Salvar elemento com foco atual
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focar primeiro elemento focável no modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
      
      // Trap de foco
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements?.[0] as HTMLElement;
          const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Restaurar foco ao fechar
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

**Entregável:** PR #7 - Ordem de Foco Corrigida

---

#### Dia 10: Revisão, Testes e Documentação (4h)

**Tarefas:**
1. Executar testes automatizados (axe, Pa11y)
2. Testar com leitores de tela (NVDA, VoiceOver)
3. Testar navegação por teclado em todos os fluxos
4. Revisar todos os PRs criados
5. Atualizar documentação de acessibilidade
6. Criar guia de boas práticas para a equipe

**Ferramentas de Teste:**
```bash
# Instalar ferramentas
npm install -D @axe-core/cli pa11y

# Executar testes
npx axe http://localhost:3000
npx pa11y http://localhost:3000

# Executar em múltiplas páginas
npx pa11y-ci --sitemap http://localhost:3000/sitemap.xml
```

**Checklist de Validação:**
- [ ] Todos os 202 componentes têm `aria-label` apropriado
- [ ] Todas as 27 imagens têm `alt` text
- [ ] Todos os 68 botões têm `type` explícito
- [ ] Skip links funcionam em todas as páginas
- [ ] Ordem de foco é lógica em todos os componentes
- [ ] Modais implementam trap de foco
- [ ] Navegação por teclado funciona em 100% dos fluxos
- [ ] Testes automatizados passam sem erros críticos
- [ ] Teste com leitor de tela é bem-sucedido

**Entregável:** Relatório de Testes e Documentação Atualizada

---

## 📝 Checklist de Implementação

### Preparação
- [ ] Configurar ambiente de desenvolvimento
- [ ] Instalar extensões de acessibilidade (axe DevTools)
- [ ] Clonar repositório e criar branch `feat/accessibility-phase-1`
- [ ] Revisar documentação WCAG 2.1

### Semana 1
- [ ] **Dia 1-2:** Botões e ícones (PR #1)
- [ ] **Dia 3:** Formulários (PR #2)
- [ ] **Dia 4:** Modais e cards (PR #3)
- [ ] **Dia 5:** Navegação e controles (PR #4)

### Semana 2
- [ ] **Dia 6-7:** Imagens (PR #5)
- [ ] **Dia 8:** Skip links (PR #6)
- [ ] **Dia 9:** Ordem de foco (PR #7)
- [ ] **Dia 10:** Testes e documentação

### Finalização
- [ ] Merge de todos os PRs
- [ ] Deploy em staging
- [ ] Testes finais
- [ ] Deploy em produção
- [ ] Atualizar documentação
- [ ] Comunicar equipe

---

## 🧪 Estratégia de Testes

### Testes Automatizados

**Configuração do axe-core:**
```typescript
// src/test/setup.ts
import { configureAxe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export const axe = configureAxe({
  rules: {
    // Regras específicas para o projeto
    'color-contrast': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'aria-required-attr': { enabled: true },
  },
});
```

**Exemplo de Teste:**
```typescript
// src/components/player/__tests__/PlaybackControls.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from '@/test/setup';
import PlaybackControls from '../PlaybackControls';

describe('PlaybackControls - Acessibilidade', () => {
  it('não deve ter violações de acessibilidade', async () => {
    const { container } = render(<PlaybackControls />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('botões devem ter aria-label', () => {
    const { getByRole } = render(<PlaybackControls />);
    const playButton = getByRole('button', { name: /reproduzir|pausar/i });
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveAttribute('aria-label');
  });
});
```

### Testes Manuais

**Roteiro de Teste com Teclado:**
1. Abrir a aplicação
2. Pressionar `Tab` repetidamente
3. Verificar:
   - Todos os elementos interativos são alcançáveis
   - Ordem de foco é lógica
   - Foco é visível
   - Não há armadilhas de foco
4. Testar atalhos de teclado
5. Testar navegação em modais
6. Testar formulários

**Roteiro de Teste com Leitor de Tela:**
1. Ativar NVDA (Windows) ou VoiceOver (Mac)
2. Navegar pela aplicação
3. Verificar:
   - Todos os elementos são anunciados
   - Rótulos são claros e descritivos
   - Estado dos componentes é comunicado
   - Estrutura de navegação é compreensível
4. Testar preenchimento de formulários
5. Testar interação com modais
6. Testar controles de mídia

---

## 📊 Métricas de Sucesso

### KPIs

| Métrica | Meta | Medição |
|---------|------|---------|
| **Componentes com aria-label** | 100% (202/202) | Auditoria manual + axe |
| **Imagens com alt** | 100% (27/27) | Auditoria manual + axe |
| **Botões com type** | 100% (68/68) | Auditoria manual |
| **Skip links** | 100% (8/8 páginas) | Teste manual |
| **Violações axe** | 0 críticas | axe DevTools |
| **Score Lighthouse A11y** | ≥ 95 | Lighthouse CI |
| **Navegação por teclado** | 100% funcional | Teste manual |
| **Teste com leitor de tela** | Aprovado | Teste manual |

### Relatório de Progresso

**Template de Relatório Semanal:**
```markdown
# Relatório de Progresso - Fase 1 Acessibilidade
**Semana:** [número]
**Data:** [data]

## Progresso
- Componentes corrigidos: [X/202]
- Imagens com alt: [X/27]
- Botões com type: [X/68]
- PRs criados: [X/7]
- PRs merged: [X/7]

## Bloqueios
- [Descrever bloqueios, se houver]

## Próximos Passos
- [Listar próximas tarefas]

## Observações
- [Observações relevantes]
```

---

## 🚀 Próximas Fases

Após a conclusão da Fase 1, seguir para:

- **Fase 2:** Melhorias de Contraste (2 semanas)
- **Fase 3:** Suporte a Dark Mode (2 semanas)
- **Fase 4:** Testes e Validação (1 semana)
- **Fase 5:** Documentação e Treinamento (1 semana)

---

## 📚 Recursos

### Documentação
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG_COMPLIANCE.md](WCAG_COMPLIANCE.md)
- [ARIA_GUIDE.md](ARIA_GUIDE.md)

### Ferramentas
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Leitores de Tela
- [NVDA](https://www.nvaccess.org/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS)

---

## 👥 Equipe e Responsabilidades

| Papel | Responsável | Responsabilidades |
|-------|-------------|-------------------|
| **Tech Lead** | [Nome] | Revisão de código, arquitetura |
| **Dev Frontend 1** | [Nome] | Botões, ícones, formulários |
| **Dev Frontend 2** | [Nome] | Modais, cards, navegação |
| **QA** | [Nome] | Testes manuais e automatizados |
| **Designer** | [Nome] | Validação de UX acessível |

---

## 📞 Contato

Para dúvidas ou suporte:
- **Slack:** #accessibility
- **Email:** accessibility@tsijukebox.com
- **Issues:** GitHub com label `accessibility`

---

**Última Atualização:** 24/12/2025  
**Versão:** 1.0.0  
**Status:** 📅 Planejado
