# TSiJUKEBOX - Relatório de Cobertura de Testes

> **Versão:** 4.2.0 | **Data:** 2025-12-23 | **Ferramentas:** Vitest + Playwright

---

## 📊 Resumo Executivo

| Categoria | Total | Testados | Cobertura |
|-----------|-------|----------|-----------|
| **Hooks** | 75+ | 15 | ~20% |
| **Components** | 186 | 25 | ~13% |
| **Edge Functions** | 26 | 2 | ~8% |
| **Contexts** | 7 | 2 | ~29% |
| **Schemas/Validações** | 12 | 5 | ~42% |
| **E2E Specs** | - | 24 | 100% |

**Cobertura Geral Estimada:** ~18%

---

## 🧪 Testes Existentes

### Hooks Testados

| Hook | Arquivo de Teste | Status |
|------|------------------|--------|
| `useDebounce` | `src/test/hooks/useDebounce.test.ts` | ✅ Completo |
| `useLocalStorage` | `src/test/hooks/useLocalStorage.test.ts` | ✅ Completo |
| `useMediaQuery` | `src/test/hooks/useMediaQuery.test.ts` | ✅ Completo |
| `useKeyboardShortcuts` | `src/test/hooks/useKeyboardShortcuts.test.ts` | ✅ Completo |
| `useSwipeGestures` | `src/test/hooks/useSwipeGestures.test.ts` | ✅ Completo |
| `useAudioContext` | `src/test/hooks/useAudioContext.test.ts` | ✅ Completo |

### Schemas Testados

| Schema | Arquivo de Teste | Casos |
|--------|------------------|-------|
| `authSchemas` | `src/test/schemas/authSchemas.test.ts` | 45+ casos |
| `GitHubRepoSchema` | `src/test/schemas/github-repo.schema.test.ts` | 30+ casos |
| `SettingsSchema` | `src/test/schemas/settingsSchemas.test.ts` | 20+ casos |

### Edge Functions Testadas

| Function | Tipo de Teste | Status |
|----------|---------------|--------|
| `github-repo` | Unit + Integration | ✅ Parcial |
| `sync-github` | Unit | ✅ Básico |

### Testes E2E (Playwright)

```
e2e/
├── auth/
│   ├── login.spec.ts
│   ├── signup.spec.ts
│   └── protected-routes.spec.ts
├── player/
│   ├── controls.spec.ts
│   ├── queue.spec.ts
│   └── volume.spec.ts
├── settings/
│   ├── navigation.spec.ts
│   ├── spotify-config.spec.ts
│   └── theme-switching.spec.ts
├── jam/
│   ├── create-session.spec.ts
│   ├── join-session.spec.ts
│   └── queue-management.spec.ts
└── accessibility/
    ├── keyboard-navigation.spec.ts
    ├── screen-reader.spec.ts
    └── wcag-compliance.spec.ts
```

---

## 🚨 Componentes Críticos SEM Testes

### Alta Prioridade (Core Business Logic)

| Componente | Risco | Justificativa |
|------------|-------|---------------|
| `PlayerControls.tsx` | 🔴 Crítico | Controle central do player |
| `SpotifyPlayer.tsx` | 🔴 Crítico | Integração Spotify Web Playback SDK |
| `YouTubeMusicPlayer.tsx` | 🔴 Crítico | Integração YouTube Music |
| `AuthProvider.tsx` | 🔴 Crítico | Gerenciamento de autenticação |
| `QueuePanel.tsx` | 🟠 Alto | Fila de reprodução |
| `MusicQueuePanel.tsx` | 🟠 Alto | Gerenciamento de músicas |

### Média Prioridade (Features Importantes)

| Componente | Risco | Justificativa |
|------------|-------|---------------|
| `JamSession/*` | 🟠 Alto | 10 componentes de sessão colaborativa |
| `CreateDeployKeyModal.tsx` | 🟡 Médio | Integração GitHub |
| `BackupManager.tsx` | 🟡 Médio | Backup de dados |
| `VoiceControlButton.tsx` | 🟡 Médio | Comandos de voz |
| `FullstackRefactorPanel.tsx` | 🟡 Médio | Refatoração AI |

### Baixa Prioridade (UI/Apresentação)

| Componente | Risco | Justificativa |
|------------|-------|---------------|
| `BrandLogo.tsx` | 🟢 Baixo | Apenas visual |
| `WeatherWidget.tsx` | 🟢 Baixo | Feature auxiliar |
| `ThemeSection.tsx` | 🟢 Baixo | Configuração de tema |

---

## 📋 Hooks Críticos SEM Testes

| Hook | Categoria | Complexidade |
|------|-----------|--------------|
| `useSpotifyPlayer` | Spotify | 🔴 Alta |
| `useSpotifyAuth` | Spotify | 🔴 Alta |
| `useYouTubeMusicPlayer` | YouTube | 🔴 Alta |
| `useJamSession` | Jam | 🔴 Alta |
| `usePlayerControls` | Player | 🟠 Média |
| `useAudioVisualization` | Player | 🟠 Média |
| `useVoiceCommands` | Voice | 🟠 Média |
| `useBackupScheduler` | Backup | 🟡 Média |
| `useWeather` | System | 🟢 Baixa |
| `useNtpSync` | System | 🟢 Baixa |

---

## 🎯 Recomendações de Priorização

### Sprint 1 - Core Player (2 semanas)

```bash
# Criar testes para:
src/test/hooks/useSpotifyPlayer.test.ts
src/test/hooks/usePlayerControls.test.ts
src/test/components/PlayerControls.test.tsx
src/test/components/QueuePanel.test.tsx
```

**Estimativa de impacto:** +15% cobertura

### Sprint 2 - Autenticação & Integrations (2 semanas)

```bash
# Criar testes para:
src/test/contexts/AuthContext.test.tsx
src/test/hooks/useSpotifyAuth.test.ts
src/test/components/auth/LoginForm.test.tsx
src/test/components/auth/ProtectedRoute.test.tsx
```

**Estimativa de impacto:** +12% cobertura

### Sprint 3 - Jam Session (2 semanas)

```bash
# Criar testes para:
src/test/hooks/useJamSession.test.ts
src/test/components/jam/JamQueue.test.tsx
src/test/components/jam/JamPlayer.test.tsx
e2e/jam/realtime-sync.spec.ts
```

**Estimativa de impacto:** +8% cobertura

---

## 📈 Métricas de Qualidade

### Cobertura por Diretório

```
src/
├── components/     13% ████░░░░░░░░░░░░░░░░
├── hooks/          20% █████░░░░░░░░░░░░░░░
├── contexts/       29% ███████░░░░░░░░░░░░░
├── lib/            42% ██████████░░░░░░░░░░
├── pages/           5% █░░░░░░░░░░░░░░░░░░░
└── integrations/    0% ░░░░░░░░░░░░░░░░░░░░
```

### Distribuição por Tipo

- **Unit Tests:** 45 arquivos
- **Integration Tests:** 12 arquivos
- **E2E Tests:** 24 specs
- **Schema Validation:** 5 arquivos

---

## 🛠️ Comandos de Teste

```bash
# Rodar todos os testes unitários
npm run test

# Rodar testes com cobertura
npm run test:coverage

# Rodar testes E2E
npm run test:e2e

# Rodar testes específicos
npm run test -- --grep "useSpotify"

# Modo watch
npm run test:watch
```

---

## 📁 Estrutura de Fixtures

```
src/test/fixtures/
├── authFixtures.ts         # Dados de autenticação mock
├── githubRepoData.ts       # Payloads GitHub mock
├── spotifyFixtures.ts      # Dados Spotify mock
├── playerFixtures.ts       # Estados do player
├── jamSessionFixtures.ts   # Sessões Jam mock
├── settingsFixtures.ts     # Configurações mock
├── backupFixtures.ts       # Dados de backup mock
├── weatherFixtures.ts      # Dados de clima mock
└── userFixtures.ts         # Usuários mock
```

---

## 🎯 Meta de Cobertura

| Período | Meta | Status |
|---------|------|--------|
| Q1 2025 | 35% | 🟡 Em progresso |
| Q2 2025 | 55% | ⏳ Planejado |
| Q3 2025 | 70% | ⏳ Planejado |
| Q4 2025 | 80% | ⏳ Planejado |

---

**Gerado automaticamente** | TSiJUKEBOX Testing Framework
