import { useState, useCallback } from 'react';
import type { TourStep } from '@/components/tour/GuidedTour';

export type SettingsTourId = 
  | 'connections' 
  | 'data' 
  | 'system' 
  | 'appearance' 
  | 'security' 
  | 'integrations';

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
      target: '[data-tour="database-type"]',
      title: 'Tipo de Banco de Dados',
      description: 'Escolha entre SQLite local (padrão), SQLite remoto (via SSH), ou Lovable Cloud para dados na nuvem.',
      position: 'bottom',
    },
    {
      target: '[data-tour="database-path"]',
      title: 'Caminho do Banco',
      description: 'Local onde o arquivo SQLite está armazenado. Normalmente não precisa alterar.',
      position: 'bottom',
    },
    {
      target: '[data-tour="backup-schedule"]',
      title: 'Agendamento de Backup',
      description: 'Configure backups automáticos para proteger seus dados. Recomendamos backup diário com retenção de 7 dias.',
      position: 'bottom',
    },
    {
      target: '[data-tour="cloud-backup"]',
      title: 'Backup em Nuvem',
      description: 'Sincronize seus backups com serviços como AWS S3, Google Drive, Dropbox ou MEGA para redundância.',
      position: 'bottom',
    },
  ],
  
  system: [
    {
      target: '[data-tour="system-urls"]',
      title: 'URLs do Sistema',
      description: 'Configure os endereços para acessar Dashboard (Grafana) e Datasource (Prometheus) para monitoramento.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ntp-config"]',
      title: 'Sincronização de Horário',
      description: 'Configure o servidor NTP para manter o relógio do sistema sincronizado. Importante para logs e agendamentos.',
      position: 'bottom',
    },
    {
      target: '[data-tour="weather-config"]',
      title: 'Widget de Clima',
      description: 'Configure sua chave API do OpenWeatherMap e cidade para exibir previsão do tempo na tela principal.',
      position: 'bottom',
    },
  ],
  
  appearance: [
    {
      target: '[data-tour="theme-preset"]',
      title: 'Tema Visual',
      description: 'Escolha entre temas predefinidos ou crie seu próprio tema personalizado com cores e gradientes.',
      position: 'bottom',
    },
    {
      target: '[data-tour="language"]',
      title: 'Idioma',
      description: 'Selecione o idioma da interface: Português, Inglês ou Espanhol.',
      position: 'bottom',
    },
    {
      target: '[data-tour="accessibility"]',
      title: 'Acessibilidade',
      description: 'Ajuste tamanho de fonte, contraste e ative modo para daltonismo se necessário.',
      position: 'bottom',
    },
  ],
  
  security: [
    {
      target: '[data-tour="user-management"]',
      title: 'Gerenciamento de Usuários',
      description: 'Crie e gerencie usuários com diferentes níveis de permissão: Admin, Usuário comum ou Novato.',
      position: 'bottom',
    },
    {
      target: '[data-tour="auth-provider"]',
      title: 'Provedor de Autenticação',
      description: 'Escolha entre autenticação local (SQLite) ou centralizada via Lovable Cloud.',
      position: 'bottom',
    },
    {
      target: '[data-tour="keys-management"]',
      title: 'Gerenciamento de Chaves',
      description: 'Visualize e gerencie chaves de API e tokens de acesso configurados no sistema.',
      position: 'bottom',
    },
  ],
  
  integrations: [
    {
      target: '[data-tour="spotify-credentials"]',
      title: 'Credenciais do Spotify',
      description: 'Configure seu Client ID e Client Secret do Spotify Developer para acessar playlists e músicas.',
      position: 'bottom',
    },
    {
      target: '[data-tour="spotify-connect"]',
      title: 'Conectar Conta',
      description: 'Após configurar as credenciais, clique em "Conectar" para autorizar o acesso à sua conta Spotify.',
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
