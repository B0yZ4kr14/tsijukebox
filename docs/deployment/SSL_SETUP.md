# Configuração de SSL/TLS

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia para configurar certificados SSL/TLS no TSiJUKEBOX.

---

## 🎯 Objetivo

Garantir conexões seguras via HTTPS.

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Deploy](#deploy)
4. [Verificação](#verificação)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Domínio configurado
- Acesso root ao servidor
- Certbot instalado

---

## ⚙️ Configuração

### Passo 1: Preparar o Ambiente

```bash
# Instalar Certbot
sudo pacman -S certbot certbot-nginx
```

### Passo 2: Configurar Variáveis

```bash
# Obter certificado
sudo certbot --nginx -d seudominio.com
```

---

## 🚀 Deploy

### Método 1: Deploy Automatizado

```bash
sudo certbot --nginx
```

### Método 2: Deploy Manual

Para certificados self-signed, use:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```

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
