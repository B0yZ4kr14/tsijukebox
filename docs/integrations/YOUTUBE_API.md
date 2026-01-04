# Integração com YouTube Music

**Tipo:** Documentação de Integração
**Serviço:** YouTube Music
**Versão:** 1.0.0

---

## 1. Visão Geral

A integração com o YouTube Music permite ao TSiJUKEBOX acessar um vasto catálogo de músicas, álbuns e playlists, oferecendo uma alternativa robusta ao Spotify. Diferente do Spotify, o YouTube não oferece uma API pública oficial e estável especificamente para o YouTube Music. Por isso, a integração depende de uma biblioteca de terceiros que faz engenharia reversa da API interna utilizada pelo site do YouTube Music.

**Biblioteca Principal:** `ytmusicapi` (para Python)

Esta biblioteca é utilizada no backend para realizar todas as interações, como buscas e obtenção de detalhes de playlists.

### Arquitetura da Integração

1.  **Frontend (React):** A interface do usuário, através dos hooks `useYouTubeMusicSearch` e `useYouTubeMusicPlayer`, faz requisições para o backend local do TSiJUKEBOX.
2.  **Backend (API Local):** Um servidor de API (geralmente em Python/Flask ou Node.js/Express) recebe essas requisições.
3.  **Biblioteca `ytmusicapi`:** O backend utiliza a `ytmusicapi` para se comunicar com os endpoints não-oficiais do YouTube Music, realizando as operações solicitadas.
4.  **Retorno de Dados:** Os dados obtidos (listas de músicas, etc.) são retornados ao frontend para serem exibidos na interface.

---

## 2. Autenticação

A autenticação para o YouTube Music é mais complexa do que um fluxo OAuth padrão, pois depende da extração de cookies de uma sessão de navegador autenticada.

### Processo de Configuração:

1.  **Instalação da `ytmusicapi`:** A biblioteca precisa ser instalada no ambiente do backend.

    ```bash
    pip install ytmusicapi
    ```

2.  **Geração do Header de Autenticação:** O desenvolvedor ou administrador do sistema precisa gerar um arquivo de autenticação. A `ytmusicapi` fornece um utilitário para isso.

    ```bash
    # Este comando abrirá um navegador para que você faça login na sua conta do Google
    # e então salvará os headers de autenticação necessários em um arquivo JSON.
    ytmusicapi oauth
    ```

3.  **Configuração no TSiJUKEBOX:** O caminho para o arquivo JSON gerado (geralmente `oauth.json`) deve ser fornecido ao backend do TSiJUKEBOX através de uma variável de ambiente (ex: `YOUTUBE_MUSIC_OAUTH_FILE`).

Este método permite que a aplicação faça requisições em nome do usuário, acessando suas playlists pessoais, histórico e recomendações.

---

## 3. Principais Funcionalidades e Hooks

A interação do frontend com a API do YouTube Music é abstraída através de hooks customizados.

### `useYouTubeMusicSearch`

Este hook é responsável por toda a lógica de busca.

-   **Função `search(query, type)`:** Envia uma requisição para o endpoint de busca do backend, que por sua vez chama a `ytmusicapi`.
-   **Tipos de Busca:** Suporta a busca por `song`, `video`, `album` e `playlist`.
-   **Resultados:** Retorna um estado com os resultados organizados por categoria (faixas, álbuns, etc.).

### `useYouTubeMusicPlayer`

Gerencia o controle da reprodução. A forma como a reprodução é feita pode variar:

-   **Player Embutido (Iframe):** Uma abordagem comum é usar um player do YouTube embutido (Iframe Player API) que fica oculto na página e é controlado programaticamente.
-   **Backend de Streaming:** Uma abordagem mais avançada onde o backend é responsável por obter a URL de streaming do áudio e enviá-la para um player de áudio HTML5 no frontend.

Este hook expõe funções como:

-   `play(videoId)`: Inicia a reprodução de um vídeo.
-   `pause()`: Pausa a reprodução.
-   `seek(positionMs)`: Avança para um ponto específico da música.
-   `setVolume(percent)`: Ajusta o volume.
-   `addToQueue(videoId)`: Adiciona uma música à fila de reprodução.

---

## 4. Limitações e Considerações

-   **API Não-Oficial:** Por depender de uma API não-oficial, a integração está sujeita a quebras caso o YouTube altere sua API interna. Isso exige manutenção e atualização constantes da biblioteca `ytmusicapi`.
-   **Autenticação Manual:** O processo de autenticação não é tão fluido para o usuário final quanto o OAuth, exigindo uma configuração manual inicial.
-   **Termos de Serviço:** A utilização de APIs não-oficiais pode violar os Termos de Serviço do YouTube. O uso em produção deve ser feito com cautela e ciência dos riscos.

---

## 5. Exemplo de Fluxo de Dados (Busca)

1.  O usuário digita "Queen" no componente `YouTubeSearchBar`.
2.  O `onChange` do input chama a função `search('Queen')` do hook `useYouTubeMusicSearch`.
3.  O hook faz uma requisição `POST` para o endpoint `/api/youtube/search` do backend local, enviando `{ query: 'Queen' }` no corpo.
4.  O servidor backend recebe a requisição, instancia o cliente da `ytmusicapi` com as credenciais carregadas e chama `ytmusic.search('Queen')`.
5.  A `ytmusicapi` faz a requisição para a API interna do YouTube Music.
6.  O YouTube Music retorna os resultados da busca.
7.  O backend formata os resultados e os retorna como resposta para o frontend.
8.  O hook `useYouTubeMusicSearch` atualiza seu estado `results` com os dados recebidos, e a UI é re-renderizada para exibir as músicas, álbuns e artistas encontrados.
