# Página: Ajuda (Help)

**Tipo:** Página da Aplicação
**Localização:** `src/pages/public/Help.tsx`
**Rota:** `/help`
**Versão:** 1.0.0

---

## Descrição

A página de **Ajuda** é uma central de autoatendimento completa para os usuários do TSiJUKEBOX. Ela foi projetada para ser um guia abrangente, cobrindo desde os primeiros passos e funcionalidades básicas até a solução de problemas comuns (FAQ). A página é interativa, pesquisável e organizada em seções temáticas para facilitar a localização da informação.

### Principais Objetivos:
- **Educar o Usuário:** Fornecer guias claros sobre como usar a aplicação.
- **Resolver Dúvidas:** Oferecer respostas rápidas para perguntas frequentes.
- **Solucionar Problemas:** Apresentar passos detalhados para diagnosticar e resolver problemas técnicos comuns.
- **Centralizar Recursos:** Agrupar informações sobre atalhos, gestos, configurações e recursos de download em um único local.

---

## Estrutura e Componentes

A página é construída em torno de uma estrutura de seções e itens de ajuda, renderizados de forma interativa.

### Componentes Principais:

- **`Accordion`:** O principal componente da UI, usado para agrupar as perguntas e respostas. Cada seção de ajuda é um `Accordion` que pode ser expandido ou recolhido.
- **`Input` de Busca:** Uma barra de pesquisa no topo permite que os usuários filtrem o conteúdo da página em tempo real, exibindo apenas as seções e perguntas que correspondem ao termo pesquisado.
- **`ScrollArea`:** Garante que a lista de seções e o conteúdo principal sejam roláveis de forma independente e suave.
- **`BackButton`:** Um botão para retornar à página anterior, utilizando o hook `useBackNavigation`.
- **Menu de Exportação (`DropdownMenu`):** Permite ao usuário baixar o conteúdo completo da página de ajuda nos formatos Markdown (`.md`) ou HTML (`.html`), ou imprimir diretamente.
- **`GlobalSearchModal`:** A página também integra a busca global da aplicação, que pode ser ativada para pesquisas mais amplas.

### Estrutura de Dados (`helpSections`):

A fonte de todo o conteúdo da página é um array estático chamado `helpSections`. Cada objeto neste array representa uma seção (ex: "Primeiros Passos", "Spotify", "FAQ") e contém:
- `id`: Identificador único.
- `title`: Título da seção.
- `icon`: Ícone representativo.
- `items`: Um array de objetos `HelpItem`, onde cada item contém:
  - `id`: Identificador único.
  - `question`: A pergunta do usuário.
  - `answer`: A resposta detalhada.
  - `steps` (opcional): Uma lista de passos para guias tutoriais.
  - `tips` (opcional): Dicas adicionais.

---

## Funcionalidades Chave

### Busca Interativa
- A funcionalidade de busca filtra o array `helpSections` com base no termo digitado pelo usuário.
- A busca é *case-insensitive* e verifica o termo na `pergunta`, `resposta`, `steps` e `tips` de cada item.
- O resultado é memorizado com `useMemo` para otimizar a performance da renderização durante a digitação.

### Navegação e Acessibilidade
- O usuário pode navegar diretamente para uma seção ou pergunta específica usando parâmetros de URL (ex: `/help?section=faq&item=faq-no-sound`). A página rola automaticamente para o item selecionado.
- O uso de `Accordion` permite que os usuários foquem apenas no conteúdo que lhes interessa, evitando poluição visual.

### Exportação de Documentos
- Utiliza as funções `downloadMarkdown`, `downloadHTML`, e `printDocument` do módulo `documentExporter`.
- O conteúdo do array `helpSections` é formatado dinamicamente para os diferentes formatos antes do download, garantindo que o arquivo exportado seja uma representação fiel e bem estruturada da página.

### Modo de Teste Interativo
- A página inclui um componente `InteractiveTestMode`, que provavelmente é usado para fins de diagnóstico ou demonstração, permitindo testar certas funcionalidades em um ambiente controlado.

---

## Relacionados

- **`useGlobalSearch` e `useBackNavigation` Hooks:** Hooks utilizados para a navegação e busca global.
- **`documentExporter` Library:** Módulo responsável pela lógica de exportação de conteúdo.
- **Componentes UI (Shadcn/ui):** `Accordion`, `Input`, `ScrollArea`, `DropdownMenu` são a base da interface.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Criação da página de Ajuda com estrutura de seções e FAQ.
- ✅ Implementação da funcionalidade de busca em tempo real.
- ✅ Adição do menu de exportação para Markdown, HTML e impressão.
- ✅ Integração com navegação por parâmetros de URL para acesso direto a perguntas.
- ✅ Conteúdo abrangente cobrindo mais de 10 seções e 30+ perguntas frequentes.
- ✅ Documentação completa.
