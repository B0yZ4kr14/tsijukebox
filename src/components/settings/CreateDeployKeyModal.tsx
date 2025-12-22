import { useState } from 'react';
import { KeyRound, Loader2, Key, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CreateDeployKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type TabMode = 'deploy-key' | 'pat';

// Error codes and messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  'key is already in use': 'Esta chave SSH já está em uso em outro repositório. Use uma chave diferente.',
  'key_already_exists': 'Esta chave SSH já existe no repositório.',
  'validation failed': 'A chave SSH fornecida é inválida. Verifique o formato.',
  'bad credentials': 'Token de acesso inválido ou expirado.',
  'not found': 'Repositório não encontrado ou sem permissão de acesso.',
  '401': 'Autenticação falhou. Verifique o token de acesso.',
  '403': 'Sem permissão para adicionar chaves ao repositório.',
  '422': 'Dados inválidos. Verifique a chave e o título.',
};

function getErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key.toLowerCase())) {
      return message;
    }
  }
  
  return error instanceof Error ? error.message : 'Erro desconhecido ao processar a requisição.';
}

export function CreateDeployKeyModal({ open, onOpenChange, onSuccess }: CreateDeployKeyModalProps) {
  const [mode, setMode] = useState<TabMode>('deploy-key');
  
  // Deploy Key state
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [readOnly, setReadOnly] = useState(true);
  
  // PAT state
  const [personalToken, setPersonalToken] = useState('');
  const [tokenName, setTokenName] = useState('');
  
  // Shared state
  const [isCreating, setIsCreating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setKey('');
    setReadOnly(true);
    setPersonalToken('');
    setTokenName('');
    setValidationError(null);
  };

  const handleCreateDeployKey = async () => {
    if (!title.trim()) {
      toast.error('Digite um título para a chave');
      return;
    }

    if (!key.trim()) {
      toast.error('Cole a chave pública SSH');
      return;
    }

    // Enhanced SSH key validation
    const sshKeyPattern = /^(ssh-(rsa|ed25519|dss)|ecdsa-sha2-nistp(256|384|521))\s+[A-Za-z0-9+/=]+/;
    if (!sshKeyPattern.test(key.trim())) {
      setValidationError('Formato de chave SSH inválido. A chave deve começar com ssh-rsa, ssh-ed25519, ssh-dss ou ecdsa-sha2-nistp*');
      return;
    }

    setIsCreating(true);
    setValidationError(null);

    try {
      const response = await supabase.functions.invoke('github-repo', {
        body: {
          action: 'create-deploy-key',
          title: title.trim(),
          key: key.trim(),
          read_only: readOnly,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create deploy key');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to create deploy key');
      }

      toast.success('Deploy key criada com sucesso!');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setValidationError(errorMessage);
      toast.error(errorMessage);
      console.error('[CreateDeployKeyModal] Error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleValidateToken = async () => {
    if (!personalToken.trim()) {
      toast.error('Cole o Personal Access Token');
      return;
    }

    // Basic PAT validation
    if (!personalToken.startsWith('ghp_') && !personalToken.startsWith('github_pat_')) {
      setValidationError('Token inválido. O Personal Access Token deve começar com ghp_ ou github_pat_');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await supabase.functions.invoke('github-repo', {
        body: {
          action: 'validate-token',
          custom_token: personalToken.trim(),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to validate token');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to validate token');
      }

      const userData = response.data?.data;
      toast.success(`Token válido! Autenticado como: ${userData?.login || 'Usuário'}`);
      
      // Proceed to save the token
      await handleSaveToken(userData?.login);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setValidationError(errorMessage);
      toast.error(errorMessage);
      console.error('[CreateDeployKeyModal] Validate Token Error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveToken = async (username?: string) => {
    if (!tokenName.trim()) {
      setTokenName(`PAT-${username || 'custom'}-${Date.now()}`);
    }

    setIsCreating(true);

    try {
      const response = await supabase.functions.invoke('github-repo', {
        body: {
          action: 'save-token',
          custom_token: personalToken.trim(),
          token_name: tokenName.trim() || `PAT-${username || 'custom'}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save token');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to save token');
      }

      toast.success('Token salvo com sucesso!');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setValidationError(errorMessage);
      toast.error(errorMessage);
      console.error('[CreateDeployKeyModal] Save Token Error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Gerenciar Acesso ao GitHub
          </DialogTitle>
          <DialogDescription>
            Configure deploy keys SSH ou Personal Access Tokens para acesso ao repositório.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as TabMode)} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deploy-key" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Deploy Key
            </TabsTrigger>
            <TabsTrigger value="pat" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Personal Token
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy-key" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-title">Título</Label>
              <Input
                id="key-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Server Production"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-content">Chave Pública SSH</Label>
              <Textarea
                id="key-content"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setValidationError(null);
                }}
                placeholder="ssh-ed25519 AAAA... user@host"
                className="bg-background font-mono text-xs min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Cole sua chave pública SSH (arquivo .pub)
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div>
                <Label>Somente Leitura</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {readOnly
                    ? 'A chave só pode clonar/pull'
                    : 'A chave pode push/write (menos seguro)'}
                </p>
              </div>
              <Switch
                checked={readOnly}
                onCheckedChange={setReadOnly}
              />
            </div>

            {!readOnly && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Chaves com permissão de escrita podem modificar o repositório. Use com cuidado!</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pat" className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-sm">
              <p className="font-medium mb-1">Personal Access Token (PAT)</p>
              <p className="text-xs opacity-80">
                PATs fornecem acesso autenticado à API do GitHub. Você pode criar um em{' '}
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  GitHub Settings → Developer settings → Personal access tokens
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-name">Nome do Token (opcional)</Label>
              <Input
                id="token-name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Ex: Servidor de Produção"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pat-content">Personal Access Token</Label>
              <Input
                id="pat-content"
                type="password"
                value={personalToken}
                onChange={(e) => {
                  setPersonalToken(e.target.value);
                  setValidationError(null);
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="bg-background font-mono"
              />
              <p className="text-xs text-muted-foreground">
                O token precisa ter permissão de <code className="bg-muted px-1 rounded">repo</code> para acessar repositórios
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Validation Error Display */}
        {validationError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isCreating || isValidating}>
            Cancelar
          </Button>
          
          {mode === 'deploy-key' ? (
            <Button onClick={handleCreateDeployKey} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Deploy Key'
              )}
            </Button>
          ) : (
            <Button onClick={handleValidateToken} disabled={isValidating || isCreating}>
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Validar e Salvar Token'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
