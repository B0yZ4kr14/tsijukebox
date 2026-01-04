# useVoiceControl

**Tipo:** React Hook  
**Localização:** `src/hooks/player/useVoiceControl.ts`  
**Versão:** 1.0.0  
**Categoria:** Voice & AI

---

## Descrição

O hook `useVoiceControl` implementa controle por voz completo para o TSiJUKEBOX usando a **Web Speech API**. Permite controlar o player, buscar músicas e executar comandos personalizados através de comandos de voz em múltiplos idiomas.

**Principais recursos:**
- Reconhecimento de voz em tempo real (Web Speech API)
- Suporte a múltiplos idiomas (PT-BR, EN-US, ES-ES)
- Comandos personalizáveis pelo usuário
- Sistema de wake word ("jukebox")
- Controle de confiança e redução de ruído
- Histórico de comandos executados
- Modo contínuo ou por demanda

---

## Uso Básico

```typescript
import { useVoiceControl } from '@/hooks/player/useVoiceControl';

function VoiceControlButton() {
  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    startListening,
    stopListening,
    lastCommand
  } = useVoiceControl();

  if (!isSupported) {
    return <p>Controle por voz não suportado neste navegador</p>;
  }

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? '🎤 Ouvindo...' : '🎤 Ativar Voz'}
      </button>
      
      {transcript && (
        <p>Você disse: "{transcript}" ({(confidence * 100).toFixed(0)}%)</p>
      )}
      
      {lastCommand && (
        <p>Último comando: {lastCommand}</p>
      )}
    </div>
  );
}
```

---

## Retorno

### `UseVoiceControlReturn`

O hook retorna um objeto com o estado e funções de controle.

#### `settings`: `VoiceControlSettings`

Configurações atuais do controle por voz.

**Tipo `VoiceControlSettings`:**
```typescript
interface VoiceControlSettings {
  enabled: boolean;                // Controle por voz ativado
  language: VoiceLanguage;         // Idioma do reconhecimento
  continuousListening: boolean;    // Escuta contínua
  wakeWord: string;                // Palavra de ativação
  minConfidenceThreshold: number;  // Threshold de confiança (0-1)
  noiseReduction: boolean;         // Redução de ruído
  silenceTimeout: number;          // Timeout de silêncio (ms)
  autoStopAfterCommand: boolean;   // Parar após comando
  customCommands: CustomVoiceCommand[]; // Comandos personalizados
}

type VoiceLanguage = 'pt-BR' | 'en-US' | 'es-ES';
```

---

#### `isListening`: `boolean`

Indica se o reconhecimento de voz está ativo.

---

#### `isSupported`: `boolean`

Indica se o navegador suporta Web Speech API.

**Navegadores suportados:**
- ✅ Chrome/Edge (Chromium)
- ✅ Safari 14.1+
- ❌ Firefox (não suporta)

---

#### `lastCommand`: `string | null`

Último comando reconhecido e executado.

---

#### `transcript`: `string`

Transcrição em tempo real do que está sendo falado.

---

#### `confidence`: `number`

Nível de confiança da transcrição (0-1).

**Exemplo:**
```typescript
if (confidence > 0.8) {
  console.log('Alta confiança');
} else if (confidence > 0.6) {
  console.log('Média confiança');
} else {
  console.log('Baixa confiança');
}
```

---

#### `error`: `string | null`

Mensagem de erro, se houver.

**Erros comuns:**
- `"not-allowed"` - Permissão negada
- `"no-speech"` - Nenhuma fala detectada
- `"network"` - Erro de rede
- `"aborted"` - Reconhecimento abortado

---

#### `startListening`: `() => void`

Inicia o reconhecimento de voz.

**Exemplo:**
```typescript
<button onClick={startListening}>
  Começar a Ouvir
</button>
```

---

#### `stopListening`: `() => void`

Para o reconhecimento de voz.

---

#### `toggleListening`: `() => void`

Alterna entre iniciar e parar o reconhecimento.

**Exemplo:**
```typescript
<button onClick={toggleListening}>
  {isListening ? 'Parar' : 'Iniciar'}
</button>
```

---

#### `updateSettings`: `(settings: Partial<VoiceControlSettings>) => void`

Atualiza as configurações do controle por voz.

**Exemplo:**
```typescript
// Mudar idioma
updateSettings({ language: 'en-US' });

// Ativar escuta contínua
updateSettings({ continuousListening: true });

// Ajustar threshold de confiança
updateSettings({ minConfidenceThreshold: 0.8 });
```

---

#### `resetSettings`: `() => void`

Restaura as configurações padrão.

---

#### `executeCommand`: `(command: string) => void`

Executa um comando manualmente (sem reconhecimento de voz).

**Exemplo:**
```typescript
executeCommand('play');
executeCommand('next');
executeCommand('search The Beatles');
```

---

#### `addCustomCommand`: `(command: Omit<CustomVoiceCommand, 'id'>) => void`

Adiciona um comando personalizado.

**Tipo `CustomVoiceCommand`:**
```typescript
interface CustomVoiceCommand {
  id: string;                      // ID único (gerado automaticamente)
  name: string;                    // Nome do comando
  patterns: string[];              // Padrões regex
  action: CommandAction;           // Ação a executar
  customAction?: string;           // Ação customizada
  enabled: boolean;                // Comando ativado
}

type CommandAction = 
  | 'play' | 'pause' | 'next' | 'previous' 
  | 'volume' | 'search' | 'shuffle' | 'repeat' 
  | 'mute' | 'custom';
```

**Exemplo:**
```typescript
addCustomCommand({
  name: 'Modo Festa',
  patterns: [
    '\\b(modo festa|party mode|festa)\\b',
    '\\b(ativar festa)\\b'
  ],
  action: 'custom',
  customAction: 'partyMode',
  enabled: true
});
```

---

#### `removeCustomCommand`: `(id: string) => void`

Remove um comando personalizado.

---

#### `toggleCustomCommand`: `(id: string, enabled: boolean) => void`

Ativa/desativa um comando personalizado.

---

## Comandos Integrados

### Comandos de Reprodução

| Comando (PT-BR) | Comando (EN-US) | Ação |
|-----------------|-----------------|------|
| "tocar", "play" | "play" | Reproduzir |
| "pausar", "parar" | "pause", "stop" | Pausar |
| "próxima", "pular" | "next", "skip" | Próxima música |
| "anterior", "voltar" | "previous", "back" | Música anterior |
| "parar tudo" | "stop" | Parar completamente |

### Comandos de Volume

| Comando (PT-BR) | Comando (EN-US) | Ação |
|-----------------|-----------------|------|
| "aumentar volume" | "volume up", "louder" | Aumentar volume |
| "diminuir volume" | "volume down", "quieter" | Diminuir volume |
| "mudo", "silenciar" | "mute" | Silenciar |

### Comandos de Modo

| Comando (PT-BR) | Comando (EN-US) | Ação |
|-----------------|-----------------|------|
| "aleatório", "embaralhar" | "shuffle" | Modo aleatório |
| "repetir" | "repeat", "loop" | Modo repetição |

### Comandos de Busca

| Comando (PT-BR) | Comando (EN-US) | Ação |
|-----------------|-----------------|------|
| "buscar [termo]" | "search [term]" | Buscar música |
| "tocar música [nome]" | "play song [name]" | Buscar e tocar |
| "procurar artista [nome]" | "find artist [name]" | Buscar artista |

**Exemplos:**
```
"buscar The Beatles"
"tocar música Yesterday"
"procurar artista Queen"
"search Bohemian Rhapsody"
```

---

## Exemplo Completo: Painel de Controle por Voz

```typescript
import { useState, useEffect } from 'react';
import { useVoiceControl } from '@/hooks/player/useVoiceControl';
import { usePlayer } from '@/hooks/player/usePlayer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Mic, 
  MicOff, 
  Settings, 
  Plus,
  Volume2
} from 'lucide-react';

function VoiceControlPanel() {
  const {
    settings,
    isListening,
    isSupported,
    transcript,
    confidence,
    lastCommand,
    error,
    startListening,
    stopListening,
    toggleListening,
    updateSettings,
    addCustomCommand
  } = useVoiceControl();

  const { play, pause, next, previous, setVolume } = usePlayer();

  // Escutar eventos de comandos de voz
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent<VoiceCommandEvent>) => {
      const { action, searchQuery } = event.detail;

      switch (action) {
        case 'play':
          play();
          break;
        case 'pause':
          pause();
          break;
        case 'next':
          next();
          break;
        case 'previous':
          previous();
          break;
        case 'volumeUp':
          setVolume(prev => Math.min(100, prev + 10));
          break;
        case 'volumeDown':
          setVolume(prev => Math.max(0, prev - 10));
          break;
        case 'search':
          if (searchQuery) {
            console.log('Buscar:', searchQuery);
            // Implementar busca
          }
          break;
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    return () => {
      window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
    };
  }, [play, pause, next, previous, setVolume]);

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <MicOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Controle por voz não suportado</p>
          <p className="text-sm mt-2">
            Use Chrome, Edge ou Safari 14.1+
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card className={isListening ? 'border-accent-cyan' : ''}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isListening ? (
                <Mic className="w-6 h-6 text-accent-cyan animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6 text-muted-foreground" />
              )}
              <div>
                <h3 className="font-semibold">
                  {isListening ? 'Ouvindo...' : 'Controle por Voz'}
                </h3>
                {lastCommand && (
                  <p className="text-sm text-muted-foreground">
                    Último: {lastCommand}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={toggleListening}
              size="lg"
              variant={isListening ? 'default' : 'outline'}
            >
              {isListening ? 'Parar' : 'Iniciar'}
            </Button>
          </div>

          {/* Transcrição */}
          {transcript && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-1">
                Você disse:
              </p>
              <p className="text-lg">"{transcript}"</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-background rounded-full h-2">
                  <div 
                    className="bg-accent-cyan h-full rounded-full transition-all"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Configurações</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Idioma */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Idioma
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ 
                language: e.target.value as VoiceLanguage 
              })}
              className="w-full p-2 rounded-lg border bg-background"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          {/* Threshold de Confiança */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Confiança Mínima: {(settings.minConfidenceThreshold * 100).toFixed(0)}%
            </label>
            <Slider
              value={[settings.minConfidenceThreshold * 100]}
              onValueChange={(value) => updateSettings({ 
                minConfidenceThreshold: value[0] / 100 
              })}
              min={50}
              max={95}
              step={5}
            />
          </div>

          {/* Escuta Contínua */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Escuta Contínua
            </label>
            <Switch
              checked={settings.continuousListening}
              onCheckedChange={(checked) => updateSettings({ 
                continuousListening: checked 
              })}
            />
          </div>

          {/* Redução de Ruído */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Redução de Ruído
            </label>
            <Switch
              checked={settings.noiseReduction}
              onCheckedChange={(checked) => updateSettings({ 
                noiseReduction: checked 
              })}
            />
          </div>

          {/* Wake Word */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Palavra de Ativação
            </label>
            <input
              type="text"
              value={settings.wakeWord}
              onChange={(e) => updateSettings({ 
                wakeWord: e.target.value 
              })}
              className="w-full p-2 rounded-lg border bg-background"
              placeholder="jukebox"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comandos Personalizados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Comandos Personalizados</h3>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings.customCommands.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum comando personalizado
            </p>
          ) : (
            <div className="space-y-2">
              {settings.customCommands.map(cmd => (
                <div 
                  key={cmd.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{cmd.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cmd.patterns.join(', ')}
                    </p>
                  </div>
                  <Switch
                    checked={cmd.enabled}
                    onCheckedChange={(checked) => 
                      toggleCustomCommand(cmd.id, checked)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VoiceControlPanel;
```

---

## Eventos Personalizados

### `voice-command`

Disparado quando um comando é reconhecido e executado.

**Tipo:**
```typescript
interface VoiceCommandEvent {
  action: string;        // Ação executada
  transcript: string;    // Transcrição completa
  searchQuery?: string;  // Query de busca (se aplicável)
  confidence: number;    // Confiança (0-1)
}
```

**Uso:**
```typescript
useEffect(() => {
  const handleCommand = (event: CustomEvent<VoiceCommandEvent>) => {
    console.log('Comando:', event.detail);
  };

  window.addEventListener('voice-command', handleCommand as EventListener);
  return () => {
    window.removeEventListener('voice-command', handleCommand as EventListener);
  };
}, []);
```

---

### `voice-command-history`

Disparado para cada tentativa de reconhecimento (sucesso ou falha).

**Tipo:**
```typescript
interface VoiceCommandHistoryEvent {
  transcript: string;
  confidence: number;
  action: string | null;
  searchQuery?: string;
  matchedPattern?: string;
  success: boolean;
  processingTimeMs: number;
}
```

---

## Persistência

As configurações são automaticamente salvas no **localStorage**.

**Chave:** `tsijukebox-voice-control`

**Estrutura:**
```json
{
  "enabled": true,
  "language": "pt-BR",
  "continuousListening": false,
  "wakeWord": "jukebox",
  "minConfidenceThreshold": 0.7,
  "noiseReduction": true,
  "silenceTimeout": 2000,
  "autoStopAfterCommand": true,
  "customCommands": [...]
}
```

---

## Performance

### Otimizações

1. **useCallback** - Todas as funções são memoizadas
2. **Timeout de silêncio** - Para automaticamente após período sem fala
3. **Threshold de confiança** - Ignora comandos com baixa confiança
4. **Cleanup automático** - Recognition instance limpa no unmount

### Recomendações

- Use **threshold de 0.7-0.8** para melhor precisão
- Ative **redução de ruído** em ambientes barulhentos
- Use **escuta contínua** apenas quando necessário (consome mais bateria)
- Implemente **debounce** para comandos repetidos

---

## Limitações

- ⚠️ **Não funciona no Firefox** (sem suporte a Web Speech API)
- ⚠️ **Requer HTTPS** (exceto localhost)
- ⚠️ **Requer permissão de microfone**
- ⚠️ **Conexão com internet** necessária (reconhecimento server-side)
- ⚠️ **Limite de tempo** - Reconhecimento para após ~60s de inatividade

---

## Acessibilidade

- ✅ Indicadores visuais de estado (ouvindo/parado)
- ✅ Feedback de confiança em tempo real
- ✅ Mensagens de erro descritivas
- ✅ Suporte a múltiplos idiomas
- ✅ Comandos alternativos para cada ação

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { useVoiceControl } from '@/hooks/player/useVoiceControl';

describe('useVoiceControl', () => {
  it('should start listening', () => {
    const { result } = renderHook(() => useVoiceControl());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
  });

  it('should add custom command', () => {
    const { result } = renderHook(() => useVoiceControl());

    act(() => {
      result.current.addCustomCommand({
        name: 'Test Command',
        patterns: ['\\btest\\b'],
        action: 'custom',
        enabled: true
      });
    });

    expect(result.current.settings.customCommands).toHaveLength(1);
  });
});
```

---

## Notas

- Requer **Web Speech API** (Chrome/Edge/Safari)
- Funciona **apenas em HTTPS** (exceto localhost)
- Reconhecimento é **server-side** (Google)
- **Não funciona offline**
- Comandos são **case-insensitive**

---

## Relacionados

- [usePlayer](./USEPLAYER.md) - Hook do player principal
- [useKaraoke](./USEKARAOKE.md) - Hook de karaokê
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Guia de Controle por Voz](../guides/VOICE_CONTROL.md)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Reconhecimento de voz com Web Speech API
- ✅ Suporte a 3 idiomas (PT-BR, EN-US, ES-ES)
- ✅ Comandos personalizáveis
- ✅ Sistema de wake word
- ✅ Controle de confiança
- ✅ Histórico de comandos
- ✅ Documentação completa
