# Página: Wiki

**Tipo:** Página da Aplicação
**Localização:** `src/pages/public/Wiki.tsx`
**Rota:** `/wiki`
**Versão:** 1.0.0

---

## Descrição

A página da **Wiki** é a base de conhecimento centralizada do TSiJUKEBOX, funcionando como uma enciclopédia interna sobre todas as funcionalidades, guias técnicos e documentação do sistema. Ela foi projetada para ser uma ferramenta poderosa tanto para usuários finais quanto para desenvolvedores, oferecendo acesso rápido e organizado a uma vasta gama de informações.

### Principais Funcionalidades:
- **Navegação por Categorias:** Os artigos são organizados em categorias e subseções, permitindo uma exploração estruturada do conteúdo.
- **Busca de Artigos:** Um componente de busca (`WikiSearch`) permite encontrar artigos rapidamente por título.
- **Busca Global:** Integração com a busca global (`Ctrl+K`) para pesquisar em toda a Wiki e na página de Ajuda simultaneamente.
- **Favoritos (`Bookmarks`):** Os usuários podem marcar artigos como favoritos para acesso rápido.
- **Leitura Offline:** Suporte completo para salvar artigos para leitura offline, ideal para ambientes com conectividade limitada. A interface exibe o status offline e o espaço de armazenamento usado.
- **Exportação:** Permite exportar o conteúdo da Wiki para os formatos Markdown e HTML, além de oferecer uma opção de impressão para PDF.
- **Navegação por URL:** Permite o acesso direto a artigos específicos através de parâmetros na URL (ex: `/wiki?article=spotify-connect`).

---

## Estrutura e Componentes

A página é dividida em uma barra de navegação lateral e uma área de conteúdo principal, com um cabeçalho fixo que oferece acesso às principais ações.

### Componentes Principais:

- **`WikiNavigation`:** A barra lateral de navegação que exibe a estrutura de categorias e artigos. Ela destaca o artigo selecionado e indica quais artigos já foram lidos.
- **`WikiArticleView`:** O componente responsável por renderizar o conteúdo de um artigo selecionado. Ele inclui o título, a data de atualização, o conteúdo em Markdown e ações como favoritar e salvar para leitura offline.
- **`WikiSearch`:** Um campo de busca com autocompletar que permite aos usuários encontrar e selecionar artigos rapidamente.
- **`WelcomeScreen`:** A tela de boas-vindas exibida quando nenhum artigo ou categoria está selecionado, apresentando um resumo das categorias e links para artigos populares.
- **`CategoryOverview`:** Uma tela que exibe todos os artigos dentro de uma categoria selecionada.

### Hooks Utilizados:

- **`useWikiBookmarks`:** Gerencia a lógica de adicionar, remover e listar os artigos favoritados, persistindo os dados no `localStorage`.
- **`useReadArticles`:** Rastreia os artigos que o usuário já visualizou, também com persistência no `localStorage`.
- **`useWikiOffline`:** O hook mais complexo, responsável por toda a funcionalidade de leitura offline. Ele utiliza o `IndexedDB` para armazenar o conteúdo dos artigos, gerencia o espaço de armazenamento e fornece os artigos do cache quando a aplicação está offline.
- **`useGlobalSearch`:** Alimenta a funcionalidade de busca global (`Ctrl+K`).

---

## Funcionalidades Detalhadas

### Leitura Offline
- Ao clicar no botão "Salvar Offline" em um artigo, o hook `useWikiOffline` armazena o conteúdo do artigo no `IndexedDB`.
- Quando a aplicação detecta que está offline (usando `navigator.onLine`), o `Badge` "Offline" é exibido no cabeçalho.
- Ao tentar acessar um artigo, o sistema prioriza a versão salva no `IndexedDB` se ela existir e o modo offline estiver ativo.
- A interface também mostra quantos artigos estão salvos e o espaço total utilizado, com a opção de limpar todo o cache offline.

### Favoritos e Histórico de Leitura
- O sistema de favoritos (`useWikiBookmarks`) permite que os usuários criem uma lista de atalhos para os artigos que mais consultam.
- O histórico de leitura (`useReadArticles`) marca visualmente os artigos já lidos na navegação, ajudando o usuário a acompanhar seu progresso.

### Estrutura de Conteúdo (`wikiData`)
- Todo o conteúdo da Wiki (categorias, subseções e artigos) é importado do arquivo `src/components/wiki/wikiData.ts`. Esta abordagem centraliza o conteúdo, facilitando sua atualização e manutenção sem a necessidade de alterar a lógica da página.

---

## Relacionados

- **`wikiData.ts`:** A fonte de todo o conteúdo da Wiki.
- **Hooks:** `useWikiBookmarks`, `useReadArticles`, `useWikiOffline`.
- **`documentExporter` Library:** Módulo que fornece a funcionalidade de exportação.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Criação da página da Wiki com layout de 3 colunas (Navegação, Conteúdo, Ações).
- ✅ Implementação da navegação por categorias e visualização de artigos.
- ✅ Adição das funcionalidades de Favoritos e Histórico de Leitura.
- ✅ Desenvolvimento do robusto sistema de Leitura Offline com `IndexedDB`.
- ✅ Integração da Busca de Artigos e da Busca Global.
- ✅ Adição do menu de exportação para Markdown, HTML e Impressão.
- ✅ Documentação completa.
