# 🎤 Tutorial: Modo Karaoke

O modo karaoke do TSiJUKEBOX exibe letras sincronizadas em tela cheia para uma experiência completa de karaoke.

---

## 🌟 Recursos

- **Letras sincronizadas** em tempo real
- **Tela cheia** imersiva
- **Destaque de linha atual**
- **Visualizador de áudio** opcional
- **Cores personalizáveis**
- **Suporte a múltiplos idiomas**

---

## 🚀 Ativando o Modo Karaoke

![Karaoke Mode](../assets/mockups/karaoke-mode-screen.png)

*Modo karaoke com letras sincronizadas, controles de áudio e pontuação*

### Método 1: Botão Rápido
Durante a reprodução de qualquer música:
1. Clique no ícone **🎤 Karaoke** nos controles
2. A tela mudará para modo fullscreen
3. Pressione **ESC** para sair

### Método 2: Atalho de Teclado
- **K**: Ativa/desativa modo karaoke
- **F**: Tela cheia
- **ESC**: Sair

### Método 3: Via Configurações
1. Acesse **Configurações > Karaoke**
2. Ative **Modo Karaoke Automático**
3. Letras aparecerão automaticamente quando disponíveis

---

## 📝 Fontes de Letras

O TSiJUKEBOX busca letras de múltiplas fontes:

1. **Letras embarcadas** (arquivos MP3 com LRC)
2. **Spotify Lyrics** (quando disponível)
3. **APIs externas** (fallback automático)

### Formatos Suportados
- **LRC** - Letras sincronizadas (preferido)
- **SRT** - Legendas
- **Plain text** - Letras simples (sem sincronização)

---

## ⚙️ Configurações de Karaoke

### Visual
| Opção | Descrição | Padrão |
|-------|-----------|--------|
| Fonte | Família de fonte | System |
| Tamanho | Tamanho do texto | Grande |
| Cor principal | Cor da linha atual | Dourado |
| Cor secundária | Próximas linhas | Branco |
| Fundo | Opacidade do fundo | 80% |

### Comportamento
| Opção | Descrição | Padrão |
|-------|-----------|--------|
| Auto-scroll | Rolar automaticamente | Ativado |
| Linhas visíveis | Quantas linhas mostrar | 5 |
| Animação | Transição entre linhas | Suave |
| Visualizador | Mostrar ondas de áudio | Ativado |

### Avançado
| Opção | Descrição | Padrão |
|-------|-----------|--------|
| Offset | Ajuste de sincronização (ms) | 0 |
| Cache | Salvar letras localmente | Ativado |
| Fallback | Buscar de fontes externas | Ativado |

---

## 🎨 Temas de Karaoke

### Tema Neon (Padrão)
- Fundo escuro gradiente
- Texto com efeito neon
- Linha atual em dourado brilhante

### Tema Clássico
- Fundo preto sólido
- Texto branco limpo
- Linha atual em amarelo

### Tema Festa
- Cores alternadas por verso
- Efeitos de partículas
- Animações extras

### Tema Minimalista
- Fundo quase transparente
- Apenas texto essencial
- Sem animações

---

## 🔧 Ajuste de Sincronização

Se as letras estão fora de sincronia:

1. Durante o karaoke, pressione **+** ou **-** para ajustar
2. Cada pressionamento ajusta 100ms
3. O ajuste é salvo para a música específica

### Valores típicos:
- **-500ms**: Letras muito adiantadas
- **0ms**: Sincronizado (padrão)
- **+500ms**: Letras atrasadas

---

## 📱 Modo Karaoke em TV/Projetor

Para exibir em tela externa:

1. Conecte a TV/projetor ao computador
2. Estenda ou espelhe a tela
3. Arraste a janela do navegador para a tela externa
4. Ative o modo karaoke
5. Use outro dispositivo para controlar a fila

### Dica
Use dois navegadores: um para controle (tela principal) e outro em fullscreen na TV.

---

## ❓ Problemas Comuns

### Letras não aparecem
- Verifique conexão com internet
- Algumas músicas não têm letras disponíveis
- Tente reconectar o provedor de música

### Sincronização ruim
- Use os controles de offset (+/-)
- Verifique se o arquivo LRC está correto
- Algumas fontes têm timing impreciso

### Tela cheia não funciona
- Verifique permissões do navegador
- Tente clicar no botão de fullscreen novamente
- Use F11 como alternativa

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| K | Ativar/desativar karaoke |
| F | Tela cheia |
| ESC | Sair da tela cheia |
| + | Adiantar letras 100ms |
| - | Atrasar letras 100ms |
| Space | Play/Pause |
| ← → | Anterior/Próxima música |

---

[← YouTube Music](Tutorial-YouTube-Music.md) | [Próximo: Modo Kiosk →](Tutorial-Kiosk-Mode.md)
