# 📦 Referência de Dependências

> Guia completo de todas as dependências do TSiJUKEBOX para CachyOS/Arch Linux.

---

## 📋 Índice

- [Dependências do Sistema](#-dependências-do-sistema)
- [Dependências Docker](#-dependências-docker)
- [Dependências Node.js](#-dependências-nodejs)
- [Dependências Python](#-dependências-python)
- [Dependências Opcionais](#-dependências-opcionais)
- [Versões Testadas](#-versões-testadas)

---

## 🖥️ Dependências do Sistema

### Pacotes Base (Obrigatórios)

```bash
# Instalação em uma linha
sudo pacman -S --needed \
    base-devel \
    git \
    curl \
    wget \
    jq \
    docker \
    docker-compose
```

| Pacote | Versão Mín. | Descrição |
|--------|-------------|-----------|
| `base-devel` | - | Ferramentas de compilação |
| `git` | 2.40+ | Controle de versão |
| `curl` | 8.0+ | Transferência de dados |
| `wget` | 1.21+ | Download de arquivos |
| `jq` | 1.6+ | Processamento JSON |
| `docker` | 24.0+ | Runtime de containers |
| `docker-compose` | 2.20+ | Orquestração de containers |

### Pacotes para Desenvolvimento

```bash
sudo pacman -S --needed \
    nodejs \
    npm \
    python \
    python-pip \
    openssl \
    nginx
```

| Pacote | Versão Mín. | Descrição |
|--------|-------------|-----------|
| `nodejs` | 18.0+ | Runtime JavaScript |
| `npm` | 9.0+ | Gerenciador de pacotes Node |
| `python` | 3.11+ | Interpretador Python |
| `python-pip` | 23.0+ | Gerenciador de pacotes Python |
| `openssl` | 3.0+ | Criptografia |
| `nginx` | 1.24+ | Servidor web/proxy |

### Pacotes para Modo Kiosk

```bash
sudo pacman -S --needed \
    openbox \
    obconf \
    xorg-server \
    xorg-xinit \
    xorg-xset \
    xorg-xrandr \
    picom \
    unclutter \
    chromium \
    feh
```

| Pacote | Descrição |
|--------|-----------|
| `openbox` | Window manager leve |
| `obconf` | Configurador do Openbox |
| `xorg-server` | Servidor X11 |
| `xorg-xinit` | Inicializador do X |
| `xorg-xset` | Configuração do X |
| `xorg-xrandr` | Configuração de display |
| `picom` | Compositor |
| `unclutter` | Ocultar cursor |
| `chromium` | Navegador kiosk |
| `feh` | Visualizador de imagens |

---

## 🐳 Dependências Docker

### Imagens Utilizadas

| Imagem | Tag | Descrição |
|--------|-----|-----------|
| `ghcr.io/b0yz4kr14/tsijukebox` | `latest` | Aplicação principal |
| `nginx` | `alpine` | Proxy reverso |
| `prom/prometheus` | `latest` | Monitoramento |
| `grafana/grafana` | `latest` | Dashboard |
| `redis` | `alpine` | Cache |
| `certbot/certbot` | `latest` | Certificados SSL |
| `certbot/dns-cloudflare` | `latest` | SSL via Cloudflare |

### Requisitos Docker

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU cores | 2 | 4+ |
| RAM | 2 GB | 4+ GB |
| Disco | 10 GB | 20+ GB |
| Rede | Bridge | Bridge + host |

---

## 📦 Dependências Node.js

### Produção (dependencies)

```json
{
  "@hookform/resolvers": "^3.10.0",
  "@radix-ui/react-*": "^1.x",
  "@supabase/supabase-js": "^2.87.3",
  "@tanstack/react-query": "^5.83.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^3.6.0",
  "framer-motion": "^11.18.2",
  "lucide-react": "^0.462.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.61.1",
  "react-router-dom": "^6.30.1",
  "recharts": "^2.15.4",
  "sonner": "^1.7.4",
  "tailwind-merge": "^2.6.0",
  "tailwindcss-animate": "^1.0.7",
  "zod": "^3.25.76"
}
```

### Desenvolvimento (devDependencies)

```json
{
  "@playwright/test": "^1.57.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/react": "^14.3.1",
  "@vitest/coverage-v8": "^1.6.1",
  "jsdom": "^24.1.3",
  "vitest": "^1.6.1",
  "vite-plugin-pwa": "^1.2.0"
}
```

### Instalação

```bash
# Instalar todas as dependências
npm install

# Apenas produção
npm install --production

# Atualizar dependências
npm update
```

---

## 🐍 Dependências Python

### Instalador (requirements-installer.txt)

```txt
# Sem dependências externas - usa apenas stdlib
```

O instalador Python usa apenas a biblioteca padrão:
- `argparse` - Parsing de argumentos
- `dataclasses` - Data classes
- `json` - Serialização JSON
- `os`, `sys`, `shutil` - Sistema
- `pathlib` - Caminhos
- `subprocess` - Execução de comandos
- `socket` - Rede
- `typing` - Type hints

### Testes (requirements-test.txt)

```txt
pytest>=8.0.0
pytest-cov>=4.1.0
pytest-mock>=3.12.0
```

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `pytest` | 8.0+ | Framework de testes |
| `pytest-cov` | 4.1+ | Cobertura de testes |
| `pytest-mock` | 3.12+ | Mocking |

### Instalação de Dependências de Teste

```bash
# Via pip
pip install -r scripts/requirements-test.txt

# Via pacman (CachyOS/Arch)
sudo pacman -S python-pytest python-pytest-cov
```

---

## 🔧 Dependências Opcionais

### Monitoramento

```bash
sudo pacman -S --needed \
    prometheus \
    grafana \
    node_exporter
```

### SSL/TLS

```bash
sudo pacman -S --needed \
    certbot \
    certbot-nginx \
    python-certbot-dns-cloudflare
```

### Ferramentas de Debug

```bash
sudo pacman -S --needed \
    htop \
    btop \
    iotop \
    nethogs \
    tcpdump \
    strace
```

### Editores

```bash
sudo pacman -S --needed \
    nano \
    vim \
    neovim \
    code  # VSCode via AUR
```

---

## ✅ Versões Testadas

### Sistemas Operacionais

| Distro | Versão | Status |
|--------|--------|--------|
| CachyOS | 2024.01+ | ✅ Testado |
| Arch Linux | Rolling | ✅ Testado |
| Manjaro | 23.0+ | ✅ Testado |
| EndeavourOS | 2024+ | ✅ Testado |
| Garuda Linux | 2024+ | ⚠️ Compatível |
| Artix Linux | 2024+ | ⚠️ Compatível |

### Kernels

| Kernel | Versão | Status |
|--------|--------|--------|
| linux-cachyos | 6.6+ | ✅ Recomendado |
| linux-cachyos-bore | 6.6+ | ✅ Recomendado |
| linux | 6.6+ | ✅ Testado |
| linux-lts | 6.1+ | ✅ Testado |
| linux-zen | 6.6+ | ⚠️ Compatível |

### Navegadores (Kiosk)

| Navegador | Versão | Status |
|-----------|--------|--------|
| Chromium | 120+ | ✅ Recomendado |
| Chrome | 120+ | ✅ Testado |
| Firefox | 120+ | ⚠️ Limitado |
| Brave | 1.60+ | ⚠️ Compatível |

### Docker

| Componente | Versão | Status |
|------------|--------|--------|
| Docker Engine | 24.0+ | ✅ Testado |
| Docker Compose | 2.20+ | ✅ Testado |
| containerd | 1.7+ | ✅ Testado |
| runc | 1.1+ | ✅ Testado |

### Node.js

| Versão | Status |
|--------|--------|
| 22.x | ✅ Recomendado |
| 20.x | ✅ Testado |
| 18.x | ✅ Suportado |
| 16.x | ❌ Não suportado |

### Python

| Versão | Status |
|--------|--------|
| 3.12+ | ✅ Recomendado |
| 3.11+ | ✅ Testado |
| 3.10+ | ⚠️ Compatível |
| 3.9 | ❌ Não suportado |

---

## 📥 Scripts de Instalação Completa

### Instalação Mínima

```bash
#!/bin/bash
# install-minimal.sh

sudo pacman -Syu --noconfirm
sudo pacman -S --noconfirm --needed \
    git curl docker docker-compose

sudo systemctl enable --now docker
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/docker-install.py | sudo python3
```

### Instalação Completa com Kiosk

```bash
#!/bin/bash
# install-full-kiosk.sh

sudo pacman -Syu --noconfirm
sudo pacman -S --noconfirm --needed \
    git curl wget jq \
    docker docker-compose \
    openbox picom unclutter chromium feh \
    xorg-server xorg-xinit xorg-xset xorg-xrandr

sudo systemctl enable --now docker
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/docker-install.py | sudo python3 -- --monitoring
```

---

## 📚 Próximos Passos

- [Instalação CachyOS](Install-CachyOS.md)
- [Configuração de Shell](Shell-Configuration.md)
- [Setup Openbox Kiosk](Openbox-Kiosk-Setup.md)

---

*TSiJUKEBOX - Referência de Dependências*
