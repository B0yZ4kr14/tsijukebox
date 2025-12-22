# 🐚 Configuração de Shell

> Guia de configuração para **fish**, **zsh** e **bash** com aliases, variáveis de ambiente e completions para TSiJUKEBOX.

---

## 📋 Índice

- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Fish Shell](#-fish-shell)
- [Zsh](#-zsh)
- [Bash](#-bash)
- [Aliases Comuns](#-aliases-comuns)
- [Completions](#-completions)

---

## 🌍 Variáveis de Ambiente

Variáveis necessárias para o TSiJUKEBOX:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `TSIJUKEBOX_HOME` | Diretório de instalação | `/opt/tsijukebox` |
| `TSIJUKEBOX_DATA` | Diretório de dados | `/var/lib/tsijukebox` |
| `TSIJUKEBOX_LOGS` | Diretório de logs | `/var/log/tsijukebox` |
| `TSIJUKEBOX_PORT` | Porta HTTP | `80` |
| `DOCKER_COMPOSE_DIR` | Diretório Docker Compose | `/opt/tsijukebox/docker` |

---

## 🐟 Fish Shell

### Instalação

```bash
# CachyOS / Arch
sudo pacman -S fish

# Definir como shell padrão
chsh -s /usr/bin/fish
```

### Configuração

Criar/editar `~/.config/fish/config.fish`:

```fish
# ============================================
# TSiJUKEBOX Configuration for Fish
# ============================================

# Variáveis de ambiente
set -gx TSIJUKEBOX_HOME /opt/tsijukebox
set -gx TSIJUKEBOX_DATA /var/lib/tsijukebox
set -gx TSIJUKEBOX_LOGS /var/log/tsijukebox
set -gx TSIJUKEBOX_PORT 80
set -gx DOCKER_COMPOSE_DIR /opt/tsijukebox/docker

# PATH
set -gx PATH $TSIJUKEBOX_HOME/bin $PATH

# Editor padrão
set -gx EDITOR nano
set -gx VISUAL nano

# ============================================
# Aliases TSiJUKEBOX
# ============================================

# Gerenciamento de containers
alias juke-start="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml up -d"
alias juke-stop="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml down"
alias juke-restart="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml restart"
alias juke-logs="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml logs -f"
alias juke-status="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml ps"

# Logs específicos
alias juke-logs-app="docker logs tsijukebox-app -f"
alias juke-logs-nginx="docker logs tsijukebox-nginx -f"
alias juke-logs-prometheus="docker logs tsijukebox-prometheus -f"

# Manutenção
alias juke-update="sudo python3 /opt/tsijukebox/scripts/docker-install.py --update"
alias juke-backup="sudo python3 /opt/tsijukebox/scripts/docker-install.py --backup"
alias juke-health="curl -s http://localhost:$TSIJUKEBOX_PORT/health | jq"

# Shell dentro do container
alias juke-shell="docker exec -it tsijukebox-app /bin/sh"

# ============================================
# Funções úteis
# ============================================

function juke-open
    # Abre TSiJUKEBOX no navegador padrão
    xdg-open "http://localhost:$TSIJUKEBOX_PORT" 2>/dev/null
end

function juke-info
    echo "╔══════════════════════════════════════════╗"
    echo "║         TSiJUKEBOX System Info           ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║ Home:    $TSIJUKEBOX_HOME"
    echo "║ Data:    $TSIJUKEBOX_DATA"
    echo "║ Port:    $TSIJUKEBOX_PORT"
    echo "║ Status:  "(docker ps --filter name=tsijukebox-app --format "{{.Status}}" 2>/dev/null || echo "Not running")
    echo "╚══════════════════════════════════════════╝"
end

# ============================================
# Prompt customizado (opcional)
# ============================================

function fish_prompt
    set_color cyan
    echo -n "🎵 "
    set_color normal
    echo -n (prompt_pwd)
    set_color green
    echo -n " ❯ "
    set_color normal
end
```

### Recarregar configuração

```fish
source ~/.config/fish/config.fish
```

---

## 🦓 Zsh

### Instalação

```bash
# CachyOS / Arch
sudo pacman -S zsh zsh-completions zsh-syntax-highlighting zsh-autosuggestions

# Definir como shell padrão
chsh -s /usr/bin/zsh
```

### Configuração

Adicionar ao `~/.zshrc`:

```zsh
# ============================================
# TSiJUKEBOX Configuration for Zsh
# ============================================

# Variáveis de ambiente
export TSIJUKEBOX_HOME="/opt/tsijukebox"
export TSIJUKEBOX_DATA="/var/lib/tsijukebox"
export TSIJUKEBOX_LOGS="/var/log/tsijukebox"
export TSIJUKEBOX_PORT="80"
export DOCKER_COMPOSE_DIR="/opt/tsijukebox/docker"

# PATH
export PATH="$TSIJUKEBOX_HOME/bin:$PATH"

# ============================================
# Aliases TSiJUKEBOX
# ============================================

# Gerenciamento de containers
alias juke-start="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml up -d"
alias juke-stop="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml down"
alias juke-restart="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml restart"
alias juke-logs="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml logs -f"
alias juke-status="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml ps"

# Logs específicos
alias juke-logs-app="docker logs tsijukebox-app -f"
alias juke-logs-nginx="docker logs tsijukebox-nginx -f"
alias juke-logs-prometheus="docker logs tsijukebox-prometheus -f"

# Manutenção
alias juke-update="sudo python3 /opt/tsijukebox/scripts/docker-install.py --update"
alias juke-backup="sudo python3 /opt/tsijukebox/scripts/docker-install.py --backup"
alias juke-health="curl -s http://localhost:$TSIJUKEBOX_PORT/health | jq"

# Shell dentro do container
alias juke-shell="docker exec -it tsijukebox-app /bin/sh"

# ============================================
# Funções úteis
# ============================================

juke-open() {
    xdg-open "http://localhost:$TSIJUKEBOX_PORT" 2>/dev/null &
}

juke-info() {
    local status=$(docker ps --filter name=tsijukebox-app --format "{{.Status}}" 2>/dev/null || echo "Not running")
    echo "╔══════════════════════════════════════════╗"
    echo "║         TSiJUKEBOX System Info           ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║ Home:    $TSIJUKEBOX_HOME"
    echo "║ Data:    $TSIJUKEBOX_DATA"
    echo "║ Port:    $TSIJUKEBOX_PORT"
    echo "║ Status:  $status"
    echo "╚══════════════════════════════════════════╝"
}

# ============================================
# Completions para comandos juke-*
# ============================================

_juke_commands() {
    local commands=(
        "juke-start:Start TSiJUKEBOX containers"
        "juke-stop:Stop TSiJUKEBOX containers"
        "juke-restart:Restart TSiJUKEBOX containers"
        "juke-logs:Show container logs"
        "juke-status:Show container status"
        "juke-update:Update TSiJUKEBOX"
        "juke-backup:Backup TSiJUKEBOX data"
        "juke-health:Check health endpoint"
        "juke-shell:Open shell in container"
        "juke-open:Open in browser"
        "juke-info:Show system info"
    )
    _describe 'command' commands
}

# ============================================
# Prompt customizado (opcional)
# ============================================

PROMPT='%F{cyan}🎵 %f%F{blue}%~%f %F{green}❯%f '
```

### Recarregar configuração

```bash
source ~/.zshrc
```

---

## 🖥️ Bash

### Configuração

Adicionar ao `~/.bashrc`:

```bash
# ============================================
# TSiJUKEBOX Configuration for Bash
# ============================================

# Variáveis de ambiente
export TSIJUKEBOX_HOME="/opt/tsijukebox"
export TSIJUKEBOX_DATA="/var/lib/tsijukebox"
export TSIJUKEBOX_LOGS="/var/log/tsijukebox"
export TSIJUKEBOX_PORT="80"
export DOCKER_COMPOSE_DIR="/opt/tsijukebox/docker"

# PATH
export PATH="$TSIJUKEBOX_HOME/bin:$PATH"

# ============================================
# Aliases TSiJUKEBOX
# ============================================

# Gerenciamento de containers
alias juke-start="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml up -d"
alias juke-stop="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml down"
alias juke-restart="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml restart"
alias juke-logs="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml logs -f"
alias juke-status="docker-compose -f $DOCKER_COMPOSE_DIR/docker-compose.yml ps"

# Logs específicos
alias juke-logs-app="docker logs tsijukebox-app -f"
alias juke-logs-nginx="docker logs tsijukebox-nginx -f"
alias juke-logs-prometheus="docker logs tsijukebox-prometheus -f"

# Manutenção
alias juke-update="sudo python3 /opt/tsijukebox/scripts/docker-install.py --update"
alias juke-backup="sudo python3 /opt/tsijukebox/scripts/docker-install.py --backup"
alias juke-health="curl -s http://localhost:$TSIJUKEBOX_PORT/health | jq"

# Shell dentro do container
alias juke-shell="docker exec -it tsijukebox-app /bin/sh"

# ============================================
# Funções úteis
# ============================================

juke-open() {
    xdg-open "http://localhost:$TSIJUKEBOX_PORT" 2>/dev/null &
}

juke-info() {
    local status=$(docker ps --filter name=tsijukebox-app --format "{{.Status}}" 2>/dev/null || echo "Not running")
    echo "╔══════════════════════════════════════════╗"
    echo "║         TSiJUKEBOX System Info           ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║ Home:    $TSIJUKEBOX_HOME"
    echo "║ Data:    $TSIJUKEBOX_DATA"
    echo "║ Port:    $TSIJUKEBOX_PORT"
    echo "║ Status:  $status"
    echo "╚══════════════════════════════════════════╝"
}

# ============================================
# Prompt customizado (opcional)
# ============================================

PS1='\[\033[36m\]🎵 \[\033[34m\]\w \[\033[32m\]❯\[\033[0m\] '
```

### Recarregar configuração

```bash
source ~/.bashrc
```

---

## 🔧 Aliases Comuns

Aliases disponíveis em todos os shells:

| Alias | Descrição |
|-------|-----------|
| `juke-start` | Inicia todos os containers |
| `juke-stop` | Para todos os containers |
| `juke-restart` | Reinicia todos os containers |
| `juke-logs` | Mostra logs em tempo real |
| `juke-status` | Mostra status dos containers |
| `juke-update` | Atualiza TSiJUKEBOX |
| `juke-backup` | Faz backup dos dados |
| `juke-health` | Verifica endpoint de saúde |
| `juke-shell` | Abre shell no container |
| `juke-open` | Abre no navegador |
| `juke-info` | Mostra informações do sistema |

---

## ⌨️ Completions

### Fish Completions

Criar `~/.config/fish/completions/juke.fish`:

```fish
# Completions para comandos juke-*
complete -c juke-start -d "Start TSiJUKEBOX containers"
complete -c juke-stop -d "Stop TSiJUKEBOX containers"
complete -c juke-restart -d "Restart TSiJUKEBOX containers"
complete -c juke-logs -d "Show container logs"
complete -c juke-status -d "Show container status"
complete -c juke-update -d "Update TSiJUKEBOX"
complete -c juke-backup -d "Backup TSiJUKEBOX data"
complete -c juke-health -d "Check health endpoint"
complete -c juke-shell -d "Open shell in container"
complete -c juke-open -d "Open in browser"
complete -c juke-info -d "Show system info"
```

---

## 📚 Próximos Passos

- [Instalação CachyOS](Install-CachyOS.md)
- [Setup Openbox Kiosk](Openbox-Kiosk-Setup.md)
- [Referência de Dependências](Dependencies-Reference.md)

---

*TSiJUKEBOX - Configuração de Shell otimizada*
