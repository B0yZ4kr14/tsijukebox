# Relatório de Auditoria ARIA - TSiJUKEBOX

> **Data:** 24/12/2025 02:16  
> **Arquivos analisados:** 228  
> **Elementos analisados:** 129

---

## 📊 Resumo

| Métrica | Valor |
|---------|-------|
| **Total de problemas** | 576 |
| **Correções geradas** | 430 |
| **Elementos já acessíveis** | 70 |
| **Taxa de conformidade** | 54.3% |

---

## 🔴 Problemas por Severidade

| Severidade | Quantidade |
|------------|------------|
| **Erro** | 7 |
| **Aviso** | 7 |
| **Info** | 562 |

---

## 📁 Problemas por Arquivo


### `src/components/GlobalSearchModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 85 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 93 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 108 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 115 | `Filter` | icon_without_aria_hidden | `aria-hidden="true"` |
| 141 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 152 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 188 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/audit/AuditLogViewer.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 60 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 62 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 152 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 186 | `Filter` | icon_without_aria_hidden | `aria-hidden="true"` |
| 190 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 194 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 198 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 223 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 295 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 330 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/auth/PermissionGate.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 20 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 28 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/debug/ContrastDebugPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 64 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 89 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 96 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 108 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 173 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 183 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 193 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/dev/DevFileChangeMonitor.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 112 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 178 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 180 | `ChevronUp` | icon_without_aria_hidden | `aria-hidden="true"` |
| 246 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/docs/CodePlayground.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 260 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 265 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/errors/ErrorBoundary.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 114 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 118 | `Home` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/AutoSyncPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 116 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 229 | `ChevronUp` | icon_without_aria_hidden | `aria-hidden="true"` |
| 231 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 274 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 286 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/CacheIndicator.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 108 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/CommitFilters.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 271 | `button` | missing_aria_label | `aria-label="Aplicar filtro"` |
| 271 | `button` | missing_type | `type="button"` |
| 280 | `button` | missing_aria_label | `aria-label="PREENCHER"` |
| 280 | `button` | missing_type | `type="button"` |
| 291 | `button` | missing_aria_label | `aria-label="Aplicar filtro"` |
| 291 | `button` | missing_type | `type="button"` |
| 47 | `Filter` | icon_without_aria_hidden | `aria-hidden="true"` |
| 133 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 148 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 258 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 269 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 272 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 281 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 295 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/CommitsTable.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 105 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/ContributorsChart.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 29 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 43 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/FileSelectionModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 99 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 164 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 176 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/GitHubDashboardCharts.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 188 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/github/SyncHistoryPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 29 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 57 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 59 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 112 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/help/InteractiveTestMode.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 52 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 53 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 54 | `SkipBack` | icon_without_aria_hidden | `aria-hidden="true"` |
| 55 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 56 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 57 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 278 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 280 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 353 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 357 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 362 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 386 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 388 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 412 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 414 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/index-page/IndexHeader.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 105 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 157 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/index-page/IndexStates.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 77 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/CreateJamModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 108 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 235 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 254 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 274 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 274 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamAISuggestions.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 125 | `ChevronUp` | icon_without_aria_hidden | `aria-hidden="true"` |
| 127 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 198 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamAddTrackModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 133 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 271 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamHeader.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 45 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 63 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 65 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 70 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 85 | `Share` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamInviteModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 61 | `Share` | icon_without_aria_hidden | `aria-hidden="true"` |
| 88 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 90 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 110 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 118 | `Share` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamNicknameModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 46 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 67 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 98 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamParticipantsList.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 19 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamPlayer.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 56 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 122 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 136 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/jam/JamQueue.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 139 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/kiosk/KioskRemoteControl.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 54 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 70 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/landing/DemoAnimated.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 260 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/landing/ScreenshotCarousel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 87 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 96 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/landing/ScreenshotPreview.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 108 | `button` | missing_aria_label | `aria-label="PREENCHER"` |
| 108 | `button` | missing_type | `type="button"` |
| 111 | `button` | missing_aria_label | `aria-label="PREENCHER"` |
| 111 | `button` | missing_type | `type="button"` |
| 114 | `button` | missing_aria_label | `aria-label="PREENCHER"` |
| 114 | `button` | missing_type | `type="button"` |
| 106 | `Heart` | icon_without_aria_hidden | `aria-hidden="true"` |
| 109 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 115 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 118 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 129 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/layout/AdminLayout.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 67 | `Home` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/navigation/GlobalSidebar.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 245 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 247 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 361 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/navigation/Header.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 347 | `button` | missing_aria_label | `aria-label="PREENCHER"` |
| 347 | `button` | missing_type | `type="button"` |
| 139 | `Menu` | icon_without_aria_hidden | `aria-hidden="true"` |
| 148 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 196 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 208 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 223 | `Bell` | icon_without_aria_hidden | `aria-hidden="true"` |
| 296 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 308 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 334 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 342 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/CommandDeck.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 271 | `Menu` | icon_without_aria_hidden | `aria-hidden="true"` |
| 320 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/CreateJamButton.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 33 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/FullscreenKaraoke.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 205 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 215 | `Minimize2` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/LibraryPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 87 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 94 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 112 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 120 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 135 | `Heart` | icon_without_aria_hidden | `aria-hidden="true"` |
| 171 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 189 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 234 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 285 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 300 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/LyricsDisplay.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 150 | `Maximize2` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/PlaybackControls.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 103 | `Repeat` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/PlayerControls.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 105 | `SkipBack` | icon_without_aria_hidden | `aria-hidden="true"` |
| 169 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/QueuePanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 115 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 246 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 258 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/SideInfoPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 76 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/UserBadge.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 15 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 23 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/VoiceControlButton.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 19 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 20 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 21 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 22 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/VolumeSlider.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 59 | `VolumeIcon` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/WeatherForecastChart.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 100 | `AnimatedWeatherIcon` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/player/WeatherWidget.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 41 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 77 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 105 | `AnimatedWeatherIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 125 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 132 | `AnimatedWeatherIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 185 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/AIConfigSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 307 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 330 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 390 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 399 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 413 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 495 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/AccessibilitySection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 160 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 164 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 245 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 248 | `VolumeX` | icon_without_aria_hidden | `aria-hidden="true"` |
| 337 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/AddCustomCommandModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 123 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/AdvancedDatabaseSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 580 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 634 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 735 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 737 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 822 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 850 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 855 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 914 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 946 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/AlertConfigSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 188 | `Bell` | icon_without_aria_hidden | `aria-hidden="true"` |
| 304 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 315 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 317 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 374 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 385 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 387 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 448 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 459 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 461 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 510 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 521 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 523 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 569 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 580 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 582 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 629 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 640 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 642 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 737 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 739 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 756 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/AuthProviderSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 85 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/BackupScheduleSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 242 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/ClientsManagementSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 257 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 426 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 438 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 521 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 529 | `Edit` | icon_without_aria_hidden | `aria-hidden="true"` |
| 540 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 561 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 577 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 611 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 623 | `Edit` | icon_without_aria_hidden | `aria-hidden="true"` |
| 636 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 648 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 687 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/CloudConnectionSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 21 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 90 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/CodeScanSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 85 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 168 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 177 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/DatabaseConfigSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 364 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/DatabaseConnectionHistory.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 107 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/FullstackRefactorPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 15 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 149 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/GitHubExportSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 44 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 66 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 81 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 127 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/GitHubSyncStatus.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 44 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 116 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 168 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 200 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/KeysManagementSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 217 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 222 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 253 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 301 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 346 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/LocalMusicSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 182 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 183 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 184 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 206 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 214 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 222 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 232 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 255 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 266 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 277 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 319 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 401 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 412 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 420 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 457 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 496 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 512 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 550 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 568 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 628 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 677 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/ManusAutomationSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 31 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 330 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 342 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 352 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/MusicIntegrationsSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 129 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 137 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 254 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 264 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/NtpConfigSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 164 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 226 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 249 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/ScriptRefactorSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 49 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 132 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 134 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 168 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 168 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 390 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 400 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 593 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 631 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 673 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsBreadcrumb.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 11 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 33 | `Home` | icon_without_aria_hidden | `aria-hidden="true"` |
| 39 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 56 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsDashboard.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 142 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 173 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 175 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 182 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 306 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 339 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 361 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 388 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsFAQ.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 254 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 270 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 302 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 377 | `ChevronUp` | icon_without_aria_hidden | `aria-hidden="true"` |
| 379 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsGuideModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 75 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 93 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsNotificationBanner.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 37 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 60 | `Bell` | icon_without_aria_hidden | `aria-hidden="true"` |
| 122 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 135 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 154 | `ChevronUp` | icon_without_aria_hidden | `aria-hidden="true"` |
| 159 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 74 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SettingsSidebar.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 116 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 118 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 132 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 149 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 172 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SpicetifySection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 91 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 127 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 132 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 189 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 197 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 239 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 277 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 302 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 321 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 344 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 412 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 475 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 484 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 503 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 535 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 546 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 568 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 579 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 592 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 598 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 604 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SpotifySetupWizard.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 195 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 199 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 203 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 249 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 337 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 341 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 406 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 425 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 536 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 594 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 676 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/StorjSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 138 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 143 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 172 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 174 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 241 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 246 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 338 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 367 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 387 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 406 | `FileIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 424 | `FileIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 441 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 448 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 494 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/SystemUrlsSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 133 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 160 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 180 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 207 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/ThemeCustomizer.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 138 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 189 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 415 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/ThemeSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 207 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 215 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/UnifiedDatabaseSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 276 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/UserManagementSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 42 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 63 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 74 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 82 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 100 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 137 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 270 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 303 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |
| 351 | `Edit` | icon_without_aria_hidden | `aria-hidden="true"` |
| 364 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 383 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/VoiceAnalyticsCharts.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 20 | `PieChartIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 189 | `PieChartIcon` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/VoiceCommandHistory.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 109 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 158 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 166 | `Filter` | icon_without_aria_hidden | `aria-hidden="true"` |
| 245 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 247 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/VoiceControlSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 244 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 273 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 282 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 319 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 397 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 456 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/VoiceTrainingMode.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 311 | `Edit` | icon_without_aria_hidden | `aria-hidden="true"` |
| 319 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 327 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 358 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 392 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/VolumeNormalizationSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 40 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/WeatherConfigSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 114 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 257 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 284 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/YouTubeMusicSection.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 115 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 120 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 264 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/YouTubeMusicSetupWizard.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 46 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 131 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 174 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 289 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 291 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 372 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 416 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 451 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/backup/BackupActions.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 29 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 44 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/backup/BackupCard.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 115 | `Upload` | icon_without_aria_hidden | `aria-hidden="true"` |
| 126 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/settings/backup/BackupHistory.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 13 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 14 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 16 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spicetify/ThemePreviewCard.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 147 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 156 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 172 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/AddToPlaylistModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 69 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 96 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 145 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/ArtistCard.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 32 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/CreatePlaylistModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 65 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/SpotifyPanel.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 81 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 252 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 259 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 277 | `Heart` | icon_without_aria_hidden | `aria-hidden="true"` |
| 476 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 507 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/SpotifySearch.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 18 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/SpotifyTrackList.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 66 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/SpotifyUserBadge.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 27 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 53 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/spotify/TrackItem.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 113 | `Heart` | icon_without_aria_hidden | `aria-hidden="true"` |
| 121 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/system/TraceViewer.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 69 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 71 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 160 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 162 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 182 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 282 | `RefreshCw` | icon_without_aria_hidden | `aria-hidden="true"` |
| 286 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 340 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 415 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 429 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/tour/GuidedTour.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 156 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 195 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 209 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/CodeDiffViewer.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 151 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 153 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 166 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 168 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/CodePreview.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 73 | `Minimize2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 75 | `Maximize2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 85 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 87 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/LogoDownload.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 173 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 173 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 186 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 227 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 229 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/NotificationFiltersPopover.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 44 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 122 | `Filter` | icon_without_aria_hidden | `aria-hidden="true"` |
| 143 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 246 | `CalendarIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 273 | `CalendarIcon` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/NotificationsDropdown.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 64 | `NotificationIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 95 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 105 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 116 | `ExternalLink` | icon_without_aria_hidden | `aria-hidden="true"` |
| 149 | `Bell` | icon_without_aria_hidden | `aria-hidden="true"` |
| 185 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 197 | `Trash` | icon_without_aria_hidden | `aria-hidden="true"` |
| 229 | `Bell` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/SectionIconsShowcase.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 32 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |
| 42 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/WcagExceptionComment.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 268 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 270 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |
| 284 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 289 | `Copy` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/accordion.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 31 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/badge.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 99 | `CheckIcon` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/breadcrumb.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 64 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/calendar.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 45 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 46 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/checkbox.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 19 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 20 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/command.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 43 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/context-menu.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 35 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 105 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/dialog.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 46 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/dropdown-menu.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 35 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 106 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/menubar.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 60 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 84 | `Menu` | icon_without_aria_hidden | `aria-hidden="true"` |
| 132 | `Menu` | icon_without_aria_hidden | `aria-hidden="true"` |
| 133 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 154 | `Menu` | icon_without_aria_hidden | `aria-hidden="true"` |
| 181 | `Menu` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/modal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 139 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 248 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/pagination.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 51 | `ChevronLeft` | icon_without_aria_hidden | `aria-hidden="true"` |
| 60 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/select.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 27 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 42 | `ChevronUp` | icon_without_aria_hidden | `aria-hidden="true"` |
| 56 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 122 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/sheet.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 61 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/specialized-cards.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 131 | `Heart` | icon_without_aria_hidden | `aria-hidden="true"` |
| 195 | `TrendIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 206 | `CardIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 375 | `User` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/ui/toast.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 76 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/upload/AudioWaveformPreview.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 241 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 245 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/weather/AnimatedWeatherIcon.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 238 | `ThunderIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 241 | `RainIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 244 | `SnowIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 247 | `FogIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 250 | `SunIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 253 | `PartialCloudsIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 256 | `CloudIcon` | icon_without_aria_hidden | `aria-hidden="true"` |
| 259 | `SunIcon` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/wiki/WikiArticle.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 53 | `SkipBack` | icon_without_aria_hidden | `aria-hidden="true"` |
| 59 | `SkipForward` | icon_without_aria_hidden | `aria-hidden="true"` |
| 113 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 127 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 145 | `Volume2` | icon_without_aria_hidden | `aria-hidden="true"` |
| 159 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 164 | `Settings` | icon_without_aria_hidden | `aria-hidden="true"` |
| 205 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 207 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 209 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 244 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 246 | `Download` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/wiki/WikiNavigation.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 277 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 292 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 310 | `Filter` | icon_without_aria_hidden | `aria-hidden="true"` |
| 359 | `Minus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 376 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 402 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 404 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |
| 461 | `ChevronDown` | icon_without_aria_hidden | `aria-hidden="true"` |
| 463 | `ChevronRight` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/wiki/WikiSearch.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 88 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |
| 109 | `X` | icon_without_aria_hidden | `aria-hidden="true"` |
| 166 | `Search` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/youtube/AddToPlaylistModal.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 160 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |
| 205 | `Check` | icon_without_aria_hidden | `aria-hidden="true"` |
| 211 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

### `src/components/youtube/YouTubeMusicTrackItem.tsx`

| Linha | Elemento | Problema | Sugestão |
|-------|----------|----------|----------|
| 108 | `Heart` | icon_without_aria_hidden | `aria-hidden="true"` |
| 126 | `Plus` | icon_without_aria_hidden | `aria-hidden="true"` |

---

## 🔧 Próximos Passos

1. Executar `python3 scripts/add-aria-labels.py --apply` para aplicar correções automáticas
2. Revisar manualmente os itens marcados com "PREENCHER"
3. Testar com leitores de tela (VoiceOver, NVDA)
4. Executar `npm run a11y:audit` para validação final

---

*Relatório gerado automaticamente pelo script add-aria-labels.py*
