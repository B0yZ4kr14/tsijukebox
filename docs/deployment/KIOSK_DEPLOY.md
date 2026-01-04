# Deploy em Modo Kiosk

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia para deploy do TSiJUKEBOX em modo kiosk (tela cheia dedicada).

---

## 🎯 Objetivo

Configurar o sistema para uso em terminais dedicados ou displays públicos.

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Deploy](#deploy)
4. [Verificação](#verificação)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Raspberry Pi 4 ou PC dedicado
- CachyOS/Arch Linux
- Openbox
- Chromium

---

## ⚙️ Configuração

### Passo 1: Preparar o Ambiente

```bash
# Instalar dependências
sudo pacman -S openbox chromium xorg-server
```

### Passo 2: Configurar Variáveis

```bash
# Configurar autologin
sudo systemctl edit getty@tty1.service
```

---

## 🚀 Deploy

### Método 1: Deploy Automatizado

```bash
./scripts/unified-installer.py --mode kiosk
```

### Método 2: Deploy Manual

Veja a seção de configuração manual do Openbox.

---

## ✅ Verificação

Após o deploy, verifique:

1. [ ] Aplicação está acessível
2. [ ] Logs não mostram erros
3. [ ] Funcionalidades principais funcionam
4. [ ] SSL está configurado (se aplicável)

---

## 🐛 Troubleshooting

### Problema: Aplicação não inicia

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
```bash
# Verificar variáveis
env | grep VITE_
```

---

## 🔗 Recursos Relacionados

- [Guia de Deploy](../PRODUCTION-DEPLOY.md)
- [Monitoramento](../MONITORING.md)
- [Configuração](../CONFIGURATION.md)
