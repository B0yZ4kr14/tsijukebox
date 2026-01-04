# 📋 Plano de Implementação - Análise de Contraste de Cores

**Projeto:** TSiJUKEBOX Code Review Automation  
**Melhoria:** Verificação de Contraste de Cores  
**WCAG:** 1.4.3 (Contraste Mínimo), 1.4.6 (Contraste Aprimorado), 1.4.11 (Contraste Não-Textual)  
**Estimativa Total:** 4-6 horas  
**Data:** 2025-12-25

---

## 📊 Visão Geral

### Objetivo
Expandir o script `generate-code-review-report.py` para detectar automaticamente problemas de contraste de cores no código-fonte, calculando ratios WCAG e alertando sobre combinações problemáticas.

### Escopo

| Incluído | Excluído |
|----------|----------|
| Classes Tailwind de cores | Cores em imagens |
| Cores hardcoded (hex, rgb, hsl) | Cores dinâmicas em runtime |
| CSS variables | Temas de terceiros |
| Combinações texto/fundo | Gradientes complexos |
| Opacidades em texto | Cores em SVG inline |

### Critérios de Sucesso

- [ ] Detectar 90%+ dos padrões de baixo contraste
- [ ] Calcular ratio WCAG com precisão de 0.1
- [ ] Zero falsos positivos em cores de marca (Spotify, YouTube)
- [ ] Tempo de execução < 5 segundos para 300 arquivos
- [ ] Integração transparente com script existente

---

## 🗂️ Estrutura de Tarefas

### Fase 1: Fundamentos (1.5h)

#### Tarefa 1.1: Estruturas de Dados
**Tempo:** 20 min | **Complexidade:** 🟢 Baixa

```python
@dataclass
class ColorValue:
    """Representa uma cor em múltiplos formatos."""
    original: str           # Valor original no código
    hex: str               # Formato #RRGGBB
    rgb: Tuple[int, int, int]  # (R, G, B)
    luminance: float       # Luminância relativa (0-1)
    source: str            # 'tailwind', 'hex', 'rgb', 'hsl', 'css-var'

@dataclass
class ContrastIssue:
    """Representa um problema de contraste detectado."""
    file: str
    line: int
    foreground: ColorValue
    background: ColorValue
    ratio: float
    required_ratio: float  # 4.5 ou 3.0
    wcag_level: str        # 'AA', 'AAA'
    text_size: str         # 'normal', 'large'
    severity: str          # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    context: str           # Trecho do código

@dataclass
class ContrastMetrics:
    """Métricas agregadas de contraste."""
    total_color_usages: int
    issues_found: int
    issues_by_severity: Dict[str, int]
    issues_by_file: Dict[str, int]
    average_ratio: float
    worst_ratio: float
    pass_rate_aa: float
    pass_rate_aaa: float
    issues: List[ContrastIssue]
```

**Entregável:** Arquivo `contrast_types.py` com dataclasses

---

#### Tarefa 1.2: Mapeamento de Cores Tailwind
**Tempo:** 30 min | **Complexidade:** 🟡 Média

```python
TAILWIND_COLORS = {
    # Grayscale
    'white': '#ffffff',
    'black': '#000000',
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',
    'gray-950': '#030712',
    
    # Zinc (usado no projeto)
    'zinc-50': '#fafafa',
    'zinc-100': '#f4f4f5',
    'zinc-200': '#e4e4e7',
    'zinc-300': '#d4d4d8',
    'zinc-400': '#a1a1aa',
    'zinc-500': '#71717a',
    'zinc-600': '#52525b',
    'zinc-700': '#3f3f46',
    'zinc-800': '#27272a',
    'zinc-900': '#18181b',
    'zinc-950': '#09090b',
    
    # Cores semânticas
    'red-500': '#ef4444',
    'red-600': '#dc2626',
    'green-500': '#22c55e',
    'green-600': '#16a34a',
    'blue-500': '#3b82f6',
    'yellow-500': '#eab308',
    
    # Cores de marca (whitelist - não alertar)
    'spotify-green': '#1DB954',
    'youtube-red': '#FF0000',
}

TAILWIND_OPACITY = {
    'opacity-0': 0.0,
    'opacity-5': 0.05,
    'opacity-10': 0.10,
    'opacity-20': 0.20,
    'opacity-25': 0.25,
    'opacity-30': 0.30,
    'opacity-40': 0.40,
    'opacity-50': 0.50,
    'opacity-60': 0.60,
    'opacity-70': 0.70,
    'opacity-75': 0.75,
    'opacity-80': 0.80,
    'opacity-90': 0.90,
    'opacity-95': 0.95,
    'opacity-100': 1.0,
}
```

**Entregável:** Arquivo `tailwind_colors.py` com mapeamentos completos

---

#### Tarefa 1.3: Funções de Conversão de Cores
**Tempo:** 40 min | **Complexidade:** 🟡 Média

```python
def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Converte #RRGGBB para (R, G, B)."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Converte (R, G, B) para #RRGGBB."""
    return f'#{r:02x}{g:02x}{b:02x}'

def hsl_to_rgb(h: float, s: float, l: float) -> Tuple[int, int, int]:
    """Converte HSL para RGB."""
    # Implementação do algoritmo HSL → RGB
    ...

def parse_color(color_str: str) -> Optional[ColorValue]:
    """
    Parse qualquer formato de cor para ColorValue.
    
    Suporta:
    - Hex: #RGB, #RRGGBB, #RRGGBBAA
    - RGB: rgb(r, g, b), rgba(r, g, b, a)
    - HSL: hsl(h, s%, l%), hsla(h, s%, l%, a)
    - Tailwind: text-gray-500, bg-zinc-800
    - CSS var: var(--color-name)
    """
    ...

def apply_opacity(color: ColorValue, opacity: float) -> ColorValue:
    """Aplica opacidade a uma cor (blend com fundo)."""
    ...
```

**Entregável:** Arquivo `color_utils.py` com funções de conversão

---

### Fase 2: Cálculo de Contraste (1h)

#### Tarefa 2.1: Algoritmo de Luminância Relativa
**Tempo:** 20 min | **Complexidade:** 🟢 Baixa

```python
def get_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """
    Calcula luminância relativa conforme WCAG 2.1.
    
    Fórmula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    Onde R, G, B são valores linearizados (gamma-corrected).
    
    Referência: https://www.w3.org/WAI/GL/wiki/Relative_luminance
    """
    def linearize(value: int) -> float:
        v = value / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    
    r, g, b = rgb
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
```

**Entregável:** Função `get_relative_luminance()` testada

---

#### Tarefa 2.2: Cálculo de Ratio de Contraste
**Tempo:** 20 min | **Complexidade:** 🟢 Baixa

```python
def calculate_contrast_ratio(fg: ColorValue, bg: ColorValue) -> float:
    """
    Calcula ratio de contraste WCAG.
    
    Fórmula: (L1 + 0.05) / (L2 + 0.05)
    Onde L1 é a luminância mais clara e L2 a mais escura.
    
    Retorna: Valor entre 1.0 (sem contraste) e 21.0 (máximo)
    """
    l1 = fg.luminance
    l2 = bg.luminance
    
    lighter = max(l1, l2)
    darker = min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)

def evaluate_contrast(ratio: float, text_size: str = 'normal') -> Dict:
    """
    Avalia se o contraste atende aos critérios WCAG.
    
    WCAG AA:
    - Texto normal: >= 4.5:1
    - Texto grande (18px+ ou 14px bold): >= 3:1
    
    WCAG AAA:
    - Texto normal: >= 7:1
    - Texto grande: >= 4.5:1
    """
    thresholds = {
        'normal': {'AA': 4.5, 'AAA': 7.0},
        'large': {'AA': 3.0, 'AAA': 4.5},
    }
    
    t = thresholds.get(text_size, thresholds['normal'])
    
    return {
        'ratio': round(ratio, 2),
        'passes_aa': ratio >= t['AA'],
        'passes_aaa': ratio >= t['AAA'],
        'required_aa': t['AA'],
        'required_aaa': t['AAA'],
        'gap_aa': max(0, t['AA'] - ratio),
        'gap_aaa': max(0, t['AAA'] - ratio),
    }
```

**Entregável:** Funções de cálculo de contraste testadas

---

#### Tarefa 2.3: Testes Unitários de Contraste
**Tempo:** 20 min | **Complexidade:** 🟢 Baixa

```python
# test_contrast.py

def test_black_on_white():
    """Preto em branco deve ter ratio 21:1."""
    black = parse_color('#000000')
    white = parse_color('#ffffff')
    assert calculate_contrast_ratio(black, white) == 21.0

def test_wcag_examples():
    """Testa exemplos oficiais do WCAG."""
    # Exemplo: #777777 em #ffffff = 4.48:1 (falha AA)
    gray = parse_color('#777777')
    white = parse_color('#ffffff')
    ratio = calculate_contrast_ratio(gray, white)
    assert 4.4 <= ratio <= 4.5
    assert not evaluate_contrast(ratio)['passes_aa']

def test_tailwind_gray_400():
    """gray-400 em fundo escuro deve falhar."""
    gray400 = parse_color('gray-400')  # #9ca3af
    gray900 = parse_color('gray-900')  # #111827
    ratio = calculate_contrast_ratio(gray400, gray900)
    # Deve passar AA para texto grande
    assert evaluate_contrast(ratio, 'large')['passes_aa']
```

**Entregável:** Suite de testes com 10+ casos

---

### Fase 3: Detecção de Padrões (1.5h)

#### Tarefa 3.1: Parser de Classes Tailwind
**Tempo:** 30 min | **Complexidade:** 🟡 Média

```python
def extract_tailwind_colors(class_string: str) -> Dict[str, ColorValue]:
    """
    Extrai cores de uma string de classes Tailwind.
    
    Exemplo:
    Input: "text-gray-400 bg-zinc-900 hover:text-white opacity-50"
    Output: {
        'text': ColorValue('#9ca3af', opacity=0.5),
        'bg': ColorValue('#18181b'),
        'hover:text': ColorValue('#ffffff'),
    }
    """
    patterns = {
        'text': r'(?:^|\s)(text-(?:[\w-]+))(?:\s|$)',
        'bg': r'(?:^|\s)(bg-(?:[\w-]+))(?:\s|$)',
        'border': r'(?:^|\s)(border-(?:[\w-]+))(?:\s|$)',
        'opacity': r'(?:^|\s)(opacity-(?:\d+))(?:\s|$)',
    }
    ...

def find_color_combinations(content: str) -> List[Tuple[str, str, int]]:
    """
    Encontra combinações de cores texto/fundo no código.
    
    Retorna: Lista de (foreground, background, line_number)
    """
    # Regex para encontrar elementos com className
    element_pattern = r'<(\w+)[^>]*className=["\']([^"\']+)["\'][^>]*>'
    ...
```

**Entregável:** Parser de classes Tailwind funcional

---

#### Tarefa 3.2: Detector de Cores Hardcoded
**Tempo:** 30 min | **Complexidade:** 🟡 Média

```python
def detect_hardcoded_colors(content: str) -> List[Dict]:
    """
    Detecta cores hardcoded no código.
    
    Padrões detectados:
    - Hex: #RGB, #RRGGBB, #RRGGBBAA
    - RGB: rgb(r, g, b), rgba(r, g, b, a)
    - HSL: hsl(h, s%, l%), hsla(h, s%, l%, a)
    - Inline style: style={{ color: '...' }}
    """
    patterns = [
        # Hex colors
        (r'["\']#([0-9a-fA-F]{3,8})["\']', 'hex'),
        (r'color:\s*#([0-9a-fA-F]{3,8})', 'hex-inline'),
        
        # RGB/RGBA
        (r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)', 'rgb'),
        
        # HSL/HSLA
        (r'hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*[\d.]+)?\s*\)', 'hsl'),
        
        # CSS variables
        (r'var\(--([a-zA-Z-]+)\)', 'css-var'),
    ]
    ...
```

**Entregável:** Detector de cores hardcoded

---

#### Tarefa 3.3: Inferência de Contexto (Texto vs Fundo)
**Tempo:** 30 min | **Complexidade:** 🟠 Alta

```python
def infer_color_context(element: str, classes: str, line_context: List[str]) -> Dict:
    """
    Infere o contexto de uso das cores (texto, fundo, borda).
    
    Estratégias:
    1. Analisar classes Tailwind (text-*, bg-*)
    2. Verificar elemento pai para herança de fundo
    3. Detectar temas (dark:, light:)
    4. Usar heurísticas para elementos comuns
    """
    context = {
        'foreground': None,
        'background': None,
        'is_text': False,
        'is_interactive': False,
        'theme': 'light',  # ou 'dark'
        'inherited_bg': None,
    }
    
    # Detectar tema
    if 'dark:' in classes or 'dark' in line_context:
        context['theme'] = 'dark'
        context['inherited_bg'] = parse_color('#09090b')  # zinc-950
    else:
        context['inherited_bg'] = parse_color('#ffffff')
    
    # Analisar classes
    ...
    
    return context
```

**Entregável:** Função de inferência de contexto

---

### Fase 4: Integração e Relatório (1h)

#### Tarefa 4.1: Função Principal de Análise
**Tempo:** 30 min | **Complexidade:** 🟡 Média

```python
def analyze_color_contrast(files: List[str], config: Dict = None) -> ContrastMetrics:
    """
    Função principal de análise de contraste.
    
    Args:
        files: Lista de arquivos para analisar
        config: Configurações opcionais
            - ignore_brand_colors: bool (default: True)
            - min_severity: str (default: 'LOW')
            - check_aaa: bool (default: False)
            - theme: str (default: 'both')
    
    Returns:
        ContrastMetrics com todos os issues encontrados
    """
    metrics = ContrastMetrics()
    config = config or {}
    
    ignore_patterns = [
        r'spotify',
        r'youtube',
        r'#1DB954',
        r'#FF0000',
    ] if config.get('ignore_brand_colors', True) else []
    
    for filepath in files:
        if not should_analyze(filepath):
            continue
        
        content = Path(filepath).read_text()
        
        # 1. Extrair combinações de cores
        combinations = find_color_combinations(content)
        
        # 2. Detectar cores hardcoded
        hardcoded = detect_hardcoded_colors(content)
        
        # 3. Avaliar cada combinação
        for fg, bg, line in combinations:
            if any(re.search(p, fg + bg, re.I) for p in ignore_patterns):
                continue
            
            ratio = calculate_contrast_ratio(fg, bg)
            evaluation = evaluate_contrast(ratio)
            
            if not evaluation['passes_aa']:
                metrics.issues.append(ContrastIssue(
                    file=filepath,
                    line=line,
                    foreground=fg,
                    background=bg,
                    ratio=ratio,
                    ...
                ))
    
    # Calcular métricas agregadas
    metrics.calculate_aggregates()
    
    return metrics
```

**Entregável:** Função `analyze_color_contrast()` integrada

---

#### Tarefa 4.2: Geração de Relatório de Contraste
**Tempo:** 20 min | **Complexidade:** 🟢 Baixa

```python
def generate_contrast_report(metrics: ContrastMetrics) -> str:
    """
    Gera seção de relatório para contraste de cores.
    """
    report = []
    report.append("## 🎨 Análise de Contraste de Cores\n")
    
    # Resumo
    report.append("### Resumo\n")
    report.append(f"| Métrica | Valor |")
    report.append(f"|---------|-------|")
    report.append(f"| Total de usos de cor | {metrics.total_color_usages} |")
    report.append(f"| Issues encontrados | {metrics.issues_found} |")
    report.append(f"| Taxa de aprovação AA | {metrics.pass_rate_aa:.1f}% |")
    report.append(f"| Pior ratio | {metrics.worst_ratio:.2f}:1 |")
    
    # Issues por severidade
    report.append("\n### Issues por Severidade\n")
    report.append("| Severidade | Quantidade |")
    report.append("|------------|------------|")
    for sev, count in metrics.issues_by_severity.items():
        report.append(f"| {sev} | {count} |")
    
    # Top 10 issues
    report.append("\n### Top 10 Issues\n")
    report.append("| Arquivo | Linha | Ratio | Requerido | Cores |")
    report.append("|---------|-------|-------|-----------|-------|")
    for issue in sorted(metrics.issues, key=lambda x: x.ratio)[:10]:
        report.append(
            f"| `{issue.file}` | {issue.line} | {issue.ratio:.2f}:1 | "
            f"{issue.required_ratio}:1 | `{issue.foreground.hex}` / `{issue.background.hex}` |"
        )
    
    return "\n".join(report)
```

**Entregável:** Função de geração de relatório

---

#### Tarefa 4.3: Integração com Script Principal
**Tempo:** 10 min | **Complexidade:** 🟢 Baixa

```python
# Em generate-code-review-report.py

from contrast_analyzer import analyze_color_contrast, generate_contrast_report

def main():
    ...
    
    # Adicionar análise de contraste
    if args.check_contrast or args.full_analysis:
        print(f"\n🎨 Executando análise de contraste...")
        report.contrast = analyze_color_contrast(files_to_analyze)
        print(f"   ✅ {report.contrast.issues_found} issues de contraste")
    
    ...
    
    # Adicionar seção ao relatório
    if report.contrast:
        contrast_section = generate_contrast_report(report.contrast)
        markdown = markdown.replace(
            "## ✅ Pontos Positivos",
            f"{contrast_section}\n\n## ✅ Pontos Positivos"
        )
```

**Entregável:** Script principal atualizado

---

### Fase 5: Testes e Documentação (0.5h)

#### Tarefa 5.1: Testes de Integração
**Tempo:** 20 min | **Complexidade:** 🟢 Baixa

```python
def test_full_analysis():
    """Testa análise completa em arquivo de exemplo."""
    result = analyze_color_contrast(['test/fixtures/form_with_issues.tsx'])
    
    assert result.issues_found > 0
    assert result.pass_rate_aa < 100
    assert any(i.severity == 'HIGH' for i in result.issues)

def test_no_false_positives_brand():
    """Garante que cores de marca não geram alertas."""
    result = analyze_color_contrast(['test/fixtures/spotify_component.tsx'])
    
    brand_issues = [i for i in result.issues if 'spotify' in i.context.lower()]
    assert len(brand_issues) == 0
```

**Entregável:** Suite de testes de integração

---

#### Tarefa 5.2: Documentação de Uso
**Tempo:** 10 min | **Complexidade:** 🟢 Baixa

```markdown
## Análise de Contraste de Cores

### Uso

```bash
# Análise básica
python3 generate-code-review-report.py --pr 123 --check-contrast

# Análise completa
python3 generate-code-review-report.py --pr 123 --full-analysis

# Configurações avançadas
python3 generate-code-review-report.py --pr 123 \
    --check-contrast \
    --contrast-theme dark \
    --contrast-level aaa
```

### Configuração

| Flag | Descrição | Default |
|------|-----------|---------|
| `--check-contrast` | Habilita análise de contraste | `false` |
| `--contrast-theme` | Tema para análise (`light`, `dark`, `both`) | `both` |
| `--contrast-level` | Nível WCAG (`aa`, `aaa`) | `aa` |
| `--ignore-brand` | Ignora cores de marca | `true` |
```

**Entregável:** Documentação atualizada

---

## 📊 Resumo do Plano

### Cronograma

| Fase | Tarefas | Tempo | Acumulado |
|------|---------|-------|-----------|
| 1. Fundamentos | 1.1, 1.2, 1.3 | 1.5h | 1.5h |
| 2. Cálculo | 2.1, 2.2, 2.3 | 1.0h | 2.5h |
| 3. Detecção | 3.1, 3.2, 3.3 | 1.5h | 4.0h |
| 4. Integração | 4.1, 4.2, 4.3 | 1.0h | 5.0h |
| 5. Testes | 5.1, 5.2 | 0.5h | **5.5h** |

### Arquivos a Criar

| Arquivo | Descrição | Linhas Est. |
|---------|-----------|-------------|
| `scripts/contrast_types.py` | Dataclasses | ~80 |
| `scripts/tailwind_colors.py` | Mapeamentos | ~200 |
| `scripts/color_utils.py` | Funções de cor | ~150 |
| `scripts/contrast_analyzer.py` | Análise principal | ~300 |
| `tests/test_contrast.py` | Testes | ~100 |
| **TOTAL** | | **~830** |

### Dependências

| Dependência | Versão | Uso |
|-------------|--------|-----|
| Python | 3.8+ | Runtime |
| colorsys | stdlib | Conversão HSL |
| re | stdlib | Regex |
| dataclasses | stdlib | Tipos |

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Falsos positivos em temas | Média | Alto | Whitelist de padrões |
| Performance em projetos grandes | Baixa | Médio | Cache de cores |
| Cores dinâmicas não detectadas | Alta | Baixo | Documentar limitação |

---

## ✅ Checklist de Entrega

- [ ] Estruturas de dados definidas
- [ ] Mapeamento Tailwind completo
- [ ] Funções de conversão testadas
- [ ] Cálculo de contraste WCAG preciso
- [ ] Parser de classes funcionando
- [ ] Detector de hardcoded funcionando
- [ ] Inferência de contexto implementada
- [ ] Integração com script principal
- [ ] Relatório de contraste gerado
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Documentação atualizada

---

*Plano versão 1.0 - TSiJUKEBOX Accessibility*
