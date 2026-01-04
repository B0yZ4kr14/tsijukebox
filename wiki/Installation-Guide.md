<div align="center">

# 📥 Guia de Instalação

[![CachyOS](https://img.shields.io/badge/CachyOS-Ready-00D4FF?style=for-the-badge&logo=archlinux&logoColor=white)](https://cachyos.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

**Instalação completa do TSiJUKEBOX em CachyOS / Arch Linux**

**🌐 Acesso:** `https://midiaserver.local/jukebox` · **🔐 Login:** `admin` / `admin`

</div>

---

## 📋 Pré-requisitos

<table>
<tr>
<td width="50%">

### 🐧 Sistema Operacional

| Componente | Recomendado |
|------------|:-----------:|
| **OS** | CachyOS / Arch Linux |
| **Shell** | fish |
| **WM** | Openbox |

</td>
<td width="50%">

### ⚙️ Hardware

| Componente | Mínimo | Recomendado |
|------------|:------:|:-----------:|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 2 GB | 4+ GB |
| **Disco** | 500 MB | 2+ GB |

</td>
</tr>
</table>

---

## 🚀 Instalação Rápida

### 🧙 Wizard Interativo (Recomendado)

O wizard analisa seu hardware e sugere o melhor modo:

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/scripts/installation-wizard.py | python3
```

### 🚀 Instalação Direta

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/scripts/unified-installer.py | sudo python3
```

---

## 🎮 Modos de Instalação

### 🎵 Modo Full (Completo)

```bash
sudo python3 unified-installer.py
```

**Inclui:** Docker, UFW, NTP, Nginx, SSL, Avahi, Grafana, Prometheus, Fail2ban, Spotify

**Acesso:** `https://midiaserver.local/jukebox`

---

### 🖥️ Modo Kiosk

```bash
sudo python3 unified-installer.py --mode kiosk
```

**Características:**
- ✅ Interface touchscreen otimizada
- ✅ Proteção contra saída do app
- ✅ Chromium --kiosk
- ✅ HTTPS via `https://midiaserver.local/jukebox`

---

### 🖧 Modo Server

```bash
sudo python3 unified-installer.py --mode server --no-spotify
```

**Características:**
- ✅ Sem interface gráfica
- ✅ API REST disponível
- ✅ Baixo consumo de recursos

**Acesso:** `https://midiaserver.local:8080/api`

---

## 📦 Componentes Instalados

| Componente | Descrição | Porta |
|------------|-----------|:-----:|
| 🐳 **Docker** | Containerização | - |
| 🔥 **UFW** | Firewall | - |
| ⏰ **NTP** | Sincronização de tempo | 123 |
| 🌐 **Nginx** | Proxy reverso + SSL | 80, 443 |
| 📊 **Grafana** | Monitoramento visual | 3000 |
| 📈 **Prometheus** | Métricas | 9090 |
| 🛡️ **Fail2ban** | Proteção contra ataques | - |
| 📡 **Avahi/mDNS** | Acesso via `.local` | 5353 |
| 🎵 **Spotify** | Player integrado | - |
| 🎨 **Spicetify** | Customização Spotify | - |

---

## 🔗 Próximos Passos

<table>
<tr>
<td align="center">

[![Configuração](https://img.shields.io/badge/⚙️-Configuração-00D4FF?style=for-the-badge)](Configuration)

</td>
<td align="center">

[![Troubleshooting](https://img.shields.io/badge/🔧-Problemas-FF4444?style=for-the-badge)](Troubleshooting)

</td>
</tr>
</table>

---

<p align="center">
  <a href="Home">← Voltar para Home</a> | <a href="Configuration">Configuração →</a>
</p>
