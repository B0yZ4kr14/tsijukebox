# Configuração do Nginx

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia para configurar o Nginx como reverse proxy para o TSiJUKEBOX.

---

## 🎯 Objetivo

Otimizar a entrega de conteúdo e gerenciar conexões.

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Deploy](#deploy)
4. [Verificação](#verificação)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Nginx instalado
- Certificado SSL (opcional)
- Acesso root

---

## ⚙️ Configuração

### Passo 1: Preparar o Ambiente

```bash
# Instalar Nginx
sudo pacman -S nginx
```

### Passo 2: Configurar Variáveis

```nginx
# /etc/nginx/sites-available/tsijukebox
server {
    listen 80;
    server_name midiaserver.local;
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 🚀 Deploy

### Método 1: Deploy Automatizado

```bash
sudo systemctl restart nginx
```

### Método 2: Deploy Manual

Edite o arquivo de configuração manualmente e reinicie o Nginx.

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
