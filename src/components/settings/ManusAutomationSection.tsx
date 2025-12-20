import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useManusAutomation, ManusTask } from '@/hooks/system/useManusAutomation';
import { toast } from 'sonner';
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
}

function AutomationCard({ title, description, icon, action, isLoading }: AutomationCardProps) {
  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={action}>
      <CardContent className="p-4">
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
            size="icon"
            className="h-8 w-8"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
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
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive"
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
            title="Gerar Documentação"
            description="Cria docs completos do projeto"
            icon={<FileText className="h-5 w-5" />}
            action={handleGenerateDocs}
            isLoading={isLoading}
          />
          <AutomationCard
            title="Otimizar Docker"
            description="Melhora Dockerfile e compose"
            icon={<Container className="h-5 w-5" />}
            action={handleOptimizeDocker}
            isLoading={isLoading}
          />
        </div>

        {/* Tutorial Generator */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Gerar Tutorial
            </CardTitle>
            <CardDescription className="text-xs">
              Cria um tutorial detalhado sobre um tópico específico
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: instalação no Raspberry Pi, configuração do Spotify..."
                value={tutorialTopic}
                onChange={(e) => setTutorialTopic(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleGenerateTutorial}
                disabled={isLoading || !tutorialTopic.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Task */}
        <div className="space-y-2">
          <Button
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
                  placeholder="Descreva a tarefa que a IA deve executar..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
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
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tarefas Recentes
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task.taskId}
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
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                      </Button>
                      {task.taskUrl && task.taskUrl !== '#' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => window.open(task.taskUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => copyTaskUrl(task.taskUrl)}
                          >
                            <Copy className="h-3 w-3" />
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
          <div className="text-sm text-muted-foreground space-y-2 p-4 rounded-lg bg-muted/30">
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
