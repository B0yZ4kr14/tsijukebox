# Página: Player (Index)

**Tipo:** Página Principal da Aplicação
**Localização:** `src/pages/public/Index.tsx`
**Rota:** `/`
**Versão:** 1.0.0

---

## Descrição

A página `Index` é o coração da experiência do usuário no TSiJUKEBOX, funcionando como o **Player de Música principal**. Esta página é projetada para o modo Kiosk, oferecendo uma interface imersiva e de fácil utilização para controlar a reprodução de músicas, gerenciar filas e interagir com diferentes fontes de mídia. Ela centraliza o estado da aplicação e integra diversos componentes e hooks para fornecer uma experiência rica e coesa.

### Principais Funcionalidades:
- **Player Principal:** Exibe informações da faixa atual, capa do álbum, e controles de reprodução (play/pause, avançar/voltar, shuffle, repeat).
- **Painéis Deslizantes:** A interface é enriquecida com painéis que podem ser abertos para exibir a fila de reprodução, um browser do Spotify, a biblioteca de mídia local e informações adicionais.
- **Controle por Voz:** Integração com `useVoiceSearch` para permitir que os usuários controlem a aplicação usando comandos de voz.
- **Gestos de Swipe:** Suporte a gestos de deslizar para navegar entre painéis, melhorando a usabilidade em telas sensíveis ao toque.
- **Gerenciamento de Estado:** A página possui estados bem definidos para carregamento (`loading`), erro de conexão e primeiro acesso (exibindo um tour guiado).
- **Instalação PWA:** Oferece um botão para instalar a aplicação como um Progressive Web App (PWA).

---

## Estrutura e Componentes

A página é construída de forma modular, utilizando componentes dedicados para cada seção da interface. O hook `useIndexPage` atua como o cérebro da página, gerenciando todo o estado e a lógica.

### Componentes Principais:

- **`KioskLayout`:** O layout base que define a estrutura de tela cheia para o modo Kiosk.
- **`useIndexPage` (Hook):** Um hook customizado que encapsula toda a lógica de estado da página, incluindo status da conexão, dados do player, visibilidade dos painéis e manipulação de eventos.
- **`IndexHeader`:** O cabeçalho superior, que exibe o status da conexão (online/offline), tipo de conexão (WebSocket/Polling), e botões para alternar a visibilidade dos painéis laterais e para a instalação do PWA.
- **`IndexPlayerSection`:** A seção central que contém o player de música. Exibe a arte do álbum, informações da faixa (título, artista), a barra de progresso (seek), e os controles principais de reprodução.
- **`IndexPanels`:** Um componente que gerencia a renderização e a visibilidade de todos os painéis sobrepostos, como a fila de reprodução, o painel do Spotify, a biblioteca e o painel de informações.
- **`VoiceControlButton`:** Um botão flutuante que ativa a interface de controle por voz.

### Estados da Página:

- **`IndexLoadingState`:** Exibido enquanto a aplicação está tentando se conectar ao backend.
- **`IndexErrorState`:** Exibido se a conexão com a API falhar, oferecendo opções para tentar novamente, ir para as configurações ou ativar o modo de demonstração.

---

## Lógica e Gerenciamento de Estado (`useIndexPage`)

Este hook é o ponto central de controle da página. Ele é responsável por:

- **Buscar o Status:** Utiliza o `useStatus` para obter o estado atual do player do backend.
- **Gerenciar a Fila:** Fornece funções para adicionar, remover, reordenar e limpar a fila de reprodução.
- **Controlar a Reprodução:** Oferece handlers para ações como `seek`, `toggleShuffle`, e `toggleRepeat`.
- **Gerenciar a Visibilidade dos Painéis:** Controla o estado de `showQueue`, `showSpotifyPanel`, `showLibraryPanel`, e `showSideInfoPanel`.
- **Manipular Gestos:** Utiliza o `useSwipeable` para detectar gestos de deslizar e atualizar a interface.
- **Controlar o Tour de Primeiro Acesso:** Gerencia a exibição do tour guiado para novos usuários.

---

## Fluxo de Interação do Usuário

1.  Ao carregar, a página exibe o estado de **carregamento** (`IndexLoadingState`).
2.  Após a conexão, o **player principal** é exibido com a música atual (se houver).
3.  O usuário pode usar os **controles na tela** para interagir com a música.
4.  O usuário pode clicar nos **ícones no header** para abrir os painéis laterais (Biblioteca, Spotify, etc.).
5.  O usuário pode clicar no botão de fila na `IndexPlayerSection` para abrir o painel da **fila de reprodução**.
6.  Em dispositivos de toque, o usuário pode **deslizar para a esquerda ou direita** para navegar entre os painéis.
7.  O **botão de voz flutuante** pode ser usado a qualquer momento para iniciar um comando de voz.

---

## Relacionados

- **`useIndexPage` Hook:** Onde toda a lógica de negócios da página reside.
- **`KioskLayout` Component:** O layout que envolve a página.
- **`useVoiceSearch` Hook:** Fornece a funcionalidade de controle por voz.
- **Componentes de Painel:** `QueuePanel`, `SpotifyPanel`, `LibraryPanel`, `SideInfoPanel`.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Criação da página principal do Player.
- ✅ Integração dos componentes de Header, Player Section e Painéis.
- ✅ Implementação do hook `useIndexPage` para gerenciamento de estado centralizado.
- ✅ Adição de controle por voz e gestos de swipe.
- ✅ Implementação dos estados de carregamento, erro e primeiro acesso.
- ✅ Documentação completa.
