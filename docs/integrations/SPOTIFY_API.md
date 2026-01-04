---
**Tipo:** Documentação de Integração
**Serviço:** Spotify
**Versão:** 1.0.0

---

## 1. Visão Geral

A integração com o Spotify é um dos pilares do TSiJUKEBOX. Ela permite que os usuários conectem suas contas do Spotify (tanto Free quanto Premium) para buscar, navegar e reproduzir todo o catálogo de músicas e playlists diretamente na interface do Jukebox.

A integração é dividida em duas partes principais:

1.  **Spotify Web API:** Utilizada para todas as operações de busca, obtenção de metadados, gerenciamento de playlists e acesso à biblioteca do usuário. A comunicação é feita através de requisições RESTful autenticadas com OAuth 2.0.
2.  **Controle de Reprodução:** A reprodução em si é delegada ao cliente desktop oficial do Spotify, que é controlado pelo TSiJUKEBOX através de um backend local que utiliza ferramentas como `playerctl` (em Linux).

---

## 2. Autenticação (OAuth 2.0)

Para que a aplicação possa acessar os dados de um usuário no Spotify, ele precisa primeiro autorizar a aplicação. O TSiJUKEBOX utiliza o fluxo de autorização **Authorization Code Flow**.

### Fluxo de Autenticação:

1.  **Redirecionamento:** O usuário clica em "Conectar com o Spotify" e é redirecionado para a página de autorização do Spotify.
2.  **Autorização:** O usuário faz login em sua conta do Spotify e concede as permissões solicitadas pela aplicação.
3.  **Callback:** O Spotify redireciona o usuário de volta para a aplicação, enviando um `code` de autorização como parâmetro na URL.
4.  **Troca de Tokens:** O backend do TSiJUKEBOX recebe esse `code` e o troca por um `access_token` e um `refresh_token` fazendo uma requisição POST para a API de contas do Spotify.
5.  **Armazenamento Seguro:** O `access_token` (que tem curta duração) e o `refresh_token` (que tem longa duração) são armazenados de forma segura, associados ao usuário.
6.  **Uso e Renovação:** O `access_token` é usado para fazer chamadas à API. Quando ele expira, o `refresh_token` é utilizado para obter um novo `access_token` sem que o usuário precise fazer login novamente.

### Configuração de Credenciais:

Para que o fluxo OAuth funcione, é necessário registrar a aplicação no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) e obter um **Client ID** e um **Client Secret**. Essas credenciais devem ser configuradas no TSiJUKEBOX durante o Setup Wizard ou na página de configurações.

---

## 3. Principais Endpoints da API Utilizados

O TSiJUKEBOX interage com vários endpoints da Spotify Web API. Os mais importantes estão encapsulados nos hooks customizados.

| Funcionalidade | Hook Responsável | Endpoint da API | Descrição |
| --- | --- | --- | --- |
| **Busca** | `useSpotifySearch` | `GET /v1/search` | Busca por faixas, álbuns, artistas e playlists. |
| **Obter Playlists** | `useSpotifyPlaylists` | `GET /v1/me/playlists` | Retorna as playlists do usuário atual. |
| **Músicas Curtidas** | `useSpotifyLibrary` | `GET /v1/me/tracks` | Retorna as músicas que o usuário salvou em "Músicas Curtidas". |
| **Navegar por Categorias** | `useSpotifyBrowse` | `GET /v1/browse/categories` | Retorna uma lista de categorias de música usadas pelo Spotify. |
| **Recomendações** | `useSpotifyRecommendations` | `GET /v1/recommendations` | Gera recomendações com base em sementes (gêneros, artistas, faixas). |
| **Perfil do Usuário** | `useUser` | `GET /v1/me` | Obtém informações do perfil do usuário conectado. |

---

## 4. Controle de Reprodução com `playerctl`

Em vez de usar o Web Playback SDK (que funciona apenas no navegador e tem limitações), o TSiJUKEBOX adota uma abordagem mais robusta para controle de reprodução em ambientes de desktop/kiosk, especialmente em Linux.

-   **`playerctl`:** É uma ferramenta de linha de comando que permite controlar players de mídia que implementam a especificação MPRIS D-Bus (como o Spotify para Linux).
-   **Backend Local:** O TSiJUKEBOX possui um pequeno servidor de API local que expõe endpoints como `/api/player/play`, `/api/player/pause`, etc.
-   **Execução de Comandos:** Quando o frontend chama um desses endpoints, o backend executa o comando `playerctl` correspondente. Por exemplo, uma chamada para `/api/player/play` pode executar `playerctl -p spotify play-pause`.

Essa arquitetura permite um controle confiável sobre o player nativo do Spotify, aproveitando sua performance e estabilidade, ao mesmo tempo que mantém a interface web do TSiJUKEBOX como o centro de comando.

### Vantagens da Abordagem com `playerctl`:

-   **Estabilidade:** Menos propenso a problemas de DRM ou compatibilidade de navegador.
-   **Performance:** A reprodução de áudio é gerenciada pelo aplicativo nativo, que é altamente otimizado.
-   **Recursos Completos:** Permite o uso de todos os recursos do cliente Spotify, como o Spotify Connect.

---

## 5. Estrutura dos Hooks

A lógica de interação com a API do Spotify é abstraída em uma série de hooks customizados para facilitar o uso nos componentes.

-   **`useSpotifySearch`:** Gerencia a lógica de busca, incluindo debounce para evitar chamadas excessivas à API enquanto o usuário digita.
-   **`useSpotifyPlayer`:** Encapsula as chamadas ao backend local para controlar a reprodução.
-   **`useSpotifyPlaylists`, `useSpotifyLibrary`, etc.:** Utilizam `React Query` para buscar e cachear os dados da API, garantindo que a UI seja rápida e responsiva, evitando buscas repetidas dos mesmos recursos.

Para mais detalhes sobre cada hook, consulte a documentação específica de cada um na seção de **Hooks**[Hooks](../hooks/)**](../hooks).
