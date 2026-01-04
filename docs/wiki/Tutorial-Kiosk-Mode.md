# 🖥️ Tutorial: Modo Kiosk

Configure o TSiJUKEBOX como um kiosk musical dedicado para bares, restaurantes, lojas e outros estabelecimentos comerciais.

---

## 🌟 O que é Modo Kiosk?

![Kiosk Mode](../assets/mockups/kiosk-mode-screen.png)

*Interface simplificada do modo kiosk com controles grandes otimizados para toque*

O modo kiosk transforma qualquer computador em um terminal musical dedicado:

- **Tela cheia** permanente
- **Interface simplificada** para clientes
- **Bloqueio de sistema** (sem acesso ao desktop)
- **Recuperação automática** de erros
- **Controles administrativos** separados

---

## 📋 Requisitos

### Hardware Recomendado
| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Armazenamento | SSD 64GB | SSD 256GB+ |
| Display | 1280x720 | 1920x1080+ |
| Touch | Opcional | Recomendado |

### Software
- **OS**: CachyOS / Arch Linux (recomendado) ou qualquer Linux com Openbox
- **Browser**: Chromium / Chrome
- **Window Manager**: Openbox (configuração automática)

---

## 🔧 Instalação Kiosk

### Método 1: Instalador Automático

```bash
cd TSiJUKEBOX/scripts/installer
python main.py --kiosk
```

O instalador configura automaticamente:
- Openbox como window manager
- Auto-login do usuário kiosk
- Chromium em fullscreen
- Serviços de auto-restart
- Bloqueio de atalhos do sistema

### Método 2: Instalação Manual

#### 1. Instalar Openbox

```bash
# Arch/CachyOS
sudo pacman -S openbox chromium xorg-xinit

# Debian/Ubuntu
sudo apt install openbox chromium-browser xinit
```

#### 2. Configurar Auto-Login

Edite `/etc/systemd/system/getty@tty1.service.d/override.conf`:
```ini
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin kiosk --noclear %I $TERM
```

#### 3. Configurar Openbox

Crie `~/.config/openbox/autostart`:
```bash
#!/bin/bash
# Desabilitar screensaver
xset s off
xset -dpms
xset s noblank

# Iniciar TSiJUKEBOX
chromium --kiosk --no-first-run --disable-translate \
  --disable-infobars --disable-suggestions-service \
  --disable-save-password-bubble --disable-session-crashed-bubble \
  --app=http://localhost:5173
```

#### 4. Habilitar Serviço

```bash
sudo systemctl enable tsijukebox.service
sudo systemctl start tsijukebox.service
```

---

## ⚙️ Configurações do Modo Kiosk

### Interface

Acessível apenas para administradores em **Configurações > Kiosk**:

| Opção | Descrição |
|-------|-----------|
| Tela de Inatividade | Tempo até mostrar screensaver |
| Timeout de Seleção | Tempo para confirmar música |
| Máximo na Fila | Limite de músicas por sessão |
| Moedeiro | Integração com hardware |
| Créditos por Música | Custo em créditos |

### Segurança

| Opção | Descrição |
|-------|-----------|
| PIN Admin | Código para acessar configurações |
| Bloqueio de URL | Impede navegação externa |
| Ocultar Barra | Remove barra de endereço |
| Desabilitar F12 | Bloqueia DevTools |

### Layout

| Opção | Descrição |
|-------|-----------|
| Tema | Selecione tema visual |
| Logo | Logo personalizado |
| Mensagem | Texto de boas-vindas |
| Cores | Customização de cores |

---

## 🔒 Acesso Administrativo

### Acessar Modo Admin

1. Toque no canto superior direito 5x rapidamente
2. Digite o PIN administrativo
3. Menu de administração aparecerá

### Opções Admin
- **Configurações**: Acesso completo
- **Estatísticas**: Visualizar uso
- **Reiniciar**: Reiniciar aplicação
- **Desligar**: Desligar sistema
- **Manutenção**: Modo de manutenção

---

## 💰 Integração com Moedeiro

O TSiJUKEBOX suporta integração com máquinas de moedas:

### Hardware Suportado
- Moedeiros paralelos (DB25)
- Moedeiros seriais (RS232)
- Sistemas de pulso

### Configuração

1. Conecte o moedeiro à porta serial/paralela
2. Acesse **Configurações > Kiosk > Moedeiro**
3. Configure:
   - Porta: `/dev/ttyUSB0`
   - Protocolo: Pulso / Serial
   - Pulsos por crédito: 1
   - Créditos por música: 1

### Mapeamento de Moedas

```
R$ 0,25 = 1 crédito
R$ 0,50 = 2 créditos
R$ 1,00 = 5 créditos
```

---

## 📊 Estatísticas e Relatórios

### Dashboard de Uso
- Total de músicas reproduzidas
- Músicas mais populares
- Horários de pico
- Créditos/faturamento

### Exportar Relatórios
1. Acesse modo admin
2. Vá em **Estatísticas > Exportar**
3. Selecione período
4. Baixe CSV/PDF

---

## 🔧 Manutenção

### Atualizações
```bash
# Via serviço de atualização automática
sudo systemctl status tsijukebox-update.timer

# Manual
cd /opt/tsijukebox
git pull
npm install
sudo systemctl restart tsijukebox
```

### Backup de Configurações
```bash
# Backup
cp -r ~/.config/tsijukebox ~/backup-tsijukebox

# Restaurar
cp -r ~/backup-tsijukebox/* ~/.config/tsijukebox/
```

### Logs
```bash
# Ver logs em tempo real
journalctl -u tsijukebox -f

# Últimas 100 linhas
journalctl -u tsijukebox -n 100
```

---

## 🛠️ Troubleshooting

### Tela preta após boot
- Verifique configuração do Openbox
- Teste: `startx /usr/bin/openbox-session`
- Cheque logs: `journalctl -b`

### Chromium não inicia fullscreen
- Adicione `--start-fullscreen` aos parâmetros
- Verifique resolução de tela

### Sistema não recupera após queda de energia
- Configure BIOS para boot automático
- Verifique serviço de watchdog

### Touch não funciona
- Instale drivers: `sudo pacman -S xf86-input-evdev`
- Calibre: `xinput_calibrator`

---

## 📁 Arquivos de Configuração

| Arquivo | Propósito |
|---------|-----------|
| `/etc/systemd/system/tsijukebox.service` | Serviço systemd |
| `~/.config/openbox/autostart` | Script de inicialização |
| `/opt/tsijukebox/` | Código da aplicação |
| `~/.config/tsijukebox/` | Configurações do usuário |

---

## 🔗 Recursos Adicionais

- [Instalação CachyOS](../INSTALLATION.md)
- [Configuração Openbox](https://wiki.archlinux.org/title/Openbox)
- [PKGBUILD para Arch](../../packaging/arch/PKGBUILD)

---

[← Modo Karaoke](Tutorial-Karaoke-Mode.md) | [Próximo: Guia de Uso Básico →](User-Guide-Basic.md)
