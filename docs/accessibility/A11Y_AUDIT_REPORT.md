======================================================================
📊 AUDITORIA DE ACESSIBILIDADE - TSiJUKEBOX
======================================================================

🎨 ANÁLISE DE CONTRASTE
--------------------------------------------------

| Padrão | Ocorrências | Descrição |
|--------|-------------|-----------|
| `text-muted` | 458 | Texto muted pode ter baixo contraste |
| `opacity-50` | 85 | Opacidade 50% reduz contraste |
| `text-\[var\(--text-muted\)\]` | 83 | Texto muted via CSS var |
| `text-gray-400` | 20 | Texto cinza claro pode ter baixo contraste |
| `text-gray-500` | 10 | Texto cinza médio pode ter baixo contraste |
| `opacity-60` | 6 | Opacidade 60% reduz contraste |


⌨️ ANÁLISE DE NAVEGAÇÃO POR TECLADO
--------------------------------------------------

| Padrão | Ocorrências | Descrição |
|--------|-------------|-----------|
| `onClick(?![^>]*onKeyDown)` | 759 | onClick sem onKeyDown |
| `focus:outline-none` | 19 | Foco removido pode afetar navegação |
| `outline-none(?![^"]*focus)` | 11 | outline-none sem estilo de foco |


🏷️ ANÁLISE DE ARIA
--------------------------------------------------

| Atributo ARIA | Ocorrências |
|---------------|-------------|
| `aria-hidden` | 445 |
| `aria-label` | 109 |
| `role` | 28 |
| `aria-describedby` | 3 |
| `aria-pressed` | 3 |
| `aria-expanded` | 2 |
| `aria-labelledby` | 1 |
| `aria-live` | 0 |


⚠️ POTENCIAIS PROBLEMAS
--------------------------------------------------

| Arquivo | Problema | Quantidade |
|---------|----------|------------|
| `components/settings/LocalMusicSection.tsx` | Botões de ícone potencialmente sem aria-label | 6 |
| `components/player/LibraryPanel.tsx` | Botões de ícone potencialmente sem aria-label | 4 |
| `components/settings/ClientsManagementSection.tsx` | Botões de ícone potencialmente sem aria-label | 4 |
| `pages/spotify/SpotifyPlaylist.tsx` | Botões de ícone potencialmente sem aria-label | 4 |
| `components/player/PlaybackControls.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/player/QueuePanel.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/settings/SettingsSidebar.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/settings/SpotifySetupWizard.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/settings/StorjSection.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/settings/VoiceCommandHistory.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/settings/VoiceTrainingMode.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/spotify/SpotifyPanel.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/ui/NotificationsDropdown.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/youtube/YouTubeMusicTrackItem.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `pages/tools/ComponentsShowcase.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `pages/tools/LyricsTest.tsx` | Botões de ícone potencialmente sem aria-label | 3 |
| `components/index-page/IndexHeader.tsx` | Botões de ícone potencialmente sem aria-label | 2 |
| `components/jam/JamQueue.tsx` | Botões de ícone potencialmente sem aria-label | 2 |
| `components/landing/ScreenshotCarousel.tsx` | Botões de ícone potencialmente sem aria-label | 2 |
| `components/player/FullscreenKaraoke.tsx` | Botões de ícone potencialmente sem aria-label | 2 |


📈 RESUMO DA AUDITORIA
======================================================================
Total de aria-labels: 109
Total de roles: 28
Padrões de baixo contraste: 789
Potenciais problemas de teclado: 789
