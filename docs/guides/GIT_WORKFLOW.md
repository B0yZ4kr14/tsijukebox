# Git Workflow

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

Este guia descreve o fluxo de trabalho Git utilizado no projeto TSiJUKEBOX.

---

## 🎯 Objetivo

Padronizar o uso do Git para garantir um histórico limpo e colaboração eficiente.

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Fluxo de Trabalho](#fluxo-de-trabalho)
4. [Boas Práticas](#boas-práticas)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Git
- Editor de código (VS Code recomendado)

---

## ⚙️ Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/B0yZ4kr14/tsijukebox.git
cd tsijukebox
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

---

## 🔄 Fluxo de Trabalho


### Branches

- `main`: Branch principal, sempre estável
- `develop`: Branch de desenvolvimento
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `docs/*`: Atualizações de documentação

### Fluxo

1. Crie uma branch a partir de `develop`
2. Faça commits semânticos
3. Abra um Pull Request
4. Aguarde review
5. Merge após aprovação


---

## ✅ Boas Práticas

1. **Commits Semânticos:** Use o padrão Conventional Commits
2. **Code Review:** Todas as alterações devem passar por review
3. **Testes:** Escreva testes para novas funcionalidades
4. **Documentação:** Atualize a documentação quando necessário

---

## 🐛 Troubleshooting

### Problema Comum 1

**Sintoma:** Descrição do problema

**Solução:**
```bash
# Comando para resolver
```

---

## 🔗 Recursos Relacionados

- [Guia do Desenvolvedor](../DEVELOPER-GUIDE.md)
- [Padrões de Código](../CODING-STANDARDS.md)
- [Como Contribuir](../CONTRIBUTING.md)
