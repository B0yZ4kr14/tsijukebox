import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { resetTour } from '@/components/tour/GuidedTour';
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
        question: 'O que é o TSi JUKEBOX?',
        answer: 'O TSi JUKEBOX é um sistema de música inteligente projetado para funcionar como um "jukebox digital". Ele permite reproduzir músicas, gerenciar playlists e conectar-se ao Spotify de forma fácil e intuitiva.',
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
        answer: 'O TSi JUKEBOX oferece atalhos de teclado intuitivos para controle completo da reprodução sem precisar tocar na tela. Esses atalhos funcionam quando o player está em foco e são ideais para uso com teclados externos, controles remotos ou em ambientes onde a tela de toque não é prática. Os atalhos foram projetados para serem simples e memoráveis, usando teclas comuns encontradas em qualquer teclado.',
        steps: [
          'Barra de Espaço (Space): Esta é a tecla mais importante. Pressione uma vez para alternar entre Play e Pause. Quando a música está tocando, pressionar a barra de espaço irá pausar imediatamente. Quando a música está pausada, pressionar espaço retoma a reprodução do ponto exato onde parou. A resposta é instantânea e funciona mesmo durante transições de faixa.',
          'Seta para Direita (→): Avança imediatamente para a próxima faixa na fila de reprodução. A transição é suave e a nova música começa do início. Se você estiver na última música da fila, o comportamento depende da configuração de repetição: pode parar, repetir a fila, ou continuar com recomendações.',
          'Seta para Esquerda (←): Volta para a faixa anterior. O comportamento inteligente considera o tempo atual: nos primeiros 3 segundos da música, volta para a faixa anterior. Após 3 segundos, reinicia a música atual do início. Isso permite "voltar" rapidamente ou "recomeçar" conforme sua intenção.',
          'Seta para Cima (↑) ou tecla +: Aumenta o volume em incrementos de 5%. Cada pressionamento sobe de 0% a 5%, de 5% a 10%, e assim por diante até o máximo de 100%. Uma notificação visual temporária mostra o novo nível de volume para confirmação.',
          'Seta para Baixo (↓) ou tecla -: Diminui o volume em incrementos de 5%. Funciona de forma análoga ao aumento. O volume mínimo é 0% (silêncio completo), mas a música continua tocando - apenas sem som audível.'
        ],
        tips: [
          'Os atalhos funcionam mesmo quando o Command Deck está expandido ou recolhido',
          'Se os atalhos não responderem, clique uma vez na área do player para garantir que ele está em foco',
          'Você pode pressionar e segurar as teclas de volume para ajuste rápido contínuo (hold)',
          'Em modo kiosk (tela cheia), os atalhos de teclado são frequentemente a forma mais rápida de controlar a música',
          'Teclados numéricos: as teclas + e - do teclado numérico funcionam igual às setas de volume',
          'Laptops: em alguns modelos, Fn + setas pode ser necessário se as setas estiverem mapeadas para outras funções'
        ]
      },
      {
        id: 'volume-precision',
        question: 'Como ajustar o volume com precisão máxima usando o teclado?',
        answer: 'O sistema de volume do TSi JUKEBOX permite ajuste fino em incrementos de 5%, oferecendo 21 níveis distintos de volume (0%, 5%, 10%, 15%... até 100%). Isso garante controle preciso sem precisar usar o slider de volume na tela, que pode ser difícil de acertar em telas de toque ou com controles remotos. Cada incremento é cuidadosamente calibrado para ser perceptível ao ouvido humano sem ser excessivamente dramático.',
        steps: [
          'Pressione ↑ ou + uma única vez para aumentar exatamente 5% - útil para ajustes finos quando você quer apenas um pouco mais de volume',
          'Pressione ↓ ou - uma única vez para diminuir exatamente 5% - perfeito para reduzir ligeiramente quando algo está muito alto',
          'Segure qualquer tecla de volume pressionada para ajuste rápido contínuo - o volume mudará a cada ~200ms enquanto a tecla estiver pressionada',
          'O nível atual é exibido temporariamente na tela após cada ajuste (desaparece após 2 segundos)',
          'A barra de volume visual na interface atualiza em tempo real para refletir o nível atual'
        ],
        tips: [
          'Volume 0% silencia completamente sem parar a música - útil para atender uma ligação rapidamente',
          'O volume é automaticamente salvo e restaurado entre sessões - ao reabrir o app, você terá o mesmo volume de antes',
          'Em ambientes ruidosos (bares, festas), recomendamos manter o volume acima de 60% para clareza',
          'Para ambientes silenciosos (residências à noite), volumes entre 20-40% são geralmente confortáveis',
          'O sistema protege contra mudanças bruscas: mesmo que você pressione rapidamente, há um limite de velocidade'
        ]
      },
      {
        id: 'navigation-shortcuts',
        question: 'Como navegar rapidamente entre faixas usando apenas o teclado?',
        answer: 'A navegação entre faixas é feita exclusivamente pelas setas horizontais (esquerda e direita). Diferente de alguns players que têm dezenas de atalhos, o TSi JUKEBOX foi projetado com simplicidade em mente - apenas duas teclas para navegação. Não há atalhos para "pular para música específica" ou "ir para posição X" via teclado, pois isso mantém a experiência limpa e intuitiva para todos os usuários, especialmente em modo kiosk.',
        steps: [
          'Seta Direita (→): Próxima música - pula instantaneamente para a próxima faixa na fila. A transição inclui uma animação suave de fade entre faixas.',
          'Seta Esquerda (←): Música anterior - comportamento inteligente baseado no tempo de reprodução atual:',
          '  • Nos primeiros 3 segundos: Volta para a música anterior completa',
          '  • Após 3 segundos: Reinicia a música atual do início',
          '  • Este comportamento imita players de CD e é intuitivo para a maioria dos usuários'
        ],
        tips: [
          'O limiar de 3 segundos não é configurável atualmente - é baseado em estudos de UX de players populares',
          'Feedback visual: uma seta animada aparece brevemente indicando a direção da navegação',
          'Se você segurar a seta pressionada, ela NÃO avança múltiplas faixas - apenas uma por pressionamento',
          'Durante a transição entre faixas (~500ms), novos comandos são ignorados para evitar "pulos acidentais"',
          'Dica de poder: combine com barra de espaço para "pausar antes de pular" se precisar de mais controle'
        ]
      },
      {
        id: 'accessibility-shortcuts',
        question: 'Quais atalhos especiais existem para acessibilidade?',
        answer: 'O TSi JUKEBOX foi projetado com acessibilidade como prioridade. Os atalhos principais são deliberadamente simples e consistentes, usando apenas 5 teclas diferentes (Espaço, 4 Setas). Isso facilita enormemente o uso por pessoas com dificuldades motoras, visuais ou cognitivas. Não há combinações complexas como Ctrl+Shift+X - cada função importante tem uma tecla única dedicada.',
        steps: [
          'Todas as 5 teclas principais (Espaço, ↑, ↓, ←, →) são grandes e fáceis de localizar em qualquer teclado',
          'Não há necessidade de pressionar teclas modificadoras (Ctrl, Alt, Shift) para nenhuma função básica',
          'O feedback é sempre multimodal: visual (na tela), sonoro (se habilitado nas configurações), e tátil (em dispositivos compatíveis)',
          'Leitores de tela (screen readers) são compatíveis com a interface - os atalhos não conflitam com comandos do leitor'
        ],
        tips: [
          'Modo Alto Contraste: pode ser ativado em Configurações > Acessibilidade para melhor visibilidade',
          'Tamanho de Fonte: aumentável globalmente em Configurações > Acessibilidade',
          'Reduzir Animações: disponível para usuários sensíveis a movimento',
          'Notificações toast aparecem em tamanho maior no modo acessibilidade para facilitar leitura',
          'Se você usa dispositivos adaptativos (switches, eye-tracking), os atalhos de teclado funcionam através de emuladores de teclado'
        ]
      },
      {
        id: 'system-shortcuts',
        question: 'Existem atalhos para funções do sistema (não relacionadas à música)?',
        answer: 'Atualmente, o TSi JUKEBOX reserva atalhos de teclado exclusivamente para controle de reprodução de música. Funções administrativas como abrir configurações, acessar dashboard, ou reiniciar o sistema não têm atalhos de teclado dedicados. Isso é intencional: em modo kiosk, queremos evitar que usuários não autorizados acessem funções administrativas através de combinações de teclas. Todas as funções administrativas são acessíveis através do Command Deck (barra inferior) ou menu de configurações.',
        tips: [
          'Se você precisa de acesso rápido às configurações, use o botão SETUP no Command Deck',
          'Em Chromium kiosk mode, as teclas F1-F12 são desabilitadas por padrão para segurança',
          'Administradores podem configurar atalhos de sistema no nível do Openbox (fora do TSi JUKEBOX)',
          'Para acessibilidade: navegação via Tab funciona em todos os elementos interativos da interface'
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
        question: 'Quais gestos de toque estão disponíveis no TSi JUKEBOX?',
        answer: 'O TSi JUKEBOX suporta gestos de deslizar (swipe) para controle rápido da reprodução sem precisar tocar em botões específicos. Os gestos funcionam em qualquer área da tela do player principal (onde aparece a capa do álbum e informações da música). Isso permite interação fluida e natural, especialmente útil em telas grandes ou quando você não quer procurar um botão específico. Os gestos foram calibrados para evitar ativações acidentais durante uso normal.',
        steps: [
          'Deslizar para Esquerda (← Swipe Left): Avança para a próxima música. Coloque um dedo na tela, mantenha contato, e arraste horizontalmente para a esquerda por pelo menos 50 pixels (aproximadamente 1-2 centímetros na maioria das telas). Ao soltar, a próxima música começará imediatamente.',
          'Deslizar para Direita (→ Swipe Right): Volta para a música anterior. Coloque um dedo na tela, mantenha contato, e arraste horizontalmente para a direita por pelo menos 50 pixels. O comportamento é idêntico à tecla de seta esquerda (volta completa ou reinicia dependendo do tempo).',
          'Toque Simples (Tap): Todos os botões na interface respondem a toques simples. Basta tocar uma vez no centro do botão. Um efeito visual de "ripple" (ondulação) confirma que o toque foi registrado.',
          'Toque e Segurar (Long Press) no Volume: Mantenha o dedo pressionado sobre o slider de volume para entrar em modo de ajuste contínuo. Arraste para cima/baixo para ajustar. Solte para confirmar o nível.'
        ],
        tips: [
          'O limiar mínimo de 50 pixels foi escolhido para evitar gestos acidentais durante toques normais',
          'Feedback visual: uma seta animada (chevron) aparece indicando a direção do gesto reconhecido',
          'Gestos funcionam mesmo quando você toca sobre a imagem da capa do álbum',
          'Em caso de dúvida, os botões são sempre uma alternativa confiável - eles são grandes (56-64px) e fáceis de acertar',
          'Gestos não funcionam sobre o Command Deck ou outras áreas de controle específicas'
        ]
      },
      {
        id: 'swipe-sensitivity',
        question: 'Como funciona a sensibilidade dos gestos? Por que meu gesto às vezes não é reconhecido?',
        answer: 'A sensibilidade dos gestos foi cuidadosamente calibrada para funcionar bem em telas de diferentes tamanhos (desde tablets de 10" até TVs de 55"+). O sistema usa um algoritmo que distingue entre gestos intencionais horizontais e movimentos acidentais ou diagonais. O reconhecimento prioriza precisão sobre velocidade - preferimos ignorar um gesto válido do que ativar um gesto acidental.',
        steps: [
          'Início do Gesto (touchstart): O sistema registra a posição X e Y exatas onde seu dedo tocou a tela. Este é o ponto de referência.',
          'Durante o Movimento (touchmove): A posição é atualizada continuamente enquanto seu dedo se move. O sistema monitora tanto o deslocamento horizontal quanto o vertical.',
          'Fim do Gesto (touchend): Quando você levanta o dedo, o sistema calcula: (1) distância horizontal total, (2) distância vertical total, (3) direção dominante.',
          'Validação: O gesto é aceito SOMENTE se: distância horizontal > 50px E distância horizontal > distância vertical. Isso garante que gestos diagonais ou verticais não sejam interpretados como "próxima/anterior".'
        ],
        tips: [
          'Se seu gesto foi diagonal demais, o sistema ignora para evitar ação incorreta',
          'Movimentos muito curtos (< 50px) são sempre ignorados - são considerados "toques" não "gestos"',
          'A velocidade do gesto NÃO afeta o resultado - apenas a distância e direção importam',
          'Use sempre um único dedo para gestos. Multi-touch (pinch, rotate) não é suportado atualmente',
          'Telas com películas muito grossas ou dedos muito secos podem reduzir a sensibilidade do touch'
        ]
      },
      {
        id: 'gesture-feedback',
        question: 'Como sei se meu gesto foi reconhecido corretamente pelo sistema?',
        answer: 'O TSi JUKEBOX fornece três tipos de feedback simultâneos para confirmar que seu gesto foi reconhecido e está sendo processado. Isso é especialmente importante em ambientes ruidosos ou quando você não está olhando diretamente para a tela. O feedback é imediato (< 100ms após o fim do gesto) para dar sensação de responsividade.',
        steps: [
          'Feedback Visual Imediato: Uma seta animada (ícone chevron) aparece brevemente no centro da tela indicando a direção. Seta apontando para direita = próxima música. Seta apontando para esquerda = música anterior. A seta usa animação de fade-in/fade-out que dura 300ms.',
          'Notificação Toast: Uma pequena mensagem aparece no canto da tela confirmando a ação em texto: "Próxima faixa" ou "Faixa anterior". O toast desaparece automaticamente após 2 segundos.',
          'Mudança de Conteúdo: A capa do álbum, título da música, nome do artista e barra de progresso atualizam para refletir a nova faixa. Esta é a confirmação definitiva de que a ação foi executada.',
          'Animação de Transição: A interface realiza uma transição suave (crossfade) entre as informações da faixa antiga e nova, dando feedback visual adicional de que algo mudou.'
        ],
        tips: [
          'Se você viu a seta mas a música não mudou, pode haver um problema de conexão com o backend',
          'Se nenhum feedback apareceu, o gesto não atingiu o limiar mínimo - tente um movimento mais longo e horizontal',
          'O feedback visual pode ser desabilitado em Configurações > Acessibilidade se for uma distração',
          'Em caso de falha, a música atual simplesmente continua tocando - nenhum dado é perdido'
        ]
      },
      {
        id: 'gesture-vs-buttons',
        question: 'Quando devo usar gestos e quando devo usar os botões na tela?',
        answer: 'Gestos e botões são complementares - ambos existem para que você possa escolher o método mais conveniente para cada situação. Nenhum é "melhor" que o outro de forma absoluta. A escolha depende do contexto de uso, do tamanho da tela, de suas preferências pessoais, e se você precisa de confirmação visual antes de agir.',
        steps: [
          'USE GESTOS quando: Você quer trocar de música rapidamente sem procurar um botão. Você está segurando algo com uma mão e só tem uma mão livre. A tela é grande e os botões estão longe do centro. Você já está familiarizado com a interface e não precisa de confirmação visual.',
          'USE BOTÕES quando: Você quer controle preciso de volume (o slider é mais preciso que qualquer gesto). Você precisa pausar/retomar (não há gesto para isso). Você está acessando funções administrativas (shuffle, repeat, queue). Você prefere confirmação visual antes de agir.',
          'COMBINE AMBOS: Muitos usuários usam gestos para navegação (próxima/anterior) e botões para controle (play/pause/volume). Esta é a forma mais eficiente de operar o sistema.'
        ],
        tips: [
          'Em telas menores (tablets 10"), gestos são frequentemente mais práticos que localizar botões pequenos',
          'Em telas grandes (TV 55"+), os botões são mais visíveis e fáceis de acertar',
          'Se você tem dificuldades motoras, botões grandes são geralmente mais acessíveis que gestos',
          'Gestos são silenciosos e discretos - úteis em ambientes onde você não quer chamar atenção para suas ações'
        ]
      },
      {
        id: 'troubleshooting-gestures',
        question: 'Meus gestos não estão funcionando. O que pode estar errado e como resolver?',
        answer: 'Se os gestos de toque não estão sendo reconhecidos, há várias causas possíveis - desde problemas de hardware até configurações de software. Siga este guia sistemático de solução de problemas para identificar e resolver a causa. Na maioria dos casos, o problema é simples de resolver.',
        steps: [
          '1. ÁREA INCORRETA: Gestos só funcionam na área central do player (onde aparece a capa do álbum). Verifique se você está tocando nessa região específica, não no Command Deck, não na barra de progresso, não nos botões.',
          '2. DIREÇÃO INCORRETA: O gesto precisa ser predominantemente horizontal. Se seu movimento é diagonal ou vertical, ele será ignorado. Tente fazer um movimento mais "reto" da esquerda para direita ou vice-versa.',
          '3. DISTÂNCIA INSUFICIENTE: O deslize precisa ter no mínimo ~50 pixels (aproximadamente 1-2cm dependendo da tela). Se o movimento for muito curto, é interpretado como "toque" não "gesto".',
          '4. MÚLTIPLOS DEDOS: Use apenas UM dedo para gestos. Multi-touch (dois ou mais dedos) pode causar comportamento inesperado ou ser completamente ignorado.',
          '5. TELA SUJA OU OLEOSA: Limpe a tela com um pano de microfibra. Sujeira, oleosidade ou umidade podem interferir na detecção de toque.',
          '6. PROBLEMA DE HARDWARE: Algumas telas têm "zonas mortas" onde o touch não funciona bem. Teste diferentes áreas da tela para ver se o problema é localizado.',
          '7. REINICIE O NAVEGADOR: Se o problema persistir, feche e reabra o navegador/aplicativo. Às vezes o listener de eventos de touch pode travar.',
          '8. MODO DEMO: Se você está em modo demo (sem backend conectado), os gestos podem ter comportamento simulado diferente do modo produção.'
        ],
        tips: [
          'Luvas de tecido ou dedos muito secos podem não ser detectados por telas capacitivas',
          'Películas de proteção muito grossas (> 0.5mm) podem reduzir a sensibilidade do touch',
          'Em caso de dúvida, os BOTÕES na tela sempre funcionam como alternativa confiável',
          'Se nada funcionar, reporte o problema com detalhes do seu hardware em GitHub Issues'
        ]
      },
      {
        id: 'multitouch-support',
        question: 'O TSi JUKEBOX suporta gestos multi-toque (pinch, zoom, rotate)?',
        answer: 'Atualmente, o TSi JUKEBOX suporta apenas gestos de um único dedo (single-touch). Gestos multi-toque como pinch-to-zoom, rotate, ou three-finger swipe não são implementados. Esta é uma decisão de design deliberada para manter a interface simples e evitar conflitos com os controles existentes. O modo kiosk também desabilita zoom para manter a escala fixa.',
        tips: [
          'Pinch-to-zoom é desabilitado em modo kiosk para manter o layout consistente',
          'Rotate e outros gestos complexos não têm função no contexto de um player de música',
          'Se você precisa de zoom para acessibilidade, use a configuração de tamanho de fonte em Configurações',
          'Multi-toque pode ser adicionado em versões futuras se houver demanda suficiente'
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
        id: 'theme',
        question: 'Como mudar o tema de cores?',
        answer: 'Acesse Configurações > Tema e escolha entre Azul Neon, Verde Tech ou Roxo Vibrante. A mudança é aplicada instantaneamente com uma transição suave.',
        steps: [
          'Abra o menu de Configurações',
          'Encontre a seção "Tema"',
          'Clique na cor desejada',
          'A mudança é automática!'
        ]
      },
      {
        id: 'theme-preview',
        question: 'Como visualizar todos os temas antes de escolher?',
        answer: 'O TSi JUKEBOX oferece uma página dedicada de Preview de Temas onde você pode ver todos os 8 presets disponíveis (5 temas sólidos + 3 temas com gradiente) e testar como cada componente da interface ficará antes de aplicar.',
        steps: [
          'Acesse Configurações > Tema',
          'Clique no botão "Preview de Temas" ou navegue para /theme-preview',
          'Explore os temas sólidos: Azul, Verde, Roxo, Laranja e Rosa',
          'Explore os temas com gradiente: Aurora Boreal, Pôr do Sol e Oceano Profundo',
          'Clique em qualquer tema para pré-visualizar os componentes',
          'Use o botão "Aplicar Tema" para confirmar sua escolha'
        ],
        tips: [
          'Temas com gradiente criam um fundo com transição suave de cores',
          'Você pode criar seus próprios temas customizados na seção Personalizador de Tema'
        ]
      },
      {
        id: 'accessibility',
        question: 'Como ajustar a acessibilidade?',
        answer: 'Em Configurações > Acessibilidade você pode ativar modo de alto contraste, aumentar o tamanho das fontes e reduzir animações para uma experiência mais confortável.',
        tips: [
          'Use o preview em tempo real para ver como ficará',
          'O modo alto contraste é ideal para ambientes muito iluminados',
          'Reduza animações se sentir desconforto com movimentos'
        ]
      },
      {
        id: 'backup',
        question: 'Como fazer backup dos dados?',
        answer: 'Backups protegem suas configurações e dados importantes. Você pode fazer backup completo (tudo) ou incremental (apenas mudanças).',
        steps: [
          'Acesse Configurações > Backup Local',
          'Clique em "Backup Completo" para a primeira vez',
          'Use "Backup Incremental" para atualizações diárias',
          'Os backups ficam listados abaixo para restauração'
        ],
        tips: ['Faça backup completo semanalmente', 'Backups incrementais são mais rápidos']
      }
    ]
  },
  {
    id: 'spotify',
    title: 'Spotify',
    icon: <Music className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'connect-spotify',
        question: 'Como conectar minha conta Spotify?',
        answer: 'Para usar o Spotify, você precisa criar um app no Spotify Developer Dashboard e obter as credenciais Client ID e Client Secret.',
        steps: [
          'Acesse developer.spotify.com e faça login',
          'Crie um novo aplicativo',
          'Copie o Client ID e Client Secret',
          'Cole nas Configurações > Spotify do TSi JUKEBOX',
          'Clique em "Conectar com Spotify"'
        ],
        tips: ['A conexão é segura via OAuth', 'Suas credenciais ficam salvas localmente']
      },
      {
        id: 'spotify-controls',
        question: 'Como controlar a música?',
        answer: 'Use os botões centrais para Play/Pause, as setas para próxima/anterior, e o slider para volume. Você também pode usar gestos de deslizar.',
        tips: ['Deslize para direita = próxima música', 'Deslize para esquerda = música anterior']
      }
    ]
  },
  {
    id: 'database',
    title: 'Banco de Dados',
    icon: <Database className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'what-is-db',
        question: 'O que é o banco de dados?',
        answer: 'O banco de dados é onde todas as suas configurações, histórico de músicas e preferências são guardados de forma segura. Pense nele como uma "caixa organizadora digital".',
      },
      {
        id: 'db-types',
        question: 'Quais tipos de banco são suportados?',
        answer: 'O TSi JUKEBOX suporta SQLite (local ou remoto) e Lovable Cloud. Para uso doméstico, SQLite local é suficiente. Para estabelecimentos, Lovable Cloud oferece backup automático.',
      },
      {
        id: 'db-maintenance',
        question: 'Como fazer manutenção do banco?',
        answer: 'Em Configurações > Banco de Dados você encontra ferramentas como Vacuum (otimização), Verificar Integridade, e Reindexar.',
        tips: ['Execute Vacuum mensalmente para melhor desempenho', 'Sempre faça backup antes de manutenções']
      }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    icon: <Shield className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'ssh-keys',
        question: 'O que são chaves SSH?',
        answer: 'Chaves SSH são como "senhas especiais" que permitem conexões seguras entre computadores. A chave privada é secreta (nunca compartilhe!), enquanto a pública pode ser compartilhada.',
        tips: [
          'Use o comando ssh-keygen -t ed25519 para criar novas chaves',
          'O tipo ed25519 é mais seguro e rápido que RSA',
          'Sempre proteja sua chave privada com senha'
        ]
      },
      {
        id: 'gpg-keys',
        question: 'Para que serve GPG?',
        answer: 'GPG serve para "assinar" e criptografar arquivos. No contexto do JUKEBOX, é usado para garantir que seus backups não foram alterados.',
      },
      {
        id: 'user-roles',
        question: 'Como funcionam os níveis de usuário?',
        answer: 'Existem três níveis: Newbie (apenas ouve música), User (pode modificar fila), e Admin (acesso total incluindo configurações).',
      }
    ]
  },
  {
    id: 'cloud',
    title: 'Nuvem e Backup',
    icon: <Cloud className="w-5 h-5 icon-neon-blue" />,
    items: [
      {
        id: 'cloud-backup',
        question: 'Como configurar backup na nuvem?',
        answer: 'Em Configurações > Backup na Nuvem você pode conectar serviços como Google Drive, Dropbox, ou Amazon S3 para guardar cópias dos seus dados.',
        steps: [
          'Escolha o serviço de nuvem desejado',
          'Insira as credenciais de acesso',
          'Configure a frequência de sincronização',
          'Clique em "Sincronizar Agora" para testar'
        ]
      },
      {
        id: 'schedule-backup',
        question: 'Como agendar backups automáticos?',
        answer: 'Em Configurações > Agendamento de Backup você define quando os backups devem ocorrer automaticamente.',
        tips: ['Recomendamos backup diário às 3h da manhã', 'Mantenha pelo menos 7 backups anteriores']
      }
    ]
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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

  // Calculate total articles
  const totalArticles = helpSections.reduce((acc, section) => acc + section.items.length, 0);

  return (
    <div className="min-h-screen bg-kiosk-bg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-kiosk-text/70 hover:text-kiosk-text"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 icon-neon-blue" />
              <div>
                <h1 className="text-xl font-bold text-kiosk-text">Manual & FAQ</h1>
                <p className="text-xs text-kiosk-text/60">{totalArticles} artigos em {helpSections.length} seções</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/theme-preview')}
              variant="outline"
              className="button-outline-neon"
            >
              <Palette className="w-4 h-4 mr-2 icon-neon-blue" />
              Preview de Temas
            </Button>
            <Button
              onClick={() => {
                resetTour();
                navigate('/');
                toast.success('Tour reiniciado! Aproveite o passeio guiado.');
              }}
              variant="outline"
              className="button-outline-neon"
            >
              <RotateCcw className="w-4 h-4 mr-2 icon-neon-blue" />
              Reiniciar Tour
            </Button>
            <LogoBrand size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-text/50" />
          <Input
            placeholder="Buscar no manual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-kiosk-surface border-border text-kiosk-text"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Index Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-2">
              <h2 className="text-sm font-semibold text-label-yellow mb-3">ÍNDICE</h2>
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                    selectedSection === section.id
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-kiosk-surface text-kiosk-text/70 hover:text-kiosk-text'
                  }`}
                >
                  {section.icon}
                  <span className="flex-1 text-sm font-medium">{section.title}</span>
                  <span className="text-xs text-kiosk-text/50">{section.items.length}</span>
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
                      <p className="text-sm text-kiosk-text/70">{selectedSectionData.items.length} artigos</p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    {selectedSectionData.items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border border-border rounded-lg overflow-hidden bg-kiosk-surface/50"
                      >
                        <AccordionTrigger className="px-4 py-3 text-left text-kiosk-text hover:no-underline hover:bg-kiosk-surface/80">
                          <span className="font-medium">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <p className="text-kiosk-text/80 leading-relaxed">{item.answer}</p>

                            {item.steps && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-label-yellow">📋 Passo a passo:</p>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-kiosk-text/70">
                                  {item.steps.map((step, i) => (
                                    <li key={i} className="leading-relaxed">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {item.tips && (
                              <div className="p-3 rounded-lg bg-primary/10 space-y-1">
                                <p className="text-sm font-medium text-primary">💡 Dicas:</p>
                                <ul className="text-sm text-kiosk-text/70 space-y-1">
                                  {item.tips.map((tip, i) => (
                                    <li key={i} className="leading-relaxed">• {tip}</li>
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
                  <p className="text-kiosk-text/70">Selecione uma seção no índice para ver o conteúdo</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
