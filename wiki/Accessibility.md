# ♿ Acessibilidade

## Conformidade WCAG 2.1

O TSiJUKEBOX segue as diretrizes WCAG 2.1 nível AA.

### Princípios

| Princípio | Descrição | Status |
|-----------|-----------|--------|
| **Perceptível** | Conteúdo apresentável de formas perceptíveis | ✅ |
| **Operável** | Interface operável por todos | ✅ |
| **Compreensível** | Informação compreensível | ✅ |
| **Robusto** | Compatível com tecnologias assistivas | ✅ |

## Recursos de Acessibilidade

### Navegação por Teclado

| Tecla | Ação |
|-------|------|
| `Tab` | Navegar entre elementos |
| `Enter` | Ativar elemento |
| `Escape` | Fechar modal/menu |
| `Space` | Play/Pause música |
| `←` `→` | Anterior/Próxima faixa |
| `↑` `↓` | Aumentar/Diminuir volume |

### Atributos ARIA

```tsx
// Botões com ícones
<Button aria-label="Reproduzir música">
  <PlayIcon aria-hidden="true" />
</Button>

// Regiões dinâmicas
<div role="status" aria-live="polite">
  Reproduzindo: {trackName}
</div>

// Elementos decorativos
<div aria-hidden="true" className="decorative-element" />
```

### Contraste de Cores

| Combinação | Ratio | Status |
|------------|-------|--------|
| Texto/Fundo | 7.5:1 | ✅ AA+ |
| Links/Fundo | 5.2:1 | ✅ AA |
| Botões/Fundo | 4.8:1 | ✅ AA |

## Scripts de Auditoria

```bash
# Executar auditoria de acessibilidade
python3 scripts/contrast_analyzer.py --analyze src/

# Corrigir aria-labels
python3 scripts/add-aria-labels.py --apply

# Filtrar falsos positivos
python3 scripts/false_positive_filter.py --apply
```

## Boas Práticas

1. **Sempre** adicione `aria-label` a botões com apenas ícones
2. **Sempre** use `aria-hidden="true"` em ícones decorativos
3. **Nunca** use apenas cor para transmitir informação
4. **Sempre** forneça alternativas de texto para imagens
5. **Sempre** mantenha foco visível em elementos interativos
