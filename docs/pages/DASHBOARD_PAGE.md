
# Página: Dashboard

**Tipo:** Página da Aplicação
**Localização:** `src/pages/dashboards/Dashboard.tsx`
**Rota:** `/dashboard`
**Versão:** 1.0.0

---

## Descrição

A página de **Dashboard** é o principal centro de visualização de dados e monitoramento do sistema TSiJUKEBOX. Ela oferece uma visão geral e em tempo real do estado do sistema, estatísticas de reprodução e tendências de uso. A página foi projetada com um forte apelo visual, utilizando o `Design System` do modo Kiosk para criar uma experiência imersiva e informativa.

### Principais Seções:
- **Header:** Exibe o título da página, um botão para voltar, e estatísticas vitais do sistema em tempo real (CPU, Memória, Temperatura).
- **Gráfico de Uso do Sistema:** Um gráfico de área que mostra o uso de CPU, memória e a temperatura nas últimas 24 horas.
- **Distribuição de Gêneros:** Um gráfico de pizza que exibe a proporção dos gêneros musicais mais tocados.
- **Estatísticas de Reprodução:** Um gráfico de barras mostrando o número de músicas tocadas nos últimos 7 dias.
- **Atividade por Hora:** Um gráfico de linha que detalha os picos de atividade ao longo do dia.
- **Top Músicas:** Uma lista classificada das músicas mais populares do mês.

---

## Componentes Utilizados

- **`motion` (Framer Motion):** Usado para animar a entrada dos elementos da página, criando uma experiência de carregamento suave.
- **`Button`:** Componente de botão customizado para navegação e ações.
- **`Card`:** Componente base para todos os painéis de visualização de dados.
- **`LogoBrand`:** Exibe o logo centralizado no topo da página.
- **`Recharts`:** Biblioteca de gráficos usada para todas as visualizações de dados (AreaChart, BarChart, PieChart, LineChart).
- **`useStatus`:** Hook customizado para obter dados de status do sistema em tempo real (CPU, memória, etc.).
- **`useTranslation`:** Hook para internacionalização (i18n) dos textos.
- **`ComponentBoundary`:** Wrapper para `Suspense` e `ErrorBoundary`, exibindo uma mensagem de carregamento ou erro para cada painel.

---

## Visualização de Dados (Gráficos)

A página utiliza a biblioteca `Recharts` para renderizar gráficos interativos e responsivos.

### 1. Gráfico de Uso do Sistema (Últimas 24h)
- **Tipo:** `AreaChart`
- **Dados:** `cpu`, `memory`, `temp`.
- **Visual:** Três áreas sobrepostas com gradientes de cor distintos (Ciano para CPU, Roxo para Memória, Laranja para Temperatura) para fácil diferenciação.

### 2. Distribuição de Gêneros
- **Tipo:** `PieChart` (Gráfico de Pizza)
- **Dados:** `name` (nome do gênero), `value` (quantidade), `color` (cor para o segmento).
- **Visual:** Gráfico de pizza com um anel interno (`innerRadius`) e legendas de cores para cada gênero.

### 3. Estatísticas de Reprodução (Últimos 7 dias)
- **Tipo:** `BarChart` (Gráfico de Barras)
- **Dados:** `day` (dia da semana), `songs` (número de músicas).
- **Visual:** Gráfico de barras verticais com cantos arredondados.

### 4. Atividade por Hora
- **Tipo:** `LineChart` (Gráfico de Linha)
- **Dados:** `hour` (hora do dia), `activity` (nível de atividade).
- **Visual:** Gráfico de linha suave (`type="monotone"`) para mostrar a tendência de atividade ao longo do dia.

---

## Fonte de Dados

- **Dados em Tempo Real:** O hook `useStatus` é responsável por buscar os dados de status do sistema (CPU, memória, temperatura) em tempo real, provavelmente através de um WebSocket ou polling de uma API.
- **Dados de Gráficos:** Atualmente, os dados para os gráficos são gerados por funções de mock (`generateSystemData`, `generatePlaybackData`, etc.) dentro do componente. Em uma implementação de produção, esses dados seriam buscados de uma API de backend que processa os logs de reprodução e monitoramento.
- **Top Músicas:** Os dados das músicas mais tocadas também são mockados e seriam, em produção, provenientes de uma consulta ao banco de dados.

---

## Estrutura e Layout

- **Grid System:** A página utiliza o sistema de grid do Tailwind CSS (`grid-cols-12`) para organizar os cards de forma responsiva.
- **Estilo Kiosk:** A maior parte da estilização (cores, fundos, bordas) vem das variáveis de tema do modo Kiosk (`kiosk-bg`, `kiosk-text`, `gold-neon`, etc.).
- **Cards 3D:** Os cards utilizam um estilo customizado (`card-admin-extreme-3d`) que lhes confere uma aparência tridimensional e destacada.

---

## Relacionados

- **`useStatus` Hook:** Hook essencial para alimentar os dados de status em tempo real.
- **`Card` Component System:** Todos os painéis são construídos usando o sistema de cards.
- **Recharts Documentation:** Para mais detalhes sobre as opções de gráficos.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Criação da página de Dashboard com layout principal.
- ✅ Adição de 4 painéis de visualização de dados: Uso do Sistema, Distribuição de Gêneros, Estatísticas de Reprodução e Atividade por Hora.
- ✅ Adição da lista de Top Músicas.
- ✅ Integração com o hook `useStatus` para dados em tempo real.
- ✅ Implementação de animações com Framer Motion.
- ✅ Documentação completa.
