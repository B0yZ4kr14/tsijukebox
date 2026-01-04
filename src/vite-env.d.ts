/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  readonly VITE_YOUTUBE_API_KEY?: string;
  readonly VITE_WEATHER_API_KEY?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
