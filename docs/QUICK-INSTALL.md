<div align="center">

# ⚡ TSiJUKEBOX - Instalação Super Rápida

**Guia de instalação amigável para iniciantes**

![Version](https://img.shields.io/badge/version-4.1.0-blue?style=flat-square)
![Arch Linux](https://img.shields.io/badge/Arch_Linux-1793D1?style=flat-square&logo=arch-linux&logoColor=white)
![CachyOS](https://img.shields.io/badge/CachyOS-00ADD8?style=flat-square)

</div>

---

## 🎯 Um Comando, Tudo Pronto!

Abra o terminal e cole este comando:

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

**Pronto!** O instalador fará todo o trabalho automaticamente.

---

## 📊 O Que Você Vai Ver

Durante a instalação, uma barra de progresso visual mostra cada etapa:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚀 TSiJUKEBOX Enterprise Installer v4.1.0                                    ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
╚══════════════════════════════════════════════════════════════════════════════╝

✅ [1/10] Sistema detectado: CachyOS Linux (cachyos)
✅ [2/10] Usuário configurado: joao
✅ [3/10] AUR helper instalado: paru
🔄 [4/10] Instalando pacotes base... ████████████░░░░░░░░ 60%
⏳ [5/10] Configurando Spotify + Spicetify...
⏳ [6/10] Instalando Grafana + Prometheus...
⏳ [7/10] Configurando banco de dados SQLite...
⏳ [8/10] Criando serviços systemd...
⏳ [9/10] Configurando modo kiosk...
⏳ [10/10] Verificação final...

Tempo estimado restante: ~5 minutos
```

---

## 🎮 Modos de Instalação

Escolha o modo que melhor se adapta ao seu uso:

### 🎵 Modo Completo (Padrão)
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```
**Ideal para:** Uso doméstico com todas as funcionalidades

**Inclui:** Spotify, Monitoramento, Interface Web, Karaokê

---

### 🖥️ Modo Kiosk
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3 - --mode kiosk
```
**Ideal para:** Bares, eventos, festas, karaokês

**Características:**
- ✅ Interface touchscreen otimizada
- ✅ Proteção contra saída do app
- ✅ Reinício automático em caso de falha
- ✅ Login automático no boot

---

### 🖧 Modo Server
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3 - --mode server --no-spotify
```
**Ideal para:** Servidores headless, streaming remoto

**Características:**
- ✅ Sem interface gráfica
- ✅ API REST disponível
- ✅ Baixo consumo de recursos
- ✅ Controle via app mobile/web

---

## 📋 Todas as Opções Disponíveis

| Flag | Descrição | Valor Padrão |
|------|-----------|--------------|
| `--mode` | Modo de instalação: `full`, `kiosk`, `server` | `full` |
| `--database` | Banco de dados: `sqlite`, `mariadb`, `postgresql` | `sqlite` |
| `--user` | Usuário do sistema para o serviço | Usuário atual |
| `--music-dir` | Diretório para arquivos de música | `~/Musics` |
| `--no-spotify` | Não instalar Spotify/Spicetify | (instala) |
| `--no-monitoring` | Não instalar Grafana/Prometheus | (instala) |
| `--no-backup` | Não configurar backup automático | (configura) |
| `--auto` | Instalação automática sem confirmações | (interativo) |
| `--uninstall` | Remover instalação existente | - |

### 🆕 Comandos Avançados v4.1.0

| Flag | Descrição | Exemplo |
|------|-----------|---------|
| `--health-check` | Verificação rápida de saúde | `python3 install.py --health-check` |
| `--alert-on-failure` | Enviar alertas em caso de falha | `--health-check --alert-on-failure` |
| `--alert-channels` | Canais de alerta | `--alert-channels telegram,email` |
| `--install-timer` | Instalar timer systemd | `--install-timer --alert-channels telegram` |
| `--timer-interval` | Intervalo do timer | `--timer-interval 10m` |
| `--plugin NAME` | Instalar plugin | `--plugin youtube-music-dl` |
| `--list-plugins` | Listar plugins disponíveis | `python3 install.py --list-plugins` |
| `--all-plugins` | Instalar todos os plugins | `--all-plugins` |
| `--migrate` | Migrar configurações | `python3 install.py --migrate` |

---

## 🏥 Health Check

Verificação rápida de saúde do sistema compatível com Nagios, Zabbix e PRTG:

```bash
# Verificação básica (retorna código de saída 0, 1, 2 ou 3)
python3 install.py --health-check
echo $?  # 0=OK, 1=WARNING, 2=CRITICAL, 3=UNKNOWN

# Com alertas automáticos em caso de falha
python3 install.py --health-check --alert-on-failure --alert-channels telegram

# Instalação de timer systemd (verifica a cada 5 minutos)
sudo python3 install.py --install-timer --alert-channels telegram,email
```

📖 [Documentação completa de Monitoramento](MONITORING.md)

---

## 🔌 Sistema de Plugins

Instale extensões modulares para funcionalidades adicionais:

```bash
# Listar plugins disponíveis
python3 install.py --list-plugins

# Instalar plugins
sudo python3 install.py --plugin youtube-music-dl
sudo python3 install.py --plugin discord-integration
sudo python3 install.py --plugin spotify-downloader
```

📖 [Documentação completa de Plugins](PLUGINS.md)

---

## 🔧 Exemplos de Uso

### Instalação Personalizada
```bash
# Modo kiosk com MariaDB e diretório de música customizado
curl -fsSL .../install.py | sudo python3 - \
  --mode kiosk \
  --database mariadb \
  --music-dir /mnt/musicas
```

### Instalação Mínima
```bash
# Apenas o essencial, sem extras
curl -fsSL .../install.py | sudo python3 - \
  --no-spotify \
  --no-monitoring \
  --no-backup
```

### Instalação Totalmente Automática
```bash
# Sem confirmações, usar todos os padrões
curl -fsSL .../install.py | sudo python3 - --auto
```

---

## 📦 O Que é Instalado

### Componentes Principais

| Componente | Descrição | Espaço |
|------------|-----------|--------|
| 🎵 **Spotify + Spicetify** | Player com temas customizados | ~500MB |
| 📊 **Grafana** | Dashboards de monitoramento | ~200MB |
| 📈 **Prometheus** | Coleta de métricas | ~100MB |
| 🌐 **Nginx** | Servidor web e proxy reverso | ~10MB |
| 💾 **SQLite** | Banco de dados local | ~5MB |

### Serviços Systemd

Após a instalação, estes serviços estarão disponíveis:

```bash
# Verificar status
systemctl status tsijukebox

# Iniciar/Parar
sudo systemctl start tsijukebox
sudo systemctl stop tsijukebox

# Habilitar no boot
sudo systemctl enable tsijukebox
```

---

## ✅ Verificação Pós-Instalação

Após a instalação, execute este comando para verificar se tudo está funcionando:

```bash
# Script de verificação automática
tsijukebox --verify

# Ou manualmente:
systemctl status tsijukebox grafana-server prometheus
```

### Saída Esperada:
```
✅ TSiJUKEBOX v4.1.0 - Verificação de Instalação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Serviço tsijukebox: ativo
✅ Serviço grafana-server: ativo
✅ Serviço prometheus: ativo
✅ Banco de dados SQLite: conectado
✅ Spotify: autenticado
✅ Interface web: http://localhost:5173

🎉 Instalação verificada com sucesso!
```

---

## 🔍 Acessando a Interface

Após a instalação:

| Interface | URL | Porta |
|-----------|-----|-------|
| 🎵 **Player Principal** | http://localhost:5173 | 5173 |
| 📊 **Grafana** | http://localhost:3000 | 3000 |
| 📈 **Prometheus** | http://localhost:9090 | 9090 |

**Credenciais padrão:**
- **Grafana:** admin / admin (alterar no primeiro login)
- **TSiJUKEBOX:** admin / admin

---

## 🆘 Problemas Comuns

### "Comando não encontrado: python3"
```bash
# Instalar Python
sudo pacman -S python
```

### "Permissão negada"
```bash
# Executar com sudo
curl ... | sudo python3
```

### "Erro de conexão com Spotify"
```bash
# Reconfigurar autenticação
tsijukebox --spotify-auth
```

### "Serviço não inicia"
```bash
# Ver logs detalhados
journalctl -u tsijukebox -f
```

---

## 🔄 Desinstalação

Para remover completamente:

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3 - --uninstall
```

Ou manualmente:
```bash
# Parar serviços
sudo systemctl stop tsijukebox grafana-server prometheus

# Remover pacotes
sudo pacman -Rns tsijukebox spotify spicetify-cli grafana prometheus

# Remover dados
rm -rf ~/.config/tsijukebox
rm -rf /var/lib/tsijukebox
```

---

## 📚 Próximos Passos

- 📖 [Guia de Configuração](CONFIGURATION.md)
- 🏭 [Deploy em Produção](PRODUCTION-DEPLOY.md)
- 🔧 [Troubleshooting](TROUBLESHOOTING.md)
- 🎨 [Customização de Temas](THEMES.md)

---

<div align="center">

**Precisa de ajuda?** 

[🐛 Reportar Bug](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues) • 
[💬 Discord](https://discord.gg/tsijukebox) • 
[📧 Contato](mailto:support@tsijukebox.com)

---

*TSiJUKEBOX Enterprise — A música, amplificada.* 🎵

</div>
