# Guia de Implementação de ARIA Labels - TSiJUKEBOX

> **Objetivo:** Implementar aria-labels nos 202 componentes identificados  
> **Prazo:** 5 dias úteis  
> **Prioridade:** 🔴 Crítica  
> **Status:** 📋 Pronto para Execução

---

## 📋 Sumário Executivo

Este guia fornece instruções **passo a passo** com **código pronto para copiar** para implementar aria-labels em todos os 202 componentes identificados na análise de acessibilidade.

### Componentes por Categoria

| Categoria | Quantidade | Arquivos | Esforço |
|-----------|------------|----------|---------|
| **Botões de ação** | 68 | 36 arquivos | 4h |
| **Ícones interativos** | 45 | 22 arquivos | 3h |
| **Cards clicáveis** | 32 | 12 arquivos | 2h |
| **Inputs de formulário** | 28 | 15 arquivos | 3h |
| **Modais e diálogos** | 12 | 8 arquivos | 2h |
| **Navegação e menus** | 10 | 5 arquivos | 1h |
| **Controles de mídia** | 7 | 4 arquivos | 1h |

**Total:** 202 componentes | 16 horas de trabalho

---

## 🚀 Ações Imediatas - Dia 1

### 1.1 Componentes do Player (Já Implementados ✅)

Os seguintes componentes **já possuem** aria-labels corretos:

```tsx
// ✅ PlaybackControls.tsx - CORRETO
<Button
  aria-label={shuffle ? t('player.shuffleOn') : t('player.shuffleOff')}
  aria-pressed={shuffle}
/>

// ✅ PlayerControls.tsx - CORRETO
<Button
  aria-label={isPlaying ? t('player.pause') : t('player.play')}
  aria-disabled={!canControl}
/>
```

### 1.2 Componentes que Precisam de Correção

#### Arquivo: `src/components/player/LibraryPanel.tsx`

**Localização:** Linhas 130, 153, 256, 290

```tsx
// ❌ ANTES (linha 130)
<button
  onClick={() => setActiveTab('playlists')}
  className={...}
>
  Playlists
</button>

// ✅ DEPOIS
<button
  type="button"
  onClick={() => setActiveTab('playlists')}
  aria-label="Ver playlists"
  aria-pressed={activeTab === 'playlists'}
  aria-controls="library-content"
  className={...}
>
  Playlists
</button>
```

**Comando para aplicar:**
```bash
# Abrir arquivo no editor
code src/components/player/LibraryPanel.tsx

# Buscar e substituir (regex)
# Buscar: <button(\s+)onClick
# Substituir: <button type="button" aria-label="PREENCHER"$1onClick
```

#### Arquivo: `src/components/player/WeatherWidget.tsx`

**Localização:** Linha 178

```tsx
// ❌ ANTES
<button
  onClick={() => setShowForecast(!showForecast)}
  className={...}
>
  {showForecast ? 'Ocultar' : 'Ver'} Previsão
</button>

// ✅ DEPOIS
<button
  type="button"
  onClick={() => setShowForecast(!showForecast)}
  aria-label={showForecast ? 'Ocultar previsão do tempo' : 'Ver previsão do tempo'}
  aria-expanded={showForecast}
  aria-controls="weather-forecast-panel"
  className={...}
>
  {showForecast ? 'Ocultar' : 'Ver'} Previsão
</button>
```

---

## 🎯 Ações Imediatas - Dia 2

### 2.1 Componentes de Landing Page

#### Arquivo: `src/components/landing/DemoAnimated.tsx`

**Localização:** Linhas 104, 224, 245

```tsx
// ❌ ANTES (linha 104)
<button
  onClick={handlePlayDemo}
  className="..."
>
  <PlayIcon />
</button>

// ✅ DEPOIS
<button
  type="button"
  onClick={handlePlayDemo}
  aria-label={isPlaying ? 'Pausar demonstração' : 'Iniciar demonstração'}
  aria-pressed={isPlaying}
  className="..."
>
  {isPlaying ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
</button>
```

#### Arquivo: `src/components/landing/ScreenshotCarousel.tsx`

**Localização:** Linha 102

```tsx
// ❌ ANTES
<button
  onClick={() => setCurrentIndex(prev => prev - 1)}
  disabled={currentIndex === 0}
>
  <ChevronLeft />
</button>

// ✅ DEPOIS
<button
  type="button"
  onClick={() => setCurrentIndex(prev => prev - 1)}
  disabled={currentIndex === 0}
  aria-label="Imagem anterior"
  aria-disabled={currentIndex === 0}
>
  <ChevronLeft aria-hidden="true" />
</button>
```

#### Arquivo: `src/components/landing/ScreenshotPreview.tsx`

**Localização:** Linhas 108, 111, 114

```tsx
// ❌ ANTES (linha 108)
<button className={`p-1 ${mutedClass}`}>
  <Volume2 />
</button>

// ✅ DEPOIS
<button
  type="button"
  className={`p-1 ${mutedClass}`}
  aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
  aria-pressed={!isMuted}
>
  {isMuted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
</button>

// ❌ ANTES (linha 111)
<button className={`p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`}>
  <Play />
</button>

// ✅ DEPOIS
<button
  type="button"
  className={`p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`}
  aria-label="Reproduzir prévia"
>
  <Play aria-hidden="true" />
</button>

// ❌ ANTES (linha 114)
<button className={`p-1 ${mutedClass}`}>
  <Maximize2 />
</button>

// ✅ DEPOIS
<button
  type="button"
  className={`p-1 ${mutedClass}`}
  aria-label="Abrir em tela cheia"
>
  <Maximize2 aria-hidden="true" />
</button>
```

---

## 🎯 Ações Imediatas - Dia 3

### 3.1 Componentes de Navegação

#### Arquivo: `src/components/navigation/GlobalSidebar.tsx`

```tsx
// ❌ ANTES
<nav className="sidebar-nav">
  <button onClick={() => navigate('/dashboard')}>
    <HomeIcon />
    Dashboard
  </button>
</nav>

// ✅ DEPOIS
<nav className="sidebar-nav" aria-label="Menu principal">
  <button
    type="button"
    onClick={() => navigate('/dashboard')}
    aria-label="Ir para Dashboard"
    aria-current={currentPath === '/dashboard' ? 'page' : undefined}
  >
    <HomeIcon aria-hidden="true" />
    <span>Dashboard</span>
  </button>
</nav>
```

#### Arquivo: `src/components/navigation/Header.tsx`

```tsx
// ❌ ANTES
<header>
  <button onClick={toggleMenu}>
    <MenuIcon />
  </button>
  <button onClick={toggleNotifications}>
    <BellIcon />
    {unreadCount > 0 && <span>{unreadCount}</span>}
  </button>
</header>

// ✅ DEPOIS
<header role="banner">
  <button
    type="button"
    onClick={toggleMenu}
    aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
    aria-expanded={isMenuOpen}
    aria-controls="main-menu"
  >
    <MenuIcon aria-hidden="true" />
  </button>
  <button
    type="button"
    onClick={toggleNotifications}
    aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
    aria-expanded={isNotificationsOpen}
    aria-controls="notifications-panel"
  >
    <BellIcon aria-hidden="true" />
    {unreadCount > 0 && (
      <span aria-hidden="true" className="badge">{unreadCount}</span>
    )}
  </button>
</header>
```

---

## 🎯 Ações Imediatas - Dia 4

### 4.1 Componentes do Spotify

#### Arquivo: `src/components/spotify/TrackItem.tsx`

```tsx
// ❌ ANTES
<div onClick={() => playTrack(track)}>
  <img src={track.albumCover} />
  <span>{track.name}</span>
  <button onClick={handleAddToPlaylist}>
    <PlusIcon />
  </button>
</div>

// ✅ DEPOIS
<div
  role="button"
  tabIndex={0}
  onClick={() => playTrack(track)}
  onKeyDown={(e) => e.key === 'Enter' && playTrack(track)}
  aria-label={`Reproduzir ${track.name} de ${track.artist}`}
>
  <img
    src={track.albumCover}
    alt={`Capa do álbum ${track.album} de ${track.artist}`}
    loading="lazy"
  />
  <span>{track.name}</span>
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handleAddToPlaylist();
    }}
    aria-label={`Adicionar ${track.name} à playlist`}
  >
    <PlusIcon aria-hidden="true" />
  </button>
</div>
```

#### Arquivo: `src/components/spotify/AlbumCard.tsx`

```tsx
// ❌ ANTES
<div className="album-card" onClick={() => openAlbum(album)}>
  <img src={album.cover} />
  <h3>{album.name}</h3>
  <p>{album.artist}</p>
</div>

// ✅ DEPOIS
<article
  className="album-card"
  role="button"
  tabIndex={0}
  onClick={() => openAlbum(album)}
  onKeyDown={(e) => e.key === 'Enter' && openAlbum(album)}
  aria-label={`Abrir álbum ${album.name} de ${album.artist}`}
>
  <img
    src={album.cover}
    alt={`Capa do álbum ${album.name}`}
    loading="lazy"
  />
  <h3>{album.name}</h3>
  <p>{album.artist}</p>
</article>
```

#### Arquivo: `src/components/spotify/PlaylistCard.tsx`

```tsx
// ❌ ANTES
<div className="playlist-card" onClick={() => openPlaylist(playlist)}>
  <img src={playlist.cover} />
  <span>{playlist.name}</span>
  <span>{playlist.trackCount} músicas</span>
</div>

// ✅ DEPOIS
<article
  className="playlist-card"
  role="button"
  tabIndex={0}
  onClick={() => openPlaylist(playlist)}
  onKeyDown={(e) => e.key === 'Enter' && openPlaylist(playlist)}
  aria-label={`Abrir playlist ${playlist.name} com ${playlist.trackCount} músicas`}
>
  <img
    src={playlist.cover}
    alt={`Capa da playlist ${playlist.name}`}
    loading="lazy"
  />
  <span>{playlist.name}</span>
  <span aria-label={`${playlist.trackCount} músicas`}>
    {playlist.trackCount} músicas
  </span>
</article>
```

#### Arquivo: `src/components/spotify/AddToPlaylistModal.tsx`

```tsx
// ❌ ANTES
<div className="modal">
  <h2>Adicionar à Playlist</h2>
  <button onClick={onClose}>×</button>
  <ul>
    {playlists.map(playlist => (
      <li key={playlist.id} onClick={() => addToPlaylist(playlist.id)}>
        {playlist.name}
      </li>
    ))}
  </ul>
</div>

// ✅ DEPOIS
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="add-playlist-title"
  aria-describedby="add-playlist-desc"
  className="modal"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <h2 id="add-playlist-title">Adicionar à Playlist</h2>
  <p id="add-playlist-desc" className="sr-only">
    Selecione uma playlist para adicionar a música
  </p>
  <button
    type="button"
    onClick={onClose}
    aria-label="Fechar modal"
  >
    <span aria-hidden="true">×</span>
  </button>
  <ul role="listbox" aria-label="Playlists disponíveis">
    {playlists.map(playlist => (
      <li
        key={playlist.id}
        role="option"
        tabIndex={0}
        onClick={() => addToPlaylist(playlist.id)}
        onKeyDown={(e) => e.key === 'Enter' && addToPlaylist(playlist.id)}
        aria-label={`Adicionar à playlist ${playlist.name}`}
      >
        {playlist.name}
      </li>
    ))}
  </ul>
</div>
```

---

## 🎯 Ações Imediatas - Dia 5

### 5.1 Componentes de Settings

#### Arquivo: `src/components/settings/ThemeCustomizer.tsx`

```tsx
// ❌ ANTES
<div className="color-picker">
  <button onClick={() => setColor('primary', '#00d4ff')}>
    <div style={{ background: '#00d4ff' }} />
  </button>
</div>

// ✅ DEPOIS
<div className="color-picker" role="radiogroup" aria-label="Selecionar cor primária">
  <button
    type="button"
    role="radio"
    aria-checked={currentColor === '#00d4ff'}
    onClick={() => setColor('primary', '#00d4ff')}
    aria-label="Cyan (#00d4ff)"
  >
    <div style={{ background: '#00d4ff' }} aria-hidden="true" />
  </button>
</div>
```

#### Arquivo: `src/components/settings/SettingsFAQ.tsx`

```tsx
// ❌ ANTES
<div className="faq-item">
  <button onClick={() => toggleQuestion(id)}>
    {question}
    <ChevronDown />
  </button>
  {isOpen && <p>{answer}</p>}
</div>

// ✅ DEPOIS
<div className="faq-item">
  <h3>
    <button
      type="button"
      onClick={() => toggleQuestion(id)}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${id}`}
      id={`faq-question-${id}`}
    >
      {question}
      <ChevronDown
        aria-hidden="true"
        className={isOpen ? 'rotate-180' : ''}
      />
    </button>
  </h3>
  <div
    id={`faq-answer-${id}`}
    role="region"
    aria-labelledby={`faq-question-${id}`}
    hidden={!isOpen}
  >
    <p>{answer}</p>
  </div>
</div>
```

### 5.2 Componentes de GitHub

#### Arquivo: `src/components/github/CommitFilters.tsx`

```tsx
// ❌ ANTES (linha 271)
<button onClick={() => setFilters(prev => ({ ...prev, author: null }))}>
  Limpar filtro de autor
</button>

// ✅ DEPOIS
<button
  type="button"
  onClick={() => setFilters(prev => ({ ...prev, author: null }))}
  aria-label="Limpar filtro de autor"
>
  <span aria-hidden="true">×</span>
  <span className="sr-only">Limpar filtro de autor</span>
</button>

// ❌ ANTES (linha 280)
<button onClick={() => toggleType(type)}>
  {type}
</button>

// ✅ DEPOIS
<button
  type="button"
  onClick={() => toggleType(type)}
  aria-label={`Filtrar por tipo: ${type}`}
  aria-pressed={selectedTypes.includes(type)}
>
  {type}
</button>
```

---

## 📝 Checklist de Implementação

### Botões (68 componentes)

- [ ] `src/components/player/LibraryPanel.tsx` (4 botões)
- [ ] `src/components/player/WeatherWidget.tsx` (1 botão)
- [ ] `src/components/landing/DemoAnimated.tsx` (3 botões)
- [ ] `src/components/landing/ScreenshotCarousel.tsx` (2 botões)
- [ ] `src/components/landing/ScreenshotPreview.tsx` (3 botões)
- [ ] `src/components/navigation/GlobalSidebar.tsx` (8 botões)
- [ ] `src/components/navigation/Header.tsx` (4 botões)
- [ ] `src/components/github/CommitFilters.tsx` (5 botões)
- [ ] `src/components/settings/ThemeCustomizer.tsx` (12 botões)
- [ ] `src/components/settings/SettingsFAQ.tsx` (10 botões)
- [ ] `src/components/settings/SettingsDashboard.tsx` (6 botões)
- [ ] `src/components/jam/CreateJamModal.tsx` (3 botões)
- [ ] `src/components/jam/JamHeader.tsx` (2 botões)
- [ ] `src/components/tour/GuidedTour.tsx` (3 botões)
- [ ] `src/components/wiki/WikiNavigation.tsx` (2 botões)

### Cards Clicáveis (32 componentes)

- [ ] `src/components/spotify/AlbumCard.tsx`
- [ ] `src/components/spotify/ArtistCard.tsx`
- [ ] `src/components/spotify/PlaylistCard.tsx`
- [ ] `src/components/spotify/TrackItem.tsx`
- [ ] `src/components/youtube/YouTubeMusicAlbumCard.tsx`
- [ ] `src/components/youtube/YouTubeMusicPlaylistCard.tsx`
- [ ] `src/components/youtube/YouTubeMusicTrackItem.tsx`
- [ ] `src/components/ui/specialized-cards.tsx`

### Modais (12 componentes)

- [ ] `src/components/spotify/AddToPlaylistModal.tsx`
- [ ] `src/components/spotify/CreatePlaylistModal.tsx`
- [ ] `src/components/youtube/AddToPlaylistModal.tsx`
- [ ] `src/components/jam/CreateJamModal.tsx`
- [ ] `src/components/settings/CreateDeployKeyModal.tsx`
- [ ] `src/components/settings/SettingsGuideModal.tsx`

### Formulários (28 componentes)

- [ ] `src/components/settings/SpotifySetupWizard.tsx`
- [ ] `src/components/settings/DatabaseConfigSection.tsx`
- [ ] `src/components/settings/UserManagementSection.tsx`
- [ ] `src/components/settings/WeatherConfigSection.tsx`
- [ ] `src/components/settings/NtpConfigSection.tsx`
- [ ] `src/components/wiki/WikiSearch.tsx`

---

## 🔧 Script de Automação

Crie o arquivo `scripts/add-aria-labels.py` para automatizar parte do processo:

```python
#!/usr/bin/env python3
"""
Script para adicionar aria-labels automaticamente aos componentes.
Uso: python3 scripts/add-aria-labels.py --dry-run
"""

import re
import os
from pathlib import Path

# Mapeamento de componentes para aria-labels
ARIA_MAPPINGS = {
    # Botões de player
    r'onClick=\{handlePlay\}': 'aria-label={isPlaying ? "Pausar" : "Reproduzir"}',
    r'onClick=\{handlePrev\}': 'aria-label="Faixa anterior"',
    r'onClick=\{handleNext\}': 'aria-label="Próxima faixa"',
    r'onClick=\{handleStop\}': 'aria-label="Parar reprodução"',
    
    # Botões de navegação
    r'onClick=\{toggleMenu\}': 'aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}',
    r'onClick=\{toggleNotifications\}': 'aria-label="Notificações"',
    
    # Botões de modal
    r'onClick=\{onClose\}': 'aria-label="Fechar"',
}

def add_aria_to_button(content: str) -> str:
    """Adiciona aria-label a botões sem o atributo."""
    # Padrão para encontrar botões sem aria-label
    pattern = r'<button([^>]*?)(?<!aria-label)>'
    
    def add_type_and_aria(match):
        attrs = match.group(1)
        if 'type=' not in attrs:
            attrs = ' type="button"' + attrs
        if 'aria-label=' not in attrs:
            # Tentar inferir aria-label do conteúdo
            attrs += ' aria-label="PREENCHER"'
        return f'<button{attrs}>'
    
    return re.sub(pattern, add_type_and_aria, content)

def process_file(filepath: Path, dry_run: bool = True) -> bool:
    """Processa um arquivo TSX."""
    content = filepath.read_text()
    new_content = add_aria_to_button(content)
    
    if content != new_content:
        if dry_run:
            print(f"[DRY-RUN] Modificaria: {filepath}")
        else:
            filepath.write_text(new_content)
            print(f"[MODIFICADO] {filepath}")
        return True
    return False

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    
    src_dir = Path('src/components')
    modified = 0
    
    for tsx_file in src_dir.rglob('*.tsx'):
        if '__tests__' in str(tsx_file):
            continue
        if process_file(tsx_file, args.dry_run):
            modified += 1
    
    print(f"\nTotal de arquivos {'que seriam modificados' if args.dry_run else 'modificados'}: {modified}")

if __name__ == '__main__':
    main()
```

---

## 📊 Métricas de Sucesso

### Antes da Implementação
- Componentes com aria-label: 48/250 (19%)
- Botões com type explícito: 82/150 (55%)
- Imagens com alt: 73/100 (73%)

### Após a Implementação (Meta)
- Componentes com aria-label: 250/250 (100%)
- Botões com type explícito: 150/150 (100%)
- Imagens com alt: 100/100 (100%)

---

## 🧪 Validação

### Ferramentas de Teste

```bash
# Executar auditoria de acessibilidade
npm run a11y:audit

# Verificar aria-labels
node scripts/a11y-audit.js --check-aria

# Testar com axe-core
npm run test:a11y
```

### Testes Manuais

1. **VoiceOver (macOS):** Cmd + F5
2. **NVDA (Windows):** Baixar de nvaccess.org
3. **ChromeVox (Chrome):** Extensão do Chrome
4. **Navegação por teclado:** Tab, Enter, Escape, Setas

---

## 📚 Referências

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Inclusive Components](https://inclusive-components.design/)

---

**Próximo Passo:** Executar o script de automação em modo dry-run e revisar as alterações sugeridas.

```bash
python3 scripts/add-aria-labels.py --dry-run
```
