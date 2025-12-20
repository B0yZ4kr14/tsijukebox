<div align="center">

# 🏭 TSiJUKEBOX - Deploy em Produção

**Guia completo para implantação em ambientes de produção**

![Production](https://img.shields.io/badge/environment-production-red?style=flat-square)
![Security](https://img.shields.io/badge/security-hardened-green?style=flat-square)
![High Availability](https://img.shields.io/badge/HA-enabled-blue?style=flat-square)

</div>

---

## 📋 Índice

1. [Requisitos de Hardware](#-requisitos-de-hardware)
2. [Preparação do Sistema](#-preparação-do-sistema)
3. [Instalação de Produção](#-instalação-de-produção)
4. [Hardening de Segurança](#-hardening-de-segurança)
5. [Alta Disponibilidade](#-alta-disponibilidade)
6. [Monitoramento](#-monitoramento)
7. [Backup e Recuperação](#-backup-e-recuperação)
8. [Manutenção](#-manutenção)

---

## 🔧 Requisitos de Hardware

### Kiosk / Digital Signage

| Componente | Mínimo | Recomendado | Ideal |
|------------|--------|-------------|-------|
| **CPU** | Dual-core 1.5GHz | Quad-core 2.0GHz | 6+ cores 3.0GHz |
| **RAM** | 4GB | 8GB | 16GB |
| **Armazenamento** | 32GB SSD | 128GB SSD | 256GB+ NVMe |
| **Display** | 1024x768 | 1920x1080 Touch | 4K Touch |
| **Áudio** | Onboard | Placa dedicada | DAC USB |

### Servidor / Multi-usuário

| Componente | Mínimo | Recomendado | Enterprise |
|------------|--------|-------------|------------|
| **CPU** | Quad-core 2.0GHz | 8 cores 2.5GHz | 16+ cores |
| **RAM** | 8GB | 16GB | 32GB+ |
| **Armazenamento** | 128GB SSD | 512GB NVMe | RAID SSD |
| **Rede** | 100Mbps | 1Gbps | 10Gbps |

### Hardware Recomendado

**Para Kiosk (Custo-Benefício):**
- Intel NUC 12 / AMD Ryzen Mini PC
- Raspberry Pi 5 (uso leve)
- Beelink Mini PC

**Para Produção:**
- Dell OptiPlex Micro
- HP EliteDesk Mini
- Lenovo ThinkCentre Tiny

---

## 🖥️ Preparação do Sistema

### 1. Instalação Base do CachyOS

```bash
# Baixar ISO do CachyOS
# https://cachyos.org/download

# Instalação mínima recomendada:
# - Kernel: linux-cachyos (otimizado)
# - DE: Openbox (para kiosk) ou Nenhum (para server)
# - Bootloader: systemd-boot
```

### 2. Configuração Inicial

```bash
# Atualizar sistema
sudo pacman -Syu

# Instalar dependências base
sudo pacman -S base-devel git python python-pip

# Configurar locale
sudo localectl set-locale LANG=pt_BR.UTF-8

# Configurar timezone
sudo timedatectl set-timezone America/Sao_Paulo

# Habilitar NTP
sudo timedatectl set-ntp true
```

### 3. Criar Usuário Dedicado

```bash
# Criar usuário sem privilégios de sudo
sudo useradd -m -s /bin/bash tsijukebox

# Adicionar aos grupos necessários
sudo usermod -aG audio,video,input tsijukebox

# Definir senha (ou desabilitar login com senha)
sudo passwd tsijukebox
```

---

## 🚀 Instalação de Produção

### Instalação Automatizada

```bash
# Instalação completa para produção
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | \
  sudo python3 - \
    --mode kiosk \
    --user tsijukebox \
    --database sqlite \
    --auto
```

### Instalação Manual (Controle Total)

```bash
# 1. Clonar repositório
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git /opt/tsijukebox
cd /opt/tsijukebox

# 2. Instalar dependências
sudo pacman -S nodejs npm sqlite nginx

# 3. Instalar aplicação
npm install --production
npm run build

# 4. Configurar permissões
sudo chown -R tsijukebox:tsijukebox /opt/tsijukebox

# 5. Instalar serviços
sudo cp packaging/systemd/* /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tsijukebox
```

---

## 🛡️ Hardening de Segurança

### 1. Firewall (UFW)

```bash
# Instalar e habilitar UFW
sudo pacman -S ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir apenas portas necessárias
sudo ufw allow 22/tcp     # SSH (remover em kiosk público)
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# Habilitar
sudo ufw enable
```

### 2. Fail2ban

```bash
# Instalar
sudo pacman -S fail2ban

# Configurar para SSH
cat << 'EOF' | sudo tee /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

# Habilitar
sudo systemctl enable --now fail2ban
```

### 3. Configuração SSH Segura

```bash
# Editar /etc/ssh/sshd_config
sudo tee -a /etc/ssh/sshd_config.d/hardening.conf << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

# Reiniciar SSH
sudo systemctl restart sshd
```

### 4. Desabilitar Serviços Desnecessários

```bash
# Listar serviços ativos
systemctl list-units --type=service --state=running

# Desabilitar serviços não necessários
sudo systemctl disable --now cups.service       # Impressão
sudo systemctl disable --now bluetooth.service  # Se não usar
sudo systemctl disable --now avahi-daemon       # mDNS (se não precisar)
```

### 5. Modo Kiosk Seguro

```bash
# Criar script de bloqueio de teclas
cat << 'EOF' | sudo tee /usr/local/bin/kiosk-lockdown
#!/bin/bash
# Desabilitar Ctrl+Alt+Del, Alt+F4, etc.
xmodmap -e 'keycode 64 = '   # Desabilitar Alt
xmodmap -e 'keycode 37 = '   # Desabilitar Ctrl
EOF

# Configurar Openbox para kiosk
mkdir -p ~/.config/openbox
cat << 'EOF' > ~/.config/openbox/autostart
# Desabilitar screensaver
xset s off
xset -dpms
xset s noblank

# Esconder cursor após 3 segundos
unclutter -idle 3 &

# Iniciar TSiJUKEBOX em fullscreen
chromium --kiosk --noerrdialogs --disable-infobars \
  --disable-translate --no-first-run \
  http://localhost:5173
EOF
```

---

## 🔄 Alta Disponibilidade

### 1. Watchdog do Sistema

```bash
# Habilitar watchdog de hardware
sudo pacman -S watchdog

# Configurar /etc/watchdog.conf
cat << 'EOF' | sudo tee /etc/watchdog.conf
watchdog-device = /dev/watchdog
watchdog-timeout = 15
interval = 5
max-load-1 = 24
min-memory = 1
EOF

# Habilitar
sudo systemctl enable --now watchdog
```

### 2. Auto-Restart do Serviço

```bash
# Configurar restart automático no systemd
sudo mkdir -p /etc/systemd/system/tsijukebox.service.d
cat << 'EOF' | sudo tee /etc/systemd/system/tsijukebox.service.d/restart.conf
[Service]
Restart=always
RestartSec=10
StartLimitIntervalSec=60
StartLimitBurst=3
EOF

sudo systemctl daemon-reload
```

### 3. Health Check Script

```bash
cat << 'EOF' | sudo tee /usr/local/bin/tsijukebox-healthcheck
#!/bin/bash
# Health check para TSiJUKEBOX

# Verificar se o serviço está rodando
if ! systemctl is-active --quiet tsijukebox; then
    echo "CRITICAL: TSiJUKEBOX service is not running"
    systemctl restart tsijukebox
    exit 1
fi

# Verificar se a porta está respondendo
if ! curl -sf http://localhost:5173/health > /dev/null; then
    echo "WARNING: TSiJUKEBOX is not responding on port 5173"
    exit 1
fi

echo "OK: TSiJUKEBOX is healthy"
exit 0
EOF

chmod +x /usr/local/bin/tsijukebox-healthcheck

# Adicionar ao cron (a cada 5 minutos)
echo "*/5 * * * * /usr/local/bin/tsijukebox-healthcheck" | sudo crontab -
```

---

## 📊 Monitoramento

### 1. Grafana + Prometheus

```bash
# Já instalados pelo script principal
# Acessar dashboards:
# - Grafana: http://localhost:3000
# - Prometheus: http://localhost:9090

# Importar dashboards pré-configurados
curl -X POST http://admin:admin@localhost:3000/api/dashboards/import \
  -H "Content-Type: application/json" \
  -d @/opt/tsijukebox/monitoring/grafana-dashboard.json
```

### 2. Alertas

```yaml
# /etc/prometheus/alerting-rules.yml
groups:
  - name: tsijukebox
    rules:
      - alert: ServiceDown
        expr: up{job="tsijukebox"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "TSiJUKEBOX está offline"
          
      - alert: HighCPU
        expr: process_cpu_seconds_total{job="tsijukebox"} > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alto uso de CPU detectado"
          
      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes{mountpoint="/"} < 1073741824
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Espaço em disco baixo (< 1GB)"
```

### 3. Logs Centralizados

```bash
# Configurar journald para persistência
sudo mkdir -p /var/log/journal
sudo systemctl restart systemd-journald

# Ver logs em tempo real
journalctl -u tsijukebox -f

# Exportar logs para análise
journalctl -u tsijukebox --since "1 hour ago" > /tmp/tsijukebox-logs.txt
```

---

## 💾 Backup e Recuperação

### 1. Backup Automático Local

```bash
# Script de backup
cat << 'EOF' | sudo tee /usr/local/bin/tsijukebox-backup
#!/bin/bash
BACKUP_DIR="/var/backups/tsijukebox"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco de dados
sqlite3 /var/lib/tsijukebox/database.sqlite ".backup '$BACKUP_DIR/database_$DATE.sqlite'"

# Backup das configurações
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/tsijukebox /opt/tsijukebox/.env

# Manter apenas últimos 7 dias
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/tsijukebox-backup

# Agendar backup diário às 3:00
echo "0 3 * * * /usr/local/bin/tsijukebox-backup" | sudo crontab -
```

### 2. Backup para Nuvem (Storj)

```bash
# Configurar Storj (se habilitado durante instalação)
# Os backups são enviados automaticamente para o bucket configurado

# Verificar status
tsijukebox --backup-status

# Forçar backup imediato
tsijukebox --backup-now
```

### 3. Recuperação

```bash
# Listar backups disponíveis
ls -la /var/backups/tsijukebox/

# Restaurar banco de dados
sudo systemctl stop tsijukebox
cp /var/backups/tsijukebox/database_20250101_030000.sqlite /var/lib/tsijukebox/database.sqlite
sudo systemctl start tsijukebox

# Restaurar configurações
tar -xzf /var/backups/tsijukebox/config_20250101_030000.tar.gz -C /
```

---

## 🔧 Manutenção

### Atualizações

```bash
# Verificar atualizações disponíveis
tsijukebox --check-updates

# Atualizar para última versão
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/update.py | sudo python3

# Ou via pacman (se instalado via AUR)
paru -Syu tsijukebox
```

### Limpeza

```bash
# Limpar cache e logs antigos
sudo journalctl --vacuum-time=7d
sudo pacman -Sc

# Limpar dados temporários
rm -rf /tmp/tsijukebox-*

# Vacuum do banco de dados
sqlite3 /var/lib/tsijukebox/database.sqlite "VACUUM;"
```

### Verificação de Integridade

```bash
# Verificar integridade do sistema
tsijukebox --verify

# Verificar banco de dados
sqlite3 /var/lib/tsijukebox/database.sqlite "PRAGMA integrity_check;"

# Verificar permissões
namei -l /var/lib/tsijukebox/database.sqlite
```

---

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Hardware verificado e testado
- [ ] Sistema operacional instalado e atualizado
- [ ] Rede configurada (IP estático para produção)
- [ ] Backup do sistema base criado

### Instalação
- [ ] TSiJUKEBOX instalado com sucesso
- [ ] Serviços habilitados e iniciando no boot
- [ ] Spotify autenticado (se aplicável)
- [ ] Interface acessível via navegador

### Segurança
- [ ] Firewall configurado e ativo
- [ ] Fail2ban configurado
- [ ] SSH hardened (ou desabilitado em kiosk)
- [ ] Usuário dedicado criado (não-root)
- [ ] Senhas padrão alteradas

### Monitoramento
- [ ] Grafana acessível e dashboards importados
- [ ] Prometheus coletando métricas
- [ ] Alertas configurados
- [ ] Logs sendo persistidos

### Backup
- [ ] Backup automático configurado
- [ ] Backup testado (restauração funcional)
- [ ] Backup remoto configurado (recomendado)

### Documentação
- [ ] IPs e credenciais documentados
- [ ] Procedimentos de recuperação documentados
- [ ] Contatos de suporte definidos

---

<div align="center">

## 📚 Recursos Adicionais

[📖 Documentação Completa](README.md) • 
[⚡ Instalação Rápida](QUICK-INSTALL.md) • 
[🔧 Troubleshooting](TROUBLESHOOTING.md)

---

**Precisa de suporte empresarial?**

[📧 enterprise@tsijukebox.com](mailto:enterprise@tsijukebox.com)

---

*TSiJUKEBOX Enterprise — Pronto para produção.* 🏭

</div>
