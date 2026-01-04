# Integração com Supabase

**Tipo:** Documentação de Integração
**Serviço:** Supabase
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX utiliza o **Supabase** como seu principal provedor de Backend-as-a-Service (BaaS). O Supabase oferece uma suíte de ferramentas de código aberto construída sobre o PostgreSQL, fornecendo uma alternativa poderosa e flexível ao Firebase.

No TSiJUKEBOX, o Supabase é usado para:

-   **Banco de Dados PostgreSQL:** Armazenamento de dados relacionais, como perfis de usuário, configurações, histórico de reprodução e logs.
-   **Autenticação:** Gerenciamento de usuários, incluindo login social (Google, GitHub) e autenticação por e-mail/senha.
-   **Edge Functions:** Execução de lógica de backend sem servidor (serverless) para tarefas como processamento de alertas e integração com outras APIs.
-   **Realtime:** Comunicação em tempo real usando WebSockets para funcionalidades como o controle remoto do modo Kiosk.

---

## 2. Configuração do Cliente Supabase

A conexão com o Supabase é gerenciada por um cliente centralizado, localizado em `src/integrations/supabase/client.ts`.

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // Tipos gerados automaticamente

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Variáveis de Ambiente:

-   `VITE_SUPABASE_URL`: A URL do seu projeto Supabase.
-   `VITE_SUPABASE_PUBLISHABLE_KEY`: A chave pública (anônima) do seu projeto Supabase.

Essas variáveis são carregadas a partir do arquivo `.env` e são essenciais para que o cliente possa se conectar ao backend correto.

### Geração de Tipos:

O TSiJUKEBOX utiliza a CLI do Supabase para gerar automaticamente os tipos TypeScript a partir do esquema do banco de dados. Isso garante segurança de tipos em todas as interações com o banco de dados.

```bash
# Comando para gerar os tipos
supabase gen types typescript --project-id <SEU_ID_PROJETO> > src/integrations/supabase/types.ts
```

---

## 3. Uso na Aplicação

Uma vez configurado, o cliente Supabase pode ser importado e utilizado em qualquer parte da aplicação (componentes, hooks, etc.) para interagir com o backend.

### Exemplo 1: Consultando Dados (Query)

```typescript
import { supabase } from '@/integrations/supabase/client';

async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return data;
}
```

### Exemplo 2: Invocando uma Edge Function

As Edge Functions são usadas para executar código de backend seguro.

```typescript
import { supabase } from '@/integrations/supabase/client';

async function sendTestAlert() {
  const { data, error } = await supabase.functions.invoke('alert-notifications', {
    body: {
      type: 'test',
      channel: 'discord',
      title: 'Teste de Alerta',
      message: 'Esta é uma mensagem de teste.'
    },
  });

  if (error) {
    console.error('Erro ao invocar a função:', error);
  }
}
```

### Exemplo 3: Assinando a Mudanças em Tempo Real (Realtime)

O Realtime é usado para funcionalidades que exigem atualizações instantâneas, como o controle remoto do modo Kiosk.

```typescript
import { supabase } from '@/integrations/supabase/client';

function KioskRemoteControl() {
  useEffect(() => {
    const channel = supabase
      .channel('kiosk-commands')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kiosk_commands' }, (payload) => {
        console.log('Novo comando recebido:', payload.new);
        // Executa o comando recebido
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ... resto do componente
}
```

---

## 4. Principais Casos de Uso no TSiJUKEBOX

-   **`AlertConfigSection.tsx`:** Utiliza `supabase.functions.invoke` para chamar a função `alert-notifications`, que envia alertas para serviços como Discord, Slack, etc.
-   **`JamAISuggestions.tsx`:** Invoca a Edge Function `analyze-jam` para obter sugestões de IA com base no estado atual de uma sessão "Jam".
-   **`KioskRemoteControl.tsx`:** Usa o `supabase.channel` para ouvir eventos em tempo real na tabela `kiosk_commands`, permitindo o controle remoto da interface do Kiosk.
-   **Autenticação:** O `AuthProvider` utiliza `supabase.auth` para gerenciar o login, logout e a sessão do usuário.
