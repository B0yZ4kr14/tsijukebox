# Integração com Webhooks do Discord

**Tipo:** Documentação de Integração
**Serviço:** Discord
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX pode se integrar com o Discord para enviar notificações de alerta em tempo real para um canal de sua escolha. Essa integração é feita através de **Webhooks do Discord**, que é uma maneira simples de postar mensagens de aplicações externas em um canal do Discord.

Essa funcionalidade é útil para administradores de sistema e equipes de DevOps que desejam ser notificados instantaneamente sobre eventos críticos do sistema, como altas taxas de erro, falhas de serviço ou outros alertas configurados.

---

## 2. Como Funciona

A integração é gerenciada pela seção de **Configuração de Alertas** (`AlertConfigSection.tsx`) na interface do TSiJUKEBOX e processada por uma **Edge Function** da Supabase chamada `alert-notifications`.

### Fluxo de Notificação:

1.  **Evento de Alerta:** Um evento no sistema (ex: monitor de saúde detecta uma falha) dispara uma chamada para a Edge Function `alert-notifications`.
2.  **Chamada da Edge Function:** A função é invocada com um payload contendo os detalhes do alerta (título, mensagem, severidade) e o canal de destino (neste caso, `discord`).
3.  **Configuração do Webhook:** A Edge Function busca a URL do Webhook do Discord que foi salva nas configurações do TSiJUKEBOX.
4.  **Requisição POST:** A função formata os dados do alerta em uma estrutura de `embed` do Discord e faz uma requisição `POST` para a URL do Webhook.
5.  **Mensagem no Discord:** O Discord recebe a requisição e posta a mensagem formatada no canal configurado.

---

## 3. Configuração no TSiJUKEBOX

Configurar a integração é um processo direto na página de configurações de alertas.

1.  **Crie um Webhook no Discord:**
    -   Vá para as **Configurações do Servidor** no seu servidor do Discord.
    -   Acesse a aba **Integrações**.
    -   Clique em **"Criar Webhook"**.
    -   Dê um nome ao webhook (ex: "Alertas TSiJUKEBOX"), escolha o canal para onde as mensagens serão enviadas e copie a **URL do Webhook**.

2.  **Configure no TSiJUKEBOX:**
    -   Navegue até **Configurações > Alertas**.
    -   Na aba **"Mensageria"**, encontre o card do Discord.
    -   **Ative** a chave (switch) para habilitar a integração.
    -   **Cole a URL do Webhook** que você copiou do Discord no campo correspondente.
    -   Clique no botão **"Testar"** para enviar uma mensagem de teste e verificar se a integração está funcionando.
    -   **Salve** as configurações.

<div align="center">
  <img src="../../public/screenshots/preview-discord-webhook-setup.png" alt="Configuração do Webhook do Discord" width="700">
  <p><em>Interface de configuração do canal de alertas do Discord.</em></p>
</div>

---

## 4. Formato da Mensagem de Alerta

As mensagens enviadas para o Discord são formatadas como "embeds" para uma melhor visualização, contendo as seguintes informações:

-   **Cor da Borda:** Varia de acordo com a severidade do alerta (ex: vermelho para crítico, amarelo para aviso).
-   **Título:** O título do alerta (ex: "Falha no Serviço de Player").
-   **Mensagem:** Uma descrição detalhada do evento que causou o alerta.
-   **Metadados:** Campos adicionais como a hora do evento, o serviço afetado e a severidade.

### Exemplo de Payload para o Webhook:

```json
{
  "embeds": [
    {
      "title": "🚨 Alerta Crítico: Serviço Offline",
      "description": "O serviço de reprodução principal (PlayerService) não está respondendo.",
      "color": 15158332,
      "fields": [
        {
          "name": "Serviço",
          "value": "PlayerService",
          "inline": true
        },
        {
          "name": "Severidade",
          "value": "Crítica",
          "inline": true
        }
      ],
      "timestamp": "2024-12-25T12:00:00.000Z"
    }
  ]
}
```

---

## 5. Segurança

-   **Proteja sua URL de Webhook:** A URL do Webhook é uma informação sensível. Qualquer pessoa com acesso a ela pode postar mensagens no seu canal. Não a exponha publicamente no código do frontend.
-   **Armazenamento:** A URL é salva no `localStorage` do navegador do administrador que a configura e deve ser gerenciada com cuidado.
-   **Validação na Edge Function:** A Edge Function pode incluir validações para garantir que apenas requisições legítimas do TSiJUKEBOX possam disparar alertas.
