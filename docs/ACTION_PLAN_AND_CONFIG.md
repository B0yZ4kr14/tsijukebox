# Plano de Ação e Recomendações Técnicas - TSiJUKEBOX

**Data:** 2025-12-25
**Autor:** Manus AI

---

Este documento detalha as ações recomendadas para aumentar a estabilidade, segurança e prontidão para produção do projeto TSiJUKEBOX, com base no relatório de validação gerado anteriormente.

## 1. As 5 Principais Correções de Erros TypeScript

Com base na análise dos 1.239 erros de tipo, a correção dos seguintes 5 tipos de erro terá o maior impacto positivo na estabilidade e manutenibilidade do sistema. Eles representam a maioria dos problemas críticos e de configuração.

| Prioridade | Categoria do Erro | Código | Ocorrências | Impacto e Recomendação |
|:---:|---|---|:---:|---|
| **1** | **Tipos de Teste Ausentes** | `TS2339` | ~300 | **Crítico.** Erros como `Property 'toBeInTheDocument' does not exist` indicam que os tipos para a biblioteca de asserção de testes (provavelmente `vitest` ou `jest-dom`) não estão configurados. Sem isso, os testes não são confiáveis. **Ação:** Instalar e configurar `@testing-library/jest-dom` e garantir que `tsconfig.json` inclua os tipos corretos para testes. |
| **2** | **Tipos de Props Inválidos** | `TS2322` | ~100 | **Alto.** Erros como `Type '"secondary"' is not assignable to type '"outline" | ...'` em componentes de UI (`Button`, `Badge`, etc.) podem causar falhas visuais ou de comportamento em tempo de execução. **Ação:** Revisar as `variants` de todos os componentes de UI e garantir que os tipos exportados correspondam aos valores usados. |
| **3** | **Componentes Não Encontrados** | `TS2304` | ~120 | **Alto.** Erros como `Cannot find name 'Switch'` ou `'Card'` indicam que componentes básicos não estão sendo importados ou declarados corretamente. Isso quebra a renderização. **Ação:** Verificar se todos os componentes de UI (`Button`, `Card`, `Switch`, `Badge`, etc.) estão sendo importados de seus respectivos arquivos (ex: `src/components/ui/button`). |
| **4** | **Módulos de Teste Ausentes** | `TS2307` | ~55 | **Médio.** `Cannot find module '@testing-library/react'` impede a execução de uma suíte inteira de testes de componentes. **Ação:** Instalar `@testing-library/react` e `@types/testing-library__react` como dependências de desenvolvimento. |
| **5** | **Tipagem Implícita (`any`)** | `TS7006` / `TS7031` | ~30 | **Médio.** Parâmetros e variáveis com tipo `any` implícito reduzem a segurança de tipo do TypeScript. **Ação:** Adicionar tipos explícitos a todos os parâmetros de função e variáveis, especialmente em loops (`.map(v => ...)` deve ser `.map((v: Type) => ...)`). |

---

## 2. Plano de Ação para Atualização do Vite e Correção de Vulnerabilidade

Foi identificada uma vulnerabilidade de segurança moderada na dependência `esbuild`, que é utilizada pelo `vite`. O plano para corrigir isso envolve a atualização do `vite` para a versão mais recente, que já inclui a versão corrigida do `esbuild`.

**Versão Atual do Vite:** `^5.4.1`
**Versão Recomendada do Vite:** `^7.3.0` (ou a mais recente disponível)

| Passo | Ação | Comando | Verificação |
|:---:|---|---|---|
| **1** | **Criar Branch de Segurança** | `git checkout -b feat/update-vite-security` | `git branch --show-current` deve retornar `feat/update-vite-security`. |
| **2** | **Atualizar o Vite** | `pnpm up vite` | O `package.json` deve mostrar a nova versão do `vite`. |
| **3** | **Verificar `esbuild`** | `pnpm list esbuild` | A versão do `esbuild` deve ser `>= 0.25.0`. |
| **4** | **Limpar Dependências** | `rm -rf node_modules && pnpm install` | A pasta `node_modules` deve ser recriada com as novas versões. |
| **5** | **Executar Build** | `pnpm build` | O build deve ser concluído sem erros relacionados à nova versão do Vite. |
| **6** | **Executar Testes** | `pnpm lint && pnpm test` | Todos os linters e testes devem passar. Corrigir quaisquer *breaking changes* introduzidos pela atualização. |
| **7** | **Merge e Deploy** | `git add . && git commit -m "feat: update vite to v7.3.0" && git push` | Após a aprovação do Pull Request, fazer o merge para a branch principal. |

---

## 3. Configuração do Nginx com Fallback para SPA

Para que uma Single Page Application (SPA) como o TSiJukebox funcione corretamente em produção, o servidor web precisa ser configurado para redirecionar todas as solicitações de rota para o arquivo `index.html` principal. Isso permite que o React Router gerencie o roteamento no lado do cliente.

Abaixo está um exemplo de configuração de um `server block` do Nginx para este propósito.

**Arquivo de Configuração:** `/etc/nginx/sites-available/tsijukebox`

```nginx
server {
    # Porta em que o servidor irá escutar
    listen 80;
    # Domínio do seu site
    server_name tsijukebox.seu-dominio.com;

    # Raiz do projeto, onde o build do Vite foi gerado
    root /home/ubuntu/tsijukebox/dist;

    # Arquivo principal a ser servido
    index index.html;

    # Bloco principal para o fallback da SPA
    location / {
        # Tenta servir o arquivo solicitado ($uri), depois um diretório ($uri/),
        # e se ambos falharem, serve o /index.html como fallback.
        try_files $uri $uri/ /index.html;
    }

    # Opcional: Otimização de cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Opcional: Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### Passos para Aplicar a Configuração:

1.  **Criar o arquivo:** `sudo nano /etc/nginx/sites-available/tsijukebox`
2.  **Colar o conteúdo** acima e ajustar `server_name` e `root`.
3.  **Criar um link simbólico** para habilitar o site: `sudo ln -s /etc/nginx/sites-available/tsijukebox /etc/nginx/sites-enabled/`
4.  **Testar a configuração** do Nginx: `sudo nginx -t`
5.  **Reiniciar o Nginx** para aplicar as alterações: `sudo systemctl restart nginx`
