# Integração com Grafana

**Tipo:** Documentação de Integração
**Serviço:** Grafana
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX se integra com o **Grafana** para fornecer visualizações ricas e em tempo real das métricas de performance do sistema. Em vez de reinventar a roda, o TSiJUKEBOX incorpora painéis do Grafana diretamente em sua interface de Dashboard, aproveitando o poder e a flexibilidade da plataforma de monitoramento líder do setor.

Esta integração permite que os administradores visualizem dados como:

-   Uso de CPU
-   Consumo de Memória
-   Temperatura do Sistema
-   Uso de Rede
-   Estatísticas de Reprodução

---

## 2. Arquitetura da Integração

A integração é surpreendentemente simples e robusta, baseada no recurso de "embedding" (incorporação) do Grafana.

1.  **Coleta de Métricas (Prometheus):** Um exportador de métricas (geralmente um serviço customizado ou um `node_exporter`) expõe os dados de performance do sistema no formato do Prometheus. O servidor Prometheus, por sua vez, coleta e armazena essas métricas em seu banco de dados de séries temporais.

2.  **Fonte de Dados no Grafana:** O Grafana é configurado para usar o Prometheus como uma fonte de dados (`datasource`).

3.  **Criação de Dashboards:** No Grafana, são criados dashboards com painéis que consultam e visualizam as métricas do Prometheus. Por exemplo, um painel pode exibir um gráfico do uso de CPU ao longo do tempo.

4.  **Incorporação no TSiJUKEBOX:** O TSiJUKEBOX utiliza `iframes` para incorporar painéis específicos desses dashboards diretamente em sua própria página de Dashboard. O Grafana permite gerar URLs de incorporação para painéis individuais, sem a necessidade de exibir a interface completa do Grafana.

### Vantagens desta Abordagem:

-   **Flexibilidade:** Permite que os administradores personalizem os dashboards no Grafana sem precisar alterar o código do TSiJUKEBOX.
-   **Performance:** A renderização dos gráficos e a consulta dos dados são totalmente gerenciadas pelo Grafana, que é otimizado para essa tarefa.
-   **Manutenção:** Separa as preocupações de monitoramento da lógica principal da aplicação.

---

## 3. Configuração

### No Grafana:

1.  **Habilitar a Incorporação Anônima:** Para que os painéis possam ser exibidos no TSiJUKEBOX sem que o usuário precise fazer login no Grafana, a incorporação anônima deve ser habilitada no arquivo de configuração do Grafana (`grafana.ini`).

    ```ini
    [auth.anonymous]
    # Habilita o acesso anônimo
    enabled = true

    [security]
    # Permite a incorporação de painéis em iframes
    allow_embedding = true
    ```

2.  **Obter a URL de Incorporação:**
    -   No Grafana, abra o painel que você deseja incorporar.
    -   Clique no título do painel e selecione **Share**.
    -   Vá para a aba **Embed**.
    -   Copie a URL fornecida no `src` do `iframe`. Esta é a URL que será usada no TSiJUKEBOX.

### No TSiJUKEBOX:

As URLs de incorporação dos painéis do Grafana são configuradas no código-fonte do componente do Dashboard. Idealmente, elas podem ser externalizadas para um arquivo de configuração para facilitar a personalização.

```tsx
// Exemplo de como um painel do Grafana é renderizado no Dashboard.tsx

const grafanaCpuPanelUrl = "http://localhost:3000/d-solo/abcdefg/system-metrics?orgId=1&panelId=2&theme=dark";

function CpuUsagePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de CPU</CardTitle>
      </CardHeader>
      <CardContent>
        <iframe
          src={grafanaCpuPanelUrl}
          width="100%"
          height="200"
          frameBorder="0"
        ></iframe>
      </CardContent>
    </Card>
  );
}
```

---

## 4. Interação via API (Opcional)

Embora a principal forma de integração seja via `iframes`, o TSiJUKEBOX também pode interagir com a **API REST do Grafana** para tarefas administrativas, como:

-   **Provisionamento Automático:** Criar fontes de dados e dashboards programaticamente durante a instalação inicial do TSiJUKEBOX.
-   **Gerenciamento de Usuários:** Sincronizar usuários entre o TSiJUKEBOX e o Grafana.

Para usar a API, é necessário gerar uma **Chave de API (API Key)** no Grafana com permissões de Administrador e configurar o TSiJUKEBOX para usá-la nas requisições.

### Exemplo de Requisição (Provisionando um Dashboard):

```bash
curl -X POST -H "Content-Type: application/json" \
     -H "Authorization: Bearer <SUA_API_KEY>" \
     -d @dashboard.json \
     http://localhost:3000/api/dashboards/db
```

Onde `dashboard.json` é um arquivo contendo a definição completa do dashboard no formato JSON do Grafana.
