/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TSiJUKEBOX - STAGE THEME
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tema inspirado no visual do modo Karaoke, com estética de palco/stage,
 * luzes neon, gradientes magenta/cyan e interface metálica.
 * 
 * Aplicável a todos os modos: Player, Dashboard, Settings, Kiosk, Spotify, YouTube
 * 
 * @author B0.y_Z4kr14 + Manus AI
 * @version 1.0.0
 * @date 2025-12-25
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS - STAGE THEME
// ═══════════════════════════════════════════════════════════════════════════

export const stageTheme = {
  name: 'Stage',
  description: 'Tema inspirado em palco de show com luzes neon e interface metálica',
  version: '1.0.0',
  
  // ═══════════════════════════════════════════════════════════════════════
  // CORES PRINCIPAIS
  // ═══════════════════════════════════════════════════════════════════════
  colors: {
    // Background - Gradiente de palco com luzes
    background: {
      primary: '#0a0a1a',           // Azul escuro profundo (base)
      secondary: '#1a0a2e',         // Roxo escuro (cards)
      tertiary: '#2a1040',          // Magenta escuro (elevação)
      gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2a1040 100%)',
      spotlight: 'radial-gradient(ellipse at top, rgba(255, 0, 212, 0.3) 0%, transparent 50%)',
      stage: 'radial-gradient(ellipse at bottom, rgba(138, 43, 226, 0.2) 0%, transparent 70%)',
    },
    
    // Accent - Neon Lights
    accent: {
      cyan: '#00ffff',              // Cyan neon brilhante (destaque principal)
      magenta: '#ff00d4',           // Magenta neon (karaoke, destaque)
      purple: '#8a2be2',            // Roxo elétrico (luzes de palco)
      pink: '#ff1493',              // Rosa neon (efeitos)
      gold: '#ffd700',              // Dourado (pontuação, premium)
      lime: '#00ff44',              // Verde neon (sucesso, online)
    },
    
    // Interface Metálica
    metallic: {
      silver: '#c0c0c0',            // Prata (bordas, separadores)
      chrome: '#e8e8e8',            // Cromado (botões, controles)
      steel: '#71797E',             // Aço (backgrounds de controles)
      brushed: 'linear-gradient(180deg, #e8e8e8 0%, #a0a0a0 50%, #c0c0c0 100%)',
      dark: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #3a3a3a 100%)',
    },
    
    // Texto
    text: {
      primary: '#ffffff',           // Branco puro
      secondary: '#b0b0b0',         // Cinza claro
      tertiary: '#808080',          // Cinza médio
      highlight: '#00ffff',         // Cyan (texto destacado)
      lyrics: '#00ffff',            // Cyan (letras ativas)
      lyricsPending: '#666666',     // Cinza (letras pendentes)
    },
    
    // Estados
    state: {
      success: '#00ff44',           // Verde neon
      warning: '#ffd700',           // Dourado
      error: '#ff4444',             // Vermelho
      info: '#00ffff',              // Cyan
      recording: '#ff0000',         // Vermelho (REC)
    },
    
    // Glow Effects
    glow: {
      cyan: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)',
      magenta: '0 0 20px rgba(255, 0, 212, 0.6), 0 0 40px rgba(255, 0, 212, 0.3)',
      purple: '0 0 20px rgba(138, 43, 226, 0.6), 0 0 40px rgba(138, 43, 226, 0.3)',
      gold: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
      white: '0 0 10px rgba(255, 255, 255, 0.5)',
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // TIPOGRAFIA
  // ═══════════════════════════════════════════════════════════════════════
  typography: {
    fontFamily: {
      display: '"Bebas Neue", "Impact", sans-serif',  // Títulos estilo karaoke
      body: '"Inter", "Roboto", sans-serif',          // Corpo
      mono: '"Fira Code", monospace',                 // Código/tempo
      lyrics: '"Poppins", "Arial Black", sans-serif', // Letras
    },
    fontSize: {
      title: '3rem',
      subtitle: '1.5rem',
      body: '1rem',
      small: '0.875rem',
      lyrics: '1.75rem',
      lyricsHighlight: '2rem',
      score: '4rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // COMPONENTES
  // ═══════════════════════════════════════════════════════════════════════
  components: {
    // Card com borda metálica
    card: {
      background: 'rgba(26, 10, 46, 0.8)',
      border: '2px solid #4a4a4a',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
    },
    
    // Botão estilo metálico
    button: {
      primary: {
        background: 'linear-gradient(180deg, #00ffff 0%, #00cccc 100%)',
        color: '#000000',
        border: '2px solid #00ffff',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        hoverGlow: '0 0 25px rgba(0, 255, 255, 0.8)',
      },
      secondary: {
        background: 'linear-gradient(180deg, #ff00d4 0%, #cc00aa 100%)',
        color: '#ffffff',
        border: '2px solid #ff00d4',
        boxShadow: '0 0 15px rgba(255, 0, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        hoverGlow: '0 0 25px rgba(255, 0, 212, 0.8)',
      },
      metallic: {
        background: 'linear-gradient(180deg, #e8e8e8 0%, #a0a0a0 50%, #c0c0c0 100%)',
        color: '#1a1a1a',
        border: '2px solid #808080',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      },
      danger: {
        background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)',
        color: '#ffffff',
        border: '2px solid #ff4444',
        boxShadow: '0 0 15px rgba(255, 68, 68, 0.5)',
      },
    },
    
    // Slider/Progress bar estilo metálico
    slider: {
      track: {
        background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
        border: '1px solid #4a4a4a',
        height: '8px',
        borderRadius: '4px',
      },
      fill: {
        background: 'linear-gradient(90deg, #ff00d4 0%, #00ffff 100%)',
        boxShadow: '0 0 10px rgba(255, 0, 212, 0.5)',
      },
      thumb: {
        background: 'linear-gradient(180deg, #e8e8e8 0%, #a0a0a0 100%)',
        border: '2px solid #606060',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
    
    // Toggle switch
    toggle: {
      off: {
        background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
        border: '2px solid #4a4a4a',
      },
      on: {
        background: 'linear-gradient(180deg, #00ffff 0%, #00cccc 100%)',
        border: '2px solid #00ffff',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
      },
    },
    
    // Display de pontuação/score
    scoreDisplay: {
      background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%)',
      border: '3px solid #4a4a4a',
      borderRadius: '12px',
      color: '#00ffff',
      textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
      fontFamily: '"Bebas Neue", sans-serif',
    },
    
    // Visualizador de áudio
    audioVisualizer: {
      barColor: 'linear-gradient(180deg, #00ffff 0%, #ff00d4 100%)',
      barGlow: '0 0 10px rgba(0, 255, 255, 0.5)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    
    // Indicador REC
    recIndicator: {
      color: '#ff0000',
      glow: '0 0 10px rgba(255, 0, 0, 0.8)',
      animation: 'pulse 1s infinite',
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // EFEITOS ESPECIAIS
  // ═══════════════════════════════════════════════════════════════════════
  effects: {
    // Luzes de palco (spotlight)
    spotlight: {
      top: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 0, 212, 0.4) 0%, transparent 50%)',
      left: 'radial-gradient(ellipse 50% 80% at 0% 50%, rgba(138, 43, 226, 0.3) 0%, transparent 50%)',
      right: 'radial-gradient(ellipse 50% 80% at 100% 50%, rgba(0, 255, 255, 0.3) 0%, transparent 50%)',
      bottom: 'radial-gradient(ellipse 100% 30% at 50% 100%, rgba(138, 43, 226, 0.2) 0%, transparent 70%)',
    },
    
    // Partículas de luz (CSS animation)
    particles: {
      color1: 'rgba(255, 0, 212, 0.6)',
      color2: 'rgba(0, 255, 255, 0.6)',
      color3: 'rgba(138, 43, 226, 0.6)',
    },
    
    // Reflexo de palco
    stageReflection: {
      background: 'linear-gradient(180deg, transparent 0%, rgba(138, 43, 226, 0.1) 100%)',
    },
    
    // Brilho de texto (lyrics highlight)
    textGlow: {
      active: 'text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
      pending: 'text-shadow: none',
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // ANIMAÇÕES
  // ═══════════════════════════════════════════════════════════════════════
  animations: {
    // Pulso do REC
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `,
    
    // Glow pulsante
    glowPulse: `
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); }
        50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.9); }
      }
    `,
    
    // Spotlight sweep
    spotlightSweep: `
      @keyframes spotlightSweep {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `,
    
    // Lyrics highlight
    lyricsHighlight: `
      @keyframes lyricsHighlight {
        0% { color: #666666; text-shadow: none; }
        100% { color: #00ffff; text-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
      }
    `,
    
    // Score count up
    scoreCountUp: `
      @keyframes scoreCountUp {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// VARIAÇÕES POR MODO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tema Stage para modo PLAYER
 * Foco em visualização de áudio e controles de reprodução
 */
export const stagePlayerTheme = {
  ...stageTheme,
  name: 'Stage Player',
  mode: 'player',
  overrides: {
    accentPrimary: stageTheme.colors.accent.cyan,
    accentSecondary: stageTheme.colors.accent.magenta,
    progressBar: 'linear-gradient(90deg, #00ffff 0%, #ff00d4 100%)',
    volumeBar: 'linear-gradient(90deg, #00ff44 0%, #00ffff 100%)',
    albumArtGlow: '0 0 30px rgba(138, 43, 226, 0.5)',
  },
};

/**
 * Tema Stage para modo DASHBOARD
 * Foco em métricas e gráficos com visual de palco
 */
export const stageDashboardTheme = {
  ...stageTheme,
  name: 'Stage Dashboard',
  mode: 'dashboard',
  overrides: {
    chartColors: ['#00ffff', '#ff00d4', '#8a2be2', '#ffd700', '#00ff44'],
    cardGlow: '0 0 15px rgba(138, 43, 226, 0.3)',
    metricHighlight: stageTheme.colors.accent.gold,
    gridLines: 'rgba(138, 43, 226, 0.2)',
  },
};

/**
 * Tema Stage para modo SETTINGS
 * Foco em controles e configurações com interface metálica
 */
export const stageSettingsTheme = {
  ...stageTheme,
  name: 'Stage Settings',
  mode: 'settings',
  overrides: {
    sectionBackground: 'rgba(26, 10, 46, 0.6)',
    inputBackground: stageTheme.components.slider.track.background,
    toggleActive: stageTheme.colors.accent.cyan,
    sliderFill: stageTheme.components.slider.fill.background,
  },
};

/**
 * Tema Stage para modo KIOSK
 * Foco em visibilidade e impacto visual para telas grandes
 */
export const stageKioskTheme = {
  ...stageTheme,
  name: 'Stage Kiosk',
  mode: 'kiosk',
  overrides: {
    fontSize: {
      title: '5rem',
      subtitle: '2.5rem',
      body: '1.5rem',
      nowPlaying: '3rem',
    },
    spotlightIntensity: 1.5,
    glowIntensity: 2,
    animationSpeed: 'slow',
  },
};

/**
 * Tema Stage para modo SPOTIFY
 * Mantém identidade Spotify com visual de palco
 */
export const stageSpotifyTheme = {
  ...stageTheme,
  name: 'Stage Spotify',
  mode: 'spotify',
  overrides: {
    accentPrimary: '#1DB954', // Spotify green
    accentSecondary: stageTheme.colors.accent.cyan,
    playButton: {
      background: 'linear-gradient(180deg, #1DB954 0%, #169c46 100%)',
      glow: '0 0 20px rgba(29, 185, 84, 0.6)',
    },
    shuffleActive: '#1DB954',
  },
};

/**
 * Tema Stage para modo YOUTUBE
 * Mantém identidade YouTube com visual de palco
 */
export const stageYouTubeTheme = {
  ...stageTheme,
  name: 'Stage YouTube',
  mode: 'youtube',
  overrides: {
    accentPrimary: '#FF0000', // YouTube red
    accentSecondary: stageTheme.colors.accent.magenta,
    playButton: {
      background: 'linear-gradient(180deg, #FF0000 0%, #cc0000 100%)',
      glow: '0 0 20px rgba(255, 0, 0, 0.6)',
    },
    progressBar: 'linear-gradient(90deg, #FF0000 0%, #ff00d4 100%)',
  },
};

/**
 * Tema Stage para modo KARAOKE (original)
 * Visual completo de palco com letras e pontuação
 */
export const stageKaraokeTheme = {
  ...stageTheme,
  name: 'Stage Karaoke',
  mode: 'karaoke',
  overrides: {
    lyricsActive: stageTheme.colors.accent.cyan,
    lyricsPending: '#666666',
    lyricsGlow: stageTheme.colors.glow.cyan,
    scoreColor: stageTheme.colors.accent.cyan,
    scoreGlow: stageTheme.colors.glow.cyan,
    pitchBar: 'linear-gradient(90deg, #ff00d4 0%, #00ffff 100%)',
    reverbBar: 'linear-gradient(90deg, #8a2be2 0%, #ff00d4 100%)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

export default stageTheme;

// ═══════════════════════════════════════════════════════════════════════════
// CSS VARIABLES GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export const generateStageCSSVariables = () => `
  :root[data-theme="stage"] {
    /* Background */
    --stage-bg-primary: ${stageTheme.colors.background.primary};
    --stage-bg-secondary: ${stageTheme.colors.background.secondary};
    --stage-bg-tertiary: ${stageTheme.colors.background.tertiary};
    --stage-bg-gradient: ${stageTheme.colors.background.gradient};
    --stage-bg-spotlight: ${stageTheme.colors.background.spotlight};
    
    /* Accent */
    --stage-accent-cyan: ${stageTheme.colors.accent.cyan};
    --stage-accent-magenta: ${stageTheme.colors.accent.magenta};
    --stage-accent-purple: ${stageTheme.colors.accent.purple};
    --stage-accent-pink: ${stageTheme.colors.accent.pink};
    --stage-accent-gold: ${stageTheme.colors.accent.gold};
    --stage-accent-lime: ${stageTheme.colors.accent.lime};
    
    /* Metallic */
    --stage-metallic-silver: ${stageTheme.colors.metallic.silver};
    --stage-metallic-chrome: ${stageTheme.colors.metallic.chrome};
    --stage-metallic-steel: ${stageTheme.colors.metallic.steel};
    --stage-metallic-brushed: ${stageTheme.colors.metallic.brushed};
    
    /* Text */
    --stage-text-primary: ${stageTheme.colors.text.primary};
    --stage-text-secondary: ${stageTheme.colors.text.secondary};
    --stage-text-highlight: ${stageTheme.colors.text.highlight};
    --stage-text-lyrics: ${stageTheme.colors.text.lyrics};
    
    /* Glow */
    --stage-glow-cyan: ${stageTheme.colors.glow.cyan};
    --stage-glow-magenta: ${stageTheme.colors.glow.magenta};
    --stage-glow-purple: ${stageTheme.colors.glow.purple};
    --stage-glow-gold: ${stageTheme.colors.glow.gold};
    
    /* Components */
    --stage-card-bg: ${stageTheme.components.card.background};
    --stage-card-border: ${stageTheme.components.card.border};
    --stage-card-radius: ${stageTheme.components.card.borderRadius};
    
    /* Typography */
    --stage-font-display: ${stageTheme.typography.fontFamily.display};
    --stage-font-body: ${stageTheme.typography.fontFamily.body};
    --stage-font-lyrics: ${stageTheme.typography.fontFamily.lyrics};
  }
`;
