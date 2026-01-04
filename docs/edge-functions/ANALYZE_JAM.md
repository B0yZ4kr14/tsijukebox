# Edge Function: analyze-jam

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `analyze-jam` utiliza inteligência artificial para analisar o conteúdo de uma sessão de música (Jam Session) e fornecer insights, como sugestões de músicas, análise de humor e recomendações de faixas similares. Ela se integra com um gateway de IA (Lovable AI) para processar as informações da fila de músicas.

### Funcionalidades Principais

- **Sugestão de Músicas:** Recomenda novas faixas com base no que já está na fila.
- **Análise de Humor:** Identifica o humor, energia e gêneros predominantes da sessão.
- **Recomendações de Similares:** Sugere músicas parecidas com a que está tocando no momento.

---

## 2. Endpoint

**Método:** `POST`

**Endpoint:** `/functions/v1/analyze-jam`

**Corpo da Requisição (JSON):**
```json
{
  "action": "suggest-tracks",
  "queue": [
    { "trackName": "Bohemian Rhapsody", "artistName": "Queen" },
    { "trackName": "Stairway to Heaven", "artistName": "Led Zeppelin" }
  ],
  "currentTrack": { "trackName": "Hotel California", "artistName": "Eagles" },
  "sessionName": "Rock Classics"
}
```

---

## 3. Ações Suportadas

| Ação | Descrição |
|---|---|
| `suggest-tracks` | Sugere 5 novas músicas com base na fila atual. |
| `analyze-mood` | Analisa o humor, energia e gêneros da sessão. |
| `get-similar` | Encontra 5 músicas similares à faixa atual. |

---

## 4. Variáveis de Ambiente

- `LOVABLE_API_KEY`: Chave de API para o gateway de IA Lovable.

---

## 5. Dependências

- `deno.land/std@0.168.0/http/server.ts`
- `deno.land/x/zod@v3.22.4/mod.ts`
