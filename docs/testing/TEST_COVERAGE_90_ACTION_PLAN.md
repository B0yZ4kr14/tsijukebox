# Plano de Ação: Atingir 90% de Cobertura de Testes

> **Objetivo:** Aumentar cobertura de testes de 70% para 90%  
> **Prazo:** 3 semanas (15 dias úteis)  
> **Foco Principal:** Testes E2E com Playwright  
> **Responsável:** Equipe de Desenvolvimento  
> **Status:** 📋 Pronto para Execução

---

## 📊 Situação Atual

### Cobertura de Testes Existente

| Categoria | Arquivos Totais | Com Testes | Sem Testes | Cobertura |
|-----------|-----------------|------------|------------|-----------|
| **Components** | 241 | 14 | 227 | 5.8% |
| **Hooks** | 187 | 36 | 151 | 19.3% |
| **Pages** | 45 | 1 | 44 | 2.2% |
| **Lib/Utils** | 50 | 0 | 50 | 0% |
| **E2E Tests** | - | 29 | - | - |
| **TOTAL** | 523 | 80 | 443 | **15.3%** |

### Análise de Gaps

**Problemas Identificados:**
1. ❌ **Componentes:** Apenas 5.8% testados (227 sem testes)
2. ❌ **Hooks:** 19.3% testados (151 sem testes)
3. ❌ **Pages:** 2.2% testadas (44 sem testes)
4. ❌ **Utils:** 0% testados (50 sem testes)
5. ✅ **E2E:** 29 testes existentes (boa base)

---

## 🎯 Metas e Objetivos

### Meta Principal
**Atingir 90% de cobertura de testes em 3 semanas**

### Metas Específicas

| Categoria | Cobertura Atual | Meta | Incremento Necessário |
|-----------|-----------------|------|----------------------|
| **Unit Tests** | 15.3% | 85% | +445 testes |
| **Integration Tests** | 5% | 80% | +40 testes |
| **E2E Tests** | 29 specs | 50+ specs | +21 testes |
| **Coverage Geral** | 70% | 90% | +20% |

### Distribuição de Esforço

```
Semana 1: Unit Tests (Components + Hooks)     - 40%
Semana 2: Integration Tests + E2E (Críticos)  - 35%
Semana 3: E2E (Completos) + Validação         - 25%
```

---

## 📅 Cronograma Detalhado

### Semana 1: Unit Tests e Componentes Críticos

#### Dia 1-2: Componentes do Player (14 componentes)
**Esforço:** 12 horas

**Componentes Prioritários:**
1. `PlayerControls.tsx` ✅ (já testado)
2. `PlaybackControls.tsx` ✅ (já testado)
3. `VolumeSlider.tsx` ✅ (já testado)
4. `ProgressBar.tsx` ⚠️ (adicionar testes)
5. `NowPlaying.tsx` ⚠️ (adicionar testes)
6. `Queue.tsx` ⚠️ (adicionar testes)
7. `LibraryPanel.tsx` ⚠️ (adicionar testes)
8. `WeatherWidget.tsx` ⚠️ (adicionar testes)

**Template de Teste:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('should render with correct initial state', () => {
    render(<ProgressBar currentTime={0} duration={180} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('should update position when dragged', () => {
    const onSeek = vi.fn();
    render(<ProgressBar currentTime={60} duration={180} onSeek={onSeek} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 120 } });
    
    expect(onSeek).toHaveBeenCalledWith(120);
  });

  it('should display correct time format', () => {
    render(<ProgressBar currentTime={125} duration={300} />);
    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });
});
```

**Entregável:** 8 arquivos de teste + PR #1

---

#### Dia 3-4: Hooks Críticos (20 hooks)
**Esforço:** 12 horas

**Hooks Prioritários:**
1. `usePlayer.ts` ✅ (já testado)
2. `useSpotify.ts` ✅ (já testado)
3. `useQueue.ts` ⚠️ (adicionar testes)
4. `usePlayback.ts` ⚠️ (adicionar testes)
5. `useVolume.ts` ⚠️ (adicionar testes)
6. `useProgress.ts` ⚠️ (adicionar testes)
7. `useYouTubeMusic.ts` ⚠️ (adicionar testes)
8. `useGitHub.ts` ⚠️ (adicionar testes)
9. `useTheme.ts` ⚠️ (adicionar testes)
10. `useTranslation.ts` ⚠️ (adicionar testes)

**Template de Teste:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useQueue } from './useQueue';

describe('useQueue', () => {
  it('should initialize with empty queue', () => {
    const { result } = renderHook(() => useQueue());
    expect(result.current.queue).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
  });

  it('should add track to queue', () => {
    const { result } = renderHook(() => useQueue());
    
    act(() => {
      result.current.addToQueue({ id: '1', name: 'Test Track' });
    });
    
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].name).toBe('Test Track');
  });

  it('should remove track from queue', () => {
    const { result } = renderHook(() => useQueue());
    
    act(() => {
      result.current.addToQueue({ id: '1', name: 'Track 1' });
      result.current.addToQueue({ id: '2', name: 'Track 2' });
      result.current.removeFromQueue('1');
    });
    
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].id).toBe('2');
  });
});
```

**Entregável:** 20 arquivos de teste + PR #2

---

#### Dia 5: Componentes de Spotify (9 componentes)
**Esforço:** 8 horas

**Componentes:**
1. `SpotifyPanel.tsx`
2. `AlbumCard.tsx`
3. `ArtistCard.tsx`
4. `PlaylistCard.tsx`
5. `TrackItem.tsx`
6. `SpotifySearch.tsx`
7. `AddToPlaylistModal.tsx`
8. `CreatePlaylistModal.tsx`
9. `SpotifyTrackList.tsx`

**Template de Teste:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlbumCard } from './AlbumCard';

describe('AlbumCard', () => {
  const mockAlbum = {
    id: '1',
    name: 'Test Album',
    artist: 'Test Artist',
    cover: 'https://example.com/cover.jpg',
    releaseDate: '2024-01-01',
  };

  it('should render album information', () => {
    render(<AlbumCard album={mockAlbum} />);
    
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByAltText(/Test Album/)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<AlbumCard album={mockAlbum} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(mockAlbum);
  });

  it('should be keyboard accessible', () => {
    const onClick = vi.fn();
    render(<AlbumCard album={mockAlbum} onClick={onClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});
```

**Entregável:** 9 arquivos de teste + PR #3

---

### Semana 2: Integration Tests e E2E Críticos

#### Dia 6-7: Integration Tests (20 testes)
**Esforço:** 12 horas

**Fluxos a Testar:**
1. **Player + Spotify Integration**
   - Buscar música → Adicionar à fila → Reproduzir
   - Criar playlist → Adicionar músicas → Salvar

2. **Player + YouTube Integration**
   - Buscar vídeo → Reproduzir
   - Adicionar à fila → Gerenciar fila

3. **Settings + Database**
   - Alterar configurações → Salvar → Verificar persistência
   - Backup → Restaurar → Validar dados

4. **Auth + Permissions**
   - Login → Verificar permissões → Acessar recursos

**Template de Integration Test:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestProviders } from '@/test-utils';
import { PlayerWithSpotify } from '@/features/player';

describe('Player + Spotify Integration', () => {
  beforeEach(() => {
    // Setup mocks
    vi.mock('@/services/spotify', () => ({
      searchTracks: vi.fn().mockResolvedValue([
        { id: '1', name: 'Track 1' },
        { id: '2', name: 'Track 2' },
      ]),
    }));
  });

  it('should search and play track from Spotify', async () => {
    render(
      <TestProviders>
        <PlayerWithSpotify />
      </TestProviders>
    );

    // Search for track
    const searchInput = screen.getByPlaceholderText('Search Spotify');
    fireEvent.change(searchInput, { target: { value: 'Test Track' } });
    fireEvent.submit(searchInput);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Track 1')).toBeInTheDocument();
    });

    // Click to play
    fireEvent.click(screen.getByText('Track 1'));

    // Verify player state
    await waitFor(() => {
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });
  });
});
```

**Entregável:** 20 integration tests + PR #4

---

#### Dia 8-9: E2E Tests Críticos - Player (10 specs)
**Esforço:** 14 horas

**Specs a Criar:**

1. **`player-full-workflow.spec.ts`** - Fluxo completo do player
2. **`player-queue-management.spec.ts`** - Gerenciamento de fila
3. **`player-volume-control.spec.ts`** - Controle de volume
4. **`player-seek-functionality.spec.ts`** - Busca na timeline
5. **`player-repeat-shuffle.spec.ts`** - Repeat e Shuffle
6. **`player-error-handling.spec.ts`** - Tratamento de erros
7. **`player-state-persistence.spec.ts`** - Persistência de estado
8. **`player-keyboard-shortcuts.spec.ts`** ✅ (já existe)
9. **`player-responsive-layout.spec.ts`** ✅ (já existe)
10. **`player-accessibility.spec.ts`** ✅ (já existe)

**Template de E2E Test:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Player - Full Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login if needed
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should play, pause, and skip tracks', async ({ page }) => {
    // Navigate to player
    await page.getByRole('link', { name: 'Player' }).click();
    await expect(page).toHaveURL('/player');

    // Search for a track
    await page.getByPlaceholder('Search music').fill('Test Track');
    await page.keyboard.press('Enter');

    // Wait for results
    await expect(page.getByText('Test Track')).toBeVisible();

    // Click to play
    await page.getByText('Test Track').click();

    // Verify playing state
    const playButton = page.getByLabel('Pause');
    await expect(playButton).toBeVisible();

    // Pause
    await playButton.click();
    await expect(page.getByLabel('Play')).toBeVisible();

    // Skip to next
    await page.getByLabel('Next track').click();
    await expect(page.getByText('Track 2')).toBeVisible();
  });

  test('should manage queue correctly', async ({ page }) => {
    await page.goto('/player');

    // Add multiple tracks to queue
    for (let i = 1; i <= 3; i++) {
      await page.getByText(`Track ${i}`).hover();
      await page.getByLabel('Add to queue').click();
    }

    // Open queue
    await page.getByLabel('Open queue').click();

    // Verify queue items
    await expect(page.getByTestId('queue-item')).toHaveCount(3);

    // Reorder queue (drag and drop)
    const firstItem = page.getByTestId('queue-item').first();
    const lastItem = page.getByTestId('queue-item').last();
    await firstItem.dragTo(lastItem);

    // Verify new order
    const items = await page.getByTestId('queue-item').allTextContents();
    expect(items[0]).toContain('Track 2');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/player');

    // Simulate network error
    await page.route('**/api/spotify/play', route => 
      route.abort('failed')
    );

    // Try to play
    await page.getByLabel('Play').click();

    // Verify error message
    await expect(page.getByText(/Failed to play/)).toBeVisible();

    // Verify retry button
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
```

**Entregável:** 7 novos E2E specs + PR #5

---

#### Dia 10: E2E Tests - Settings (8 specs)
**Esforço:** 8 horas

**Specs a Criar:**

1. **`settings-spotify-setup.spec.ts`** ✅ (já existe)
2. **`settings-youtube-setup.spec.ts`** ⚠️ (criar)
3. **`settings-theme-customization.spec.ts`** ⚠️ (criar)
4. **`settings-user-management.spec.ts`** ⚠️ (criar)
5. **`settings-backup-restore.spec.ts`** ✅ (já existe)
6. **`settings-voice-control.spec.ts`** ✅ (já existe)
7. **`settings-accessibility.spec.ts`** ⚠️ (criar)
8. **`settings-database-config.spec.ts`** ⚠️ (criar)

**Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Settings - Theme Customization', () => {
  test('should customize theme colors', async ({ page }) => {
    await page.goto('/settings/theme');

    // Select primary color
    await page.getByLabel('Primary Color').click();
    await page.getByRole('radio', { name: 'Cyan' }).click();

    // Select accent color
    await page.getByLabel('Accent Color').click();
    await page.getByRole('radio', { name: 'Purple' }).click();

    // Save changes
    await page.getByRole('button', { name: 'Save Theme' }).click();

    // Verify success message
    await expect(page.getByText('Theme saved successfully')).toBeVisible();

    // Verify colors applied
    const root = page.locator(':root');
    const primaryColor = await root.evaluate(el => 
      getComputedStyle(el).getPropertyValue('--color-primary')
    );
    expect(primaryColor).toContain('cyan');
  });
});
```

**Entregável:** 5 novos E2E specs + PR #6

---

### Semana 3: E2E Completos e Validação

#### Dia 11-12: E2E Tests - Integrações (12 specs)
**Esforço:** 14 horas

**Specs a Criar:**

**Spotify (4 specs):**
1. `spotify-search-and-play.spec.ts`
2. `spotify-playlist-management.spec.ts`
3. `spotify-library-sync.spec.ts`
4. `spotify-auth-flow.spec.ts`

**YouTube (4 specs):**
5. `youtube-search-and-play.spec.ts`
6. `youtube-playlist-management.spec.ts`
7. `youtube-video-quality.spec.ts`
8. `youtube-auth-flow.spec.ts`

**GitHub (4 specs):**
9. `github-dashboard.spec.ts`
10. `github-auto-sync.spec.ts`
11. `github-commit-history.spec.ts`
12. `github-webhook-integration.spec.ts`

**Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Spotify - Search and Play', () => {
  test('should search and play track from Spotify', async ({ page }) => {
    await page.goto('/player');

    // Switch to Spotify tab
    await page.getByRole('tab', { name: 'Spotify' }).click();

    // Search
    await page.getByPlaceholder('Search Spotify').fill('Bohemian Rhapsody');
    await page.keyboard.press('Enter');

    // Wait for results
    await expect(page.getByText('Bohemian Rhapsody')).toBeVisible();

    // Play track
    await page.getByText('Bohemian Rhapsody').click();
    await page.getByLabel('Play').click();

    // Verify playing
    await expect(page.getByLabel('Pause')).toBeVisible();
    await expect(page.getByText('Now Playing')).toBeVisible();
  });

  test('should create and manage playlists', async ({ page }) => {
    await page.goto('/spotify/playlists');

    // Create new playlist
    await page.getByRole('button', { name: 'New Playlist' }).click();
    await page.getByLabel('Playlist Name').fill('My Test Playlist');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify created
    await expect(page.getByText('My Test Playlist')).toBeVisible();

    // Add tracks
    await page.getByText('My Test Playlist').click();
    await page.getByRole('button', { name: 'Add Tracks' }).click();
    await page.getByPlaceholder('Search').fill('Test Track');
    await page.getByText('Test Track').click();

    // Verify added
    await expect(page.getByTestId('playlist-track')).toHaveCount(1);
  });
});
```

**Entregável:** 12 novos E2E specs + PR #7

---

#### Dia 13: E2E Tests - JAM Sessions (6 specs)
**Esforço:** 8 horas

**Specs a Criar:**

1. `jam-create-session.spec.ts`
2. `jam-join-session.spec.ts`
3. `jam-voting-system.spec.ts`
4. `jam-realtime-sync.spec.ts`
5. `jam-chat-functionality.spec.ts`
6. `jam-ai-suggestions.spec.ts`

**Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('JAM Sessions - Create and Join', () => {
  test('should create a JAM session', async ({ page }) => {
    await page.goto('/jam');

    // Create session
    await page.getByRole('button', { name: 'Create JAM' }).click();
    await page.getByLabel('Session Name').fill('Friday Night Jam');
    await page.getByLabel('Max Participants').fill('10');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify created
    await expect(page.getByText('Friday Night Jam')).toBeVisible();
    await expect(page.getByText('Session Code:')).toBeVisible();

    // Copy invite link
    await page.getByRole('button', { name: 'Copy Link' }).click();
    await expect(page.getByText('Link copied')).toBeVisible();
  });

  test('should join existing JAM session', async ({ page, context }) => {
    // Create session in first tab
    await page.goto('/jam');
    await page.getByRole('button', { name: 'Create JAM' }).click();
    await page.getByLabel('Session Name').fill('Test JAM');
    await page.getByRole('button', { name: 'Create' }).click();

    const sessionCode = await page.getByTestId('session-code').textContent();

    // Open new tab and join
    const page2 = await context.newPage();
    await page2.goto('/jam/join');
    await page2.getByLabel('Session Code').fill(sessionCode);
    await page2.getByRole('button', { name: 'Join' }).click();

    // Verify joined
    await expect(page2.getByText('Test JAM')).toBeVisible();
    await expect(page2.getByText('Connected')).toBeVisible();

    // Verify participant count updated in first tab
    await expect(page.getByText('2 participants')).toBeVisible();
  });
});
```

**Entregável:** 6 novos E2E specs + PR #8

---

#### Dia 14: Testes de Acessibilidade e Performance (8 specs)
**Esforço:** 8 horas

**Specs a Criar:**

**Acessibilidade (4 specs):**
1. `a11y-keyboard-navigation.spec.ts`
2. `a11y-screen-reader.spec.ts`
3. `a11y-color-contrast.spec.ts`
4. `a11y-focus-management.spec.ts`

**Performance (4 specs):**
5. `perf-page-load.spec.ts`
6. `perf-player-responsiveness.spec.ts`
7. `perf-large-playlists.spec.ts`
8. `perf-memory-leaks.spec.ts`

**Template de Acessibilidade:**
```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should navigate entire app with keyboard only', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    // Tab through navigation
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Player' })).toBeFocused();

    // Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/player');

    // Check accessibility
    await checkA11y(page);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/player');

    // Tab to play button
    await page.keyboard.press('Tab');
    const playButton = page.getByLabel('Play');
    await expect(playButton).toBeFocused();

    // Verify focus visible
    const outline = await playButton.evaluate(el => 
      getComputedStyle(el).outline
    );
    expect(outline).not.toBe('none');
  });
});
```

**Template de Performance:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance - Page Load', () => {
  test('should load dashboard within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle large playlists efficiently', async ({ page }) => {
    await page.goto('/spotify/playlists');

    // Load playlist with 1000+ tracks
    await page.getByText('Large Playlist (1000 tracks)').click();

    // Measure render time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="track-item"]');
    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(1000);

    // Verify virtual scrolling
    const visibleTracks = await page.getByTestId('track-item').count();
    expect(visibleTracks).toBeLessThan(50); // Should virtualize
  });
});
```

**Entregável:** 8 novos E2E specs + PR #9

---

#### Dia 15: Validação e Relatório Final
**Esforço:** 8 horas

**Atividades:**

1. **Executar todos os testes** (2h)
   ```bash
   # Unit tests
   npm run test:unit -- --coverage
   
   # Integration tests
   npm run test:integration
   
   # E2E tests
   npm run test:e2e
   ```

2. **Analisar cobertura** (1h)
   ```bash
   # Gerar relatório de cobertura
   npm run coverage:report
   
   # Verificar métricas
   cat coverage/coverage-summary.json
   ```

3. **Corrigir testes falhando** (3h)
   - Revisar testes com falhas
   - Corrigir bugs identificados
   - Atualizar snapshots se necessário

4. **Documentar resultados** (2h)
   - Gerar relatório de cobertura
   - Documentar testes adicionados
   - Criar guia de manutenção

**Entregável:** Relatório final + PR #10

---

## 🔧 Configuração do Ambiente

### 1. Instalar Dependências

```bash
# Playwright (já instalado)
npm install -D @playwright/test

# Axe para testes de acessibilidade
npm install -D @axe-core/playwright axe-playwright

# Testing Library
npm install -D @testing-library/react @testing-library/user-event
npm install -D @testing-library/jest-dom @testing-library/hooks

# Vitest (já instalado)
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

### 2. Atualizar Configuração do Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'coverage/playwright/results.json' }],
    ['junit', { outputFile: 'coverage/playwright/junit.xml' }],
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    
    // Accessibility testing
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Kiosk mode
    {
      name: 'kiosk-mode',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1080, height: 1920 },
        isMobile: false,
      },
    },
    
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 3. Criar Fixtures Reutilizáveis

```typescript
// e2e/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});
```

### 4. Criar Helpers de Teste

```typescript
// e2e/helpers/player.ts
import { Page, expect } from '@playwright/test';

export class PlayerHelper {
  constructor(private page: Page) {}

  async playTrack(trackName: string) {
    await this.page.getByText(trackName).click();
    await this.page.getByLabel('Play').click();
    await expect(this.page.getByLabel('Pause')).toBeVisible();
  }

  async pauseTrack() {
    await this.page.getByLabel('Pause').click();
    await expect(this.page.getByLabel('Play')).toBeVisible();
  }

  async skipToNext() {
    await this.page.getByLabel('Next track').click();
  }

  async skipToPrevious() {
    await this.page.getByLabel('Previous track').click();
  }

  async setVolume(volume: number) {
    const slider = this.page.getByLabel('Volume');
    await slider.fill(volume.toString());
  }

  async addToQueue(trackName: string) {
    await this.page.getByText(trackName).hover();
    await this.page.getByLabel('Add to queue').click();
  }
}
```

### 5. Scripts NPM

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:webkit": "playwright test --project=webkit",
    "test:e2e:mobile": "playwright test --project=mobile-chrome",
    "test:e2e:kiosk": "playwright test --project=kiosk-mode",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:a11y": "playwright test e2e/specs/a11y-*.spec.ts",
    "test:perf": "playwright test e2e/specs/perf-*.spec.ts",
    "coverage": "vitest run --coverage && playwright test --reporter=html",
    "coverage:report": "open coverage/index.html && open playwright-report/index.html"
  }
}
```

---

## 📊 Métricas de Sucesso

### Metas de Cobertura

| Tipo de Teste | Meta | Como Medir |
|---------------|------|------------|
| **Unit Tests** | 85% | Vitest coverage report |
| **Integration Tests** | 80% | Manual tracking |
| **E2E Tests** | 50+ specs | Playwright test count |
| **Coverage Geral** | 90% | Combined coverage report |

### KPIs

1. **Cobertura de Código:** 90%+
2. **Testes Passando:** 100%
3. **Tempo de Execução:** < 10 minutos (unit + integration)
4. **Tempo de Execução E2E:** < 30 minutos
5. **Flakiness Rate:** < 5%

---

## 🚀 Comandos Rápidos

```bash
# Executar todos os testes
npm run test && npm run test:e2e

# Executar testes com coverage
npm run coverage

# Executar apenas testes modificados
npm run test -- --changed

# Executar testes em modo watch
npm run test:watch

# Executar E2E em modo debug
npm run test:e2e:debug

# Executar E2E com UI
npm run test:e2e:ui

# Executar testes de acessibilidade
npm run test:a11y

# Executar testes de performance
npm run test:perf

# Gerar relatório de cobertura
npm run coverage:report
```

---

## 📝 Checklist de Implementação

### Semana 1
- [ ] Dia 1-2: Testes de componentes do Player (8 arquivos)
- [ ] Dia 3-4: Testes de hooks críticos (20 arquivos)
- [ ] Dia 5: Testes de componentes Spotify (9 arquivos)

### Semana 2
- [ ] Dia 6-7: Integration tests (20 testes)
- [ ] Dia 8-9: E2E Player (7 specs)
- [ ] Dia 10: E2E Settings (5 specs)

### Semana 3
- [ ] Dia 11-12: E2E Integrações (12 specs)
- [ ] Dia 13: E2E JAM Sessions (6 specs)
- [ ] Dia 14: E2E A11y + Performance (8 specs)
- [ ] Dia 15: Validação e relatório final

---

## 🎯 Próximos Passos Imediatos

1. ✅ Revisar este plano com a equipe
2. ⚠️ Configurar ambiente de testes (Dia 0)
3. ⚠️ Criar branch `feat/test-coverage-90`
4. ⚠️ Iniciar Semana 1 - Dia 1
5. ⚠️ Executar daily standups para acompanhamento

---

## 📚 Recursos e Referências

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Axe Accessibility Testing](https://www.deque.com/axe/)
- [Test Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)

---

**Última Atualização:** 24/12/2025  
**Próxima Revisão:** 31/12/2025 (após Semana 1)

---

*Plano criado automaticamente - TSiJUKEBOX Testing Team*
