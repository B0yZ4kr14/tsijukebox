import { useState } from 'react';
import { Shield, Play, Trash2, Download, AlertTriangle, CheckCircle2, Info, Loader2, FileCode } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCodeScan, CodeIssue } from '@/hooks/system/useCodeScan';
import { toast } from 'sonner';
import { Badge, Button, Input } from "@/components/ui/themed"

export function CodeScanSection() {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const { results, isScanning, progress, error, scanCode, clearResults, totalIssues, criticalCount, averageScore } = useCodeScan();

  const handleScan = async () => {
    if (!code.trim()) {
      toast.error('Cole o código para analisar');
      return;
    }

    const name = fileName.trim() || 'untitled.ts';
    
    try {
      await scanCode(code, name);
      toast.success('Análise concluída!');
    } catch (err) {
      toast.error('Erro ao analisar código');
    }
  };

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalIssues,
        criticalCount,
        averageScore,
      },
      results,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-scan-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado!');
  };

  const getSeverityColor = (severity: CodeIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      case 'info':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: CodeIssue['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium':
      case 'low':
        return <Info className="w-3 h-3" />;
      default:
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const instructions = {
    title: "🔍 Varredura de Código com IA",
    steps: [
      "Esta ferramenta usa IA avançada (Claude) para analisar código.",
      "Cole o código que deseja analisar na área de texto.",
      "A IA buscará vulnerabilidades, problemas de performance e más práticas.",
      "Cada problema encontrado terá uma sugestão de correção."
    ],
    tips: [
      "💡 Comece com arquivos críticos (autenticação, API)",
      "💡 Issues 'critical' devem ser corrigidas imediatamente",
      "💡 Exporte o relatório para análise posterior"
    ],
    warning: "⚠️ O código é enviado para análise via API. Não cole credenciais ou segredos!"
  };

  return (
    <SettingsSection
      icon={<Shield className="w-5 h-5 icon-neon-blue" />}
      title="Varredura de Código"
      description="Análise de segurança e qualidade com Anthropic Claude"
      instructions={instructions}
      delay={0.35}
    >
      <div data-testid="codescan-section" className="space-y-4">
        {/* Input Section */}
        <div data-testid="codescan-input-section" className="space-y-3">
          <div className="space-y-2">
            <Label data-testid="codescan-filename-label" htmlFor="file-name">Nome do Arquivo (opcional)</Label>
            <Input
              id="file-name"
              data-testid="codescan-filename-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Ex: src/components/Auth.tsx"
              className="bg-kiosk-background border-kiosk-border font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label data-testid="codescan-code-label" htmlFor="code-input">Código para Análise</Label>
            <Textarea
              id="code-input"
              data-testid="codescan-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Cole o código aqui..."
              className="bg-kiosk-background border-kiosk-border font-mono text-xs min-h-[200px]"
            />
          </div>

          <div data-testid="codescan-actions" className="flex gap-2">
            <Button
              data-testid="codescan-submit-button"
              onClick={handleScan}
              disabled={isScanning || !code.trim()}
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <Loader2 data-testid="codescan-loading-spinner" className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Análise
                </>
              )}
            </Button>
            
            {results.length > 0 && (
              <>
                <Button 
                  data-testid="codescan-export-button" 
                  variant="outline" 
                  onClick={handleExport}
                  aria-label="Exportar relatório"
                >
                  <Download aria-hidden="true" className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  data-testid="codescan-clear-button" 
                  variant="outline" 
                  onClick={clearResults}
                  aria-label="Limpar resultados"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        {isScanning && (
          <div data-testid="codescan-progress" className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Analisando...</span>
              <span data-testid="codescan-progress-value" className="text-kiosk-primary">{progress}%</span>
            </div>
            <Progress data-testid="codescan-progress-bar" value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <div data-testid="codescan-error" className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && (
          <>
            <Separator className="bg-kiosk-border" />
            
            <div data-testid="codescan-summary" className="grid grid-cols-4 gap-3">
              <div className="card-option-dark-3d rounded-lg p-3 text-center">
                <p data-testid="codescan-files-count" className="text-2xl font-bold text-kiosk-primary">{results.length}</p>
                <p className="text-xs text-muted-foreground">Arquivos</p>
              </div>
              <div className="card-option-dark-3d rounded-lg p-3 text-center">
                <p data-testid="codescan-issues-count" className="text-2xl font-bold text-foreground">{totalIssues}</p>
                <p className="text-xs text-muted-foreground">Issues</p>
              </div>
              <div className="card-option-dark-3d rounded-lg p-3 text-center">
                <p data-testid="codescan-critical-count" className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {criticalCount}
                </p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
              <div className="card-option-dark-3d rounded-lg p-3 text-center">
                <p data-testid="codescan-score-display" className={`text-2xl font-bold ${averageScore >= 70 ? 'text-green-500' : averageScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {averageScore}
                </p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {results.length > 0 && (
          <ScrollArea data-testid="codescan-results" className="h-[400px]">
            <div className="space-y-4 pr-4">
              {results.map((result) => (
                <Collapsible key={result.fileName} defaultOpen>
                  <CollapsibleTrigger 
                    data-testid={`codescan-file-${result.fileName}`}
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border hover:bg-kiosk-background/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-kiosk-primary" />
                      <span className="font-mono text-sm">{result.fileName}</span>
                      <Badge data-testid={`codescan-issues-badge-${result.fileName}`} variant="outline" className="text-xs">
                        {result.issues.length} issues
                      </Badge>
                    </div>
                    <Badge
                      data-testid={`codescan-score-${result.fileName}`}
                      className={`${
                        result.score >= 70
                          ? 'bg-green-600'
                          : result.score >= 40
                          ? 'bg-yellow-500 text-black'
                          : 'bg-red-600'
                      }`}
                    >
                      Score: {result.score}
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-2">
                    <p data-testid={`codescan-file-summary-${result.fileName}`} className="text-sm text-muted-foreground px-3">{result.summary}</p>
                    {result.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        data-testid={`codescan-issue-${result.fileName}-${idx}`}
                        className="p-3 rounded-lg bg-kiosk-background/30 border border-kiosk-border space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge data-testid={`codescan-severity-${result.fileName}-${idx}`} className={`text-xs ${getSeverityColor(issue.severity)}`}>
                            {getSeverityIcon(issue.severity)}
                            <span className="ml-1 uppercase">{issue.severity}</span>
                          </Badge>
                          <Badge data-testid={`codescan-category-${result.fileName}-${idx}`} variant="outline" className="text-xs capitalize">
                            {issue.category}
                          </Badge>
                          {issue.line && (
                            <span data-testid={`codescan-line-${result.fileName}-${idx}`} className="text-xs text-muted-foreground">
                              Linha {issue.line}
                            </span>
                          )}
                        </div>
                        <p data-testid={`codescan-issue-title-${result.fileName}-${idx}`} className="text-sm font-medium">{issue.title}</p>
                        <p data-testid={`codescan-issue-message-${result.fileName}-${idx}`} className="text-sm text-muted-foreground">{issue.message}</p>
                        {issue.suggestion && (
                          <div data-testid={`codescan-suggestion-${result.fileName}-${idx}`} className="p-2 rounded bg-kiosk-surface/50 text-xs font-mono">
                            💡 {issue.suggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </SettingsSection>
  );
}
