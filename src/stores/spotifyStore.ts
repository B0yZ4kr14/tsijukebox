import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface para informações do usuário Spotify
 */
interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string;
  product: 'free' | 'premium';
}

/**
 * Interface para o estado do Spotify
 */
interface SpotifyState {
  // Estado de conexão
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Dados do usuário
  user: SpotifyUser | null;
  
  // Token de acesso
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  
  // Ações
  connect: () => Promise<void>;
  disconnect: () => void;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: SpotifyUser) => void;
  setError: (error: string | null) => void;
  checkConnection: () => Promise<boolean>;
}

/**
 * Store Zustand para gerenciamento do estado do Spotify
 */
export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isConnected: false,
      isLoading: false,
      error: null,
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,

      /**
       * Inicia o fluxo de autenticação OAuth do Spotify
       */
      connect: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Gera state aleatório para segurança OAuth
          const state = Math.random().toString(36).substring(7);
          sessionStorage.setItem('spotify_auth_state', state);

          // Parâmetros de autenticação
          const params = new URLSearchParams({
            client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
            response_type: 'code',
            redirect_uri: `${window.location.origin}/callback/spotify`,
            state,
            scope: [
              'user-read-playback-state',
              'user-modify-playback-state',
              'user-read-currently-playing',
              'playlist-read-private',
              'playlist-read-collaborative',
              'user-library-read',
              'user-top-read',
            ].join(' '),
          });

          // Redireciona para página de autorização do Spotify
          window.location.href = `https://accounts.spotify.com/authorize?${params}`;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao conectar com Spotify',
            isLoading: false 
          });
        }
      },

      /**
       * Desconecta do Spotify e limpa os dados
       */
      disconnect: () => {
        set({
          isConnected: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          error: null,
        });
      },

      /**
       * Armazena os tokens de acesso
       */
      setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
        const tokenExpiresAt = Date.now() + expiresIn * 1000;
        set({
          accessToken,
          refreshToken,
          tokenExpiresAt,
          isConnected: true,
          isLoading: false,
        });
      },

      /**
       * Renova o token de acesso usando o refresh token
       */
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          set({ error: 'Nenhum refresh token disponível' });
          return;
        }

        try {
          const response = await fetch('/api/spotify/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Falha ao renovar token');
          }

          const data = await response.json();
          get().setTokens(data.accessToken, refreshToken, data.expiresIn);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao renovar token',
            isConnected: false 
          });
        }
      },

      /**
       * Define os dados do usuário
       */
      setUser: (user: SpotifyUser) => {
        set({ user });
      },

      /**
       * Define uma mensagem de erro
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Verifica se a conexão ainda é válida
       */
      checkConnection: async () => {
        const { accessToken, tokenExpiresAt, refreshAccessToken } = get();

        if (!accessToken) {
          set({ isConnected: false });
          return false;
        }

        // Verifica se o token expirou
        if (tokenExpiresAt && Date.now() >= tokenExpiresAt) {
          await refreshAccessToken();
          return get().isConnected;
        }

        return true;
      },
    }),
    {
      name: 'tsijukebox-spotify-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        isConnected: state.isConnected,
      }),
    }
  )
);
