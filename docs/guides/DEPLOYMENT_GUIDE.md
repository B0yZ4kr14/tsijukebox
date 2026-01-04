# Guia de Deploy em Produção do TSiJUKEBOX

**Tipo:** Guia
**Público-alvo:** Administradores de sistema, DevOps
**Versão:** 1.0.0

---

## 1. Visão Geral

Este guia detalha o processo de implantação do TSiJUKEBOX em um ambiente de produção, com foco em segurança, estabilidade e performance. Abordaremos desde a preparação do hardware e do sistema operacional até a configuração de monitoramento e backups.

Para um ambiente de produção, recomendamos o uso de uma distribuição Linux robusta como **CachyOS** (baseada em Arch Linux e otimizada para performance) ou outra distribuição de sua preferência.

---

## 2. Requisitos de Hardware

As necessidades de hardware variam conforme o caso de uso.

### Para um Kiosk ou Ponto de Acesso Único:

- **CPU:** Quad-core 2.0GHz+
- **RAM:** 8GB+
- **Armazenamento:** 128GB+ SSD (NVMe recomendado)
- **Exemplos:** Intel NUC, Beelink Mini PC, Dell OptiPlex Micro.

### Para um Servidor Multi-usuário:

- **CPU:** 8+ cores 2.5GHz+
- **RAM:** 16GB+
- **Armazenamento:** 512GB+ NVMe (RAID para redundância)
- **Rede:** 1Gbps+

---

## 3. Preparação do Sistema (Exemplo com CachyOS/Arch Linux)

1.  **Instalação Mínima:**
    - Instale o CachyOS com um ambiente mínimo (ex: Openbox para Kiosk) ou sem interface gráfica (para servidor).
    - Use o kernel `linux-cachyos` para otimizações de performance.

2.  **Atualização e Dependências:**

    ```bash
    # Atualize o sistema
    sudo pacman -Syu

    # Instale as dependências essenciais
    sudo pacman -S base-devel git python python-pip nginx ufw fail2ban
    ```

3.  **Crie um Usuário Dedicado:**
    Nunca rode a aplicação como `root`. Crie um usuário com privilégios limitados.

    ```bash
    # Crie o usuário 'tsijukebox'
    sudo useradd -m -s /bin/bash tsijukebox

    # Adicione aos grupos necessários para controle de áudio e vídeo
    sudo usermod -aG audio,video,input tsijukebox
    ```

---

## 4. Instalação da Aplicação

Recomendamos clonar o repositório em `/opt/tsijukebox`.

1.  **Clone o Repositório:**

    ```bash
    sudo git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git /opt/tsijukebox
    ```

2.  **Instale as Dependências e Faça o Build:**

    ```bash
    cd /opt/tsijukebox
    sudo npm install --production
    sudo npm run build
    ```

3.  **Ajuste as Permissões:**

    ```bash
    sudo chown -R tsijukebox:tsijukebox /opt/tsijukebox
    ```

4.  **Configure os Serviços Systemd:**
    Isso garantirá que a aplicação inicie automaticamente com o sistema e seja gerenciada pelo `systemd`.

    ```bash
    sudo cp packaging/systemd/* /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now tsijukebox.service
    sudo systemctl enable --now tsijukebox-api.service
    ```

---

## 5. Hardening de Segurança

Proteger seu ambiente de produção é crucial.

1.  **Configure o Firewall (UFW):**
    Libere apenas as portas estritamente necessárias.

    ```bash
    sudo ufw default deny incoming
    sudo ufw allow 22/tcp  # SSH (restrinja o acesso por IP se possível)
    sudo ufw allow 80/tcp  # HTTP
    sudo ufw allow 443/tcp # HTTPS
    sudo ufw enable
    ```

2.  **Proteja o SSH com Fail2ban:**
    Previna ataques de força bruta no SSH.

    ```bash
    # Crie uma configuração local para o SSH
    echo -e "[sshd]\nenabled = true\nmaxretry = 3\nbantime = 3600" | sudo tee /etc/fail2ban/jail.local

    # Inicie o serviço
    sudo systemctl enable --now fail2ban
    ```

3.  **Desabilite o Login como Root e por Senha no SSH:**
    Force o uso de chaves SSH, que são muito mais seguras.

    ```bash
    # Edite /etc/ssh/sshd_config
    # Altere/adicione as seguintes linhas:
    PermitRootLogin no
    PasswordAuthentication no
    PubkeyAuthentication yes
    ```

---

## 6. Configuração de Alta Disponibilidade (HA)

Para garantir que a aplicação permaneça online, configure mecanismos de auto-recuperação.

1.  **Auto-Restart do Serviço:**
    Configure o `systemd` para reiniciar o serviço automaticamente em caso de falha.

    ```bash
    sudo mkdir -p /etc/systemd/system/tsijukebox.service.d
    echo -e "[Service]\nRestart=always\nRestartSec=10" | sudo tee /etc/systemd/system/tsijukebox.service.d/restart.conf
    sudo systemctl daemon-reload
    ```

2.  **Watchdog de Hardware:**
    Se o hardware suportar, um watchdog pode reiniciar o sistema inteiro se ele travar completamente.

    ```bash
    sudo pacman -S watchdog
    # Configure /etc/watchdog.conf e habilite o serviço
    sudo systemctl enable --now watchdog
    ```

---

## 7. Backup e Recuperação

Backups regulares são essenciais para a recuperação de desastres.

1.  **Crie um Script de Backup:**
    Este script fará o backup do banco de dados SQLite e dos arquivos de configuração.

    ```bash
    #!/bin/bash
    BACKUP_DIR="/var/backups/tsijukebox"
    DATE=$(date +%Y%m%d_%H%M%S)
    mkdir -p $BACKUP_DIR

    # Backup do banco de dados
    sqlite3 /opt/tsijukebox/data/database.sqlite ".backup '$BACKUP_DIR/database_$DATE.sqlite'"

    # Backup das configurações
    tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/tsijukebox/.env

    # Mantenha apenas os últimos 7 backups
    find $BACKUP_DIR -type f -mtime +7 -delete
    ```

2.  **Agende o Backup com Cron:**
    Execute o script de backup diariamente.

    ```bash
    # Adicione ao crontab para rodar todo dia às 3h da manhã
    echo "0 3 * * * /usr/local/bin/tsijukebox-backup.sh" | sudo crontab -
    ```

---

## 8. Manutenção e Atualizações

-   **Atualizações do Sistema:** Mantenha o sistema operacional e os pacotes sempre atualizados com `sudo pacman -Syu`.
-   **Atualizações da Aplicação:** Para atualizar o TSiJUKEBOX, puxe as últimas alterações do repositório Git e refaça o build.

    ```bash
    cd /opt/tsijukebox
    sudo git pull origin main
    sudo npm install --production
    sudo npm run build
    sudo systemctl restart tsijukebox
    ```

-   **Limpeza de Logs:** Use `journalctl --vacuum-time=7d` para limpar logs com mais de uma semana.
