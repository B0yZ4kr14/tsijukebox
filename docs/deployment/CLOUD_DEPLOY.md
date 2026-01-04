# Deploy em Cloud

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Guia para deploy do TSiJUKEBOX em provedores de cloud (Vercel, Netlify, etc.).

---

## 🎯 Objetivo

Facilitar o deploy em plataformas de cloud para acesso público.

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Deploy](#deploy)
4. [Verificação](#verificação)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Conta no provedor de cloud
- Repositório GitHub configurado
- Variáveis de ambiente

---

## ⚙️ Configuração

### Passo 1: Preparar o Ambiente

```bash
# Vercel
npx vercel
```

### Passo 2: Configurar Variáveis

Configure as variáveis de ambiente no dashboard do provedor.

---

## 🚀 Deploy

### Método 1: Deploy Automatizado

```bash
vercel --prod
```

### Método 2: Deploy Manual

Acesse o dashboard do provedor e conecte o repositório GitHub.

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
