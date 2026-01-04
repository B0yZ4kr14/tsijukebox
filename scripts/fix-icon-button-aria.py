#!/usr/bin/env python3
"""
TSiJUKEBOX - Script para adicionar aria-labels a botões de ícone
================================================================

Este script identifica botões com size="icon" ou size="xs" que não possuem
aria-label e adiciona automaticamente baseado no contexto (ícone usado,
texto próximo, ou nome da função).

Uso:
    python3 scripts/fix-icon-button-aria.py --dry-run    # Simular alterações
    python3 scripts/fix-icon-button-aria.py --apply      # Aplicar alterações
    python3 scripts/fix-icon-button-aria.py --report     # Gerar relatório
"""

import re
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Diretório base
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
BACKUP_DIR = BASE_DIR / "backups" / "aria-fixes"

# Mapeamento de ícones para labels em português
ICON_TO_LABEL = {
    # Ações comuns
    'X': 'Fechar',
    'Close': 'Fechar',
    'Plus': 'Adicionar',
    'PlusCircle': 'Adicionar',
    'Minus': 'Remover',
    'MinusCircle': 'Remover',
    'Trash': 'Excluir',
    'Trash2': 'Excluir',
    'Edit': 'Editar',
    'Edit2': 'Editar',
    'Edit3': 'Editar',
    'Pencil': 'Editar',
    'Save': 'Salvar',
    'Copy': 'Copiar',
    'Clipboard': 'Copiar',
    'Check': 'Confirmar',
    'CheckCircle': 'Confirmar',
    'CheckCircle2': 'Confirmar',
    
    # Navegação
    'ChevronLeft': 'Voltar',
    'ChevronRight': 'Avançar',
    'ChevronUp': 'Expandir',
    'ChevronDown': 'Recolher',
    'ArrowLeft': 'Voltar',
    'ArrowRight': 'Avançar',
    'ArrowUp': 'Mover para cima',
    'ArrowDown': 'Mover para baixo',
    'Home': 'Início',
    'ExternalLink': 'Abrir em nova aba',
    
    # Player/Mídia
    'Play': 'Reproduzir',
    'Pause': 'Pausar',
    'PlayCircle': 'Reproduzir',
    'PauseCircle': 'Pausar',
    'SkipBack': 'Música anterior',
    'SkipForward': 'Próxima música',
    'Rewind': 'Retroceder',
    'FastForward': 'Avançar',
    'Volume': 'Volume',
    'Volume1': 'Volume baixo',
    'Volume2': 'Volume médio',
    'VolumeX': 'Mudo',
    'Shuffle': 'Aleatório',
    'Repeat': 'Repetir',
    'Repeat1': 'Repetir uma',
    'Heart': 'Favoritar',
    'HeartOff': 'Remover dos favoritos',
    'ListMusic': 'Fila de reprodução',
    'Music': 'Música',
    'Mic': 'Microfone',
    'MicOff': 'Desativar microfone',
    
    # Interface
    'Menu': 'Menu',
    'MoreHorizontal': 'Mais opções',
    'MoreVertical': 'Mais opções',
    'Settings': 'Configurações',
    'Settings2': 'Configurações',
    'Cog': 'Configurações',
    'Search': 'Pesquisar',
    'Filter': 'Filtrar',
    'SortAsc': 'Ordenar crescente',
    'SortDesc': 'Ordenar decrescente',
    'Grid': 'Visualização em grade',
    'List': 'Visualização em lista',
    'Maximize': 'Maximizar',
    'Maximize2': 'Maximizar',
    'Minimize': 'Minimizar',
    'Minimize2': 'Minimizar',
    'Fullscreen': 'Tela cheia',
    'Shrink': 'Sair da tela cheia',
    'Expand': 'Expandir',
    
    # Ações de dados
    'Download': 'Baixar',
    'Upload': 'Enviar',
    'Share': 'Compartilhar',
    'Share2': 'Compartilhar',
    'Link': 'Copiar link',
    'Link2': 'Copiar link',
    'Unlink': 'Remover link',
    'RefreshCw': 'Atualizar',
    'RefreshCcw': 'Atualizar',
    'RotateCw': 'Girar',
    'RotateCcw': 'Girar',
    'Sync': 'Sincronizar',
    
    # Status/Info
    'Info': 'Informações',
    'HelpCircle': 'Ajuda',
    'AlertCircle': 'Alerta',
    'AlertTriangle': 'Aviso',
    'Bell': 'Notificações',
    'BellOff': 'Silenciar notificações',
    'Eye': 'Visualizar',
    'EyeOff': 'Ocultar',
    
    # Usuário
    'User': 'Usuário',
    'UserPlus': 'Adicionar usuário',
    'UserMinus': 'Remover usuário',
    'Users': 'Usuários',
    'LogIn': 'Entrar',
    'LogOut': 'Sair',
    
    # Arquivos
    'File': 'Arquivo',
    'FileText': 'Documento',
    'Folder': 'Pasta',
    'FolderOpen': 'Abrir pasta',
    'FolderPlus': 'Nova pasta',
    'Image': 'Imagem',
    
    # Outros
    'Calendar': 'Calendário',
    'Clock': 'Horário',
    'MapPin': 'Localização',
    'Phone': 'Telefone',
    'Mail': 'Email',
    'Send': 'Enviar',
    'MessageCircle': 'Mensagem',
    'MessageSquare': 'Comentário',
    'Star': 'Favorito',
    'StarOff': 'Remover favorito',
    'Bookmark': 'Salvar',
    'BookmarkMinus': 'Remover dos salvos',
    'Tag': 'Tag',
    'Hash': 'Hashtag',
    'AtSign': 'Mencionar',
    'Zap': 'Ação rápida',
    'Power': 'Ligar/Desligar',
    'PowerOff': 'Desligar',
    'Lock': 'Bloquear',
    'Unlock': 'Desbloquear',
    'Key': 'Chave',
    'Shield': 'Segurança',
    'Loader': 'Carregando',
    'Loader2': 'Carregando',
    'Github': 'GitHub',
    'Spotify': 'Spotify',
    'Youtube': 'YouTube',
    'Terminal': 'Terminal',
    'Code': 'Código',
    'Code2': 'Código',
    'Database': 'Banco de dados',
    'Server': 'Servidor',
    'Wifi': 'Conexão',
    'WifiOff': 'Sem conexão',
    'Sun': 'Modo claro',
    'Moon': 'Modo escuro',
    'Cloud': 'Nuvem',
    'CloudOff': 'Offline',
    'CloudUpload': 'Enviar para nuvem',
    'CloudDownload': 'Baixar da nuvem',
    'PanelLeft': 'Painel esquerdo',
    'PanelRight': 'Painel direito',
    'Columns': 'Colunas',
    'Rows': 'Linhas',
    'Table': 'Tabela',
    'BarChart': 'Gráfico de barras',
    'LineChart': 'Gráfico de linhas',
    'PieChart': 'Gráfico de pizza',
    'Activity': 'Atividade',
    'TrendingUp': 'Tendência de alta',
    'TrendingDown': 'Tendência de baixa',
}


def find_icon_in_content(button_content: str) -> str:
    """Encontra o ícone usado dentro de um botão e retorna o label apropriado."""
    
    # Procurar por ícones Lucide dentro do botão (ex: <ArrowLeft, <X, etc.)
    icon_matches = re.findall(r'<([A-Z][a-zA-Z0-9]*)', button_content)
    for icon_name in icon_matches:
        if icon_name in ICON_TO_LABEL:
            return ICON_TO_LABEL[icon_name]
    
    return None


def find_button_end(content: str, start_pos: int) -> int:
    """Encontra a posição do fechamento do Button (> ou />)."""
    depth = 0
    i = start_pos
    in_string = False
    string_char = None
    in_jsx_expr = 0
    
    while i < len(content):
        char = content[i]
        
        # Rastrear strings
        if char in '"\'`' and (i == 0 or content[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
        
        # Rastrear expressões JSX {}
        if not in_string:
            if char == '{':
                in_jsx_expr += 1
            elif char == '}':
                in_jsx_expr -= 1
        
        # Procurar pelo fechamento da tag
        if not in_string and in_jsx_expr == 0:
            if char == '>' and i > start_pos:
                return i
            # Self-closing />
            if char == '/' and i + 1 < len(content) and content[i+1] == '>':
                return i + 1
        
        i += 1
    
    return -1


def find_button_close_tag(content: str, start_pos: int) -> int:
    """Encontra a posição do </Button>."""
    # Procurar pelo </Button> correspondente
    depth = 1
    i = start_pos
    
    while i < len(content) and depth > 0:
        # Procurar por <Button ou </Button>
        if content[i:i+7] == '<Button':
            # Verificar se não é self-closing
            end = find_button_end(content, i)
            if end != -1 and content[end] == '>':
                depth += 1
            i = end + 1 if end != -1 else i + 1
        elif content[i:i+9] == '</Button>':
            depth -= 1
            if depth == 0:
                return i + 9
            i += 9
        else:
            i += 1
    
    return -1


def process_file(filepath: Path, dry_run: bool = True) -> dict:
    """Processa um arquivo e adiciona aria-labels aos botões de ícone."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Encontrar todos os <Button que têm size="icon" ou size="xs"
    button_pattern = r'<Button\s'
    
    offset = 0
    for match in re.finditer(button_pattern, original_content):
        start_pos = match.start()
        
        # Encontrar o fim da tag de abertura
        tag_end = find_button_end(original_content, start_pos)
        if tag_end == -1:
            continue
        
        # Extrair a tag de abertura completa
        opening_tag = original_content[start_pos:tag_end+1]
        
        # Verificar se tem size="icon" ou size="xs"
        if not re.search(r'size="(?:icon|xs)"', opening_tag):
            continue
        
        # Verificar se já tem aria-label
        if 'aria-label=' in opening_tag:
            continue
        
        # Encontrar o conteúdo do botão (entre > e </Button>)
        if opening_tag.endswith('/>'):
            # Self-closing, sem conteúdo interno
            button_content = ""
        else:
            close_tag_pos = find_button_close_tag(original_content, tag_end + 1)
            if close_tag_pos == -1:
                continue
            button_content = original_content[tag_end+1:close_tag_pos-9]  # -9 para </Button>
        
        # Encontrar o label apropriado baseado no ícone
        label = find_icon_in_content(button_content)
        
        if label:
            # Calcular a linha
            line_num = original_content[:start_pos].count('\n') + 1
            
            changes.append({
                'line': line_num,
                'label': label,
                'context': button_content[:50].strip() if button_content else opening_tag[:50],
                'start': start_pos,
                'tag_end': tag_end,
                'opening_tag': opening_tag
            })
    
    # Aplicar as mudanças de trás para frente para não afetar os offsets
    new_content = original_content
    for change in reversed(changes):
        start = change['start']
        tag_end = change['tag_end']
        opening_tag = change['opening_tag']
        label = change['label']
        
        # Inserir aria-label antes do > final
        if opening_tag.endswith('/>'):
            # Self-closing: inserir antes de />
            new_opening = opening_tag[:-2].rstrip() + f' aria-label="{label}" />'
        else:
            # Normal: inserir antes de >
            new_opening = opening_tag[:-1].rstrip() + f' aria-label="{label}">'
        
        new_content = new_content[:start] + new_opening + new_content[tag_end+1:]
    
    result = {
        'file': str(filepath),
        'changes': changes,
        'modified': new_content != original_content
    }
    
    if not dry_run and result['modified']:
        # Criar backup
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        backup_name = f"{filepath.stem}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{filepath.suffix}"
        backup_path = BACKUP_DIR / backup_name
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(original_content)
        
        # Salvar arquivo modificado
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        result['backup'] = str(backup_path)
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Adiciona aria-labels a botões de ícone no TSiJUKEBOX'
    )
    parser.add_argument('--dry-run', action='store_true', 
                        help='Simular alterações sem aplicar')
    parser.add_argument('--apply', action='store_true',
                        help='Aplicar alterações')
    parser.add_argument('--report', action='store_true',
                        help='Gerar relatório detalhado')
    parser.add_argument('--file', type=str,
                        help='Processar arquivo específico')
    
    args = parser.parse_args()
    
    if not any([args.dry_run, args.apply, args.report]):
        args.dry_run = True
    
    print("=" * 70)
    print("📊 TSiJUKEBOX - Correção de aria-labels em botões de ícone")
    print("=" * 70)
    
    # Coletar arquivos para processar
    if args.file:
        files = [Path(args.file)]
    else:
        files = list(SRC_DIR.rglob('*.tsx'))
    
    print(f"\n🔍 Analisando {len(files)} arquivos...")
    
    results = []
    total_changes = 0
    
    for filepath in files:
        try:
            result = process_file(filepath, dry_run=not args.apply)
            if result['changes']:
                results.append(result)
                total_changes += len(result['changes'])
        except Exception as e:
            print(f"❌ Erro ao processar {filepath}: {e}")
    
    # Exibir resultados
    print(f"\n📊 Resultados:")
    print(f"   Arquivos analisados: {len(files)}")
    print(f"   Arquivos com alterações: {len(results)}")
    print(f"   Total de aria-labels adicionados: {total_changes}")
    
    if args.report or args.dry_run:
        print("\n" + "-" * 70)
        print("📋 Detalhes das alterações:")
        print("-" * 70)
        
        for result in sorted(results, key=lambda x: -len(x['changes'])):
            short_path = result['file'].replace(str(SRC_DIR) + '/', '')
            print(f"\n📁 {short_path} ({len(result['changes'])} alterações)")
            
            for change in result['changes']:
                print(f"   Linha {change['line']}: aria-label=\"{change['label']}\"")
    
    if args.apply:
        print("\n✅ Alterações aplicadas!")
        print(f"📦 Backups salvos em: {BACKUP_DIR}")
    elif args.dry_run:
        print("\n💡 Execute com --apply para aplicar as alterações")


if __name__ == '__main__':
    main()
