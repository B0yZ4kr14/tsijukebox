# Conformidade WCAG 2.1 - TSiJUKEBOX

> **Última Atualização:** 24/12/2025  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento  
> **Nível de Conformidade:** AA (Objetivo)

---

## 📋 Visão Geral

Este documento estabelece as diretrizes e práticas para garantir que o **TSiJUKEBOX** atenda aos critérios de conformidade **WCAG 2.1 nível AA** (Web Content Accessibility Guidelines). A acessibilidade é um compromisso fundamental do projeto, garantindo que todos os usuários, independentemente de suas capacidades, possam utilizar plenamente o sistema.

---

## 🎯 Objetivo

Garantir que o TSiJUKEBOX seja **acessível a todos os usuários**, incluindo:

- Pessoas com deficiência visual (cegueira, baixa visão, daltonismo)
- Pessoas com deficiência auditiva
- Pessoas com deficiência motora
- Pessoas com deficiência cognitiva
- Usuários de tecnologias assistivas (leitores de tela, ampliadores, navegação por voz)
- Usuários de dispositivos móveis e tablets
- Usuários em ambientes com limitações (conexão lenta, dispositivos antigos)

---

## 📚 Índice

1. [Princípios WCAG](#princípios-wcag)
2. [Critérios de Sucesso](#critérios-de-sucesso)
3. [Implementação Prática](#implementação-prática)
4. [Testes e Validação](#testes-e-validação)
5. [Checklist de Conformidade](#checklist-de-conformidade)
6. [Problemas Identificados](#problemas-identificados)
7. [Roadmap de Correções](#roadmap-de-correções)

---

## 🌟 Princípios WCAG

### 1. Perceptível

**Definição:** A informação e os componentes da interface do usuário devem ser apresentados de forma que possam ser percebidos pelos usuários.

#### 1.1 Alternativas em Texto

- **1.1.1 Conteúdo Não Textual (Nível A):** Todo conteúdo não textual deve ter uma alternativa textual.

**Implementação no TSiJUKEBOX:**
```tsx
// ✅ Correto
<img src="/album-cover.jpg" alt="Capa do álbum Thriller de Michael Jackson" />

// ❌ Incorreto
<img src="/album-cover.jpg" />
```

**Status Atual:** ⚠️ **27 imagens sem alt text identificadas**

#### 1.2 Mídias com Base no Tempo

- **1.2.1 Apenas Áudio e Apenas Vídeo (Nível A):** Fornecer alternativas para mídia pré-gravada.
- **1.2.2 Legendas (Nível A):** Fornecer legendas para todo conteúdo de áudio.

**Implementação no TSiJUKEBOX:**
```tsx
<video controls>
  <source src="tutorial.mp4" type="video/mp4" />
  <track kind="captions" src="captions-pt.vtt" srclang="pt" label="Português" />
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English" />
</video>
```

**Status Atual:** ✅ **Não aplicável** (sistema não possui conteúdo de vídeo próprio)

#### 1.3 Adaptável

- **1.3.1 Informações e Relações (Nível A):** Estrutura e relações devem ser programaticamente determinadas.
- **1.3.2 Sequência Significativa (Nível A):** Ordem de leitura deve ser lógica.
- **1.3.3 Características Sensoriais (Nível A):** Instruções não devem depender apenas de características sensoriais.

**Implementação no TSiJUKEBOX:**
```tsx
// ✅ Correto - Estrutura semântica
<nav aria-label="Menu principal">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/player">Player</a></li>
    <li><a href="/settings">Configurações</a></li>
  </ul>
</nav>

// ❌ Incorreto - Div soup
<div>
  <div onClick={goToDashboard}>Dashboard</div>
  <div onClick={goToPlayer}>Player</div>
</div>
```

**Status Atual:** ✅ **Parcialmente implementado** (estrutura semântica presente na maioria dos componentes)

#### 1.4 Distinguível

- **1.4.1 Uso de Cor (Nível A):** Cor não deve ser o único meio de transmitir informação.
- **1.4.3 Contraste Mínimo (Nível AA):** Razão de contraste de pelo menos 4.5:1.
- **1.4.10 Reflow (Nível AA):** Conteúdo deve ser apresentável sem perda de informação em 320px.
- **1.4.11 Contraste Não Textual (Nível AA):** Razão de contraste de 3:1 para componentes de interface.
- **1.4.12 Espaçamento de Texto (Nível AA):** Permitir ajuste de espaçamento sem perda de conteúdo.

**Implementação no TSiJUKEBOX:**

| Elemento | Cor de Fundo | Cor de Texto | Razão de Contraste | Status |
|----------|--------------|--------------|-------------------|--------|
| Background principal | `#0a0a0a` | `#ffffff` | 19.37:1 | ✅ |
| Background card | `#121212` | `#ffffff` | 17.04:1 | ✅ |
| Texto secundário | `#0a0a0a` | `#b3b3b3` | 10.24:1 | ✅ |
| Botão primário | `#1DB954` | `#ffffff` | 3.48:1 | ⚠️ Abaixo do ideal |
| Link hover | `#1a1a1a` | `#1ed760` | 5.82:1 | ✅ |

**Status Atual:** ⚠️ **Requer atenção** (alguns componentes com contraste insuficiente)

---

### 2. Operável

**Definição:** Os componentes de interface do usuário e a navegação devem ser operáveis.

#### 2.1 Acessível por Teclado

- **2.1.1 Teclado (Nível A):** Toda funcionalidade deve estar disponível via teclado.
- **2.1.2 Sem Bloqueio de Teclado (Nível A):** Foco não deve ficar preso.
- **2.1.4 Atalhos de Teclado de Caractere Único (Nível A):** Atalhos devem ser desativáveis ou remapeáveis.

**Implementação no TSiJUKEBOX:**

| Tecla/Atalho | Ação | Contexto | Status |
|--------------|------|----------|--------|
| `Tab` | Navegar para próximo elemento | Global | ✅ |
| `Shift + Tab` | Navegar para elemento anterior | Global | ✅ |
| `Enter` | Ativar elemento focado | Global | ✅ |
| `Space` | Reproduzir/Pausar | Player | ✅ |
| `→` | Próxima faixa | Player | ✅ |
| `←` | Faixa anterior | Player | ✅ |
| `↑` | Aumentar volume | Player | ✅ |
| `↓` | Diminuir volume | Player | ✅ |
| `Escape` | Fechar modal/diálogo | Modais | ✅ |
| `Ctrl + K` | Abrir busca | Global | 📅 Planejado |

**Status Atual:** ✅ **Implementado** (navegação por teclado funcional)

#### 2.2 Tempo Suficiente

- **2.2.1 Ajuste de Tempo (Nível A):** Permitir ajuste ou desativação de limites de tempo.
- **2.2.2 Pausar, Parar, Ocultar (Nível A):** Controlar conteúdo em movimento.

**Implementação no TSiJUKEBOX:**
```tsx
// Controles de reprodução sempre visíveis
<PlayerControls>
  <button aria-label="Pausar reprodução">
    <PauseIcon />
  </button>
</PlayerControls>
```

**Status Atual:** ✅ **Implementado** (usuário tem controle total sobre reprodução)

#### 2.3 Convulsões e Reações Físicas

- **2.3.1 Três Flashes ou Abaixo do Limite (Nível A):** Evitar conteúdo que pisca mais de 3 vezes por segundo.

**Status Atual:** ✅ **Conforme** (sem animações com flashes rápidos)

#### 2.4 Navegável

- **2.4.1 Ignorar Blocos (Nível A):** Mecanismo para pular blocos repetidos.
- **2.4.2 Página com Título (Nível A):** Páginas têm títulos descritivos.
- **2.4.3 Ordem do Foco (Nível A):** Ordem de foco é lógica e intuitiva.
- **2.4.4 Finalidade do Link (Nível A):** Finalidade de cada link é clara.
- **2.4.5 Várias Formas (Nível AA):** Múltiplas formas de localizar páginas.
- **2.4.6 Cabeçalhos e Rótulos (Nível AA):** Cabeçalhos e rótulos descritivos.
- **2.4.7 Foco Visível (Nível AA):** Indicador de foco visível.

**Implementação no TSiJUKEBOX:**
```tsx
// Skip link para navegação rápida
<a href="#main-content" className="skip-link">
  Pular para conteúdo principal
</a>

// Títulos de página descritivos
<Helmet>
  <title>Dashboard - TSiJUKEBOX</title>
</Helmet>

// Foco visível
.focus-visible:focus {
  outline: 2px solid #1DB954;
  outline-offset: 2px;
}
```

**Status Atual:** ⚠️ **Parcialmente implementado** (falta skip links em algumas páginas)

#### 2.5 Modalidades de Entrada

- **2.5.1 Gestos de Ponteiro (Nível A):** Funcionalidade não deve depender de gestos complexos.
- **2.5.2 Cancelamento de Ponteiro (Nível A):** Ações devem ser canceláveis.
- **2.5.3 Rótulo no Nome (Nível A):** Rótulo visível deve estar no nome acessível.
- **2.5.4 Ativação por Movimento (Nível A):** Funcionalidade ativada por movimento deve ter alternativa.

**Status Atual:** ✅ **Conforme** (interface baseada em cliques simples)

---

### 3. Compreensível

**Definição:** A informação e a operação da interface do usuário devem ser compreensíveis.

#### 3.1 Legível

- **3.1.1 Idioma da Página (Nível A):** Idioma padrão deve ser programaticamente determinado.
- **3.1.2 Idioma de Partes (Nível AA):** Idioma de partes específicas deve ser indicado.

**Implementação no TSiJUKEBOX:**
```tsx
<html lang="pt-BR">
  <head>
    <meta charSet="UTF-8" />
    <title>TSiJUKEBOX</title>
  </head>
  <body>
    <p>Bem-vindo ao TSiJUKEBOX</p>
    <p lang="en">Welcome to TSiJUKEBOX</p>
  </body>
</html>
```

**Status Atual:** ✅ **Implementado**

#### 3.2 Previsível

- **3.2.1 Em Foco (Nível A):** Foco não deve iniciar mudança de contexto.
- **3.2.2 Em Entrada (Nível A):** Entrada não deve causar mudança de contexto inesperada.
- **3.2.3 Navegação Consistente (Nível AA):** Mecanismos de navegação devem ser consistentes.
- **3.2.4 Identificação Consistente (Nível AA):** Componentes com mesma funcionalidade devem ser identificados consistentemente.

**Status Atual:** ✅ **Implementado** (navegação consistente em todas as páginas)

#### 3.3 Assistência de Entrada

- **3.3.1 Identificação de Erro (Nível A):** Erros devem ser identificados e descritos.
- **3.3.2 Rótulos ou Instruções (Nível A):** Rótulos ou instruções devem ser fornecidos.
- **3.3.3 Sugestão de Erro (Nível AA):** Sugestões de correção devem ser fornecidas.
- **3.3.4 Prevenção de Erro (Nível AA):** Ações importantes devem ser reversíveis ou confirmáveis.

**Implementação no TSiJUKEBOX:**
```tsx
// Validação de formulário com mensagens claras
<form onSubmit={handleSubmit}>
  <label htmlFor="email">
    E-mail *
    <span className="sr-only">(obrigatório)</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={errors.email ? "true" : "false"}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="error">
      {errors.email}
    </p>
  )}
</form>

// Confirmação de ações críticas
<Dialog>
  <DialogTitle>Confirmar exclusão</DialogTitle>
  <DialogDescription>
    Tem certeza que deseja excluir esta playlist? Esta ação não pode ser desfeita.
  </DialogDescription>
  <DialogActions>
    <Button onClick={onCancel}>Cancelar</Button>
    <Button onClick={onConfirm} variant="destructive">Excluir</Button>
  </DialogActions>
</Dialog>
```

**Status Atual:** ✅ **Implementado** (validação e confirmações presentes)

---

### 4. Robusto

**Definição:** O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.

#### 4.1 Compatível

- **4.1.1 Análise (Nível A):** Marcação deve ser válida.
- **4.1.2 Nome, Função, Valor (Nível A):** Nome e função devem ser programaticamente determinados.
- **4.1.3 Mensagens de Status (Nível AA):** Mensagens de status devem ser apresentadas sem receber foco.

**Implementação no TSiJUKEBOX:**
```tsx
// Componente com ARIA apropriado
<button
  type="button"
  aria-label="Reproduzir música"
  aria-pressed={isPlaying}
  onClick={togglePlay}
>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>

// Live region para notificações
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// Toast com role="alert"
<Toast role="alert">
  Música adicionada à fila
</Toast>
```

**Status Atual:** ⚠️ **Parcialmente implementado** (202 componentes sem aria-label identificados)

---

## 💻 Implementação Prática

### Componentes Acessíveis

#### Botões

```tsx
// ✅ Botão acessível completo
<button
  type="button"
  aria-label="Adicionar à playlist"
  aria-pressed={isAdded}
  aria-describedby="tooltip-add"
  disabled={isLoading}
  onClick={handleAdd}
  className="btn-icon"
>
  {isAdded ? <CheckIcon /> : <PlusIcon />}
</button>

// Tooltip associado
<div id="tooltip-add" role="tooltip" className="sr-only">
  {isAdded ? "Remover da playlist" : "Adicionar à playlist"}
</div>
```

#### Formulários

```tsx
// ✅ Formulário acessível
<form onSubmit={handleSubmit} noValidate>
  <fieldset>
    <legend>Informações de Login</legend>
    
    <div className="form-group">
      <label htmlFor="username">
        Nome de usuário
        <span aria-label="obrigatório">*</span>
      </label>
      <input
        id="username"
        type="text"
        required
        aria-required="true"
        aria-invalid={errors.username ? "true" : "false"}
        aria-describedby="username-hint username-error"
        autoComplete="username"
      />
      <p id="username-hint" className="hint">
        Mínimo de 3 caracteres
      </p>
      {errors.username && (
        <p id="username-error" role="alert" className="error">
          {errors.username}
        </p>
      )}
    </div>
    
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Entrando..." : "Entrar"}
    </button>
  </fieldset>
</form>
```

#### Modais/Diálogos

```tsx
// ✅ Modal acessível
<Dialog
  open={isOpen}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">
    Configurações de Privacidade
  </DialogTitle>
  
  <DialogContent id="dialog-description">
    <p>Gerencie suas preferências de privacidade.</p>
    {/* Conteúdo do modal */}
  </DialogContent>
  
  <DialogActions>
    <button onClick={onClose}>Cancelar</button>
    <button onClick={onSave} autoFocus>Salvar</button>
  </DialogActions>
</Dialog>
```

#### Navegação por Tabs

```tsx
// ✅ Tabs acessíveis
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList role="tablist" aria-label="Seções de configuração">
    <TabsTrigger
      value="general"
      role="tab"
      aria-selected={activeTab === "general"}
      aria-controls="panel-general"
    >
      Geral
    </TabsTrigger>
    <TabsTrigger
      value="privacy"
      role="tab"
      aria-selected={activeTab === "privacy"}
      aria-controls="panel-privacy"
    >
      Privacidade
    </TabsTrigger>
  </TabsList>
  
  <TabsContent
    value="general"
    role="tabpanel"
    id="panel-general"
    aria-labelledby="tab-general"
  >
    {/* Conteúdo da aba Geral */}
  </TabsContent>
  
  <TabsContent
    value="privacy"
    role="tabpanel"
    id="panel-privacy"
    aria-labelledby="tab-privacy"
  >
    {/* Conteúdo da aba Privacidade */}
  </TabsContent>
</Tabs>
```

---

## 🧪 Testes e Validação

### Ferramentas Automatizadas

| Ferramenta | Tipo | Uso | Link |
|------------|------|-----|------|
| **axe DevTools** | Extensão de navegador | Análise em tempo real | [Chrome](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) |
| **WAVE** | Ferramenta online | Avaliação visual | [wave.webaim.org](https://wave.webaim.org/) |
| **Lighthouse** | DevTools do Chrome | Auditoria completa | Integrado no Chrome |
| **Pa11y** | CLI | Testes automatizados | [pa11y.org](https://pa11y.org/) |
| **axe-core** | Biblioteca JS | Integração em testes | [GitHub](https://github.com/dequelabs/axe-core) |

### Testes Manuais

#### 1. Teste de Navegação por Teclado

**Procedimento:**
1. Desconecte o mouse
2. Use apenas `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape` e setas
3. Verifique se:
   - Todos os elementos interativos são alcançáveis
   - Ordem de foco é lógica
   - Foco é visível em todos os elementos
   - Não há armadilhas de foco
   - Atalhos de teclado funcionam

**Resultado Esperado:** Todas as funcionalidades devem ser acessíveis via teclado.

#### 2. Teste com Leitor de Tela

**Ferramentas:**
- **NVDA** (Windows) - [nvaccess.org](https://www.nvaccess.org/)
- **JAWS** (Windows) - [freedomscientific.com](https://www.freedomscientific.com/products/software/jaws/)
- **VoiceOver** (macOS/iOS) - Integrado no sistema
- **TalkBack** (Android) - Integrado no sistema

**Procedimento:**
1. Ative o leitor de tela
2. Navegue pela aplicação
3. Verifique se:
   - Todos os elementos são anunciados corretamente
   - Rótulos e descrições são claros
   - Estado dos componentes é comunicado
   - Estrutura de navegação é compreensível

**Resultado Esperado:** Usuário deve compreender completamente a interface apenas pelo áudio.

#### 3. Teste de Contraste de Cores

**Ferramentas:**
- **Colour Contrast Analyser** - [tpgi.com](https://www.tpgi.com/color-contrast-checker/)
- **WebAIM Contrast Checker** - [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)

**Procedimento:**
1. Identifique todos os pares de cores (texto/fundo)
2. Meça a razão de contraste
3. Verifique conformidade:
   - Texto normal: mínimo 4.5:1 (AA) ou 7:1 (AAA)
   - Texto grande (18pt+): mínimo 3:1 (AA) ou 4.5:1 (AAA)
   - Componentes de UI: mínimo 3:1 (AA)

**Resultado Esperado:** Todos os pares devem atender ao nível AA.

#### 4. Teste de Zoom e Redimensionamento

**Procedimento:**
1. Aumente o zoom do navegador para 200%
2. Verifique se:
   - Conteúdo permanece legível
   - Não há sobreposição de elementos
   - Rolagem horizontal não é necessária (exceto tabelas)
   - Funcionalidade permanece intacta

**Resultado Esperado:** Interface deve ser utilizável até 200% de zoom.

---

## ✅ Checklist de Conformidade

### Nível A (Obrigatório)

- [ ] **1.1.1** Todas as imagens têm texto alternativo
- [ ] **1.2.1** Alternativas para áudio e vídeo pré-gravados
- [ ] **1.2.2** Legendas para conteúdo de áudio
- [ ] **1.3.1** Informações e relações são programaticamente determinadas
- [ ] **1.3.2** Sequência de leitura é lógica
- [ ] **1.3.3** Instruções não dependem apenas de características sensoriais
- [ ] **1.4.1** Cor não é o único meio de transmitir informação
- [ ] **1.4.2** Controle de áudio disponível
- [ ] **2.1.1** Toda funcionalidade disponível via teclado
- [ ] **2.1.2** Sem bloqueio de teclado
- [ ] **2.1.4** Atalhos de teclado são configuráveis
- [ ] **2.2.1** Ajuste de tempo disponível
- [ ] **2.2.2** Controle de conteúdo em movimento
- [ ] **2.3.1** Sem flashes rápidos
- [ ] **2.4.1** Mecanismo para pular blocos
- [ ] **2.4.2** Páginas têm títulos descritivos
- [ ] **2.4.3** Ordem de foco é lógica
- [ ] **2.4.4** Finalidade dos links é clara
- [ ] **2.5.1** Gestos complexos têm alternativa
- [ ] **2.5.2** Ações de ponteiro são canceláveis
- [ ] **2.5.3** Rótulo visível está no nome acessível
- [ ] **2.5.4** Ativação por movimento tem alternativa
- [ ] **3.1.1** Idioma da página é definido
- [ ] **3.2.1** Foco não causa mudança de contexto
- [ ] **3.2.2** Entrada não causa mudança de contexto inesperada
- [ ] **3.3.1** Erros são identificados
- [ ] **3.3.2** Rótulos ou instruções são fornecidos
- [ ] **4.1.1** Marcação é válida
- [ ] **4.1.2** Nome, função e valor são programaticamente determinados

### Nível AA (Objetivo do TSiJUKEBOX)

- [ ] **1.2.4** Legendas ao vivo para conteúdo de áudio
- [ ] **1.2.5** Audiodescrição para vídeo pré-gravado
- [ ] **1.3.4** Orientação não é restrita
- [ ] **1.3.5** Identificação do propósito de entrada
- [ ] **1.4.3** Contraste mínimo de 4.5:1
- [ ] **1.4.4** Redimensionamento de texto até 200%
- [ ] **1.4.5** Imagens de texto evitadas
- [ ] **1.4.10** Reflow sem perda de informação
- [ ] **1.4.11** Contraste não textual de 3:1
- [ ] **1.4.12** Espaçamento de texto ajustável
- [ ] **1.4.13** Conteúdo em hover ou foco é controlável
- [ ] **2.4.5** Múltiplas formas de localizar páginas
- [ ] **2.4.6** Cabeçalhos e rótulos são descritivos
- [ ] **2.4.7** Foco é visível
- [ ] **3.1.2** Idioma de partes é indicado
- [ ] **3.2.3** Navegação é consistente
- [ ] **3.2.4** Identificação é consistente
- [ ] **3.3.3** Sugestões de correção são fornecidas
- [ ] **3.3.4** Prevenção de erro para ações importantes
- [ ] **4.1.3** Mensagens de status são anunciadas

---

## 🚨 Problemas Identificados

Com base na análise do frontend (FRONTEND_ANALYSIS_REPORT.md), foram identificados os seguintes problemas:

### Críticos (Prioridade Alta)

| Problema | Quantidade | Impacto | Critério WCAG |
|----------|------------|---------|---------------|
| Componentes sem `aria-label` | 202 | Alto | 4.1.2 |
| Imagens sem `alt` text | 27 | Alto | 1.1.1 |
| Botões sem `type` explícito | 68 | Médio | 4.1.2 |

### Importantes (Prioridade Média)

| Problema | Quantidade | Impacto | Critério WCAG |
|----------|------------|---------|---------------|
| Componentes sem suporte a dark mode | 10+ | Médio | 1.4.3 |
| Contraste insuficiente | Vários | Médio | 1.4.3, 1.4.11 |
| Falta de skip links | Algumas páginas | Médio | 2.4.1 |

---

## 🛠️ Roadmap de Correções

### Fase 1: Correções Críticas (Sprint 1-2)

**Objetivo:** Resolver problemas que impedem o uso por tecnologias assistivas.

- [ ] Adicionar `aria-label` aos 202 componentes identificados
- [ ] Adicionar `alt` text às 27 imagens
- [ ] Adicionar `type="button"` aos 68 botões
- [ ] Implementar skip links em todas as páginas
- [ ] Corrigir ordem de foco em componentes complexos

**Responsável:** Equipe de Frontend  
**Prazo:** 2 semanas

### Fase 2: Melhorias de Contraste (Sprint 3-4)

**Objetivo:** Garantir contraste adequado em todos os componentes.

- [ ] Auditar todos os pares de cores
- [ ] Ajustar cores com contraste insuficiente
- [ ] Implementar design tokens para cores acessíveis
- [ ] Testar com ferramentas de contraste
- [ ] Documentar paleta de cores acessível

**Responsável:** Equipe de Design + Frontend  
**Prazo:** 2 semanas

### Fase 3: Suporte a Dark Mode (Sprint 5-6)

**Objetivo:** Implementar dark mode acessível em todos os componentes.

- [ ] Implementar dark mode nos 10+ componentes faltantes
- [ ] Garantir contraste adequado no dark mode
- [ ] Testar transição entre modos
- [ ] Persistir preferência do usuário
- [ ] Respeitar preferência do sistema operacional

**Responsável:** Equipe de Frontend  
**Prazo:** 2 semanas

### Fase 4: Testes e Validação (Sprint 7)

**Objetivo:** Validar conformidade WCAG 2.1 AA.

- [ ] Executar testes automatizados (axe, Pa11y)
- [ ] Realizar testes manuais com leitores de tela
- [ ] Testar navegação por teclado em todos os fluxos
- [ ] Validar com usuários reais com deficiências
- [ ] Documentar resultados e ajustes necessários

**Responsável:** Equipe de QA + Acessibilidade  
**Prazo:** 1 semana

### Fase 5: Documentação e Treinamento (Sprint 8)

**Objetivo:** Garantir manutenção da acessibilidade no futuro.

- [ ] Atualizar guias de desenvolvimento
- [ ] Criar checklist de acessibilidade para PRs
- [ ] Treinar equipe em práticas de acessibilidade
- [ ] Configurar testes automatizados no CI/CD
- [ ] Estabelecer processo de revisão de acessibilidade

**Responsável:** Tech Lead + Equipe  
**Prazo:** 1 semana

---

## 📚 Recursos e Referências

### Documentação Oficial

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)

### Ferramentas

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Leitores de Tela

- [NVDA](https://www.nvaccess.org/) (Windows, gratuito)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, pago)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS/iOS, integrado)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Android, integrado)

### Documentos Relacionados

- [Guia de Acessibilidade](../ACCESSIBILITY.md)
- [Guia de ARIA](ARIA_GUIDE.md)
- [Navegação por Teclado](KEYBOARD_NAVIGATION.md)
- [Suporte a Leitores de Tela](SCREEN_READER.md)
- [Design System](../DESIGN-SYSTEM.md)
- [Frontend Analysis Report](../FRONTEND_ANALYSIS_REPORT.md)

---

## 📞 Contato e Suporte

Para questões relacionadas à acessibilidade do TSiJUKEBOX:

- **Issues no GitHub:** [github.com/B0yZ4kr14/tsijukebox/issues](https://github.com/B0yZ4kr14/tsijukebox/issues)
- **Etiqueta:** `accessibility`
- **Responsável:** Equipe de Acessibilidade

---

**Última Revisão:** 24/12/2025  
**Próxima Revisão:** 24/03/2026  
**Versão do Documento:** 1.0.0
