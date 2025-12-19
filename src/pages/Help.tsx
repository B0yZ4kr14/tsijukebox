import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  Settings, 
  Music, 
  Shield, 
  Database, 
  Cloud,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Keyboard,
  Hand,
  Palette,
  MessageCircleQuestion,
  Wifi,
  Volume2,
  Monitor,
  Printer,
  BookOpen,
  Download,
  FileText,
  Code
} from 'lucide-react';
import { formatBrandInText } from '@/components/ui/BrandText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { resetTour } from '@/components/tour/GuidedTour';
import { InteractiveTestMode } from '@/components/help/InteractiveTestMode';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { useGlobalSearch } from '@/hooks';
import { downloadMarkdown, downloadHTML, printDocument } from '@/lib/documentExporter';
import { toast } from 'sonner';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: HelpItem[];
}

interface HelpItem {
  id: string;
  question: string;
  answer: string;
  steps?: string[];
  tips?: string[];
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    icon: <Book className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'what-is',
        question: 'O que é o TSiJUKEBOX?',
        answer: 'O TSiJUKEBOX é um sistema de música inteligente projetado para funcionar como um "jukebox digital". Ele permite reproduzir músicas, gerenciar playlists e conectar-se ao Spotify de forma fácil e intuitiva.',
        tips: ['O sistema foi pensado para uso em tela de toque', 'Funciona perfeitamente em modo kiosk (tela cheia)']
      },
      {
        id: 'navigation',
        question: 'Como navegar na interface?',
        answer: 'A interface é dividida em áreas principais: o player de música no centro, controles de reprodução na parte inferior, e um deck de comandos para funções administrativas.',
        steps: [
          'Use os botões grandes para controlar a música',
          'Deslize para os lados para trocar de faixa',
          'Toque no ícone de engrenagem para configurações',
          'Use o deck inferior para funções avançadas'
        ]
      },
      {
        id: 'first-setup',
        question: 'Como fazer a configuração inicial?',
        answer: 'Na primeira vez que abrir o sistema, um assistente de configuração irá guiá-lo pelos passos principais: escolha de tema, ajustes de acessibilidade e conexões.',
        tips: ['Você pode refazer a configuração a qualquer momento em /setup']
      }
    ]
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Atalhos de Teclado',
    icon: <Keyboard className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'playback-shortcuts',
        question: 'Quais são os atalhos para controlar a reprodução de música?',
        answer: 'O TSiJUKEBOX oferece atalhos de teclado intuitivos para controle completo da reprodução sem precisar tocar na tela.',
        steps: [
          'Barra de Espaço (Space): Alternar entre Play e Pause',
          'Seta para Direita (→): Avançar para a próxima faixa',
          'Seta para Esquerda (←): Voltar para a faixa anterior',
          'Seta para Cima (↑) ou tecla +: Aumenta o volume em 5%',
          'Seta para Baixo (↓) ou tecla -: Diminui o volume em 5%'
        ],
        tips: [
          'Os atalhos funcionam mesmo quando o Command Deck está expandido',
          'Você pode pressionar e segurar as teclas de volume para ajuste rápido contínuo'
        ]
      },
      {
        id: 'volume-precision',
        question: 'Como ajustar o volume com precisão máxima usando o teclado?',
        answer: 'O sistema de volume permite ajuste fino em incrementos de 5%, oferecendo 21 níveis distintos (0% a 100%).',
        steps: [
          'Pressione ↑ ou + uma única vez para aumentar 5%',
          'Pressione ↓ ou - uma única vez para diminuir 5%',
          'Segure a tecla para ajuste rápido contínuo'
        ],
        tips: [
          'Volume 0% silencia sem parar a música',
          'O volume é salvo e restaurado entre sessões'
        ]
      }
    ]
  },
  {
    id: 'touch-gestures',
    title: 'Gestos de Toque',
    icon: <Hand className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'basic-gestures',
        question: 'Quais gestos de toque estão disponíveis?',
        answer: 'O TSiJUKEBOX suporta gestos de deslizar (swipe) para controle rápido da reprodução.',
        steps: [
          'Deslizar para Esquerda (← Swipe Left): Avança para a próxima música',
          'Deslizar para Direita (→ Swipe Right): Volta para a música anterior',
          'Toque Simples (Tap): Todos os botões respondem a toques simples'
        ],
        tips: [
          'O limiar mínimo é de 50 pixels para evitar gestos acidentais',
          'Feedback visual indica a direção do gesto reconhecido'
        ]
      },
      {
        id: 'swipe-sensitivity',
        question: 'Como funciona a sensibilidade dos gestos?',
        answer: 'A sensibilidade foi calibrada para funcionar bem em telas de diferentes tamanhos. O sistema distingue entre gestos intencionais horizontais e movimentos acidentais.',
        steps: [
          'O gesto é aceito se: distância horizontal > 50px',
          'E distância horizontal > distância vertical',
          'Gestos diagonais são ignorados para evitar ação incorreta'
        ]
      }
    ]
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: <Settings className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'theme-settings',
        question: 'Como personalizar o tema visual?',
        answer: 'Acesse Configurações > Tema para escolher entre temas sólidos ou com gradiente.',
        steps: [
          'Vá em Configurações',
          'Na seção Tema, escolha a cor principal',
          'Opcionalmente, ative gradientes personalizados'
        ]
      },
      {
        id: 'accessibility-settings',
        question: 'Quais opções de acessibilidade estão disponíveis?',
        answer: 'O sistema oferece modo de alto contraste, ajuste de tamanho de fonte e opção de reduzir animações.',
        tips: ['Essas configurações são salvas localmente no navegador']
      }
    ]
  },
  {
    id: 'spotify',
    title: 'Spotify',
    icon: <Music className="w-5 h-5 text-[#1DB954]" />,
    items: [
      {
        id: 'spotify-connect',
        question: 'Como conectar minha conta Spotify?',
        answer: 'Para conectar ao Spotify, você precisa criar um aplicativo no Spotify Developer Dashboard.',
        steps: [
          'Acesse developer.spotify.com/dashboard',
          'Crie um novo aplicativo',
          'Adicione a URL de redirecionamento',
          'Copie Client ID e Client Secret',
          'Cole as credenciais em Configurações > Spotify'
        ]
      },
      {
        id: 'spotify-library',
        question: 'Como acessar minha biblioteca do Spotify?',
        answer: 'Após conectar sua conta, você terá acesso a playlists, músicas curtidas, álbuns e artistas.',
        tips: ['A biblioteca é sincronizada automaticamente']
      }
    ]
  },
  {
    id: 'database',
    title: 'Banco de Dados',
    icon: <Database className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'database-maintenance',
        question: 'Como fazer manutenção do banco de dados?',
        answer: 'Acesse Configurações > Banco de Dados para executar operações de manutenção como VACUUM e verificação de integridade.',
        steps: [
          'Vá em Configurações > Banco de Dados',
          'Use VACUUM para otimizar o espaço',
          'Execute verificação de integridade periodicamente'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    icon: <Shield className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'user-roles',
        question: 'Como funcionam os níveis de permissão?',
        answer: 'O sistema possui três níveis: Newbie (apenas ouvir), User (gerenciar fila) e Admin (acesso total).',
        tips: ['Apenas admins podem alterar configurações do sistema']
      }
    ]
  },
  {
    id: 'cloud',
    title: 'Cloud & Backup',
    icon: <Cloud className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'backup-local',
        question: 'Como fazer backup local do banco de dados?',
        answer: 'Acesse Configurações > Backup para criar backups completos ou incrementais.',
        steps: [
          'Vá em Configurações > Backup',
          'Clique em "Backup Completo" ou "Backup Incremental"',
          'Os backups são salvos no servidor'
        ]
      },
      {
        id: 'backup-cloud',
        question: 'Como configurar backup na nuvem?',
        answer: 'O sistema suporta backup para diversos provedores: AWS S3, Google Drive, Dropbox, MEGA, OneDrive e Storj.',
        tips: ['Configure as credenciais do provedor escolhido em Configurações > Cloud Backup']
      }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ - Problemas Comuns',
    icon: <MessageCircleQuestion className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'faq-eternal-connecting',
        question: 'O sistema mostra "Conectando ao servidor..." eternamente',
        answer: 'Este problema ocorre quando o frontend não consegue estabelecer comunicação com o backend FastAPI. Pode ser causado por serviço inativo, firewall ou URL incorreta.',
        steps: [
          'Verifique se o serviço backend está rodando: systemctl status tsi-jukebox-api',
          'Confirme que a URL da API está correta em Configurações',
          'Teste a conexão acessando a URL da API diretamente no navegador',
          'Verifique logs do backend: journalctl -u tsi-jukebox-api -f',
          'Se necessário, reinicie o serviço: systemctl restart tsi-jukebox-api'
        ],
        tips: [
          'Em modo demo, o sistema funciona sem backend',
          'Verifique se não há firewall bloqueando a porta 8000'
        ]
      },
      {
        id: 'faq-backend-unavailable',
        question: 'Erro "Backend não disponível" aparece constantemente',
        answer: 'O frontend não consegue se comunicar com a API REST. Isso pode indicar problemas de rede, serviço parado ou configuração incorreta.',
        steps: [
          'Verifique a conectividade de rede do servidor',
          'Confirme que o processo FastAPI está ativo',
          'Teste com curl: curl http://localhost:8000/api/status',
          'Verifique se o Nginx está configurado corretamente como proxy reverso'
        ],
        tips: [
          'Ative o modo demo temporariamente para continuar usando a interface',
          'O indicador de conexão no canto mostra o status em tempo real'
        ]
      },
      {
        id: 'faq-websocket-disconnect',
        question: 'WebSocket desconecta frequentemente',
        answer: 'Desconexões frequentes do WebSocket podem ser causadas por instabilidade de rede, timeout do servidor ou limite de conexões.',
        steps: [
          'Mude para modo Polling em Configurações se o problema persistir',
          'Verifique a estabilidade da rede local',
          'Aumente o timeout do WebSocket no backend se necessário',
          'Verifique logs para identificar o motivo das desconexões'
        ],
        tips: [
          'O sistema automaticamente tenta reconectar',
          'Polling é mais estável mas tem maior latência'
        ]
      },
      {
        id: 'faq-music-stops',
        question: 'Música para de tocar após alguns minutos',
        answer: 'A reprodução pode parar por timeout do Spotify, perda de conexão com o backend ou hibernação do sistema.',
        steps: [
          'Verifique se o Spotify ainda está autenticado (token pode ter expirado)',
          'Confirme que o sistema não está entrando em modo de economia de energia',
          'Verifique se há erros no log do playerctl',
          'Reconecte a conta Spotify se necessário'
        ],
        tips: [
          'O sistema tenta renovar tokens automaticamente',
          'Desative o protetor de tela em sistemas kiosk'
        ]
      },
      {
        id: 'faq-spotify-connect-fail',
        question: 'Não consigo conectar ao Spotify',
        answer: 'Falhas na conexão OAuth podem ocorrer por credenciais incorretas, URL de redirecionamento errada ou conta Spotify sem Premium.',
        steps: [
          'Verifique se Client ID e Client Secret estão corretos',
          'Confirme que a URL de redirecionamento no Spotify Dashboard é exata',
          'Verifique se sua conta Spotify está ativa',
          'Tente limpar cookies e reconectar'
        ],
        tips: [
          'Algumas funcionalidades requerem Spotify Premium',
          'A URL de redirecionamento deve incluir /settings'
        ]
      },
      {
        id: 'faq-no-sound',
        question: 'Não ouço nenhum som, mesmo com volume no máximo',
        answer: 'Ausência de áudio pode ter várias causas: volume do sistema, saída de áudio incorreta, Spotify não rodando ou problemas de hardware.',
        steps: [
          'Verifique o volume do sistema operacional (alsamixer ou pavucontrol)',
          'Confirme que a saída de áudio correta está selecionada',
          'Verifique se o Spotify está rodando: pgrep spotify',
          'Teste o áudio com outro aplicativo',
          'Verifique conexões físicas dos alto-falantes'
        ],
        tips: [
          'Em modo demo, nenhum áudio real é reproduzido',
          'O volume do TSiJUKEBOX é independente do volume do sistema'
        ]
      },
      {
        id: 'faq-volume-not-changing',
        question: 'O volume não muda quando ajusto o slider',
        answer: 'O controle de volume do TSiJUKEBOX comunica-se com o Spotify via MPRIS/playerctl. Se não funcionar, pode haver problema na comunicação.',
        steps: [
          'Teste playerctl diretamente: playerctl volume 0.5',
          'Verifique se o Spotify está respondendo a comandos MPRIS',
          'Reinicie o Spotify e o backend',
          'Verifique permissões do usuário para controlar o player'
        ],
        tips: [
          'O volume é um valor entre 0 e 100%',
          'Alguns sistemas podem ter bloqueio de controle de volume'
        ]
      },
      {
        id: 'faq-delay-response',
        question: 'Há atraso entre os comandos e a resposta',
        answer: 'Latência pode ser causada por polling lento, rede congestionada ou processamento do backend.',
        steps: [
          'Mude de Polling para WebSocket em Configurações para menor latência',
          'Reduza o intervalo de polling se usar esse modo',
          'Verifique a carga do servidor',
          'Otimize a rede local'
        ],
        tips: [
          'WebSocket oferece resposta quase instantânea',
          'Em redes lentas, atrasos de 1-2 segundos são normais com polling'
        ]
      },
      {
        id: 'faq-black-white-screen',
        question: 'A tela está toda preta ou branca',
        answer: 'Tela completamente preta ou branca geralmente indica erro de JavaScript, CSS não carregado ou problema de renderização.',
        steps: [
          'Abra o console do navegador (F12) e verifique erros',
          'Tente recarregar a página (Ctrl+Shift+R para forçar)',
          'Verifique se todos os arquivos estão sendo servidos corretamente',
          'Limpe o cache do navegador'
        ],
        tips: [
          'Em modo kiosk, F12 pode estar desabilitado - use SSH para diagnóstico',
          'Verifique se o tema não está configurado com cores inválidas'
        ]
      },
      {
        id: 'faq-buttons-not-responding',
        question: 'Os botões não respondem ao toque',
        answer: 'Botões não responsivos podem indicar JavaScript travado, overlay invisível bloqueando cliques ou problema do driver de touch.',
        steps: [
          'Verifique se há algum modal ou overlay aberto',
          'Recarregue a página',
          'Teste se o teclado funciona (indica se é problema de touch específico)',
          'Verifique driver da tela de toque: xinput list'
        ],
        tips: [
          'Alguns gestos acidentais podem abrir menus invisíveis',
          'Tente usar Tab para navegar e Enter para ativar botões'
        ]
      },
      {
        id: 'faq-album-cover-missing',
        question: 'A capa do álbum não aparece',
        answer: 'Capas não carregando podem ser causadas por URLs inválidas, CORS, ou o Spotify não retornando imagem.',
        steps: [
          'Verifique a conexão com internet',
          'Confirme que a música tem capa no Spotify',
          'Verifique se há erros de CORS no console',
          'Teste com outra música para comparar'
        ],
        tips: [
          'Músicas locais (não Spotify) podem não ter capa',
          'Uma imagem placeholder é mostrada quando não há capa'
        ]
      },
      {
        id: 'faq-slow-animations',
        question: 'As animações estão lentas ou travando',
        answer: 'Performance de animação depende do hardware. Sistemas mais antigos ou com GPU limitada podem ter dificuldade.',
        steps: [
          'Ative "Reduzir Animações" em Configurações > Acessibilidade',
          'Verifique uso de CPU/GPU durante operação',
          'Feche outras aplicações consumindo recursos',
          'Considere usar hardware com melhor GPU'
        ],
        tips: [
          'O modo de animações reduzidas mantém funcionalidade sem efeitos visuais',
          'Raspberry Pi 4 ou superior é recomendado para experiência fluida'
        ]
      },
      {
        id: 'faq-settings-not-saving',
        question: 'Não consigo salvar as configurações',
        answer: 'Configurações são salvas no localStorage do navegador. Problemas podem ocorrer por localStorage cheio ou modo privado.',
        steps: [
          'Verifique se não está em modo de navegação privada',
          'Limpe dados antigos do localStorage',
          'Verifique permissões de armazenamento do site',
          'Tente um navegador diferente'
        ],
        tips: [
          'O localStorage tem limite de ~5MB por domínio',
          'Configurações são específicas por navegador/dispositivo'
        ]
      },
      {
        id: 'faq-theme-reset',
        question: 'O tema volta ao padrão após reiniciar',
        answer: 'Se o tema não persiste, há problema na leitura/escrita do localStorage ou o cache está sendo limpo.',
        steps: [
          'Verifique se o navegador não está limpando dados ao fechar',
          'Desative extensões que possam limpar cookies/storage',
          'Em modo kiosk, configure o Chromium para persistir dados'
        ],
        tips: [
          'Use flag --user-data-dir no Chromium para persistir dados',
          'Verifique se não há script limpando localStorage'
        ]
      },
      {
        id: 'faq-weather-error',
        question: 'O widget de clima mostra erro ou não carrega',
        answer: 'O widget de clima usa a API OpenWeatherMap. Erros podem indicar API key inválida, cidade não encontrada ou limite de requisições.',
        steps: [
          'Verifique se a API Key está configurada em Configurações > Clima',
          'Confirme que o nome da cidade está correto',
          'Teste a API key diretamente no site da OpenWeatherMap',
          'Verifique se não excedeu o limite de chamadas da API'
        ],
        tips: [
          'O plano gratuito permite 1000 chamadas/dia',
          'Use o formato "Cidade,Código do País" para maior precisão'
        ]
      }
    ]
  },
  // =============================================
  // SPICETIFY FAQ - 15 itens
  // =============================================
  {
    id: 'spicetify-faq',
    title: 'Spicetify FAQ',
    icon: <Palette className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'spicetify-what',
        question: 'O que é Spicetify e para que serve?',
        answer: 'Spicetify é uma ferramenta de linha de comando que permite personalizar o cliente desktop do Spotify. Com ela, você pode aplicar temas visuais, instalar extensões de funcionalidade, adicionar snippets CSS e muito mais.',
        tips: ['Funciona apenas com Spotify desktop', 'É gratuito e open source']
      },
      {
        id: 'spicetify-web-player',
        question: 'Spicetify funciona com Spotify Web Player?',
        answer: 'Não. O Spicetify funciona exclusivamente com o cliente desktop do Spotify. O Web Player não pode ser personalizado com Spicetify.',
        tips: ['Use o cliente desktop para aproveitar todas as customizações']
      },
      {
        id: 'spicetify-update-broke',
        question: 'Por que meu tema parou de funcionar após atualização do Spotify?',
        answer: 'Atualizações do Spotify frequentemente alteram a estrutura interna do app, quebrando customizações do Spicetify. Isso é normal e esperado.',
        steps: [
          'Execute: spicetify backup apply',
          'Se não funcionar: spicetify restore backup apply',
          'Atualize o Spicetify: spicetify upgrade'
        ]
      },
      {
        id: 'spicetify-marketplace',
        question: 'Como aplicar um tema do Marketplace?',
        answer: 'O Marketplace permite instalar temas com um clique diretamente do Spotify.',
        steps: [
          'Habilite: spicetify config custom_apps marketplace && spicetify apply',
          'Acesse o Marketplace no menu lateral do Spotify',
          'Navegue até Themes e clique Install no tema desejado'
        ]
      },
      {
        id: 'spicetify-extensions-recommended',
        question: 'Quais extensões são recomendadas?',
        answer: 'Extensões populares incluem: Shuffle+ (embaralhamento inteligente), Lyrics+ (letras sincronizadas), Full App Display (modo tela cheia), e Keyboard Shortcut (atalhos customizáveis).',
        tips: ['Instale pelo Marketplace para facilitar']
      },
      {
        id: 'spicetify-create-theme',
        question: 'Como criar meu próprio tema?',
        answer: 'Crie uma pasta em ~/.config/spicetify/Themes/MeuTema com arquivo color.ini definindo as cores. Opcionalmente, adicione user.css para estilos avançados.',
        steps: [
          'Crie a pasta do tema em Themes/',
          'Crie color.ini com as variáveis de cor',
          'Aplique: spicetify config current_theme MeuTema && spicetify apply'
        ]
      },
      {
        id: 'spicetify-snippets-performance',
        question: 'Snippets CSS afetam performance?',
        answer: 'Snippets CSS geralmente têm impacto mínimo na performance. No entanto, snippets muito complexos com animações pesadas podem causar lentidão.',
        tips: ['Use snippets simples para melhor performance']
      },
      {
        id: 'spicetify-safe',
        question: 'É seguro usar Spicetify?',
        answer: 'Sim, Spicetify é seguro. É um projeto open source amplamente usado pela comunidade. Ele modifica apenas arquivos locais do Spotify, não acessa sua conta ou dados pessoais.',
        tips: ['Não viola termos de serviço do Spotify']
      },
      {
        id: 'spicetify-backup-config',
        question: 'Como fazer backup das minhas configurações Spicetify?',
        answer: 'O comando spicetify backup cria backup do Spotify original. Para suas customizações, copie a pasta ~/.config/spicetify inteira.',
        steps: [
          'Execute: spicetify backup',
          'Copie ~/.config/spicetify para local seguro',
          'Para restaurar, copie de volta e execute: spicetify apply'
        ]
      },
      {
        id: 'spicetify-linux',
        question: 'Spicetify funciona no Linux/CachyOS?',
        answer: 'Sim! Spicetify funciona perfeitamente em Linux, incluindo CachyOS. A instalação pode ser feita via script curl ou gerenciador de pacotes AUR.',
        steps: [
          'Via AUR: yay -S spicetify-cli',
          'Via script: curl -fsSL https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.sh | sh'
        ]
      },
      {
        id: 'spicetify-remove',
        question: 'Como remover completamente o Spicetify?',
        answer: 'Para remover o Spicetify e restaurar o Spotify original:',
        steps: [
          'Execute: spicetify restore',
          'Delete ~/.spicetify e ~/.config/spicetify',
          'Reinicie o Spotify'
        ]
      },
      {
        id: 'spicetify-ext-not-working',
        question: 'Por que algumas extensões não funcionam?',
        answer: 'Extensões podem parar de funcionar após atualizações do Spotify ou Spicetify. Verifique se há atualizações disponíveis para a extensão ou procure alternativas.',
        steps: [
          'Atualize o Spicetify: spicetify upgrade',
          'Reinstale a extensão pelo Marketplace',
          'Verifique issues no GitHub da extensão'
        ]
      },
      {
        id: 'spicetify-upgrade',
        question: 'Como atualizar o Spicetify?',
        answer: 'O comando spicetify upgrade atualiza para a versão mais recente.',
        steps: [
          'Execute: spicetify upgrade',
          'Reaplique: spicetify apply',
          'Se houver problemas: spicetify restore backup apply'
        ]
      },
      {
        id: 'spicetify-multiple-themes',
        question: 'Posso usar múltiplos temas ao mesmo tempo?',
        answer: 'Não diretamente, mas você pode combinar elementos de diferentes temas criando um tema personalizado que mistura cores e CSS de outros temas.'
      },
      {
        id: 'spicetify-ban-account',
        question: 'O Spotify pode banir minha conta por usar Spicetify?',
        answer: 'Não há casos conhecidos de banimento por uso do Spicetify. A ferramenta modifica apenas a aparência local do app, não interfere com serviços do Spotify nem viola termos de uso de forma detectável.',
        tips: ['Spicetify é amplamente usado há anos sem problemas']
      }
    ]
  },
  // =============================================
  // STORJ FAQ - 12 itens
  // =============================================
  {
    id: 'storj-faq',
    title: 'Storj Cloud FAQ',
    icon: <Cloud className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'storj-what',
        question: 'O que é Storj e como difere de S3?',
        answer: 'Storj é uma plataforma de armazenamento em nuvem descentralizada. Diferente do S3 (centralizado na AWS), seus dados são criptografados, fragmentados e distribuídos em milhares de nós globalmente.',
        tips: ['Mais seguro e privado que soluções centralizadas', 'Compatível com protocolo S3']
      },
      {
        id: 'storj-secure',
        question: 'Storj é seguro para dados sensíveis?',
        answer: 'Sim. Storj usa criptografia end-to-end (AES-256-GCM) onde apenas você possui as chaves. Nem mesmo a Storj pode acessar seus dados.',
        tips: ['Dados fragmentados em 80+ peças', 'Distribuídos em mínimo 29 nós diferentes']
      },
      {
        id: 'storj-cost',
        question: 'Quanto custa usar Storj?',
        answer: 'Storj usa modelo pay-as-you-go: $4/TB/mês para armazenamento e $7/TB para download. Upload e operações de API são gratuitos.',
        tips: ['Mais barato que AWS S3', 'Sem custos de egress entre regiões']
      },
      {
        id: 'storj-access-grant',
        question: 'Como gerar um Access Grant?',
        answer: 'Access Grants são gerados no console do Storj.',
        steps: [
          'Acesse console.storj.io',
          'Vá em Access > Create Access Grant',
          'Escolha permissões (Full ou Restricted)',
          'Copie e guarde o grant (mostrado apenas uma vez)'
        ]
      },
      {
        id: 'storj-data-if-close',
        question: 'Posso acessar meus dados se Storj fechar?',
        answer: 'Storj é baseado em código aberto e rede descentralizada. Mesmo se a empresa fechar, os dados permanecem acessíveis através da rede de nós independentes.',
        tips: ['Dados não dependem de infraestrutura centralizada']
      },
      {
        id: 'storj-speed',
        question: 'Qual a velocidade de upload/download?',
        answer: 'A velocidade depende da sua conexão de internet. Storj usa download paralelo de múltiplos nós, geralmente alcançando velocidades comparáveis ou superiores a serviços centralizados.',
        tips: ['Download paralelo de múltiplas fontes', 'Performance melhor em arquivos maiores']
      },
      {
        id: 'storj-auto-backup',
        question: 'Como configurar backup automático?',
        answer: 'No TSiJUKEBOX, configure em Configurações > Backup > Agendamento. Defina frequência, horário e retenção de backups antigos.',
        steps: [
          'Configure Storj em Cloud Backup primeiro',
          'Ative backup automático em Agendamento',
          'Escolha frequência e horário'
        ]
      },
      {
        id: 'storj-s3-tools',
        question: 'Posso usar ferramentas S3 com Storj?',
        answer: 'Sim! Storj é 100% compatível com S3. Use AWS CLI, rclone, Cyberduck, s3cmd e outras ferramentas S3 com credenciais S3 do Storj.',
        steps: [
          'Gere credenciais S3 no console Storj',
          'Use endpoint: gateway.storjshare.io',
          'Configure sua ferramenta S3 favorita'
        ]
      },
      {
        id: 'storj-object-lock',
        question: 'O que é Object Lock e quando usar?',
        answer: 'Object Lock impede que objetos sejam deletados ou modificados por um período definido. Útil para compliance, retenção legal ou proteção contra ransomware.',
        tips: ['Modo Governance: admins podem remover', 'Modo Compliance: ninguém pode remover']
      },
      {
        id: 'storj-share-files',
        question: 'Como compartilhar arquivos via Storj?',
        answer: 'Use Linksharing para gerar URLs públicas de acesso aos seus arquivos.',
        steps: [
          'Crie um Access Grant com permissão de leitura',
          'Use Storj Linkshare ou SDK para gerar URL',
          'Compartilhe o link gerado'
        ]
      },
      {
        id: 'storj-grant-vs-s3',
        question: 'Qual a diferença entre Access Grant e S3 credentials?',
        answer: 'Access Grant é o método nativo do Storj, mais seguro e com controle granular. S3 credentials são para compatibilidade com ferramentas S3 existentes.',
        tips: ['Use Access Grant quando possível', 'S3 credentials para ferramentas legadas']
      },
      {
        id: 'storj-restore',
        question: 'Como restaurar backup do Storj?',
        answer: 'No TSiJUKEBOX, acesse Configurações > Cloud Backup, liste backups disponíveis, selecione o desejado e clique em Restaurar.',
        tips: ['Faça backup local antes de restaurar', 'Restauração substitui dados atuais']
      }
    ]
  },
  // =============================================
  // MÚSICA LOCAL FAQ - 8 itens
  // =============================================
  {
    id: 'local-music-faq',
    title: 'Música Local FAQ',
    icon: <Music className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'local-upload',
        question: 'Como fazer upload de músicas MP3?',
        answer: 'Acesse Configurações > Integrações > Música Local. Na aba Upload, arraste seus arquivos MP3 ou clique para selecionar. O sistema processa e adiciona à biblioteca automaticamente.',
        steps: [
          'Acesse Música Local nas Integrações',
          'Vá na aba Upload',
          'Arraste ou selecione arquivos MP3',
          'Aguarde o processamento'
        ]
      },
      {
        id: 'local-formats',
        question: 'Quais formatos de áudio são suportados?',
        answer: 'O sistema suporta MP3 (recomendado), M4A/AAC, FLAC (sem perdas) e OGG. MP3 oferece melhor compatibilidade, FLAC melhor qualidade.',
        tips: ['MP3 320kbps oferece ótima qualidade', 'FLAC para audiófilos']
      },
      {
        id: 'local-sync-users',
        question: 'Como sincronizar músicas para todos os usuários?',
        answer: 'Na aba Sincronização, selecione as músicas e clique em "Sincronizar Todos". O sistema copia os arquivos para /home/$user/Music/ de cada usuário cadastrado.',
        tips: ['Requer permissões root', 'Usa rsync para eficiência']
      },
      {
        id: 'local-replicate',
        question: 'Como replicar biblioteca para outras instâncias?',
        answer: 'Registre outras instâncias TSiJUKEBOX na aba Instâncias. Depois, selecione músicas e use "Replicar" para transferir via SSH.',
        steps: [
          'Registre a instância de destino',
          'Selecione músicas na biblioteca',
          'Escolha destinos e clique Replicar',
          'Aguarde a transferência SSH'
        ]
      },
      {
        id: 'local-size-limit',
        question: 'Qual o limite de tamanho por arquivo?',
        answer: 'Por padrão, o limite é de 50MB por arquivo. Arquivos FLAC de alta qualidade podem ultrapassar isso. Configure o limite nas opções avançadas se necessário.',
        tips: ['MP3 320kbps: ~2.5MB/minuto', 'FLAC: ~5-10MB/minuto']
      },
      {
        id: 'local-playlists',
        question: 'Como organizar músicas em playlists?',
        answer: 'Na aba Playlists, crie novas playlists e adicione músicas arrastando ou selecionando. Playlists locais são independentes do Spotify.',
        steps: [
          'Vá na aba Playlists',
          'Clique em Nova Playlist',
          'Dê um nome e descrição',
          'Arraste músicas da biblioteca para a playlist'
        ]
      },
      {
        id: 'local-performance',
        question: 'O upload afeta a performance do sistema?',
        answer: 'Durante uploads grandes, pode haver leve impacto na responsividade. O processamento de metadados ID3 consome CPU temporariamente.',
        tips: ['Faça uploads em lote fora do horário de uso intenso', 'Arquivos menores processam mais rápido']
      },
      {
        id: 'local-backup',
        question: 'Como fazer backup da biblioteca musical?',
        answer: 'Configure backup cloud em Configurações > Backup. A biblioteca musical será incluída nos backups automáticos. Alternativamente, copie manualmente a pasta de músicas.',
        tips: ['Inclua músicas no backup cloud', 'Mantenha cópias locais também']
      }
    ]
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>('getting-started');
  const [showInteractiveTest, setShowInteractiveTest] = useState<'keyboard' | 'gestures' | null>(null);

  // Global search
  const globalSearch = useGlobalSearch({ 
    helpSections: helpSections.map(s => ({ 
      id: s.id, 
      title: s.title, 
      items: s.items 
    })) 
  });

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    return helpSections
      .map(section => ({
        ...section,
        items: section.items.filter(
          item =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        )
      }))
      .filter(section => section.items.length > 0);
  }, [searchQuery]);

  const selectedSectionData = selectedSection 
    ? helpSections.find(s => s.id === selectedSection)
    : null;

  const totalArticles = helpSections.reduce((acc, section) => acc + section.items.length, 0);

  // Export functions
  const handleExportMarkdown = () => {
    downloadMarkdown(helpSections.map(s => ({ id: s.id, title: s.title, items: s.items })));
    toast.success('Markdown exportado com sucesso!');
  };

  const handleExportHTML = () => {
    downloadHTML(helpSections.map(s => ({ id: s.id, title: s.title, items: s.items })));
    toast.success('HTML exportado com sucesso!');
  };

  const handlePrint = () => {
    printDocument(helpSections.map(s => ({ id: s.id, title: s.title, items: s.items })));
  };

  return (
    <div className="min-h-screen bg-kiosk-bg help-content">
      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={globalSearch.isOpen}
        onClose={() => globalSearch.setIsOpen(false)}
        query={globalSearch.query}
        setQuery={globalSearch.setQuery}
        results={globalSearch.results}
        filters={globalSearch.filters}
        toggleSource={globalSearch.toggleSource}
        clearSearch={globalSearch.clearSearch}
        helpCount={globalSearch.helpCount}
        wikiCount={globalSearch.wikiCount}
      />

      {/* Interactive Test Mode Modal */}
      {showInteractiveTest && (
        <InteractiveTestMode 
          mode={showInteractiveTest} 
          onClose={() => setShowInteractiveTest(null)} 
        />
      )}

      {/* Header */}
      <div className="p-4 border-b border-border no-print">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-kiosk-text/90 hover:text-kiosk-text"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 icon-neon-blue" />
              <div>
                <h1 className="text-xl font-bold text-kiosk-text">Manual & FAQ</h1>
                <p className="text-xs text-kiosk-text/85">{totalArticles} artigos em {helpSections.length} seções</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <Button
              onClick={() => globalSearch.setIsOpen(true)}
              variant="outline"
              className="button-outline-neon"
            >
              <Search className="w-4 h-4 mr-2 icon-neon-blue" />
              Busca Global
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-kiosk-surface rounded">Ctrl+K</kbd>
            </Button>
            <Button
              onClick={() => navigate('/wiki')}
              variant="outline"
              className="button-outline-neon"
            >
              <BookOpen className="w-4 h-4 mr-2 icon-neon-blue" />
              Wiki
            </Button>
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="button-outline-neon">
                  <Download className="w-4 h-4 mr-2 icon-neon-blue" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-kiosk-surface border-kiosk-border">
                <DropdownMenuItem onClick={handleExportMarkdown} className="text-kiosk-text hover:bg-kiosk-bg cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTML} className="text-kiosk-text hover:bg-kiosk-bg cursor-pointer">
                  <Code className="w-4 h-4 mr-2" />
                  Exportar HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint} className="text-kiosk-text hover:bg-kiosk-bg cursor-pointer">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir / PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => {
                resetTour();
                navigate('/');
                toast.success('Tour reiniciado!');
              }}
              variant="outline"
              className="button-outline-neon"
            >
              <RotateCcw className="w-4 h-4 mr-2 icon-neon-blue" />
              Tour
            </Button>
            <LogoBrand size="sm" variant="metal" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search */}
        <div className="relative mb-6 no-print">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-text/85" />
          <Input
            placeholder="Buscar no manual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-kiosk-surface border-border text-kiosk-text"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Index Sidebar */}
          <div className="lg:col-span-1 no-print">
            <div className="sticky top-4 space-y-2">
              <h2 className="text-sm font-semibold text-label-yellow mb-3">ÍNDICE</h2>
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                    selectedSection === section.id
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-kiosk-surface text-kiosk-text/85 hover:text-kiosk-text'
                  }`}
                >
                  {section.icon}
                  <span className="flex-1 text-sm font-medium">{section.title}</span>
                  <span className="text-xs text-kiosk-text/85">{section.items.length}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {selectedSectionData ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      {selectedSectionData.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-kiosk-text">{selectedSectionData.title}</h2>
                      <p className="text-sm text-kiosk-text/85">{selectedSectionData.items.length} artigos</p>
                    </div>
                  </div>

                  {/* Interactive Test Buttons */}
                  {selectedSection === 'keyboard-shortcuts' && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4 no-print">
                      <p className="text-sm text-kiosk-text/80 mb-3">
                        Experimente os atalhos em tempo real:
                      </p>
                      <Button 
                        onClick={() => setShowInteractiveTest('keyboard')}
                        className="button-primary-glow-3d"
                      >
                        <Keyboard className="w-4 h-4 mr-2" />
                        🎹 Testar Atalhos de Teclado
                      </Button>
                    </div>
                  )}

                  {selectedSection === 'touch-gestures' && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4 no-print">
                      <p className="text-sm text-kiosk-text/80 mb-3">
                        Pratique gestos de toque:
                      </p>
                      <Button 
                        onClick={() => setShowInteractiveTest('gestures')}
                        className="button-primary-glow-3d"
                      >
                        <Hand className="w-4 h-4 mr-2" />
                        👆 Testar Gestos de Toque
                      </Button>
                    </div>
                  )}

                  <Accordion type="single" collapsible className="space-y-2">
                    {selectedSectionData.items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border border-border rounded-lg overflow-hidden bg-kiosk-surface/50"
                      >
                        <AccordionTrigger className="px-4 py-3 text-left text-kiosk-text hover:no-underline hover:bg-kiosk-surface/80">
                          <span className="font-medium">{formatBrandInText(item.question)}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <p className="text-kiosk-text/80 leading-relaxed">{formatBrandInText(item.answer)}</p>

                            {item.steps && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-label-yellow">📋 Passo a passo:</p>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-kiosk-text/90">
                                  {item.steps.map((step, i) => (
                                    <li key={i} className="leading-relaxed">{formatBrandInText(step)}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {item.tips && (
                              <div className="p-3 rounded-lg bg-primary/10 space-y-1">
                                <p className="text-sm font-medium text-primary">💡 Dicas:</p>
                                <ul className="text-sm text-kiosk-text/90 space-y-1">
                                  {item.tips.map((tip, i) => (
                                    <li key={i} className="leading-relaxed">• {formatBrandInText(tip)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ) : (
              <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 mx-auto icon-neon-blue opacity-30 mb-4" />
                  <p className="text-kiosk-text/90">Selecione uma seção no índice para ver o conteúdo</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
