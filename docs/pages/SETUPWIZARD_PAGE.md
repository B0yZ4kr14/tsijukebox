# Página: Assistente de Configuração (SetupWizard)

**Tipo:** Página da Aplicação
**Localização:** `src/pages/public/SetupWizard.tsx`
**Rota:** `/setup`
**Versão:** 1.0.0

---

## Descrição

O **Assistente de Configuração (SetupWizard)** é uma página interativa e gamificada projetada para guiar os usuários através do processo de configuração inicial do TSiJUKEBOX. Ele substitui um formulário de configurações tradicional por uma experiência passo a passo, onde cada etapa foca em um aspecto específico da configuração, como idioma, tema, acessibilidade e conexões.

### Principais Objetivos:
- **Simplificar a Configuração:** Tornar o processo de setup inicial menos intimidante e mais amigável.
- **Gamificação:** Introduzir um sistema de "conquistas" (achievements) para incentivar o usuário a completar todas as etapas.
- **Validação em Tempo Real:** Fornecer feedback instantâneo, como testar a conexão com o backend ou a API de clima, diretamente na interface.
- **Educar o Usuário:** Apresentar as principais opções de personalização de forma clara e visual.

---

## Estrutura e Componentes

A página é um componente de múltiplos passos que renderiza diferentes UIs com base no passo atual (`currentStep`).

### Componentes Principais:

- **`motion` (Framer Motion):** Usado extensivamente para animar a transição entre os passos, proporcionando uma experiência fluida.
- **Barra de Progresso:** Uma barra no topo da tela indica o progresso do usuário através do assistente.
- **Botões de Navegação:** Botões "Avançar" e "Voltar" para navegar entre os passos.
- **Componentes de Formulário:** Utiliza componentes de UI do projeto como `RadioGroup`, `Switch`, `Slider`, e `Input` para coletar as preferências do usuário.
- **`SettingsIllustration`:** Componentes de ilustração que representam visualmente a categoria de configuração de cada passo.

### Estrutura de Dados:

- **`steps`:** Um array que define cada passo do assistente, incluindo `id`, `title`, `description`, `icon`, e um `achievementId` opcional.
- **`achievements`:** Um array que define todas as conquistas possíveis, com `id`, `title`, `description`, `icon`, e um estado `unlocked`.
- **`wizardData` (Estado):** Um objeto de estado que armazena todas as configurações selecionadas pelo usuário ao longo do assistente.

---

## Funcionalidades Detalhadas

### Gamificação e Conquistas
- Ao completar um passo significativo (como escolher um tema ou configurar uma conexão), a função `unlockAchievement` é chamada.
- Uma notificação de "conquista desbloqueada" é exibida na tela por um curto período, com o título e o ícone da conquista.
- Isso cria um ciclo de feedback positivo, motivando o usuário a prosseguir.

### Passos do Assistente

1.  **Boas-vindas:** Tela inicial.
2.  **Idioma:** Seleção de idioma (Português, Inglês, Espanhol).
3.  **Tema:** Escolha da cor principal do tema.
4.  **Acessibilidade:** Ajustes de alto contraste e tamanho da fonte.
5.  **Conexão com Servidor:** Configuração da URL do backend e opção de usar o Modo Demo.
6.  **Provedor de Música:** Escolha entre Spotify, Spicetify, YouTube Music ou arquivos locais.
7.  **Spotify:** Inserção das credenciais do Spotify (Client ID e Secret).
8.  **Widget de Clima:** Configuração da chave da API do OpenWeatherMap e da cidade.
9.  **Conclusão:** Tela final que resume as conquistas e finaliza o setup.

### Validação em Tempo Real
- **Teste de Backend:** No passo de configuração do servidor, um botão "Testar Conexão" faz uma requisição `fetch` para o endpoint `/status` da API. O resultado (sucesso ou erro) é exibido visualmente.
- **Teste de API de Clima:** Da mesma forma, no passo de configuração do clima, um botão testa a chave da API e a cidade fornecidas contra a API do OpenWeatherMap.

### Finalização do Setup (`completeSetup`)
- Ao final do assistente, a função `completeSetup` é executada.
- Ela pega todos os dados do estado `wizardData` e os salva no `localStorage` usando as chaves apropriadas (ex: `STORAGE_KEYS.ACCESSIBILITY`, `spotify_client_id`).
- Marca o setup como concluído no `localStorage` para que o assistente não seja exibido novamente.
- Redireciona o usuário para a página principal (`/`).

---

## Relacionados

- **`useSettings` (Context Hook):** O assistente utiliza este hook para aplicar as configurações salvas no estado global da aplicação.
- **`localStorage`:** O principal meio de persistência para as configurações definidas no assistente.
- **`toast` (Sonner):** Usado para exibir notificações de sucesso ou erro durante os testes de conexão e ao desbloquear conquistas.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Criação do Assistente de Configuração com 9 passos.
- ✅ Implementação do sistema de gamificação com conquistas.
- ✅ Adição de validação em tempo real para conexões de backend e API de clima.
- ✅ Integração com o `SettingsContext` para persistir as configurações.
- ✅ Design visual polido com ilustrações e animações.
- ✅ Documentação completa.
