// i18n templates - 4 arquivos
// Geração automática de conteúdo para src/i18n/

const VERSION = '2.5.0';
const GENERATED_AT = new Date().toISOString();

export function generateI18nContent(path: string): string | null {
  const fileName = path.split('/').pop();
  
  if (path.includes('locales/')) {
    switch (fileName) {
      case 'en.json':
        return generateEnLocale();
      case 'es.json':
        return generateEsLocale();
      case 'pt-BR.json':
        return generatePtBrLocale();
      default:
        return null;
    }
  }
  
  if (fileName === 'index.ts') {
    return generateI18nIndex();
  }
  
  return null;
}

function generateI18nIndex(): string {
  return `// i18n configuration
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

export const resources = {
  en: { translation: en },
  es: { translation: es },
  'pt-BR': { translation: ptBR },
} as const;

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
`;
}

function generateEnLocale(): string {
  return JSON.stringify({
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      settings: "Settings",
      logout: "Logout",
      login: "Login",
      register: "Register"
    },
    player: {
      nowPlaying: "Now Playing",
      queue: "Queue",
      shuffle: "Shuffle",
      repeat: "Repeat",
      volume: "Volume",
      mute: "Mute",
      previous: "Previous",
      next: "Next",
      play: "Play",
      pause: "Pause"
    },
    settings: {
      title: "Settings",
      theme: "Theme",
      language: "Language",
      notifications: "Notifications",
      privacy: "Privacy",
      about: "About"
    },
    github: {
      sync: "Sync with GitHub",
      syncing: "Syncing...",
      syncSuccess: "Sync completed",
      syncError: "Sync failed",
      lastSync: "Last sync"
    }
  }, null, 2);
}

function generateEsLocale(): string {
  return JSON.stringify({
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      search: "Buscar",
      settings: "Configuración",
      logout: "Cerrar sesión",
      login: "Iniciar sesión",
      register: "Registrarse"
    },
    player: {
      nowPlaying: "Reproduciendo",
      queue: "Cola",
      shuffle: "Aleatorio",
      repeat: "Repetir",
      volume: "Volumen",
      mute: "Silenciar",
      previous: "Anterior",
      next: "Siguiente",
      play: "Reproducir",
      pause: "Pausar"
    },
    settings: {
      title: "Configuración",
      theme: "Tema",
      language: "Idioma",
      notifications: "Notificaciones",
      privacy: "Privacidad",
      about: "Acerca de"
    },
    github: {
      sync: "Sincronizar con GitHub",
      syncing: "Sincronizando...",
      syncSuccess: "Sincronización completada",
      syncError: "Error de sincronización",
      lastSync: "Última sincronización"
    }
  }, null, 2);
}

function generatePtBrLocale(): string {
  return JSON.stringify({
    common: {
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Salvar",
      delete: "Excluir",
      edit: "Editar",
      search: "Buscar",
      settings: "Configurações",
      logout: "Sair",
      login: "Entrar",
      register: "Cadastrar"
    },
    player: {
      nowPlaying: "Tocando Agora",
      queue: "Fila",
      shuffle: "Aleatório",
      repeat: "Repetir",
      volume: "Volume",
      mute: "Mudo",
      previous: "Anterior",
      next: "Próxima",
      play: "Tocar",
      pause: "Pausar"
    },
    settings: {
      title: "Configurações",
      theme: "Tema",
      language: "Idioma",
      notifications: "Notificações",
      privacy: "Privacidade",
      about: "Sobre"
    },
    github: {
      sync: "Sincronizar com GitHub",
      syncing: "Sincronizando...",
      syncSuccess: "Sincronização concluída",
      syncError: "Erro na sincronização",
      lastSync: "Última sincronização"
    }
  }, null, 2);
}
