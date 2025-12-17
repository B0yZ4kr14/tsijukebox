import { ReactNode } from 'react';

export interface WikiArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  steps?: string[];
  tips?: string[];
  relatedArticles?: string[];
  illustration?: string;
}

export interface WikiSubSection {
  id: string;
  title: string;
  articles: WikiArticle[];
}

export interface WikiCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  subSections: WikiSubSection[];
}

export const wikiCategories: WikiCategory[] = [
  {
    id: 'playback',
    title: 'Reprodução de Música',
    icon: 'Music',
    description: 'Aprenda a controlar a reprodução de músicas no TSi JUKEBOX',
    subSections: [
      {
        id: 'basic-controls',
        title: 'Controles Básicos',
        articles: [
          {
            id: 'play-pause',
            title: 'Play/Pause',
            description: 'Como iniciar e pausar a reprodução de música',
            content: 'O botão Play/Pause é o controle central do player. Ele permite alternar entre reproduzir e pausar a música atual com um único toque ou pressionamento de tecla.',
            steps: [
              'Via tela de toque: Toque no botão grande central com o ícone de play (▶) ou pause (⏸)',
              'Via teclado: Pressione a Barra de Espaço',
              'O ícone muda automaticamente para refletir o estado atual'
            ],
            tips: [
              'O estado é sincronizado em tempo real com o Spotify',
              'Pausar não perde a posição da música'
            ],
            illustration: 'player',
            relatedArticles: ['next-previous', 'volume-control']
          },
          {
            id: 'next-previous',
            title: 'Próxima/Anterior',
            description: 'Navegação entre faixas da playlist',
            content: 'Os botões de navegação permitem avançar para a próxima música ou voltar para a anterior. O comportamento de "voltar" é inteligente e considera o tempo de reprodução.',
            steps: [
              'Próxima: Toque no botão ⏭ ou pressione Seta Direita (→)',
              'Anterior: Toque no botão ⏮ ou pressione Seta Esquerda (←)',
              'Gesto: Deslize para esquerda (próxima) ou direita (anterior)'
            ],
            tips: [
              'Nos primeiros 3s, "anterior" volta para a música anterior',
              'Após 3s, "anterior" reinicia a música atual'
            ],
            illustration: 'player',
            relatedArticles: ['play-pause', 'keyboard-navigation']
          },
          {
            id: 'volume-control',
            title: 'Controle de Volume',
            description: 'Ajuste o volume de reprodução',
            content: 'O volume pode ser ajustado de 0% a 100% em incrementos de 5%. O nível é persistido entre sessões.',
            steps: [
              'Slider: Arraste o controle deslizante de volume',
              'Teclado: Setas ↑/↓ ou teclas +/- para ajuste de 5%',
              'Toque longo: Segure no slider para ajuste contínuo'
            ],
            tips: [
              'Volume 0% silencia mas não para a música',
              'O volume é salvo automaticamente'
            ],
            illustration: 'volume',
            relatedArticles: ['play-pause']
          }
        ]
      },
      {
        id: 'queue',
        title: 'Fila de Reprodução',
        articles: [
          {
            id: 'view-queue',
            title: 'Visualizar Fila',
            description: 'Veja as próximas músicas que serão tocadas',
            content: 'A fila de reprodução mostra todas as músicas programadas para tocar. Você pode ver a ordem, informações das faixas e gerenciar a lista.',
            steps: [
              'Toque no ícone de lista/fila no player',
              'A fila aparece em um painel lateral',
              'Role para ver todas as músicas'
            ],
            tips: ['A fila sincroniza com o Spotify em tempo real'],
            illustration: 'queue'
          },
          {
            id: 'reorder-queue',
            title: 'Reordenar Fila',
            description: 'Arraste músicas para mudar a ordem',
            content: 'Você pode reorganizar a fila de reprodução arrastando as músicas para novas posições usando drag and drop.',
            steps: [
              'Abra a fila de reprodução',
              'Toque e segure em uma música',
              'Arraste para a nova posição',
              'Solte para confirmar'
            ],
            tips: ['A nova ordem é salva automaticamente no backend'],
            illustration: 'queue'
          },
          {
            id: 'add-to-queue',
            title: 'Adicionar à Fila',
            description: 'Adicione músicas do Spotify à fila',
            content: 'Você pode adicionar músicas à fila de reprodução a partir da biblioteca do Spotify, playlists ou resultados de busca.',
            steps: [
              'Navegue até a música desejada no Spotify Browser',
              'Toque no ícone + ou "Adicionar à fila"',
              'A música aparecerá no final da fila'
            ],
            illustration: 'spotify'
          },
          {
            id: 'remove-from-queue',
            title: 'Remover da Fila',
            description: 'Remova músicas indesejadas',
            content: 'Músicas podem ser removidas individualmente da fila, ou você pode limpar toda a fila de uma vez.',
            steps: [
              'Abra a fila de reprodução',
              'Toque no ícone X ao lado da música',
              'Confirme a remoção se solicitado'
            ],
            tips: ['Use "Limpar Fila" para remover todas de uma vez'],
            illustration: 'queue'
          },
          {
            id: 'clear-queue',
            title: 'Limpar Fila',
            description: 'Remova todas as músicas da fila',
            content: 'A função de limpar fila remove todas as músicas pendentes, mantendo apenas a música atual em reprodução.',
            steps: [
              'Abra a fila de reprodução',
              'Toque no botão "Limpar Fila"',
              'Confirme a ação'
            ],
            illustration: 'queue'
          }
        ]
      },
      {
        id: 'playback-modes',
        title: 'Modos de Reprodução',
        articles: [
          {
            id: 'shuffle',
            title: 'Shuffle (Aleatório)',
            description: 'Reproduza músicas em ordem aleatória',
            content: 'O modo shuffle embaralha a ordem das músicas na fila, proporcionando uma experiência de audição variada e surpreendente.',
            steps: [
              'Localize o ícone de shuffle (🔀) nos controles',
              'Toque para ativar/desativar',
              'O ícone fica destacado quando ativo'
            ],
            tips: [
              'Ativar shuffle reorganiza a fila atual',
              'Desativar restaura a ordem original'
            ],
            illustration: 'playback'
          },
          {
            id: 'repeat',
            title: 'Repeat (Repetir)',
            description: 'Configure a repetição de músicas',
            content: 'O modo repeat oferece três estados: desligado, repetir playlist, e repetir uma música.',
            steps: [
              'Localize o ícone de repeat (🔁) nos controles',
              'Toque para alternar entre os modos:',
              '• Desligado: sem repetição',
              '• Playlist: repete toda a fila',
              '• Uma música: repete a faixa atual'
            ],
            tips: ['O indicador "1" aparece no modo de repetir uma música'],
            illustration: 'playback'
          }
        ]
      }
    ]
  },
  {
    id: 'shortcuts',
    title: 'Atalhos e Gestos',
    icon: 'Keyboard',
    description: 'Domine os atalhos de teclado e gestos de toque',
    subSections: [
      {
        id: 'keyboard-shortcuts',
        title: 'Atalhos de Teclado',
        articles: [
          {
            id: 'keyboard-playback',
            title: 'Atalhos de Reprodução',
            description: 'Controle a música com o teclado',
            content: 'Os atalhos de teclado permitem controlar a reprodução sem tocar na tela, ideal para uso com teclados externos ou controles remotos.',
            steps: [
              'Espaço: Play/Pause - alterna o estado de reprodução',
              '→ Seta Direita: Próxima música',
              '← Seta Esquerda: Música anterior',
              '↑ Seta Cima ou +: Volume +5%',
              '↓ Seta Baixo ou -: Volume -5%'
            ],
            tips: [
              'Funciona em qualquer área do player',
              'Segure as teclas de volume para ajuste rápido'
            ],
            illustration: 'keyboard'
          },
          {
            id: 'keyboard-navigation',
            title: 'Navegação por Teclado',
            description: 'Use Tab e Enter para navegar',
            content: 'A interface suporta navegação completa por teclado para acessibilidade.',
            steps: [
              'Tab: Move o foco para o próximo elemento',
              'Shift+Tab: Move o foco para o elemento anterior',
              'Enter: Ativa o elemento com foco',
              'Escape: Fecha modais e menus'
            ],
            illustration: 'keyboard'
          }
        ]
      },
      {
        id: 'touch-gestures',
        title: 'Gestos de Toque',
        articles: [
          {
            id: 'swipe-gestures',
            title: 'Gestos de Deslizar',
            description: 'Deslize para controlar a música',
            content: 'Os gestos de deslizar (swipe) permitem navegação rápida entre músicas com movimento natural.',
            steps: [
              '← Deslizar para Esquerda: Próxima música',
              '→ Deslizar para Direita: Música anterior',
              'Distância mínima: 50 pixels',
              'Funciona sobre a área do player'
            ],
            tips: [
              'Gestos diagonais são ignorados',
              'Feedback visual confirma o reconhecimento'
            ],
            illustration: 'gesture'
          },
          {
            id: 'tap-gestures',
            title: 'Gestos de Toque',
            description: 'Toques simples e prolongados',
            content: 'Além de deslizar, o sistema responde a diferentes tipos de toque nos elementos da interface.',
            steps: [
              'Toque simples: Ativa botões e controles',
              'Toque duplo: Não utilizado (evita conflitos)',
              'Toque longo: Ativa modo de ajuste contínuo no volume'
            ],
            illustration: 'gesture'
          },
          {
            id: 'gesture-sensitivity',
            title: 'Sensibilidade de Gestos',
            description: 'Entenda como os gestos são reconhecidos',
            content: 'O sistema usa limiares específicos para distinguir gestos intencionais de movimentos acidentais.',
            steps: [
              'Distância mínima horizontal: 50px',
              'Movimento horizontal deve ser maior que vertical',
              'Velocidade não afeta o reconhecimento',
              'Use um único dedo para melhores resultados'
            ],
            tips: [
              'Películas grossas podem reduzir sensibilidade',
              'Limpe a tela se os gestos não responderem'
            ],
            illustration: 'gesture'
          }
        ]
      },
      {
        id: 'test-mode',
        title: 'Modo de Teste',
        articles: [
          {
            id: 'test-shortcuts',
            title: 'Testar Atalhos',
            description: 'Área interativa para testar atalhos',
            content: 'O modo de teste permite verificar se os atalhos de teclado estão funcionando corretamente no seu dispositivo.',
            steps: [
              'Acesse o Manual de Ajuda',
              'Clique em "Testar Atalhos"',
              'Pressione teclas e observe o feedback',
              'Verifique o histórico de eventos'
            ],
            illustration: 'keyboard'
          },
          {
            id: 'test-gestures',
            title: 'Testar Gestos',
            description: 'Área interativa para testar gestos',
            content: 'O modo de teste de gestos permite praticar e verificar se seus gestos estão sendo reconhecidos.',
            steps: [
              'Acesse o Manual de Ajuda',
              'Clique em "Testar Gestos"',
              'Deslize na área de teste',
              'Observe as métricas e feedback'
            ],
            illustration: 'gesture'
          }
        ]
      }
    ]
  },
  {
    id: 'customization',
    title: 'Personalização',
    icon: 'Palette',
    description: 'Customize a aparência e comportamento do sistema',
    subSections: [
      {
        id: 'themes',
        title: 'Temas Visuais',
        articles: [
          {
            id: 'solid-themes',
            title: 'Temas Sólidos',
            description: 'Temas com cores sólidas',
            content: 'Os temas sólidos oferecem uma aparência limpa com uma cor primária definida.',
            steps: [
              'Acesse Configurações > Aparência',
              'Escolha entre: Blue, Green, Purple, Orange, Pink',
              'O tema é aplicado instantaneamente'
            ],
            tips: ['Use Preview de Temas para ver todos antes de aplicar'],
            illustration: 'settings'
          },
          {
            id: 'gradient-themes',
            title: 'Temas com Gradiente',
            description: 'Temas com degradê de cores',
            content: 'Os temas com gradiente criam ambientes visuais mais dinâmicos com transições suaves entre cores.',
            steps: [
              'Acesse Configurações > Aparência',
              'Escolha: Aurora Boreal, Pôr do Sol, ou Oceano Profundo',
              'Observe o fundo com gradiente animado'
            ],
            illustration: 'settings'
          },
          {
            id: 'custom-themes',
            title: 'Criar Tema Personalizado',
            description: 'Crie seu próprio tema',
            content: 'Você pode criar temas completamente personalizados definindo cada cor individualmente.',
            steps: [
              'Acesse Configurações > Aparência',
              'Clique em "Personalizar"',
              'Ajuste: cor primária, fundo, superfície, texto',
              'Opcionalmente, ative gradiente e defina cores/ângulo',
              'Salve o tema com um nome'
            ],
            tips: ['Temas personalizados são salvos localmente'],
            illustration: 'settings'
          }
        ]
      },
      {
        id: 'accessibility',
        title: 'Acessibilidade',
        articles: [
          {
            id: 'high-contrast',
            title: 'Alto Contraste',
            description: 'Melhore a visibilidade',
            content: 'O modo de alto contraste aumenta a diferença entre elementos para melhor legibilidade.',
            steps: [
              'Acesse Configurações > Acessibilidade',
              'Ative "Alto Contraste"',
              'As cores serão ajustadas automaticamente'
            ],
            illustration: 'settings'
          },
          {
            id: 'font-size',
            title: 'Tamanho de Fonte',
            description: 'Ajuste o tamanho do texto',
            content: 'Você pode aumentar ou diminuir o tamanho de todas as fontes da interface.',
            steps: [
              'Acesse Configurações > Acessibilidade',
              'Ajuste o slider de "Tamanho de Fonte"',
              'Escolha entre: 12px, 14px, 16px, 18px, 20px'
            ],
            illustration: 'settings'
          },
          {
            id: 'reduced-motion',
            title: 'Reduzir Animações',
            description: 'Minimize movimentos na tela',
            content: 'Desativa ou reduz animações para usuários sensíveis a movimento.',
            steps: [
              'Acesse Configurações > Acessibilidade',
              'Ative "Reduzir Animações"',
              'Transições serão simplificadas ou removidas'
            ],
            illustration: 'settings'
          }
        ]
      },
      {
        id: 'language',
        title: 'Idioma',
        articles: [
          {
            id: 'change-language',
            title: 'Alterar Idioma',
            description: 'Mude o idioma da interface',
            content: 'O TSi JUKEBOX suporta múltiplos idiomas: Português, Inglês e Espanhol.',
            steps: [
              'Acesse Configurações > Idioma',
              'Selecione o idioma desejado',
              'A interface atualiza instantaneamente'
            ],
            tips: ['O idioma é salvo para sua próxima visita'],
            illustration: 'settings'
          }
        ]
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrações',
    icon: 'Plug',
    description: 'Configure conexões com serviços externos',
    subSections: [
      {
        id: 'spotify',
        title: 'Spotify',
        articles: [
          {
            id: 'spotify-connect',
            title: 'Conectar ao Spotify',
            description: 'Configure a integração com Spotify',
            content: 'O TSi JUKEBOX usa o Spotify como fonte de música. A conexão requer credenciais OAuth.',
            steps: [
              'Acesse Configurações > Spotify',
              'Insira seu Client ID e Client Secret',
              'Clique em "Conectar"',
              'Autorize o acesso na janela do Spotify'
            ],
            tips: [
              'Obtenha credenciais em developer.spotify.com',
              'O token renova automaticamente'
            ],
            illustration: 'spotify'
          },
          {
            id: 'spotify-browse',
            title: 'Navegar Biblioteca',
            description: 'Explore sua biblioteca do Spotify',
            content: 'Após conectar, você pode navegar por playlists, álbuns, artistas e músicas salvas.',
            steps: [
              'Acesse o menu Spotify',
              'Navegue por: Playlists, Curtidas, Álbuns, Artistas',
              'Toque em qualquer item para ver detalhes',
              'Use a busca para encontrar músicas específicas'
            ],
            illustration: 'spotify'
          },
          {
            id: 'spotify-search',
            title: 'Buscar Músicas',
            description: 'Encontre qualquer música no Spotify',
            content: 'A busca permite encontrar músicas, álbuns e artistas em todo o catálogo do Spotify.',
            steps: [
              'Acesse Spotify > Buscar',
              'Digite o nome da música, artista ou álbum',
              'Os resultados aparecem em tempo real',
              'Toque para adicionar à fila ou reproduzir'
            ],
            illustration: 'spotify'
          },
          {
            id: 'spotify-playlists',
            title: 'Gerenciar Playlists',
            description: 'Crie e edite playlists',
            content: 'Você pode visualizar, criar e gerenciar suas playlists do Spotify diretamente no TSi JUKEBOX.',
            steps: [
              'Acesse Spotify > Playlists',
              'Visualize suas playlists existentes',
              'Crie novas playlists com o botão +',
              'Adicione músicas arrastando ou usando o menu'
            ],
            illustration: 'spotify'
          }
        ]
      },
      {
        id: 'backend',
        title: 'Backend FastAPI',
        articles: [
          {
            id: 'backend-connection',
            title: 'Conexão com Backend',
            description: 'Configure a conexão com o servidor',
            content: 'O TSi JUKEBOX se conecta a um backend FastAPI para controle de reprodução e persistência de dados.',
            steps: [
              'Acesse Configurações > Backend',
              'Verifique a URL do servidor',
              'O status de conexão é mostrado em tempo real',
              'Use WebSocket para menor latência ou Polling como fallback'
            ],
            illustration: 'settings'
          },
          {
            id: 'connection-modes',
            title: 'Modos de Conexão',
            description: 'WebSocket, Polling ou Demo',
            content: 'O sistema oferece três modos de comunicação com o backend.',
            steps: [
              'WebSocket: Conexão em tempo real, menor latência',
              'Polling: Consultas periódicas, mais compatível',
              'Demo: Dados simulados para testes sem backend'
            ],
            tips: ['WebSocket é recomendado quando disponível'],
            illustration: 'settings'
          }
        ]
      },
      {
        id: 'weather',
        title: 'Clima',
        articles: [
          {
            id: 'weather-setup',
            title: 'Configurar Widget de Clima',
            description: 'Configure a previsão do tempo',
            content: 'O widget de clima mostra condições atuais e previsão de 5 dias usando OpenWeatherMap.',
            steps: [
              'Acesse Configurações > Clima',
              'Insira sua API Key do OpenWeatherMap',
              'Configure a cidade/localização',
              'O widget aparecerá no player'
            ],
            tips: ['Obtenha uma API Key gratuita em openweathermap.org'],
            illustration: 'settings'
          }
        ]
      },
      {
        id: 'spicetify',
        title: 'Spicetify',
        articles: [
          {
            id: 'spicetify-overview',
            title: 'O que é Spicetify?',
            description: 'Entenda a integração com Spicetify',
            content: 'Spicetify é uma ferramenta de linha de comando que permite personalizar o cliente desktop do Spotify com temas, extensões e funcionalidades adicionais.',
            steps: [
              'Spicetify modifica o cliente Spotify desktop',
              'Permite aplicar temas visuais personalizados',
              'Adiciona extensões para funcionalidades extras',
              'Integra-se com o TSi JUKEBOX para controle local'
            ],
            tips: [
              'Requer Spotify desktop instalado',
              'Funciona apenas no sistema local (não remoto)',
              'Atualizações do Spotify podem exigir re-aplicação'
            ],
            illustration: 'settings',
            relatedArticles: ['spicetify-themes', 'spicetify-extensions']
          },
          {
            id: 'spicetify-themes',
            title: 'Aplicar Temas no Spicetify',
            description: 'Personalize a aparência do Spotify',
            content: 'Os temas do Spicetify modificam completamente a aparência visual do cliente Spotify desktop, incluindo cores, fontes e layout.',
            steps: [
              'Acesse Configurações > Integrações > Spicetify',
              'Verifique se Spicetify está instalado (status verde)',
              'Na seção "Temas Disponíveis", clique no tema desejado',
              'Aguarde a aplicação (pode levar alguns segundos)',
              'O Spotify reiniciará automaticamente com o novo tema'
            ],
            tips: [
              'O tema "Dribbblish" é um dos mais populares',
              'Faça backup antes de mudar temas',
              'Alguns temas têm variantes de cor'
            ],
            illustration: 'settings',
            relatedArticles: ['spicetify-overview', 'spicetify-extensions']
          },
          {
            id: 'spicetify-extensions',
            title: 'Gerenciar Extensões Spicetify',
            description: 'Adicione funcionalidades ao Spotify',
            content: 'As extensões do Spicetify adicionam novas funcionalidades ao cliente Spotify, como letras de músicas, controles adicionais e integrações.',
            steps: [
              'Acesse Configurações > Integrações > Spicetify',
              'Role até a seção "Extensões"',
              'Use o switch para ativar/desativar cada extensão',
              'As mudanças são aplicadas automaticamente',
              'O Spotify pode precisar reiniciar'
            ],
            tips: [
              'Extensões populares: Lyrics, Full App Display, Shuffle+',
              'Muitas extensões podem afetar performance',
              'Desative extensões que não usa'
            ],
            illustration: 'settings',
            relatedArticles: ['spicetify-overview', 'spicetify-themes']
          }
        ]
      },
      {
        id: 'youtube-music',
        title: 'YouTube Music',
        articles: [
          {
            id: 'ytm-connect',
            title: 'Conectar YouTube Music',
            description: 'Configure sua conta Google',
            content: 'O TSi JUKEBOX suporta YouTube Music como provedor de música alternativo ao Spotify, permitindo acessar sua biblioteca e playlists do YouTube Music.',
            steps: [
              'Acesse Configurações > Integrações > YouTube Music',
              'Clique em "Conectar com Google"',
              'Uma janela de autorização do Google abrirá',
              'Selecione sua conta Google e autorize o acesso',
              'Após autorização, você será redirecionado de volta',
              'Seu nome e foto aparecerão confirmando a conexão'
            ],
            tips: [
              'Use uma conta Google com YouTube Music Premium para melhor experiência',
              'A conexão usa OAuth seguro (suas credenciais não são armazenadas)',
              'Você pode desconectar a qualquer momento'
            ],
            illustration: 'settings',
            relatedArticles: ['ytm-library', 'ytm-playback']
          },
          {
            id: 'ytm-library',
            title: 'Navegar Biblioteca YouTube Music',
            description: 'Acesse suas playlists e músicas',
            content: 'Após conectar sua conta, você pode navegar por toda sua biblioteca do YouTube Music incluindo playlists, álbuns curtidos, artistas seguidos e histórico.',
            steps: [
              'No menu principal, acesse "YouTube Music"',
              'Navegue pelas abas: Playlists, Curtidas, Álbuns, Artistas',
              'Use a busca para encontrar músicas específicas',
              'Toque em uma playlist para ver as músicas',
              'Adicione músicas à fila de reprodução'
            ],
            tips: [
              'Playlists são sincronizadas em tempo real',
              'Músicas "Curtidas" aparecem na aba dedicada',
              'Histórico mostra suas reproduções recentes'
            ],
            illustration: 'settings',
            relatedArticles: ['ytm-connect', 'ytm-playback']
          },
          {
            id: 'ytm-playback',
            title: 'Reprodução com YouTube Music',
            description: 'Controle a reprodução de músicas',
            content: 'O TSi JUKEBOX integra controles de reprodução para YouTube Music, permitindo tocar, pausar, pular e controlar volume das músicas.',
            steps: [
              'Selecione uma música ou playlist no YouTube Music Browser',
              'Toque no botão Play para iniciar a reprodução',
              'Use os controles do player principal para pause/play/skip',
              'O volume é controlado pelo slider do player',
              'A fila de reprodução mostra as próximas músicas'
            ],
            tips: [
              'A qualidade de áudio depende da sua assinatura YouTube',
              'Reprodução continua em background',
              'Histórico é salvo automaticamente'
            ],
            illustration: 'player',
            relatedArticles: ['ytm-connect', 'ytm-library']
          }
        ]
      },
      {
        id: 'multi-provider',
        title: 'Multi-Provedor',
        articles: [
          {
            id: 'provider-selection',
            title: 'Escolher Provedor Padrão',
            description: 'Configure o serviço de música principal',
            content: 'O TSi JUKEBOX suporta múltiplos provedores de música (Spotify, YouTube Music, Spicetify). Você pode escolher qual será o provedor padrão.',
            steps: [
              'Acesse Configurações > Integrações',
              'Na seção "Provedor Padrão", selecione o serviço',
              'Opções: Spotify, YouTube Music, ou Spicetify (local)',
              'O provedor selecionado será usado para reprodução',
              'Outros provedores continuam disponíveis para navegação'
            ],
            tips: [
              'Spotify oferece melhor integração de desktop',
              'YouTube Music é bom para vídeos musicais',
              'Spicetify funciona apenas localmente'
            ],
            illustration: 'settings',
            relatedArticles: ['provider-fallback', 'spotify-connect', 'ytm-connect']
          },
          {
            id: 'provider-fallback',
            title: 'Configurar Fallback Automático',
            description: 'Reprodução contínua sem interrupção',
            content: 'O sistema de fallback permite que a reprodução continue mesmo se o provedor principal falhar, mudando automaticamente para outro serviço.',
            steps: [
              'Acesse Configurações > Integrações',
              'Role até "Ordem de Fallback"',
              'Arraste para reordenar a prioridade dos provedores',
              'Ative "Fallback Automático" para mudança automática',
              'Configure tempo de timeout antes do fallback'
            ],
            tips: [
              'Ordem padrão: Spotify > YouTube Music > Spicetify',
              'Fallback é útil para conexões instáveis',
              'Desative se preferir controle manual'
            ],
            illustration: 'settings',
            relatedArticles: ['provider-selection']
          }
        ]
      }
    ]
  },
  {
    id: 'admin',
    title: 'Administração',
    icon: 'Shield',
    description: 'Gerencie o sistema, banco de dados e usuários',
    subSections: [
      {
        id: 'database',
        title: 'Banco de Dados',
        articles: [
          {
            id: 'database-info',
            title: 'Informações do Banco',
            description: 'Visualize status do SQLite',
            content: 'Você pode visualizar informações sobre o banco de dados SQLite usado pelo sistema.',
            steps: [
              'Acesse Configurações > Banco de Dados',
              'Visualize: caminho, tamanho, versão',
              'Veja estatísticas de uso'
            ],
            illustration: 'settings'
          },
          {
            id: 'database-maintenance',
            title: 'Manutenção',
            description: 'Otimize o banco de dados',
            content: 'Ferramentas de manutenção ajudam a manter o banco de dados saudável e performático.',
            steps: [
              'Vacuum: Compacta e otimiza o banco',
              'Integrity Check: Verifica integridade',
              'Reindex: Reconstrói índices',
              'Stats: Mostra estatísticas detalhadas'
            ],
            illustration: 'settings'
          }
        ]
      },
      {
        id: 'backup',
        title: 'Backup',
        articles: [
          {
            id: 'local-backup',
            title: 'Backup Local',
            description: 'Faça backup do banco de dados',
            content: 'Crie backups locais do banco de dados para proteção contra perda de dados.',
            steps: [
              'Acesse Configurações > Backup',
              'Clique em "Criar Backup"',
              'Escolha: Full (completo) ou Incremental',
              'O backup é salvo no servidor'
            ],
            illustration: 'settings'
          },
          {
            id: 'cloud-backup',
            title: 'Backup em Nuvem',
            description: 'Sincronize com serviços de nuvem',
            content: 'Configure sincronização automática com serviços de armazenamento em nuvem.',
            steps: [
              'Acesse Configurações > Backup > Nuvem',
              'Selecione o provedor: Google Drive, Dropbox, etc.',
              'Configure as credenciais',
              'Ative sincronização automática'
            ],
            illustration: 'settings'
          },
          {
            id: 'backup-schedule',
            title: 'Agendamento de Backup',
            description: 'Configure backups automáticos',
            content: 'Agende backups automáticos para garantir que seus dados estejam sempre protegidos.',
            steps: [
              'Acesse Configurações > Backup > Agendamento',
              'Ative o agendamento automático',
              'Defina a frequência: Diário, Semanal, Mensal',
              'Configure o horário de execução',
              'Defina a retenção (quantos manter)'
            ],
            illustration: 'settings'
          }
        ]
      },
      {
        id: 'users',
        title: 'Usuários',
        articles: [
          {
            id: 'user-roles',
            title: 'Níveis de Permissão',
            description: 'Entenda os papéis de usuário',
            content: 'O sistema possui três níveis de permissão para controlar o acesso.',
            steps: [
              'Newbie: Apenas ouve música, sem modificações',
              'User: Pode gerenciar fila e reprodução',
              'Admin: Acesso completo, incluindo configurações'
            ],
            illustration: 'settings'
          },
          {
            id: 'manage-users',
            title: 'Gerenciar Usuários',
            description: 'Adicione e remova usuários',
            content: 'Administradores podem criar, editar e remover usuários do sistema.',
            steps: [
              'Acesse Configurações > Usuários',
              'Visualize a lista de usuários',
              'Clique em + para adicionar novo usuário',
              'Defina nome, senha e nível de permissão',
              'Use os ícones de ação para editar ou remover'
            ],
            illustration: 'settings'
          }
        ]
      }
    ]
  },
  {
    id: 'command-deck',
    title: 'Command Deck',
    icon: 'Terminal',
    description: 'Controles de sistema e administração rápida',
    subSections: [
      {
        id: 'deck-overview',
        title: 'Visão Geral',
        articles: [
          {
            id: 'deck-intro',
            title: 'O que é o Command Deck?',
            description: 'Barra de controle do sistema',
            content: 'O Command Deck é uma barra de controle localizada na parte inferior da tela, fornecendo acesso rápido a funções administrativas do sistema.',
            steps: [
              'Localizado na parte inferior da tela',
              'Expandível verticalmente',
              'Contém botões de ação rápida',
              'Separado visualmente dos controles de música'
            ],
            illustration: 'player'
          }
        ]
      },
      {
        id: 'deck-buttons',
        title: 'Botões do Deck',
        articles: [
          {
            id: 'btn-dashboard',
            title: 'Dashboard',
            description: 'Acesse o painel Grafana',
            content: 'Abre o dashboard de monitoramento do sistema (Grafana) em uma nova janela.',
            steps: [
              'Clique no botão com ícone de gráfico',
              'Uma nova janela/aba abre com o Grafana',
              'URL padrão: http://localhost:3000'
            ],
            illustration: 'deck'
          },
          {
            id: 'btn-datasource',
            title: 'Datasource',
            description: 'Acesse o Prometheus',
            content: 'Abre a interface do Prometheus para visualizar métricas do sistema.',
            steps: [
              'Clique no botão com ícone de ECG',
              'Uma nova janela/aba abre com o Prometheus',
              'URL padrão: http://localhost:9090'
            ],
            illustration: 'deck'
          },
          {
            id: 'btn-reload',
            title: 'Reload',
            description: 'Reinicie serviços',
            content: 'Executa um soft restart dos serviços do sistema sem reiniciar o computador.',
            steps: [
              'Clique no botão RELOAD (âmbar)',
              'Os serviços serão reiniciados',
              'Aguarde a reconexão automática'
            ],
            tips: ['Útil após alterações de configuração'],
            illustration: 'deck'
          },
          {
            id: 'btn-setup',
            title: 'Setup',
            description: 'Acesse configurações',
            content: 'Abre a página de configurações do sistema.',
            steps: [
              'Clique no botão SETUP (branco)',
              'Você será redirecionado para /settings'
            ],
            illustration: 'deck'
          },
          {
            id: 'btn-reboot',
            title: 'Reboot',
            description: 'Reinicie o sistema',
            content: 'Executa um reinício completo do sistema operacional. Use com cautela.',
            steps: [
              'Clique no botão REBOOT (vermelho)',
              'Confirme a ação no diálogo',
              'O sistema será reiniciado completamente'
            ],
            tips: ['Esta ação interrompe toda reprodução de música'],
            illustration: 'deck'
          }
        ]
      }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ - Problemas Comuns',
    icon: 'HelpCircle',
    description: 'Soluções para problemas frequentes',
    subSections: [
      {
        id: 'connection-issues',
        title: 'Problemas de Conexão',
        articles: [
          {
            id: 'faq-no-connection',
            title: 'Sistema não conecta ao servidor',
            description: 'O sistema mostra "Conectando..." eternamente',
            content: 'Este problema geralmente indica que o backend FastAPI não está acessível. Pode ser causado por servidor desligado, firewall, ou URL incorreta.',
            steps: [
              '1. Verifique se o servidor está ligado e rodando',
              '2. Confirme a URL do backend em Configurações',
              '3. Teste a URL diretamente no navegador',
              '4. Verifique se há firewall bloqueando a porta',
              '5. Tente reiniciar o serviço do backend',
              '6. Se usar HTTPS, verifique o certificado SSL'
            ],
            tips: [
              'URL padrão: http://localhost:8000/api',
              'Use modo Demo para testar sem backend'
            ]
          },
          {
            id: 'faq-websocket-disconnect',
            title: 'WebSocket desconecta frequentemente',
            description: 'A conexão cai repetidamente',
            content: 'Desconexões frequentes podem ser causadas por rede instável, proxy, ou timeout do servidor.',
            steps: [
              '1. Verifique a estabilidade da sua rede',
              '2. Se usar proxy, configure para suportar WebSocket',
              '3. Tente mudar para modo Polling em Configurações',
              '4. Verifique os logs do servidor para erros',
              '5. Aumente o timeout se configurável'
            ],
            tips: ['Polling é mais estável mas tem maior latência']
          },
          {
            id: 'faq-spotify-not-connecting',
            title: 'Spotify não conecta',
            description: 'Erro ao autorizar ou conectar ao Spotify',
            content: 'Problemas com OAuth do Spotify podem ter várias causas, desde credenciais incorretas até URLs de callback.',
            steps: [
              '1. Verifique se Client ID e Client Secret estão corretos',
              '2. Confirme que a URL de callback está configurada no Spotify Dashboard',
              '3. Verifique se o token não expirou',
              '4. Tente desconectar e reconectar',
              '5. Limpe os cookies e tente novamente'
            ],
            tips: ['Tokens renovam automaticamente se configurado corretamente']
          }
        ]
      },
      {
        id: 'audio-issues',
        title: 'Problemas de Áudio',
        articles: [
          {
            id: 'faq-no-sound',
            title: 'Não ouço nenhum som',
            description: 'A música está tocando mas sem áudio',
            content: 'Ausência de som com música tocando indica problema na cadeia de áudio: volume, saída, ou processo do Spotify.',
            steps: [
              '1. Verifique o volume no TSi JUKEBOX (não está em 0%?)',
              '2. Verifique o volume do sistema operacional',
              '3. Confirme que a saída de áudio correta está selecionada',
              '4. Verifique se os alto-falantes/fones estão conectados',
              '5. No terminal: verifique se o Spotify está rodando',
              '6. Teste o áudio com outro aplicativo'
            ],
            tips: [
              'Em modo Demo, nenhum áudio real é reproduzido',
              'O Spotify precisa estar instalado e rodando no sistema'
            ]
          },
          {
            id: 'faq-audio-delay',
            title: 'Há atraso no áudio',
            description: 'Os comandos demoram para fazer efeito',
            content: 'Latência entre comandos e resposta pode ser causada por rede, processamento, ou configuração do sistema.',
            steps: [
              '1. Use WebSocket em vez de Polling para menor latência',
              '2. Verifique a carga do processador do sistema',
              '3. Reduza o intervalo de polling se usando este modo',
              '4. Verifique a latência da rede com ping',
              '5. Reinicie os serviços se a latência aumentar com o tempo'
            ]
          },
          {
            id: 'faq-volume-not-changing',
            title: 'O volume não muda',
            description: 'Ajustes de volume não têm efeito',
            content: 'Se o volume do TSi JUKEBOX não afeta o áudio, pode haver desconexão entre o frontend e o controle de volume do sistema.',
            steps: [
              '1. Verifique se está em modo Demo (volume é simulado)',
              '2. Confirme que o backend está recebendo os comandos',
              '3. Verifique os logs do servidor para erros',
              '4. Teste o controle de volume via terminal (playerctl)',
              '5. Reinicie o serviço do player'
            ]
          }
        ]
      },
      {
        id: 'interface-issues',
        title: 'Problemas de Interface',
        articles: [
          {
            id: 'faq-blank-screen',
            title: 'Tela preta ou branca',
            description: 'A interface não carrega corretamente',
            content: 'Uma tela em branco geralmente indica erro de JavaScript ou falha no carregamento de recursos.',
            steps: [
              '1. Abra o console do navegador (F12) e verifique erros',
              '2. Limpe o cache do navegador e recarregue',
              '3. Verifique a conexão de rede',
              '4. Tente em modo anônimo/privado',
              '5. Desabilite extensões do navegador',
              '6. Verifique se os arquivos estáticos estão sendo servidos'
            ]
          },
          {
            id: 'faq-buttons-not-responding',
            title: 'Botões não respondem ao toque',
            description: 'Toques na tela não têm efeito',
            content: 'Botões não responsivos podem indicar problema de touch, overlay invisível, ou JavaScript travado.',
            steps: [
              '1. Verifique se há algum modal/overlay aberto',
              '2. Recarregue a página',
              '3. Verifique erros no console do navegador',
              '4. Teste com mouse para confirmar se é problema de touch',
              '5. Calibre a tela de toque se disponível',
              '6. Reinicie o navegador em modo kiosk'
            ]
          },
          {
            id: 'faq-album-art-missing',
            title: 'Capa do álbum não aparece',
            description: 'A imagem da capa não carrega',
            content: 'Capas de álbum que não carregam podem indicar problema de conexão com Spotify CDN ou CORS.',
            steps: [
              '1. Verifique a conexão com internet',
              '2. Confirme que URLs do Spotify CDN não estão bloqueadas',
              '3. Verifique se há erros de CORS no console',
              '4. Limpe o cache de imagens do navegador',
              '5. Em modo Demo, imagens são locais e sempre funcionam'
            ]
          },
          {
            id: 'faq-slow-animations',
            title: 'Animações lentas ou travando',
            description: 'A interface está lenta',
            content: 'Performance degradada pode ser causada por hardware limitado, muitos processos, ou renderização pesada.',
            steps: [
              '1. Ative "Reduzir Animações" em Acessibilidade',
              '2. Feche outras aplicações consumindo recursos',
              '3. Verifique a temperatura do processador',
              '4. Use um navegador mais leve se possível',
              '5. Reduza a resolução da tela se necessário'
            ],
            tips: ['Chromium em modo kiosk geralmente tem melhor performance']
          }
        ]
      },
      {
        id: 'config-issues',
        title: 'Problemas de Configuração',
        articles: [
          {
            id: 'faq-settings-not-saving',
            title: 'Configurações não salvam',
            description: 'Mudanças são perdidas ao recarregar',
            content: 'Configurações são salvas em localStorage. Se não persistem, pode haver problema de armazenamento ou modo privado.',
            steps: [
              '1. Verifique se não está em modo privado/anônimo',
              '2. Confirme que localStorage está habilitado no navegador',
              '3. Verifique se há espaço suficiente no localStorage',
              '4. Tente limpar o localStorage e reconfigurar',
              '5. Exporte configurações antes de limpar como backup'
            ]
          },
          {
            id: 'faq-theme-reset',
            title: 'Tema volta ao padrão',
            description: 'O tema personalizado não persiste',
            content: 'Temas customizados são salvos localmente. Se resetam, pode haver conflito ou falha no salvamento.',
            steps: [
              '1. Aplique o tema e verifique se foi salvo corretamente',
              '2. Não limpe dados do site/navegador',
              '3. Exporte o tema para backup',
              '4. Verifique se há erros no console ao salvar'
            ]
          },
          {
            id: 'faq-weather-error',
            title: 'Widget de clima mostra erro',
            description: 'O clima não carrega ou mostra erro',
            content: 'Erros no widget de clima geralmente são relacionados à API Key ou configuração de localização.',
            steps: [
              '1. Verifique se a API Key do OpenWeatherMap é válida',
              '2. Confirme que não excedeu o limite de requisições',
              '3. Verifique se o nome da cidade está correto',
              '4. Teste a API Key diretamente na documentação do OWM',
              '5. Verifique se há firewall bloqueando api.openweathermap.org'
            ],
            tips: ['API Keys gratuitas têm limite de 60 requisições/minuto']
          }
        ]
      }
    ]
  }
];

// Helper function to get all articles flattened
export function getAllArticles(): WikiArticle[] {
  const articles: WikiArticle[] = [];
  wikiCategories.forEach(category => {
    category.subSections.forEach(subSection => {
      articles.push(...subSection.articles);
    });
  });
  return articles;
}

// Helper function to find article by ID
export function findArticleById(id: string): WikiArticle | undefined {
  for (const category of wikiCategories) {
    for (const subSection of category.subSections) {
      const article = subSection.articles.find(a => a.id === id);
      if (article) return article;
    }
  }
  return undefined;
}

// Helper function to get breadcrumb path
export function getArticlePath(articleId: string): { category: WikiCategory; subSection: WikiSubSection; article: WikiArticle } | null {
  for (const category of wikiCategories) {
    for (const subSection of category.subSections) {
      const article = subSection.articles.find(a => a.id === articleId);
      if (article) {
        return { category, subSection, article };
      }
    }
  }
  return null;
}

// Get total article count
export function getTotalArticleCount(): number {
  return getAllArticles().length;
}
