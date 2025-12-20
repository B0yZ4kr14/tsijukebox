import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { 
  useScriptRefactor, 
  InstallerScript, 
  RefactoredScript 
} from '@/hooks/system/useScriptRefactor';
import { toast } from 'sonner';
import {
  Wand2,
  Copy,
  CheckCircle,
  Circle,
  Loader2,
  FileCode,
  ChevronDown,
  ChevronRight,
  Github,
  Play,
  Trash2,
  Settings,
  Layers,
  Link,
  Wrench,
  Code2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

// Ícones e cores por categoria
const CATEGORY_CONFIG: Record<InstallerScript['category'], { 
  icon: React.ReactNode; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  core: { 
    icon: <Settings className="w-4 h-4" />, 
    label: 'Core', 
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  setup: { 
    icon: <Wrench className="w-4 h-4" />, 
    label: 'Setup', 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  integration: { 
    icon: <Link className="w-4 h-4" />, 
    label: 'Integration', 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  utility: { 
    icon: <Layers className="w-4 h-4" />, 
    label: 'Utility', 
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
};

// Badge de prioridade
const PRIORITY_CONFIG: Record<InstallerScript['priority'], { 
  label: string; 
  variant: 'destructive' | 'outline' | 'secondary';
}> = {
  high: { label: 'Alta', variant: 'destructive' },
  medium: { label: 'Média', variant: 'outline' },
  low: { label: 'Baixa', variant: 'secondary' },
};

interface ScriptCardProps {
  script: InstallerScript;
  isSelected: boolean;
  isRefactored: boolean;
  isRefactoring: boolean;
  onSelect: () => void;
  onRefactor: () => void;
  refactoredData?: RefactoredScript;
}

function ScriptCard({ 
  script, 
  isSelected, 
  isRefactored,
  isRefactoring,
  onSelect, 
  onRefactor,
  refactoredData,
}: ScriptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const categoryConfig = CATEGORY_CONFIG[script.category];
  const priorityConfig = PRIORITY_CONFIG[script.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`
          cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}
          ${isRefactored ? 'bg-success/10 border-success/50' : ''}
        `}
        onClick={onSelect}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Selection indicator */}
              <div className={`flex-shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                {isRefactoring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRefactored ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : isSelected ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              
              {/* File icon and name */}
              <div className={`p-1.5 rounded ${categoryConfig.bgColor}`}>
                <FileCode className={`w-3.5 h-3.5 ${categoryConfig.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                  {script.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground truncate">
                  ~{script.estimatedLines} linhas
                </p>
              </div>
            </div>
            
            {/* Priority badge */}
            <Badge variant={priorityConfig.variant} className="text-[10px] h-5 flex-shrink-0">
              {priorityConfig.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger 
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Detalhes</span>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2 space-y-2">
              <p className="text-xs text-muted-foreground">
                {script.description}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${categoryConfig.color}`}>
                  {categoryConfig.icon}
                  <span className="ml-1">{categoryConfig.label}</span>
                </Badge>
              </div>
              
              {/* Refactor button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefactor();
                }}
                disabled={isRefactoring}
              >
                {isRefactoring ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Refatorando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Refatorar com Claude
                  </>
                )}
              </Button>
              
              {/* Show refactored summary */}
              {refactoredData && (
                <div className="mt-2 p-2 rounded bg-success/10 border border-success/20">
                  <p className="text-xs text-success font-medium">✓ Refatorado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {refactoredData.improvements.length} melhorias aplicadas
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface CategorySectionProps {
  category: InstallerScript['category'];
  scripts: InstallerScript[];
  selectedScripts: string[];
  refactoredScripts: Map<string, RefactoredScript>;
  isRefactoring: boolean;
  refactoringScript: string | null;
  onSelectScript: (path: string) => void;
  onRefactorScript: (script: InstallerScript) => void;
}

function CategorySection({
  category,
  scripts,
  selectedScripts,
  refactoredScripts,
  isRefactoring,
  refactoringScript,
  onSelectScript,
  onRefactorScript,
}: CategorySectionProps) {
  const config = CATEGORY_CONFIG[category];
  const selectedCount = scripts.filter(s => selectedScripts.includes(s.path)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${config.bgColor}`}>
          {React.cloneElement(config.icon as React.ReactElement, { 
            className: `w-4 h-4 ${config.color}` 
          })}
        </div>
        <h3 className={`text-sm font-semibold ${config.color}`}>
          {config.label}
        </h3>
        <Badge variant="outline" className="text-[10px]">
          {selectedCount}/{scripts.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {scripts.map((script) => (
            <ScriptCard
              key={script.path}
              script={script}
              isSelected={selectedScripts.includes(script.path)}
              isRefactored={refactoredScripts.has(script.path)}
              isRefactoring={isRefactoring && refactoringScript === script.path}
              onSelect={() => onSelectScript(script.path)}
              onRefactor={() => onRefactorScript(script)}
              refactoredData={refactoredScripts.get(script.path)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ScriptRefactorSection() {
  const {
    installerScripts,
    selectedScripts,
    refactoredScripts,
    isRefactoring,
    isExporting,
    error,
    selectScript,
    selectAll,
    clearSelection,
    refactorSingle,
    exportToGitHub,
    getScriptsByCategory,
    clearRefactored,
  } = useScriptRefactor();

  const [activeTab, setActiveTab] = useState<'scripts' | 'code' | 'results'>('scripts');
  const [codeInput, setCodeInput] = useState('');
  const [selectedScriptForCode, setSelectedScriptForCode] = useState<InstallerScript | null>(null);
  const [refactoringScript, setRefactoringScript] = useState<string | null>(null);

  const handleRefactorScript = async (script: InstallerScript) => {
    if (!codeInput && !selectedScriptForCode) {
      setSelectedScriptForCode(script);
      setActiveTab('code');
      toast.info(`Cole o código de ${script.name} para refatorar`);
      return;
    }
    
    setRefactoringScript(script.path);
    try {
      await refactorSingle(script.path, codeInput);
      toast.success(`${script.name} refatorado com sucesso!`);
      setCodeInput('');
      setSelectedScriptForCode(null);
      setActiveTab('results');
    } finally {
      setRefactoringScript(null);
    }
  };

  const handleRefactorFromCode = async () => {
    if (!selectedScriptForCode || !codeInput.trim()) {
      toast.error('Selecione um script e cole o código');
      return;
    }
    
    setRefactoringScript(selectedScriptForCode.path);
    try {
      await refactorSingle(selectedScriptForCode.path, codeInput);
      toast.success(`${selectedScriptForCode.name} refatorado com sucesso!`);
      setCodeInput('');
      setSelectedScriptForCode(null);
      setActiveTab('results');
    } finally {
      setRefactoringScript(null);
    }
  };

  const handleExport = async () => {
    await exportToGitHub();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado!');
  };

  // Agrupar scripts por categoria
  const coreScripts = getScriptsByCategory('core');
  const setupScripts = getScriptsByCategory('setup');
  const integrationScripts = getScriptsByCategory('integration');
  const utilityScripts = getScriptsByCategory('utility');

  return (
    <SettingsSection
      icon={<Wand2 className="w-5 h-5 text-kiosk-primary" />}
      title="Refatoração de Scripts Python"
      description="Refatore scripts do instalador CachyOS com Claude Opus 4.5"
    >
      <div className="space-y-4">
        {/* Header actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={selectedScripts.length === installerScripts.length}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Selecionar Todos
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedScripts.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar Seleção
          </Button>
          
          <div className="flex-1" />
          
          <Badge variant="secondary" className="text-xs">
            {selectedScripts.length} de {installerScripts.length} selecionados
          </Badge>
          
          <Badge variant="outline" className="text-xs text-success">
            {refactoredScripts.size} refatorados
          </Badge>
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scripts" className="gap-1">
              <FileCode className="w-4 h-4" />
              Scripts ({installerScripts.length})
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1">
              <Code2 className="w-4 h-4" />
              Código
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-1">
              <Sparkles className="w-4 h-4" />
              Resultados ({refactoredScripts.size})
            </TabsTrigger>
          </TabsList>

          {/* Scripts Tab - Grid of clickable cards */}
          <TabsContent value="scripts" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <CategorySection
                  category="core"
                  scripts={coreScripts}
                  selectedScripts={selectedScripts}
                  refactoredScripts={refactoredScripts}
                  isRefactoring={isRefactoring}
                  refactoringScript={refactoringScript}
                  onSelectScript={selectScript}
                  onRefactorScript={handleRefactorScript}
                />
                
                <CategorySection
                  category="setup"
                  scripts={setupScripts}
                  selectedScripts={selectedScripts}
                  refactoredScripts={refactoredScripts}
                  isRefactoring={isRefactoring}
                  refactoringScript={refactoringScript}
                  onSelectScript={selectScript}
                  onRefactorScript={handleRefactorScript}
                />
                
                <CategorySection
                  category="integration"
                  scripts={integrationScripts}
                  selectedScripts={selectedScripts}
                  refactoredScripts={refactoredScripts}
                  isRefactoring={isRefactoring}
                  refactoringScript={refactoringScript}
                  onSelectScript={selectScript}
                  onRefactorScript={handleRefactorScript}
                />
                
                <CategorySection
                  category="utility"
                  scripts={utilityScripts}
                  selectedScripts={selectedScripts}
                  refactoredScripts={refactoredScripts}
                  isRefactoring={isRefactoring}
                  refactoringScript={refactoringScript}
                  onSelectScript={selectScript}
                  onRefactorScript={handleRefactorScript}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Code Input Tab */}
          <TabsContent value="code" className="mt-4">
            <div className="space-y-4">
              {selectedScriptForCode && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Refatorando: {selectedScriptForCode.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6"
                    onClick={() => setSelectedScriptForCode(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              
              <Textarea
                placeholder={selectedScriptForCode 
                  ? `Cole o código de ${selectedScriptForCode.name} aqui...`
                  : "Selecione um script na aba 'Scripts' primeiro, ou cole o código Python aqui..."
                }
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCodeInput('')}
                  disabled={!codeInput}
                >
                  Limpar
                </Button>
                <Button
                  onClick={handleRefactorFromCode}
                  disabled={!selectedScriptForCode || !codeInput.trim() || isRefactoring}
                >
                  {isRefactoring ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refatorando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Refatorar com Claude Opus 4.5
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-4">
            {refactoredScripts.size === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                <p>Nenhum script refatorado ainda</p>
                <p className="text-sm">Selecione scripts e refatore-os com Claude Opus 4.5</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Export button */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearRefactored}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Limpar Resultados
                  </Button>
                  
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 mr-2" />
                        Exportar para GitHub ({refactoredScripts.size})
                      </>
                    )}
                  </Button>
                </div>
                
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {Array.from(refactoredScripts.entries()).map(([path, data]) => (
                      <Card key={path} className="border-success/30 bg-success/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              {path.split('/').pop()}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs text-success">
                              {data.improvements.length} melhorias
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {data.summary}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {data.improvements.slice(0, 3).map((imp, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {imp.length > 30 ? imp.slice(0, 30) + '...' : imp}
                              </Badge>
                            ))}
                            {data.improvements.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{data.improvements.length - 3} mais
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => copyToClipboard(data.refactoredCode)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar Código
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SettingsSection>
  );
}
