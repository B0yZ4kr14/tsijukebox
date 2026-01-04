# Guia de Início Rápido - TSiJUKEBOX

**5 Minutos para começar a usar!** ⚡

---

## 🎯 Objetivo

Este guia lhe permite configurar e começar a usar o TSiJUKEBOX em menos de 5 minutos.

---

## 📋 Pré-requisitos

- **Sistema Operacional:** Linux (Arch, CachyOS, Manjaro, EndeavourOS, Garuda)
- **Node.js:** v20 ou superior
- **Navegador:** Chrome, Firefox, Safari ou Edge (última versão)

---

## 🚀 Instalação Rápida

### Opção 1: Instalação com Um Comando (Recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/scripts/install.sh | bash
```

Este comando irá:
- ✅ Instalar todas as dependências necessárias
- ✅ Configurar o banco de dados (SQLite por padrão)
- ✅ Configurar o servidor web
- ✅ Iniciar o TSiJUKEBOX automaticamente

### Opção 2: Instalação Manual

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/tsijukebox.git
cd tsijukebox

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

---

## ⚙️ Configuração Inicial (Setup Wizard)

Ao acessar o TSiJUKEBOX pela primeira vez, você será guiado pelo **Setup Wizard**:

### Passo 1: Idioma e Tema
- Escolha seu idioma preferido (Português, Inglês, Espanhol)
- Selecione um tema (Escuro, Claro, Auto)

### Passo 2: Provedor de Música
Escolha pelo menos um provedor:

#### Spotify
1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie uma nova aplicação
3. Copie o **Client ID** e **Client Secret**
4. Cole no Setup Wizard

#### YouTube Music
1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a API do YouTube
4. Gere credenciais OAuth 2.0
5. Cole no Setup Wizard

#### Arquivos Locais
- Selecione a pasta onde estão seus arquivos de música
- O sistema suporta: MP3, FLAC, WAV, OGG, M4A

### Passo 3: Banco de Dados
Para uso básico, use o **SQLite** (padrão - não requer configuração).

Para uso avançado, escolha:
- **MariaDB/MySQL** - Para múltiplos usuários
- **PostgreSQL** - Para alta performance
- **Firebird** - Para ambientes específicos

### Passo 4: Recursos Opcionais
- 🎤 **Modo Karaokê** - Exibe letras sincronizadas
- 🎙️ **Controle por Voz** - Comandos de voz
- 🖥️ **Modo Kiosk** - Interface em tela cheia (ideal para festas)

---

## 🎵 Primeira Música

### 1. Conecte sua conta Spotify ou YouTube Music
- Clique no ícone do provedor no canto superior direito
- Faça login com suas credenciais
- Autorize o TSiJUKEBOX

### 2. Busque uma música
- Digite o nome da música ou artista na barra de busca
- Pressione `Enter` ou clique em Buscar

### 3. Reproduza
- Clique na música desejada
- Use os controles no player:
  - ▶️ Play/Pause
  - ⏭️ Próxima
  - ⏮️ Anterior
  - 🔊 Volume

---

## 🎯 Recursos Principais

### Fila de Reprodução
- Adicione músicas à fila clicando no ícone ➕
- Reorganize arrastando e soltando
- Remova músicas com o ícone ✖️

### Playlists
- Crie playlists personalizadas
- Importe playlists do Spotify
- Compartilhe com amigos

### Modo Karaokê
1. Ative o modo karaokê no player
2. As letras sincronizadas aparecerão automaticamente
3. Ajuste o tamanho e a posição das letras

### Controle por Voz
Diga os comandos:
- "Reproduzir [nome da música]"
- "Parar"
- "Próxima música"
- "Volume para 50%"

---

## 🔧 Configurações Rápidas

### Acessar Configurações
- Clique no ícone ⚙️ no canto superior direito
- Ou pressione `Ctrl + ,`

### Configurações Importantes
- **Qualidade de Áudio:** Alta, Média, Baixa (impacta no consumo de dados)
- **Atalhos de Teclado:** Personalize os atalhos
- **Notificações:** Ative/desative notificações
- **Tema:** Personalize cores e aparência

---

## ⌨️ Atalhos de Teclado Essenciais

| Atalho | Ação |
|--------|------|
| `Espaço` | Play/Pause |
| `→` | Próxima música |
| `←` | Música anterior |
| `↑` | Aumentar volume |
| `↓` | Diminuir volume |
| `Ctrl + K` | Busca global |
| `Ctrl + ,` | Configurações |
| `F` | Modo tela cheia |
| `K` | Modo karaokê |
| `M` | Mute/Unmute |

---

## 📱 Acesso Remoto

O TSiJUKEBOX pode ser acessado por outros dispositivos na sua rede:

1. Encontre o endereço IP do seu computador:
   ```bash
   ip addr show
   ```

2. Em outro dispositivo (celular, tablet), acesse:
   ```
   http://[SEU_IP]:5173
   ```

3. Controle a música de qualquer lugar da sua casa!

---

## 🆘 Problemas Comuns

### Não consigo fazer login no Spotify
- **Solução:** Verifique se o Client ID e Client Secret estão corretos
- Certifique-se de que a URL de callback está configurada no Spotify Dashboard

### A música não toca
- **Solução:** Verifique sua conexão com a internet
- Certifique-se de que o navegador tem permissão para reproduzir áudio
- Tente atualizar a página (F5)

### O karaokê não mostra as letras
- **Solução:** Nem todas as músicas têm letras sincronizadas disponíveis
- Tente outra música ou desative temporariamente o modo karaokê

### Erro de autenticação
- **Solução:** Limpe o cache do navegador
- Faça logout e login novamente
- Verifique se as credenciais da API não expiraram

---

## 📚 Próximos Passos

Agora que você tem o básico configurado, explore:

1. **[User Guide (Avançado)](User-Guide-Advanced.md)** - Recursos avançados
2. **[Tutorial de Karaokê](Tutorial-Karaoke-Mode.md)** - Configure o modo karaokê perfeitamente
3. **[Modo Kiosk](Tutorial-Kiosk-Mode.md)** - Transforme em um jukebox de verdade
4. **[Configuração de Backup](Config-Cloud-Backup.md)** - Nunca perca suas playlists

---

## 🤝 Precisa de Ajuda?

- **Documentação Completa:** [Wiki Principal](Home.md)
- **Problemas Técnicos:** [Troubleshooting](../TROUBLESHOOTING.md)
- **Suporte:** [GitHub Issues](https://github.com/B0yZ4kr14/tsijukebox/issues)
- **Comunidade:** [GitHub Discussions](https://github.com/B0yZ4kr14/tsijukebox/discussions)

---

**Divirta-se com sua música! 🎵🎉**

Última atualização: 04/01/2026  
Versão do Guia: 1.0
