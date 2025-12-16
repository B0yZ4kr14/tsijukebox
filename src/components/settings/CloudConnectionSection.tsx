import { Cloud, Check, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SettingsSection } from './SettingsSection';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export function CloudConnectionSection() {
  const isConnected = !!SUPABASE_URL;
  const projectId = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || 'N/A';

  return (
    <SettingsSection
      icon={<Cloud className="w-5 h-5 text-[#3ECF8E]" />}
      title="Lovable Cloud"
      description="Serviços de backend: banco de dados, autenticação, storage e edge functions"
      badge={
        isConnected ? (
          <Badge variant="outline" className="ml-2 border-[#3ECF8E] text-[#3ECF8E]">
            <Check className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        ) : null
      }
      delay={0.25}
      instructions={{
        title: "☁️ O que é Lovable Cloud?",
        steps: [
          "Lovable Cloud é um serviço de backend automático integrado ao seu projeto.",
          "Oferece banco de dados PostgreSQL, autenticação de usuários e armazenamento.",
          "Edge Functions permitem executar código no servidor para lógica personalizada.",
          "A conexão é configurada automaticamente pelo Lovable - você não precisa fazer nada!"
        ],
        tips: [
          "💡 Dados são sincronizados automaticamente com a nuvem",
          "💡 Ideal para projetos que precisam de backend sem configuração manual"
        ]
      }}
    >
      <div className="space-y-4">
        {isConnected ? (
          <>
            <div className="p-4 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Status</span>
                  <span className="text-[#3ECF8E] font-medium">✓ Ativo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Project ID</span>
                  <code className="text-kiosk-text font-mono text-xs bg-kiosk-background px-2 py-0.5 rounded">
                    {projectId}
                  </code>
                </div>
              </div>
            </div>

            <Separator className="bg-kiosk-border" />

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
                <p className="text-xs text-kiosk-text/50 mb-1">Database</p>
                <p className="text-sm text-kiosk-text font-medium">PostgreSQL</p>
              </div>
              <div className="p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
                <p className="text-xs text-kiosk-text/50 mb-1">Auth</p>
                <p className="text-sm text-kiosk-text font-medium">Disponível</p>
              </div>
              <div className="p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
                <p className="text-xs text-kiosk-text/50 mb-1">Storage</p>
                <p className="text-sm text-kiosk-text font-medium">Disponível</p>
              </div>
              <div className="p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
                <p className="text-xs text-kiosk-text/50 mb-1">Edge Functions</p>
                <p className="text-sm text-kiosk-text font-medium">Disponível</p>
              </div>
            </div>

            <p className="text-xs text-kiosk-text/40 text-center">
              Configuração automática gerenciada pelo Lovable
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <Cloud className="w-12 h-12 text-kiosk-text/20 mx-auto mb-3" />
            <p className="text-kiosk-text/60 mb-4">Lovable Cloud não está configurado</p>
            <Button variant="outline" className="border-kiosk-border text-kiosk-text">
              <ExternalLink className="w-4 h-4 mr-2" />
              Saiba mais
            </Button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
