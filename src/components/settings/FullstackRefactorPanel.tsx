import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, FileCode, Shield, FileText, Settings2, Play, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SettingsSection } from './SettingsSection';
import { useClaudeOpusRefactor, type RefactorAction, type TargetDistro } from '@/hooks/system/useClaudeOpusRefactor';

const ACTION_OPTIONS: { value: RefactorAction; label: string; icon: React.ReactNode }[] = [
  { value: 'refactor-python', label: 'Refatorar Python', icon: <FileCode className="w-4 h-4" /> },
  { value: 'refactor-docker', label: 'Otimizar Docker', icon: <Settings2 className="w-4 h-4" /> },
  { value: 'optimize-archlinux', label: 'Otimizar CachyOS/Arch', icon: <Cpu className="w-4 h-4" /> },
  { value: 'analyze-security', label: 'Análise de Segurança', icon: <Shield className="w-4 h-4" /> },
  { value: 'generate-docs', label: 'Gerar Documentação', icon: <FileText className="w-4 h-4" /> },
];

export function FullstackRefactorPanel() {
  const { isRefactoring, error, lastResult, refactorFiles, clearResult } = useClaudeOpusRefactor();
  
  const [action, setAction] = useState<RefactorAction>('refactor-python');
  const [targetDistro, setTargetDistro] = useState<TargetDistro>('cachyos');
  const [codeInput, setCodeInput] = useState('');
  const [filePath, setFilePath] = useState('scripts/installer/main.py');
  const [context, setContext] = useState('');

  const handleRefactor = async () => {
    if (!codeInput.trim()) return;
    
    await refactorFiles(action, [{ path: filePath, content: codeInput }], context || undefined, targetDistro);
  };

  return (
    <SettingsSection
      icon={<Cpu className="w-5 h-5 text-purple-500" />}
      title="Refatoração Fullstack (Claude Opus 4.5)"
      description="Refatore código Python, Docker e scripts de instalação com IA avançada"
      badge={
        <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
          Opus 4.5
        </Badge>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Action Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-kiosk-text">Ação</Label>
            <Select value={action} onValueChange={(v) => setAction(v as RefactorAction)}>
              <SelectTrigger className="bg-kiosk-background border-kiosk-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-kiosk-text">Distro Alvo</Label>
            <Select value={targetDistro} onValueChange={(v) => setTargetDistro(v as TargetDistro)}>
              <SelectTrigger className="bg-kiosk-background border-kiosk-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cachyos">CachyOS</SelectItem>
                <SelectItem value="archlinux">Arch Linux</SelectItem>
                <SelectItem value="manjaro">Manjaro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Path */}
        <div className="space-y-2">
          <Label className="text-kiosk-text">Caminho do Arquivo</Label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            className="w-full px-3 py-2 bg-kiosk-background border border-kiosk-border rounded-md text-kiosk-text text-sm font-mono"
            placeholder="scripts/installer/main.py"
          />
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <Label className="text-kiosk-text">Código para Refatorar</Label>
          <Textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Cole o código Python, Docker, ou configuração aqui..."
            className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm min-h-[200px]"
          />
        </div>

        {/* Context */}
        <div className="space-y-2">
          <Label className="text-kiosk-text">Contexto Adicional (opcional)</Label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Instruções específicas para a refatoração..."
            className="bg-kiosk-background border-kiosk-border text-kiosk-text min-h-[60px]"
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={handleRefactor}
          disabled={isRefactoring || !codeInput.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isRefactoring ? (
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isRefactoring ? 'Refatorando com Claude Opus...' : 'Iniciar Refatoração'}
        </Button>

        {/* Results */}
        {lastResult && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="result" className="border-kiosk-border">
              <AccordionTrigger className="text-kiosk-text hover:no-underline">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Resultado da Refatoração
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-lg bg-kiosk-surface/50 border border-kiosk-border">
                    <p className="text-sm text-kiosk-text">{lastResult.summary}</p>
                  </div>
                  
                  {lastResult.files.map((file, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-kiosk-primary" />
                        <span className="text-sm font-mono text-kiosk-text">{file.path}</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-kiosk-background border border-kiosk-border text-xs text-kiosk-text overflow-x-auto max-h-[300px]">
                        {file.refactoredContent}
                      </pre>
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" onClick={clearResult}>
                    Limpar Resultado
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </SettingsSection>
  );
}
