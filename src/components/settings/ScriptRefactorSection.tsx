import React, { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCodeRefactor, RefactorSuggestion } from '@/hooks/system/useCodeRefactor';
import { toast } from 'sonner';
import {
  Wand2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  Shield,
  Loader2,
  FileCode,
  ArrowRight,
} from 'lucide-react';

export function ScriptRefactorSection() {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const { result, isRefactoring, error, refactorCode, clearResult } = useCodeRefactor();

  const handleRefactor = async () => {
    if (!code.trim()) {
      toast.error('Cole o código a ser refatorado');
      return;
    }
    if (!fileName.trim()) {
      toast.error('Informe o nome do arquivo');
      return;
    }

    try {
      await refactorCode(code, fileName);
      toast.success('Refatoração concluída!');
    } catch {
      toast.error('Falha na refatoração');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado!');
  };

  const getTypeIcon = (type: RefactorSuggestion['type']): React.ReactNode => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4 text-destructive" />;
      case 'performance':
        return <Zap className="h-4 w-4 text-warning" />;
      case 'readability':
        return <BookOpen className="h-4 w-4 text-info" />;
      case 'best-practice':
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getTypeBadge = (type: RefactorSuggestion['type']) => {
    const variants: Record<string, 'destructive' | 'outline' | 'secondary' | 'default'> = {
      security: 'destructive',
      performance: 'outline',
      readability: 'secondary',
      'best-practice': 'default',
    };
    return (
      <Badge variant={variants[type]} className="text-xs">
        {type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: RefactorSuggestion['priority']) => {
    const colors: Record<string, string> = {
      high: 'bg-destructive/20 text-destructive',
      medium: 'bg-warning/20 text-warning',
      low: 'bg-muted text-muted-foreground',
    };
    return (
      <Badge className={`text-xs ${colors[priority]}`}>
        {priority}
      </Badge>
    );
  };

  return (
    <SettingsSection
      icon={<Wand2 className="w-5 h-5 text-kiosk-primary" />}
      title="Refatoração de Scripts"
      description="Use Claude AI para analisar e refatorar scripts Python, Dockerfile e mais"
    >
      <div className="space-y-4">
        {/* Input Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Nome do Arquivo
            </label>
            <Input
              placeholder="Ex: main.py, Dockerfile, docker-compose.yml"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={handleRefactor}
              disabled={isRefactoring || !code.trim() || !fileName.trim()}
              className="flex-1"
            >
              {isRefactoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Refatorar com Claude
                </>
              )}
            </Button>
            {result && (
              <Button variant="outline" onClick={clearResult}>
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Código Original</label>
          <Textarea
            placeholder="Cole aqui o código do seu script Python, Dockerfile, ou docker-compose..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-primary">
                  {result.suggestions.length}
                </div>
                <div className="text-sm text-muted-foreground">Sugestões</div>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-success">
                  +{result.improvementScore}%
                </div>
                <div className="text-sm text-muted-foreground">Melhoria</div>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-info">
                  {result.language}
                </div>
                <div className="text-sm text-muted-foreground">Linguagem</div>
              </div>
            </div>

            {/* Summary Text */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm">{result.summary}</p>
            </div>

            {/* Tabs for Suggestions and Code */}
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="refactored">Refatorado</TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {result.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(suggestion.type)}
                            {getTypeBadge(suggestion.type)}
                            {getPriorityBadge(suggestion.priority)}
                          </div>
                          {suggestion.lineStart && (
                            <span className="text-xs text-muted-foreground">
                              Linha {suggestion.lineStart}
                              {suggestion.lineEnd && suggestion.lineEnd !== suggestion.lineStart
                                ? `-${suggestion.lineEnd}`
                                : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-sm">{suggestion.explanation}</p>

                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Antes:</span>
                            <pre className="text-xs p-2 rounded bg-destructive/10 overflow-x-auto">
                              <code>{suggestion.original}</code>
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Depois:</span>
                            <pre className="text-xs p-2 rounded bg-success/10 overflow-x-auto">
                              <code>{suggestion.suggested}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="original" className="mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(result.originalCode)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-sm p-4 rounded-lg bg-muted/50 font-mono">
                      <code>{result.originalCode}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="refactored" className="mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(result.refactoredCode)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-sm p-4 rounded-lg bg-success/10 font-mono">
                      <code>{result.refactoredCode}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Compare Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  copyToClipboard(result.refactoredCode);
                  toast.success('Código refatorado copiado para a área de transferência!');
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Copiar Código Refatorado
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!result && (
          <div className="text-sm text-muted-foreground space-y-2 p-4 rounded-lg bg-muted/30">
            <p className="font-medium">Como usar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Cole o código do script Python, Dockerfile ou docker-compose</li>
              <li>Informe o nome do arquivo para detecção automática de linguagem</li>
              <li>Clique em "Refatorar com Claude" para análise</li>
              <li>Revise as sugestões e copie o código refatorado</li>
            </ol>
            <p className="mt-2 text-xs">
              <strong>Linguagens suportadas:</strong> Python (.py), Dockerfile, Docker Compose (.yml/.yaml), Shell (.sh)
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
