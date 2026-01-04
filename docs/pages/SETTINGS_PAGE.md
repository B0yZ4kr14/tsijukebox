# Página: Configurações (Settings)

**Tipo:** Página da Aplicação
**Localização:** `src/pages/settings/Settings.tsx`
**Rota:** `/settings`
**Versão:** 1.0.0

---

## Descrição

A página de **Configurações** é o centro de controle administrativo do TSiJUKEBOX. Ela oferece uma interface abrangente e organizada para que os usuários possam customizar todos os aspectos da aplicação, desde a aparência e conexões de backend até integrações com serviços de terceiros e configurações avançadas de segurança.

A página é estruturada com uma navegação lateral (`SettingsSidebar`) que permite ao usuário alternar entre diferentes categorias de configurações, com o conteúdo de cada categoria sendo renderizado dinamicamente na área principal.

### Principais Categorias:
- **Dashboard:** Uma visão geral das principais configurações e atalhos.
- **Conexões:** Configurações da API de backend e conexões com a nuvem.
- **Dados:** Gerenciamento do banco de dados, backups e clientes Jukebox.
- **Sistema:** Informações da versão, modo de demonstração e URLs do sistema.
- **Aparência:** Customização de temas, acessibilidade, volume e idioma.
- **Segurança:** Gerenciamento de usuários, chaves de API e provedores de autenticação.
- **Integrações:** Configuração de serviços como Spotify, YouTube Music e Spicetify.

---

## Estrutura e Componentes

A página utiliza uma arquitetura modular, onde cada seção de configuração é um componente React independente, facilitando a manutenção e a escalabilidade.

### Componentes Principais:

- **`SettingsSidebar`:** A barra de navegação lateral que lista todas as categorias de configuração. O hook `useSettingsNavigation` gerencia a categoria ativa.
- **`SettingsDashboard`:** A tela inicial da área de configurações, que exibe cartões de acesso rápido para as principais categorias.
- **`SettingsBreadcrumb`:** Exibe um caminho de navegação no topo da página, permitindo ao usuário entender sua localização e voltar para o dashboard.
- **`SettingsSection`:** Um componente de layout reutilizável que encapsula cada grupo de configurações, fornecendo um título, ícone e descrição padrão.
- **Componentes de Seção Específicos:** Cada categoria possui um ou mais componentes dedicados (ex: `ThemeSection`, `BackendConnectionSection`, `SpotifySetupWizard`) que contêm a lógica e a UI para aquele grupo de configurações.

### Gerenciamento de Estado:

- **`useSettingsNavigation` (Hook):** Gerencia a navegação entre as categorias, mantendo o estado da `activeCategory`.
- **`useSettings` (Context Hook):** Fornece acesso global ao estado das configurações (como `isDemoMode`, `apiUrl`, credenciais do Spotify, etc.) e as funções para atualizá-las. As configurações são persistidas no `localStorage` para manter as escolhas do usuário entre as sessões.
- **`useSettingsOAuth` (Hook):** Encapsula a lógica para o fluxo de autenticação OAuth 2.0 com o Spotify.

---

## Fluxo de Renderização

1.  A página `Settings` é renderizada dentro do `KioskLayout`.
2.  A `SettingsSidebar` é exibida à esquerda, com a categoria ativa destacada.
3.  O conteúdo principal renderiza o `SettingsDashboard` por padrão.
4.  Quando o usuário clica em uma categoria na sidebar, o estado `activeCategory` é atualizado.
5.  A função `renderCategoryContent` utiliza um `switch` para determinar qual conjunto de componentes de seção deve ser renderizado na área de conteúdo principal, com base na `activeCategory`.
6.  Cada seção de configuração lê e atualiza o estado do `SettingsContext`.
7.  As alterações são salvas automaticamente no `localStorage` e, em alguns casos, notificadas ao usuário através de `toast` (Sonner).

---

## Funcionalidades Chave

### Integração com Spotify
- **Formulário de Credenciais:** Permite que o usuário insira seu Client ID e Client Secret do Spotify.
- **Assistente de Configuração (`SpotifySetupWizard`):** Um modal guiado que ajuda os usuários a obterem e configurarem suas credenciais do Spotify passo a passo.
- **Fluxo OAuth:** O botão "Conectar com Spotify" inicia o fluxo de autenticação OAuth. Após a autorização, a página manipula o redirecionamento, obtém os tokens e os salva no contexto.
- **Status de Conexão:** A interface exibe claramente se o Spotify está conectado, mostrando informações do usuário logado, ou se está apenas configurado ou não configurado.

### Modo Demonstração
- Um `Switch` permite ativar/desativar o **Modo Demo**.
- Quando ativo, a aplicação utiliza dados simulados, permitindo que a interface seja testada e demonstrada sem uma conexão real com o backend.
- O estado é refletido em toda a aplicação através do `SettingsContext`.

---

## Relacionados

- **`SettingsContext`:** O contexto que provê o estado global para todas as configurações.
- **`useSettingsNavigation` Hook:** Gerencia a navegação interna da página.
- **Componentes de Seção:** A lógica de cada grupo de configuração está encapsulada em componentes dentro de `src/components/settings/`.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Criação da página de Configurações com layout de sidebar e conteúdo dinâmico.
- ✅ Implementação de mais de 10 categorias de configuração, incluindo Conexões, Dados, Aparência, Segurança e Integrações.
- ✅ Integração completa com o `SettingsContext` para gerenciamento de estado persistente.
- ✅ Desenvolvimento do fluxo de configuração do Spotify com assistente guiado.
- ✅ Documentação completa.
