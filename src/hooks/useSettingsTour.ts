import { useState, useCallback } from 'react';
import type { TourStep } from '@/components/tour/GuidedTour';

export type SettingsTourId = 
  | 'connections' 
  | 'data' 
  | 'system' 
  | 'appearance' 
  | 'security' 
  | 'integrations'
  | 'clients';

const TOUR_STORAGE_PREFIX = 'settings_tour_';

const settingsTours: Record<SettingsTourId, TourStep[]> = {
  connections: [
    {
      target: '[data-tour="backend-url"]',
      title: 'URL do Backend',
      description: 'Digite o endereço do servidor FastAPI. O padrão é https://midiaserver.local/api. Use o botão "Testar" para verificar a conexão.',
      position: 'bottom',
    },
    {
      target: '[data-tour="websocket-toggle"]',
      title: 'WebSocket vs Polling',
      description: 'WebSocket oferece atualizações instantâneas com menor latência. Se tiver problemas de conexão, desative para usar Polling.',
      position: 'bottom',
    },
    {
      target: '[data-tour="demo-mode"]',
      title: 'Modo Demonstração',
      description: 'Ative para testar a interface sem um servidor real. Ideal para demonstrações e desenvolvimento.',
      position: 'bottom',
    },
  ],
  
  data: [
    {
      target: '[data-tour="database-engine"]',
      title: 'Motor de Banco de Dados',
      description: 'Escolha entre SQLite (local), PostgreSQL, MariaDB ou Firebird para armazenar os dados do sistema.',
      position: 'bottom',
    },
    {
      target: '[data-tour="database-config"]',
      title: 'Configuração de Conexão',
      description: 'Configure host, porta, usuário e senha para conectar ao banco de dados selecionado.',
      position: 'bottom',
    },
    {
      target: '[data-tour="database-maintenance"]',
      title: 'Ferramentas de Manutenção',
      description: 'Execute operações de reparo, otimização e verificação de integridade do banco de dados.',
      position: 'bottom',
    },
    {
      target: '[data-tour="backup-local"]',
      title: 'Backup Local',
      description: 'Crie backups completos ou incrementais salvos localmente no servidor.',
      position: 'bottom',
    },
    {
      target: '[data-tour="backup-cloud"]',
      title: 'Backup em Nuvem',
      description: 'Sincronize backups com serviços como AWS S3, Google Drive, Dropbox ou MEGA para redundância.',
      position: 'bottom',
    },
    {
      target: '[data-tour="backup-schedule"]',
      title: 'Agendamento de Backup',
      description: 'Configure backups automáticos com frequência diária, semanal ou mensal.',
      position: 'bottom',
    },
  ],
  
  system: [
    {
      target: '[data-tour="system-dashboard-url"]',
      title: 'URL do Dashboard',
      description: 'Endereço do Grafana para monitoramento de métricas e performance do sistema.',
      position: 'bottom',
    },
    {
      target: '[data-tour="system-datasource-url"]',
      title: 'URL do Datasource',
      description: 'Endereço do Prometheus que coleta métricas de CPU, memória e rede.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ntp-server"]',
      title: 'Servidor NTP',
      description: 'Selecione o servidor de sincronização de horário. Recomendamos pool.ntp.br para Brasil.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ntp-sync-button"]',
      title: 'Sincronizar Agora',
      description: 'Clique para sincronizar manualmente o relógio do sistema com o servidor NTP.',
      position: 'bottom',
    },
  ],
  
  appearance: [
    {
      target: '[data-tour="theme-customizer"]',
      title: 'Personalizador de Tema',
      description: 'Escolha entre temas predefinidos ou crie seu próprio tema personalizado com cores e gradientes.',
      position: 'bottom',
    },
    {
      target: '[data-tour="theme-tools"]',
      title: 'Ferramentas de Tema',
      description: 'Visualize preview completo, exporte e importe configurações de tema.',
      position: 'bottom',
    },
    {
      target: '[data-tour="accessibility-settings"]',
      title: 'Acessibilidade',
      description: 'Ajuste tamanho de fonte, contraste, animações e sons de feedback.',
      position: 'bottom',
    },
    {
      target: '[data-tour="language-selector"]',
      title: 'Idioma',
      description: 'Selecione o idioma da interface: Português, Inglês ou Espanhol.',
      position: 'bottom',
    },
  ],
  
  security: [
    {
      target: '[data-tour="user-management-list"]',
      title: 'Lista de Usuários',
      description: 'Visualize todos os usuários cadastrados e seus níveis de permissão.',
      position: 'bottom',
    },
    {
      target: '[data-tour="add-user-button"]',
      title: 'Adicionar Usuário',
      description: 'Crie novos usuários com diferentes níveis de acesso: Admin, Usuário ou Novato.',
      position: 'bottom',
    },
    {
      target: '[data-tour="keys-management"]',
      title: 'Chaves de Segurança',
      description: 'Configure chaves SSH e GPG para acesso seguro e criptografia de backups.',
      position: 'bottom',
    },
    {
      target: '[data-tour="auth-provider-selector"]',
      title: 'Provedor de Autenticação',
      description: 'Escolha entre autenticação local (Backend FastAPI) ou via Lovable Cloud.',
      position: 'bottom',
    },
  ],
  
  integrations: [
    {
      target: '[data-tour="weather-api-key"]',
      title: 'Chave API de Clima',
      description: 'Insira sua chave do OpenWeatherMap para exibir previsão do tempo.',
      position: 'bottom',
    },
    {
      target: '[data-tour="weather-city"]',
      title: 'Cidade do Clima',
      description: 'Digite sua cidade para exibir a previsão correta. Ex: "Montes Claros,BR"',
      position: 'bottom',
    },
    {
      target: '[data-tour="spotify-credentials"]',
      title: 'Credenciais do Spotify',
      description: 'Configure seu Client ID e Client Secret do Spotify Developer para acessar playlists.',
      position: 'bottom',
    },
    {
      target: '[data-tour="spotify-connect"]',
      title: 'Conectar ao Spotify',
      description: 'Após configurar credenciais, clique em "Conectar com Spotify" para autorizar o acesso.',
      position: 'bottom',
    },
  ],

  clients: [
    {
      target: '[data-tour="clients-management"]',
      title: 'Gerenciamento de Clientes',
      description: 'Adicione e gerencie múltiplos terminais TSiJUKEBOX remotamente.',
      position: 'bottom',
    },
  ],
};

export function useSettingsTour(sectionId: SettingsTourId) {
  const storageKey = `${TOUR_STORAGE_PREFIX}${sectionId}_complete`;
  const [isOpen, setIsOpen] = useState(false);
  
  const steps = settingsTours[sectionId] || [];
  
  const startTour = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const endTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);
  
  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);
  
  const isTourComplete = localStorage.getItem(storageKey) === 'true';
  
  return { 
    steps, 
    isOpen, 
    startTour, 
    endTour, 
    resetTour,
    isTourComplete,
    hasSteps: steps.length > 0
  };
}

export function resetAllSettingsTours() {
  Object.keys(settingsTours).forEach(sectionId => {
    localStorage.removeItem(`${TOUR_STORAGE_PREFIX}${sectionId}_complete`);
  });
}
