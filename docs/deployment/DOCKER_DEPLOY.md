# Deploy com Docker

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia para deploy do TSiJUKEBOX usando Docker.

---

## 🎯 Objetivo

Facilitar o deploy em qualquer ambiente usando containers Docker.

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Deploy](#deploy)
4. [Verificação](#verificação)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo

---

## ⚙️ Configuração

### Passo 1: Preparar o Ambiente

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/tsijukebox.git
cd tsijukebox
```

### Passo 2: Configurar Variáveis

```bash
# Configure variáveis de ambiente
cp .env.example .env
nano .env
```

---

## 🚀 Deploy

### Método 1: Deploy Automatizado

```bash
docker-compose up -d
```

### Método 2: Deploy Manual

```bash
# Build da imagem
docker build -t tsijukebox .

# Executar container
docker run -d -p 3000:3000 tsijukebox
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
