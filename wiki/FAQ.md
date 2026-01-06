# FAQ - Perguntas Frequentes

**Respostas rápidas para as dúvidas mais comuns sobre o TSiJUKEBOX**

---

## 📋 Índice

- [Geral](#geral)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Integrações](#integrações)
- [Problemas Técnicos](#problemas-técnicos)
- [Desenvolvimento](#desenvolvimento)

---

## Geral

### O que é o TSiJUKEBOX?
O TSiJUKEBOX é um sistema completo de jukebox digital com suporte a múltiplas fontes de música (Spotify, YouTube Music, arquivos locais), modo karaokê com letras sincronizadas, controle por voz e interface kiosk para festas e eventos.

### É gratuito?
Sim! O TSiJUKEBOX é totalmente gratuito e open source sob a licença MIT. Você pode usá-lo, modificá-lo e distribuí-lo livremente.

### Quais sistemas operacionais são suportados?
Oficialmente suportamos Linux (Arch, CachyOS, Manjaro, EndeavourOS, Garuda). O sistema também pode funcionar em Windows e macOS, mas com suporte limitado.

### Preciso de uma conta Spotify Premium?
Para usar a integração com Spotify, sim. A API do Spotify requer uma conta Premium para reprodução de músicas. Alternativamente, você pode usar YouTube Music ou arquivos locais.

### Posso usar sem internet?
Sim! O modo offline permite reproduzir músicas de arquivos locais e acessar a Wiki offline. No entanto, as integrações com Spotify e YouTube Music requerem conexão à internet.

---

## Instalação

### Como instalar o TSiJUKEBOX?
Use o script de instalação com um comando:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/scripts/install.sh | bash
```
Consulte o [Guia de Início Rápido](Quick-Start-Guide.md) para mais detalhes.

### Qual é o tamanho da instalação?
A instalação completa ocupa aproximadamente 500MB-1GB, incluindo todas as dependências.

### Posso instalar em um Raspberry Pi?
Tecnicamente sim, mas o desempenho pode ser limitado dependendo do modelo. Recomendamos Raspberry Pi 4 com pelo menos 4GB de RAM.

### Como atualizar para a versão mais recente?
```bash
cd tsijukebox
git pull origin main
npm install
npm run build
```

### Como desinstalar?
```bash
cd tsijukebox
npm run uninstall
# ou manualmente:
rm -rf ~/tsijukebox
```

---

## Configuração

### Onde ficam os arquivos de configuração?
- **Configuração principal:** `.env` na raiz do projeto
- **Banco de dados:** `data/` (SQLite) ou configurado externamente
- **Cache:** `~/.cache/tsijukebox/`
- **Logs:** `logs/`

### Como alterar o idioma?
Acesse **Configurações** → **Geral** → **Idioma** e selecione seu idioma preferido (Português, Inglês, Espanhol).

### Como mudar o tema?
Acesse **Configurações** → **Aparência** → **Tema** e escolha entre Escuro, Claro ou Auto (segue o sistema).

### Posso personalizar as cores?
Sim! Acesse **Configurações** → **Aparência** → **Cores Personalizadas** para definir cores primárias, secundárias e de destaque.

### Como configurar o banco de dados?
Durante o Setup Wizard, escolha:
- **SQLite** (padrão): Sem configuração necessária
- **MariaDB/MySQL**: Forneça host, porta, usuário e senha
- **PostgreSQL**: Similar ao MariaDB
- **Firebird**: Forneça o caminho do banco de dados

Consulte [Config-Database.md](Config-Database.md) para detalhes.

---

## Uso

### Como adicionar músicas à fila?
1. Busque a música
2. Clique no ícone ➕ ou
3. Arraste a música para a fila
4. Ou clique com o botão direito → "Adicionar à fila"

### Como criar uma playlist?
1. Acesse **Playlists** no menu lateral
2. Clique em "+ Nova Playlist"
3. Dê um nome e adicione músicas
4. Salve

### Como usar o modo karaokê?
1. Reproduza uma música
2. Clique no ícone 🎤 no player
3. As letras sincronizadas aparecerão (se disponíveis)
4. Ajuste tamanho e posição nas configurações

Consulte [Tutorial-Karaoke-Mode.md](Tutorial-Karaoke-Mode.md) para guia completo.

### Como funciona o controle por voz?
1. Ative o controle por voz em **Configurações**
2. Clique no ícone do microfone ou pressione `Ctrl + Shift + V`
3. Diga comandos como:
   - "Reproduzir [nome da música]"
   - "Parar"
   - "Próxima"
   - "Volume para 70%"

### Como usar o modo kiosk?
1. Pressione `F11` ou clique em "Modo Kiosk"
2. A interface mudará para tela cheia
3. Ideal para festas e eventos
4. Pressione `Esc` para sair

---

## Integrações

### Como conectar ao Spotify?
1. Crie uma aplicação no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Copie Client ID e Client Secret
3. Acesse **Configurações** → **Integrações** → **Spotify**
4. Cole as credenciais e faça login

Consulte [Tutorial-Spotify-Integration.md](Tutorial-Spotify-Integration.md).

### Como conectar ao YouTube Music?
1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Ative a YouTube Data API v3
3. Gere credenciais OAuth 2.0
4. Configure no TSiJUKEBOX

Consulte [Tutorial-YouTube-Music.md](Tutorial-YouTube-Music.md).

### Como adicionar músicas locais?
1. Acesse **Configurações** → **Integrações** → **Arquivos Locais**
2. Clique em "Adicionar Pasta"
3. Selecione a pasta com suas músicas
4. O sistema escaneará automaticamente (MP3, FLAC, WAV, OGG, M4A)

### As integrações funcionam simultaneamente?
Sim! Você pode ter Spotify, YouTube Music e arquivos locais configurados ao mesmo tempo e alternar entre eles.

### Como fazer backup das minhas playlists?
1. Acesse **Configurações** → **Backup**
2. Escolha um provedor de cloud (Google Drive, OneDrive, Dropbox, MEGA, Storj)
3. Configure as credenciais
4. Ative backup automático

Consulte [Config-Cloud-Backup.md](Config-Cloud-Backup.md).

---

## Problemas Técnicos

### A música não toca
**Possíveis soluções:**
- Verifique sua conexão com a internet
- Certifique-se de que o navegador tem permissão para reproduzir áudio
- Tente atualizar a página (F5)
- Limpe o cache do navegador
- Verifique se as credenciais da API não expiraram

### Erro "Failed to fetch"
**Solução:**
- Problema de CORS. Verifique se o backend está rodando
- Confirme que a URL da API está correta em `.env`
- Reinicie o servidor

### O karaokê não mostra letras
**Solução:**
- Nem todas as músicas têm letras sincronizadas disponíveis
- Verifique se o modo karaokê está ativado
- Tente outra música

### Alto consumo de memória
**Solução:**
- Reduza a qualidade de áudio em **Configurações**
- Limpe o cache: **Configurações** → **Avançado** → **Limpar Cache**
- Reduza o tamanho da fila de reprodução
- Feche outras abas do navegador

### Erro de autenticação Spotify/YouTube
**Solução:**
- Verifique se Client ID e Client Secret estão corretos
- Certifique-se de que a URL de callback está configurada corretamente
- Faça logout e login novamente
- Gere novas credenciais se necessário

### O banco de dados está travando
**Solução:**
- Se usando SQLite, considere migrar para MariaDB ou PostgreSQL
- Execute `npm run db:optimize` para otimizar
- Verifique espaço em disco disponível
- Consulte os logs em `logs/database.log`

---

## Desenvolvimento

### Como contribuir com o projeto?
Consulte nosso [Guia de Contribuição](Dev-Contributing.md). Resumo:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commits claros e descritivos
4. Abra um Pull Request
5. Aguarde review

### Como configurar o ambiente de desenvolvimento?
```bash
git clone https://github.com/B0yZ4kr14/tsijukebox.git
cd tsijukebox
npm install
cp .env.example .env
npm run dev
```

Consulte [Getting Started (Dev)](../guides/GETTING_STARTED_DEV.md).

### Como rodar os testes?
```bash
npm test              # Todos os testes
npm run test:unit     # Testes unitários
npm run test:e2e      # Testes E2E
npm run test:coverage # Com relatório de cobertura
```

### Qual stack tecnológica é usada?
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Edge Functions)
- **Estado:** React Query, Context API
- **Testes:** Vitest, Playwright
- **Build:** Vite, ESBuild

### Como reportar bugs?
1. Verifique se o bug já não foi reportado em [Issues](https://github.com/B0yZ4kr14/tsijukebox/issues)
2. Abra uma nova issue usando o template
3. Forneça:
   - Descrição detalhada
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Logs de erro

### Posso criar plugins/extensões?
Sim! O TSiJUKEBOX tem um sistema de plugins. Consulte [PLUGINS.md](../PLUGINS.md) para documentação completa.

---

## 🔍 Não Encontrou Sua Resposta?

- **Documentação Completa:** [Wiki Principal](Home.md)
- **Troubleshooting:** [Guia de Resolução de Problemas](../TROUBLESHOOTING.md)
- **Suporte da Comunidade:** [GitHub Discussions](https://github.com/B0yZ4kr14/tsijukebox/discussions)
- **Reportar Problema:** [GitHub Issues](https://github.com/B0yZ4kr14/tsijukebox/issues)
- **Email:** suporte@tsijukebox.com

---

**Última atualização:** 04/01/2026  
**Versão:** 1.0.0

Tem uma pergunta que não está aqui? [Sugira uma adição ao FAQ](https://github.com/B0yZ4kr14/tsijukebox/issues/new?labels=documentation&template=faq-suggestion.md)!
