# 🎧 Tutorial: Integração Spotify

Guia completo para configurar e usar a integração do Spotify com o TSiJUKEBOX.

---

## 📋 Requisitos

- Conta Spotify **Premium** (obrigatório para controle de reprodução)
- Navegador com suporte a pop-ups habilitado
- Conexão com internet

---

## 🧙 Configuração Guiada (Recomendado)

O TSiJUKEBOX oferece um **assistente guiado** para configurar o Spotify:

1. Acesse **Configurações > Integrações de Música > Spotify**
2. Clique em **"Configurar com Assistente Guiado"**
3. Siga os 5 passos do wizard:
   - Introdução
   - Acessar Developer Dashboard
   - Criar Aplicativo
   - Configurar Redirect URI
   - Copiar Credenciais
4. Ao finalizar, clique em **"Conectar com Spotify"**

---

## 🔗 Conectando sua Conta (Manual)

![Spotify Integration](../assets/mockups/spotify-integration-screen.png)

*Tela de gerenciamento da integração Spotify com status, permissões e playlists sincronizadas*

### Passo 1: Acessar Configurações

1. Navegue até **Configurações** (ícone de engrenagem)
2. Selecione **Integrações de Música**
3. Localize a seção **Spotify**

### Passo 2: Autorização OAuth

1. Clique no botão **Conectar ao Spotify**
2. Uma nova janela/popup abrirá
3. Faça login na sua conta Spotify
4. Clique em **Concordo** para autorizar o TSiJUKEBOX
5. A janela fechará automaticamente

### Passo 3: Verificar Conexão

Após autorização:
- Seu nome de usuário aparecerá na seção Spotify
- O ícone de status ficará verde
- Você pode desconectar a qualquer momento

### Passo 3: Verificar Conexão

Após autorização:
- Seu nome de usuário aparecerá na seção Spotify
- O ícone de status ficará verde
- Você pode desconectar a qualquer momento

---

## 🎵 Usando o Spotify

### Navegação

O TSiJUKEBOX oferece várias formas de navegar no Spotify:

#### Browser (`/spotify`)
- **Suas Playlists**: Acesse todas as suas playlists
- **Curtidas**: Músicas que você salvou
- **Recentes**: Histórico de reprodução
- **Descobertas**: Recomendações personalizadas

#### Busca (`/spotify/search`)
- Pesquise por artistas, álbuns, músicas ou playlists
- Use filtros para refinar resultados
- Acesse perfis de artistas

#### Biblioteca (`/spotify/library`)
- Álbuns salvos
- Artistas seguidos
- Podcasts (se houver)

### Reprodução

#### Adicionar à Fila
- Clique no ícone ▶️ em qualquer faixa
- A música será adicionada à fila de reprodução
- Arraste para reordenar

#### Controles de Reprodução
- **Play/Pause**: Barra de espaço ou botão central
- **Próxima**: Seta direita ou botão →
- **Anterior**: Seta esquerda ou botão ←
- **Volume**: Slider ou teclas + / -
- **Shuffle**: Ícone de embaralhar
- **Repeat**: Um, todos ou desligado

#### Spotify Connect
O TSiJUKEBOX usa Spotify Connect, permitindo:
- Controlar reprodução em outros dispositivos
- Transferir reprodução entre dispositivos
- Sincronização em tempo real

---

## ⚙️ Configurações Avançadas

### Qualidade de Áudio
Em **Configurações > Spotify > Qualidade**:
- **Automático**: Ajusta baseado na conexão
- **Alta**: 320kbps (recomendado)
- **Normal**: 160kbps
- **Baixa**: 96kbps (economia de dados)

### Crossfade
Transição suave entre músicas:
- Desligado (padrão)
- 1-12 segundos

### Normalização de Volume
Equaliza o volume entre diferentes faixas:
- Desligado
- Silencioso
- Normal (recomendado)
- Alto

### Letras
- **Automático**: Busca letras quando disponível
- Suporte a letras sincronizadas (karaoke)
- Fallback para provedores externos

---

## 🔧 Troubleshooting

### "Precisa de conta Premium"
A API do Spotify exige conta Premium para controle de reprodução. Contas gratuitas podem apenas navegar, não reproduzir.

### Reprodução não funciona
1. Verifique se há um dispositivo ativo no Spotify
2. Abra o app Spotify em outro dispositivo
3. Selecione o dispositivo no seletor do TSiJUKEBOX

### Token expirado
Tokens do Spotify expiram periodicamente:
1. Vá em **Configurações > Spotify**
2. Clique em **Reconectar**
3. Autorize novamente

### Playlists não aparecem
- Verifique a conexão com internet
- Limpe cache: **Configurações > Avançado > Limpar Cache**
- Reconecte a integração

---

## 📊 Estatísticas

O TSiJUKEBOX registra estatísticas de reprodução:
- Top músicas reproduzidas
- Tempo total de reprodução
- Gêneros mais ouvidos
- Histórico por período

Acesse em **Dashboard > Estatísticas**.

---

## 🔐 Privacidade

- Tokens são armazenados localmente com criptografia
- Nenhum dado é compartilhado com terceiros
- Você pode revogar acesso a qualquer momento nas configurações do Spotify

---

[← Voltar ao Home](Home.md) | [Próximo: YouTube Music →](Tutorial-YouTube-Music.md)
