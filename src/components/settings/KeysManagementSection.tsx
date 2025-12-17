import { useState, useEffect } from 'react';
import { Key, Shield, FileKey, FolderKey, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface KeysConfig {
  sshKeyPath: string;
  sshKeyPubPath: string;
  gpgKeyId: string;
  gpgKeyPath: string;
  useSSHAgent: boolean;
}

const defaultConfig: KeysConfig = {
  sshKeyPath: '~/.keys/ssh/id_ed25519',
  sshKeyPubPath: '~/.keys/ssh/id_ed25519.pub',
  gpgKeyId: '',
  gpgKeyPath: '~/.keys/gpg/',
  useSSHAgent: true,
};

const STORAGE_KEY = 'tsi_jukebox_keys_config';

export function KeysManagementSection() {
  const [config, setConfig] = useState<KeysConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = (key: keyof KeysConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success('Configuração de chaves salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const instructions = {
    title: "🔐 O que são Chaves SSH e GPG?",
    steps: [
      "Imagine que sua casa tem uma fechadura especial que só abre com uma chave única - as chaves SSH funcionam assim!",
      "Elas permitem que seu Jukebox 'entre' em outros computadores de forma segura, sem precisar digitar senha.",
      "A CHAVE PRIVADA (ex: id_ed25519) é como a chave da sua casa - NUNCA mostre para ninguém!",
      "A CHAVE PÚBLICA (.pub) é como o endereço da sua casa - pode ser compartilhada com quem você confia.",
      "O GPG serve para 'assinar' seus backups digitalmente, garantindo que ninguém alterou seus arquivos."
    ],
    tips: [
      "💡 Se não tem chaves, abra o terminal e digite: ssh-keygen -t ed25519",
      "💡 O tipo ed25519 é mais seguro e rápido que o antigo RSA",
      "💡 O SSH Agent guarda sua senha na memória temporariamente"
    ],
    warning: "⚠️ NUNCA compartilhe sua chave PRIVADA! Perder ela significa perder acesso aos servidores. Faça backup em local seguro!"
  };

  return (
    <SettingsSection
      icon={<Key className="w-5 h-5 icon-neon-blue" />}
      title="Chaves de Segurança"
      description="Configure suas chaves SSH e GPG"
      instructions={instructions}
      delay={0.25}
    >
      <div className="space-y-6" data-tour="keys-management">
        {/* SSH Keys Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-label-yellow">
            <FileKey className="w-4 h-4" />
            <span className="font-medium">Chaves SSH</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ssh-key-path" className="text-label-yellow font-semibold">
                Caminho da Chave Privada
              </Label>
              <Input
                id="ssh-key-path"
                value={config.sshKeyPath}
                onChange={(e) => updateConfig('sshKeyPath', e.target.value)}
                placeholder="~/.keys/ssh/id_ed25519"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
              <p className="text-xs text-settings-hint">
                Esta é sua chave SECRETA - mantenha segura!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssh-pub-path" className="text-label-yellow font-semibold">
                Caminho da Chave Pública
              </Label>
              <Input
                id="ssh-pub-path"
                value={config.sshKeyPubPath}
                onChange={(e) => updateConfig('sshKeyPubPath', e.target.value)}
                placeholder="~/.keys/ssh/id_ed25519.pub"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
              <p className="text-xs text-settings-hint">
                Esta pode ser compartilhada com servidores
              </p>
            </div>

            <div className="card-option-dark-3d rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 icon-neon-blue" />
                  <div>
                    <Label className="text-label-yellow font-medium">Usar SSH Agent</Label>
                    <p className="text-xs text-settings-hint mt-0.5">
                      Guarda a senha na memória (recomendado)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.useSSHAgent}
                  onCheckedChange={(checked) => updateConfig('useSSHAgent', checked)}
                  variant="neon"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Folder Structure Example */}
        <div className="card-option-dark-3d rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-label-orange">
            <FolderKey className="w-4 h-4" />
            <span className="text-sm font-medium">Exemplo de Estrutura de Pastas</span>
          </div>
          <pre className="text-xs font-mono text-neon-white bg-kiosk-bg/50 p-3 rounded overflow-x-auto">
{`~/.keys/
  ├── ssh/
  │   ├── id_ed25519        (chave privada - SECRETA!)
  │   └── id_ed25519.pub    (chave pública)
  └── gpg/
      └── [arquivos GPG]`}
          </pre>
        </div>

        {/* GPG Keys Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-label-yellow">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Chave GPG</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="gpg-key-id" className="text-label-yellow font-semibold">
                ID da Chave GPG
              </Label>
              <Input
                id="gpg-key-id"
                value={config.gpgKeyId}
                onChange={(e) => updateConfig('gpgKeyId', e.target.value)}
                placeholder="3AA5C34371567BD2"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
              <p className="text-xs text-settings-hint">
                Identificador único da sua chave GPG
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpg-key-path" className="text-label-yellow font-semibold">
                Diretório das Chaves GPG
              </Label>
              <Input
                id="gpg-key-path"
                value={config.gpgKeyPath}
                onChange={(e) => updateConfig('gpgKeyPath', e.target.value)}
                placeholder="~/.keys/gpg/"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="instructions-warning">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Importante sobre segurança:</p>
            <ul className="mt-1 space-y-1 text-xs opacity-90">
              <li>• NUNCA compartilhe sua chave PRIVADA (id_ed25519)</li>
              <li>• A chave pública (.pub) pode ser compartilhada</li>
              <li>• Use senhas fortes para proteger suas chaves</li>
              <li>• Faça backup das chaves em local seguro</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full button-primary-glow-3d ripple-effect"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </SettingsSection>
  );
}
