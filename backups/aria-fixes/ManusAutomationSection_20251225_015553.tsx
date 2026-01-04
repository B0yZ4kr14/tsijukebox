import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsSection } from './SettingsSection';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useManusAutomation, ManusTask } from '@/hooks/system/useManusAutomation';
import { toast } from 'sonner';
import { Badge, Button, Card, Input } from "@/components/ui/themed"
import {
  Bot,
  FileText,
  BookOpen,
  Container,
  Loader2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
} from 'lucide-react';

function TaskStatusBadge({ status }: { status: ManusTask['status'] }) {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: 'bg-muted text-muted-foreground', icon: <Clock className="h-3 w-3" />, label: 'Pendente' },
    running: { color: 'bg-info/20 text-info', icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Executando' },
    completed: { color: 'bg-success/20 text-success', icon: <CheckCircle className="h-3 w-3" />, label: 'Concluído' },
    failed: { color: 'bg-destructive/20 text-destructive', icon: <AlertCircle className="h-3 w-3" />, label: 'Falhou' },
  };

  const { color, icon, label } = config[status] || config.pending;

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      {icon}
      {label}
    </Badge>
  );
}

interface AutomationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  isLoading: boolean;
  testId: string;
}

function AutomationCard({ title, description, icon, action, isLoading, testId }: AutomationCardProps) {
  return (
    <Card 
      data-testid={testId}
      className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" 
      onClick={action}
    >
      <div className="mt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            className="h-8 w-8"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
            aria-label={`Executar ${title}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ManusAutomationSection() {
  const [customPrompt, setCustomPrompt] = useState('');
  const [tutorialTopic, setTutorialTopic] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const {
    tasks,
    currentTask,
    isLoading,
    error,
    createTask,
    generateDocumentation,
    generateTutorial,
    optimizeDocker,
    getTaskStatus,
    clearError,
  } = useManusAutomation();

  const handleGenerateDocs = async () => {
    const result = await generateDocumentation([
      'scripts/installer/',
      'docker/',
      'docs/',
    ]);
    if (result) {
      toast.success('Tarefa de documentação iniciada');
    }
  };

  const handleGenerateTutorial = async () => {
    if (!tutorialTopic.trim()) {
      toast.error('Informe o tópico do tutorial');
      return;
    }
    const result = await generateTutorial(tutorialTopic);
    if (result) {
      toast.success('Tarefa de tutorial iniciada');
      setTutorialTopic('');
    }
  };

  const handleOptimizeDocker = async () => {
    const result = await optimizeDocker([
      'docker/Dockerfile',
      'docker/docker-compose.yml',
      'docker/docker-compose.dev.yml',
    ]);
    if (result) {
      toast.success('Tarefa de otimização Docker iniciada');
    }
  };

  const handleCustomTask = async () => {
    if (!customPrompt.trim()) {
      toast.error('Informe a descrição da tarefa');
      return;
    }
    const result = await createTask(customPrompt);
    if (result) {
      toast.success('Tarefa personalizada iniciada');
      setCustomPrompt('');
      setShowCustom(false);
    }
  };

  const copyTaskUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada!');
  };

  return (
    <SettingsSection
      icon={<Bot className="w-5 h-5 text-kiosk-primary" />}
      title="Automação Manus.im"
      description="Use IA autônoma para gerar documentação, tutoriais e otimizar configurações"
    >
      <div data-testid="manus-section" className="space-y-4">
        {/* Error Display */}
        {error && (
          <motion.div
            data-testid="manus-error-display"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm flex-1">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-3 md:grid-cols-2">
          <AutomationCard
            testId="manus-generate-docs-card"
            title="Gerar Documentação"
            description="Cria docs completos do projeto"
            icon={<FileText className="h-5 w-5" />}
            action={handleGenerateDocs}
            isLoading={isLoading}
          />
          <AutomationCard
            testId="manus-optimize-docker-card"
            title="Otimizar Docker"
            description="Melhora Dockerfile e compose"
            icon={<Container className="h-5 w-5" />}
            action={handleOptimizeDocker}
            isLoading={isLoading}
          />
        </div>

        {/* Tutorial Generator */}
        <Card data-testid="manus-tutorial-section" className="border-border/50">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Gerar Tutorial
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Cria um tutorial detalhado sobre um tópico específico
            </p>
          
          <div className="mt-4">
            <div className="flex gap-2">
              <Input
                data-testid="manus-tutorial-input"
                placeholder="Ex: instalação no Raspberry Pi, configuração do Spotify..."
                value={tutorialTopic}
                onChange={(e) => setTutorialTopic(e.target.value)}
                className="flex-1"
                aria-label="Tópico do tutorial"
              />
              <Button
                data-testid="manus-tutorial-submit"
                onClick={handleGenerateTutorial}
                disabled={isLoading || !tutorialTopic.trim()}
                aria-label="Gerar tutorial"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Custom Task */}
        <div className="space-y-2">
          <Button
            data-testid="manus-custom-task-toggle"
            variant="outline"
            className="w-full"
            onClick={() => setShowCustom(!showCustom)}
          >
            <Bot className="h-4 w-4 mr-2" />
            Tarefa Personalizada
          </Button>
          
          <AnimatePresence>
            {showCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Textarea
                  data-testid="manus-custom-task-input"
                  placeholder="Descreva a tarefa que a IA deve executar..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px]"
                  aria-label="Descrição da tarefa personalizada"
                />
                <Button
                  data-testid="manus-custom-task-submit"
                  onClick={handleCustomTask}
                  disabled={isLoading || !customPrompt.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando tarefa...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Executar Tarefa
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tasks History */}
        {tasks.length > 0 && (
          <div data-testid="manus-task-history" className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tarefas Recentes
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task.taskId}
                    data-testid={`manus-task-${task.taskId}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.taskTitle}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {task.taskId}
                        </p>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => getTaskStatus(task.taskId)}
                        disabled={isLoading}
                        aria-label="Atualizar status da tarefa"
                      >
                        <RefreshCw aria-hidden="true" className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                      </Button>
                      {task.taskUrl && task.taskUrl !== '#' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => window.open(task.taskUrl, '_blank')}
                            aria-label="Abrir tarefa em nova aba"
                          >
                            <ExternalLink aria-hidden="true" className="h-3 w-3 mr-1" />
                            Abrir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => copyTaskUrl(task.taskUrl)}
                            aria-label="Copiar URL da tarefa"
                          >
                            <Copy aria-hidden="true" className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {task.mock && (
                        <Badge variant="secondary" className="text-xs">
                          Simulação
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Instructions */}
        {tasks.length === 0 && (
          <div data-testid="manus-instructions" className="text-sm text-muted-foreground space-y-2 p-4 rounded-lg bg-muted/30">
            <p className="font-medium">Sobre o Manus.im:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>IA autônoma que executa tarefas complexas de forma independente</li>
              <li>Gera documentação, tutoriais e configurações automaticamente</li>
              <li>Otimiza scripts e arquivos Docker seguindo melhores práticas</li>
              <li>Tarefas são executadas em background e você será notificado ao concluir</li>
            </ul>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
