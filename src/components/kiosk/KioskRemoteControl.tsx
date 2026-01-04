import { useState } from 'react';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLogAudit } from '@/hooks/useAuditLogs';
import {
  RefreshCw,
  Container,
  Camera,
  Terminal,
  Download,
  Power,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { KioskConnection } from '@/hooks/system/useKioskMonitor';
import { Badge, Button, Card, Input } from "@/components/ui/themed"

export interface KioskRemoteControlProps {
  kiosk: KioskConnection;
  onActionComplete?: () => void;
}

type CommandType = 'chromium_restart' | 'container_restart' | 'container_update' | 'screenshot' | 'custom_command';

interface RemoteAction {
  id: CommandType;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  requiresConfirmation: boolean;
}

const REMOTE_ACTIONS: RemoteAction[] = [
  {
    id: 'chromium_restart',
    label: 'Reiniciar Chromium',
    description: 'Reinicia o navegador Chromium no modo kiosk',
    icon: <RefreshCw aria-hidden="true" className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: false,
  },
  {
    id: 'container_restart',
    label: 'Reiniciar Container',
    description: 'Reinicia o container Docker da aplicação',
    icon: <Container className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: true,
  },
  {
    id: 'container_update',
    label: 'Atualizar Container',
    description: 'Baixa a última versão e reinicia o container',
    icon: <Download aria-hidden="true" className="h-4 w-4" />,
    variant: 'secondary',
    requiresConfirmation: true,
  },
  {
    id: 'screenshot',
    label: 'Capturar Screenshot',
    description: 'Captura a tela atual do kiosk',
    icon: <Camera className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: false,
  },
];

export function KioskRemoteControl({ kiosk, onActionComplete }: KioskRemoteControlProps) {
  const [isLoading, setIsLoading] = useState<CommandType | null>(null);
  const [customCommand, setCustomCommand] = useState('');
  const [showCommandInput, setShowCommandInput] = useState(false);
  const { logAudit } = useLogAudit();

  const sendCommand = async (command: CommandType, params: Json = {}) => {
    setIsLoading(command);
    
    try {
      const { error } = await supabase.from('kiosk_commands').insert([{
        machine_id: kiosk.machine_id,
        command,
        params,
        status: 'pending',
      }]);

      if (error) throw error;

      // Registrar no audit log
      await logAudit({
        action: 'kiosk_command_sent',
        category: 'kiosk',
        severity: command === 'custom_command' ? 'warning' : 'info',
        target_type: 'kiosk',
        target_id: kiosk.machine_id,
        target_name: kiosk.hostname,
        details: { command, params },
        status: 'success',
      });

      toast.success(`Comando "${command}" enviado para ${kiosk.hostname}`);
      onActionComplete?.();
    } catch (error) {
      console.error('Error sending command:', error);
      
      // Registrar falha no audit log
      await logAudit({
        action: 'kiosk_command_sent',
        category: 'kiosk',
        severity: 'warning',
        target_type: 'kiosk',
        target_id: kiosk.machine_id,
        target_name: kiosk.hostname,
        details: { command, params },
        status: 'failure',
        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
      });

      toast.error(`Erro ao enviar comando: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCustomCommand = async () => {
    if (!customCommand.trim()) {
      toast.error('Digite um comando para executar');
      return;
    }

    await sendCommand('custom_command', { command: customCommand });
    setCustomCommand('');
    setShowCommandInput(false);
  };

  const isKioskOnline = kiosk.status === 'online';

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          <Power className="h-5 w-5" />
          Controle Remoto
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          Enviar comandos para {kiosk.hostname}
        </p>
      
      <div className="mt-4">
        {!isKioskOnline && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              Kiosk está {kiosk.status}. Comandos podem não ser executados.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {REMOTE_ACTIONS.map((action) => {
            const isCurrentLoading = isLoading === action.id;
            
            if (action.requiresConfirmation) {
              return (
                <AlertDialog key={action.id}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={action.variant}
                      className="flex items-center gap-2 h-auto py-3 flex-col"
                      disabled={isLoading !== null}
                    >
                      {isCurrentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        action.icon
                      )}
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
                      <AlertDialogDescription>
                        {action.description}. Esta ação pode causar interrupção temporária do serviço.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => sendCommand(action.id)}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            }

            return (
              <Button
                key={action.id}
                variant={action.variant}
                className="flex items-center gap-2 h-auto py-3 flex-col"
                disabled={isLoading !== null}
                onClick={() => sendCommand(action.id)}
              >
                {isCurrentLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  action.icon
                )}
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Terminal/Custom Command Section */}
        <div className="pt-4 border-t">
          {!showCommandInput ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setShowCommandInput(true)}
            >
              <Terminal className="h-4 w-4" />
              Executar comando personalizado
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o comando..."
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomCommand()}
                  className="font-mono text-sm"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="danger" 
                      size="sm"
                      disabled={!customCommand.trim() || isLoading !== null}
                    >
                      {isLoading === 'custom_command' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Executar'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Atenção: Comando Personalizado
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>Você está prestes a executar:</p>
                        <code className="block p-2 bg-muted rounded font-mono text-sm">
                          {customCommand}
                        </code>
                        <p className="text-destructive">
                          Comandos personalizados são executados com privilégios elevados.
                          Certifique-se de que o comando é seguro.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCustomCommand}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Executar Mesmo Assim
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommandInput(false);
                  setCustomCommand('');
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>Status do kiosk:</span>
          <Badge variant={isKioskOnline ? 'default' : 'destructive'}>
            {kiosk.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export default KioskRemoteControl;
