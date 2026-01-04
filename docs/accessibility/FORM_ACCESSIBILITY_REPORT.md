# 📋 Relatório de Acessibilidade de Formulários

**Data:** 2025-12-25 02:43:04
**Projeto:** tsijukebox

## 📊 Resumo

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 293 |
| Arquivos modificados | 0 |
| Total de problemas | 32 |
| Problemas corrigidos | 0 |

## 📋 Por Tipo de Problema

| Tipo | Quantidade |
|------|------------|
| aria-invalid ausente em erro | 25 |
| Erro sem aria-describedby | 5 |
| Placeholder usado como label | 2 |

## 🚨 Por Severidade

| Severidade | Quantidade |
|------------|------------|
| 🟠 ALTA | 32 |

## 📁 Detalhes por Arquivo

### src/components/settings/SpicetifySection.tsx
- Problemas: 3
- Corrigidos: 0

- **Linha 200:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro
- **Linha 465:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro
- **Linha 569:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/settings/WeatherConfigSection.tsx
- Problemas: 3
- Corrigidos: 0

- **Linha 184:** Erro sem aria-describedby
  - Sugestão: Adicionar role="alert" ou aria-live="polite" para anunciar erros
- **Linha 184:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro
- **Linha 185:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/ui/input.tsx
- Problemas: 3
- Corrigidos: 0

- **Linha 164:** Erro sem aria-describedby
  - Sugestão: Adicionar role="alert" ou aria-live="polite" para anunciar erros
- **Linha 125:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro
- **Linha 164:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/settings/NtpConfigSection.tsx
- Problemas: 2
- Corrigidos: 0

- **Linha 226:** Erro sem aria-describedby
  - Sugestão: Adicionar role="alert" ou aria-live="polite" para anunciar erros
- **Linha 226:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/settings/backup/BackupCard.tsx
- Problemas: 2
- Corrigidos: 0

- **Linha 120:** Erro sem aria-describedby
  - Sugestão: Adicionar role="alert" ou aria-live="polite" para anunciar erros
- **Linha 120:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/navigation/HeaderV2.tsx
- Problemas: 2
- Corrigidos: 0

- **Linha 385:** Erro sem aria-describedby
  - Sugestão: Adicionar role="alert" ou aria-live="polite" para anunciar erros
- **Linha 385:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/pages/public/DesignSystem.tsx
- Problemas: 2
- Corrigidos: 0

- **Linha 384:** Placeholder usado como label
  - Sugestão: Adicionar aria-label="Input padrão" (placeholder não é suficiente)
- **Linha 385:** Placeholder usado como label
  - Sugestão: Adicionar aria-label="Input desabilitado" (placeholder não é suficiente)

### src/components/debug/ContrastDebugPanel.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 95:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/help/InteractiveTestMode.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 353:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/player/CommandDeck.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 408:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/settings/AdvancedDatabaseSection.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 784:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/settings/SettingsNotificationBanner.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 69:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/settings/VoiceControlSection.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 473:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/ui/themed/index.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 260:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/components/navigation/Header.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 194:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/pages/brand/BrandGuidelines.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 748:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/pages/dashboards/A11yDashboard.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 164:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/pages/dashboards/ClientsMonitorDashboard.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 179:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/pages/dashboards/GitHubDashboard.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 199:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro

### src/pages/dashboards/HealthDashboard.tsx
- Problemas: 1
- Corrigidos: 0

- **Linha 119:** aria-invalid ausente em erro
  - Sugestão: Adicionar aria-invalid={hasError} para indicar estado de erro
