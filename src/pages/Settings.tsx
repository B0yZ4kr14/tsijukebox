import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Monitor, TestTube, Music, ExternalLink, LogOut, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { useSettings } from '@/contexts/SettingsContext';
import { spotifyClient } from '@/lib/api/spotify';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { toast } from 'sonner';
import { 
  SettingsSection, 
  ThemeSection, 
  CloudConnectionSection, 
  BackendConnectionSection, 
  UnifiedDatabaseSection,
  UnifiedBackupSection,
  AdvancedDatabaseSection,
  ClientsManagementSection,
  UserManagementSection, 
  AuthProviderSection, 
  SystemUrlsSection, 
  NtpConfigSection, 
  WeatherConfigSection, 
  LanguageSection, 
  AccessibilitySection, 
  KeysManagementSection,
  SpicetifySection,
  YouTubeMusicSection
} from '@/components/settings';
import { SettingsSidebar, SettingsCategory } from '@/components/settings/SettingsSidebar';
import { SettingsDashboard } from '@/components/settings/SettingsDashboard';
import { SettingsBreadcrumb } from '@/components/settings/SettingsBreadcrumb';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('dashboard');
  
  const {
    isDemoMode,
    setDemoMode,
    apiUrl,
    setApiUrl,
    useWebSocket,
    setUseWebSocket,
    pollingInterval,
    setPollingInterval,
    spotify,
    setSpotifyCredentials,
    setSpotifyTokens,
    setSpotifyUser,
    clearSpotifyAuth,
    setYouTubeMusicTokens,
    setYouTubeMusicUser,
  } = useSettings();

  const [localClientId, setLocalClientId] = useState(spotify.clientId);
  const [localClientSecret, setLocalClientSecret] = useState(spotify.clientSecret);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Persist active category
  useEffect(() => {
    const saved = localStorage.getItem('settings_active_category');
    if (saved && ['dashboard', 'connections', 'data', 'system', 'appearance', 'security', 'integrations'].includes(saved)) {
      setActiveCategory(saved as SettingsCategory);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settings_active_category', activeCategory);
  }, [activeCategory]);

  // Handle OAuth callback (Spotify and YouTube Music)
  useEffect(() => {
    const code = searchParams.get('spotify_code');
    const ytCode = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('spotify_error') || searchParams.get('error');

    if (error) {
      toast.error(`Erro na autenticação: ${error}`);
      setSearchParams({});
      return;
    }

    // Spotify OAuth callback
    if (code && spotify.clientId && spotify.clientSecret) {
      handleSpotifyCallback(code);
    }

    // YouTube Music OAuth callback
    if (ytCode && state === 'youtube-music-oauth') {
      handleYouTubeMusicCallback(ytCode);
    }
  }, [searchParams, spotify.clientId, spotify.clientSecret]);

  const handleSpotifyCallback = async (code: string) => {
    setIsConnecting(true);
    try {
      const tokens = await spotifyClient.exchangeCode(code);
      setSpotifyTokens(tokens);
      
      const user = await spotifyClient.validateToken();
      if (user) {
        setSpotifyUser(user);
        toast.success(`Conectado como ${user.displayName}`);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to exchange code:', error);
      toast.error('Falha ao conectar com Spotify');
    } finally {
      setIsConnecting(false);
      setSearchParams({});
    }
  };

  const handleYouTubeMusicCallback = async (code: string) => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/settings`;
      const tokens = await youtubeMusicClient.exchangeCode(code, redirectUri);
      setYouTubeMusicTokens(tokens);
      
      const user = await youtubeMusicClient.getCurrentUser();
      if (user) {
        setYouTubeMusicUser(user);
        toast.success(`YouTube Music conectado como ${user.name}`);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to exchange YouTube Music code:', error);
      toast.error('Falha ao conectar com YouTube Music');
    } finally {
      setIsConnecting(false);
      setSearchParams({});
    }
  };

  const handleDemoModeToggle = (checked: boolean) => {
    setDemoMode(checked);
    toast.success(checked ? 'Modo demo ativado' : 'Modo demo desativado');
  };

  const handleSaveSpotifyCredentials = () => {
    if (!localClientId.trim() || !localClientSecret.trim()) {
      toast.error('Preencha Client ID e Client Secret');
      return;
    }
    setSpotifyCredentials(localClientId.trim(), localClientSecret.trim());
    toast.success('Credenciais Spotify salvas');
  };

  const handleSpotifyConnect = async () => {
    if (!spotify.clientId || !spotify.clientSecret) {
      toast.error('Configure as credenciais primeiro');
      return;
    }

    setIsConnecting(true);
    try {
      const { authUrl } = await spotifyClient.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to get auth URL:', error);
      toast.error('Falha ao iniciar autenticação');
      setIsConnecting(false);
    }
  };

  const handleSpotifyDisconnect = () => {
    clearSpotifyAuth();
    toast.success('Desconectado do Spotify');
  };

  const credentialsChanged = localClientId !== spotify.clientId || localClientSecret !== spotify.clientSecret;

  // Category titles for header
  const categoryTitles: Record<SettingsCategory, string> = {
    dashboard: 'Dashboard',
    connections: 'Conexões',
    data: 'Dados & Backup',
    system: 'Sistema',
    appearance: 'Aparência',
    security: 'Segurança & Usuários',
    integrations: 'Integrações',
  };

  // Render content based on active category
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'dashboard':
        return <SettingsDashboard onNavigateToCategory={setActiveCategory} />;

      case 'connections':
        return (
          <>
            <BackendConnectionSection
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              useWebSocket={useWebSocket}
              setUseWebSocket={setUseWebSocket}
              pollingInterval={pollingInterval}
              setPollingInterval={setPollingInterval}
              isDemoMode={isDemoMode}
            />
            <CloudConnectionSection />
          </>
        );

      case 'data':
        return (
          <>
            <AdvancedDatabaseSection isDemoMode={isDemoMode} />
            <UnifiedBackupSection isDemoMode={isDemoMode} />
            <ClientsManagementSection />
          </>
        );

      case 'system':
        return (
          <>
            <SystemUrlsSection />
            <NtpConfigSection />
            {/* Demo Mode */}
            <SettingsSection
              icon={<TestTube className="w-5 h-5 text-kiosk-primary" />}
              title="Modo Demonstração"
              description="Ativa dados simulados para testar a interface sem o backend"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-kiosk-text">Demo Mode</Label>
                    <p className="text-xs text-kiosk-text/70">
                      {isDemoMode ? 'Usando dados mockados' : 'Conectando ao backend real'}
                    </p>
                  </div>
                  <Switch
                    checked={isDemoMode}
                    onCheckedChange={handleDemoModeToggle}
                    className="data-[state=checked]:bg-kiosk-primary"
                  />
                </div>

                {isDemoMode && (
                  <motion.div
                    className="p-3 rounded-lg bg-kiosk-primary/10 border border-kiosk-primary/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-sm text-kiosk-primary">
                      ✓ Modo demo ativo - todas as animações e gestos funcionam com dados simulados
                    </p>
                  </motion.div>
                )}
              </div>
            </SettingsSection>
            {/* System Info */}
            <SettingsSection
              icon={<Monitor className="w-5 h-5 text-kiosk-primary" />}
              title="Informações do Sistema"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Versão</span>
                  <span className="text-kiosk-text">TSiJUKEBOX Enterprise v4.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Modo</span>
                  <span className="text-kiosk-text">
                    {isDemoMode ? 'Demonstração' : 'Produção'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Conexão</span>
                  <span className="text-kiosk-text">
                    {isDemoMode ? 'N/A' : useWebSocket ? 'WebSocket' : `Polling (${pollingInterval / 1000}s)`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">API</span>
                  <span className="text-kiosk-text font-mono text-xs truncate max-w-[200px]">
                    {isDemoMode ? 'Mock Data' : apiUrl}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Spotify</span>
                  <span className="text-kiosk-text">
                    {spotify.isConnected ? (
                      <span className="text-[#1DB954]">Conectado</span>
                    ) : spotify.clientId ? (
                      <span className="text-yellow-500">Configurado</span>
                    ) : (
                      <span className="text-kiosk-text/40">Não configurado</span>
                    )}
                  </span>
                </div>
              </div>
            </SettingsSection>
          </>
        );

      case 'appearance':
        return (
          <>
            <ThemeSection />
            <AccessibilitySection />
            <LanguageSection />
          </>
        );

      case 'security':
        return (
          <>
            <UserManagementSection />
            <KeysManagementSection />
            <AuthProviderSection />
          </>
        );

      case 'integrations':
        return (
          <>
            <WeatherConfigSection />
            {/* Spotify Section */}
            <SettingsSection
              icon={<Music className="w-5 h-5 text-[#1DB954]" />}
              title="Spotify"
              description="Conecte sua conta Spotify para acessar playlists e biblioteca"
              badge={
                spotify.isConnected ? (
                  <Badge variant="outline" className="ml-2 border-[#1DB954] text-[#1DB954]">
                    <Check className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                ) : null
              }
            >
              <div className="space-y-4">
                {/* Connected User Info */}
                {spotify.isConnected && spotify.user && (
                  <motion.div
                    className="p-4 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-3">
                      {spotify.user.imageUrl ? (
                        <img
                          src={spotify.user.imageUrl}
                          alt={spotify.user.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-[#1DB954]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-kiosk-text">{spotify.user.displayName}</p>
                        <p className="text-sm text-kiosk-text/75">{spotify.user.email}</p>
                        <Badge 
                          variant="secondary" 
                          className={`mt-1 ${
                            spotify.user.product === 'premium' 
                              ? 'bg-[#1DB954]/20 text-[#1DB954]' 
                              : 'bg-kiosk-surface text-kiosk-text/60'
                          }`}
                        >
                          {spotify.user.product === 'premium' ? 'Premium' : 'Free'}
                        </Badge>
                      </div>
                      <Button
                        variant="kiosk-outline"
                        size="sm"
                        onClick={handleSpotifyDisconnect}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Desconectar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Credentials Form */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="clientId" className="text-label-yellow">Client ID</Label>
                    <Input
                      id="clientId"
                      value={localClientId}
                      onChange={(e) => setLocalClientId(e.target.value)}
                      placeholder="Cole seu Spotify Client ID"
                      className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret" className="text-label-yellow">Client Secret</Label>
                    <div className="relative">
                      <Input
                        id="clientSecret"
                        type={showClientSecret ? 'text' : 'password'}
                        value={localClientSecret}
                        onChange={(e) => setLocalClientSecret(e.target.value)}
                        placeholder="Cole seu Spotify Client Secret"
                        className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-kiosk-text/50 hover:text-kiosk-text"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                      >
                        {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {credentialsChanged && (
                    <Button
                      onClick={handleSaveSpotifyCredentials}
                      className="w-full bg-kiosk-primary hover:bg-kiosk-primary/90"
                    >
                      Salvar Credenciais
                    </Button>
                  )}
                </div>

                <Separator className="bg-kiosk-border" />

                {/* Connect/Info Section */}
                {!spotify.isConnected && (
                  <div className="space-y-3">
                    <Button
                      onClick={handleSpotifyConnect}
                      disabled={!spotify.clientId || !spotify.clientSecret || isConnecting}
                      className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-white"
                    >
                      {isConnecting ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Music className="w-4 h-4 mr-2" />
                          Conectar com Spotify
                        </>
                      )}
                    </Button>

                    {/* Help Info */}
                    <div className="p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border card-option-neon">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 icon-neon-blue mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-kiosk-text/80 space-y-1.5">
                          <p className="text-label-orange">Para obter as credenciais:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-1">
                            <li>Acesse o <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">Spotify Developer Dashboard <ExternalLink className="w-3 h-3" /></a></li>
                            <li>Crie um novo aplicativo</li>
                            <li>
                              Adicione como Redirect URI:
                              <div className="mt-1 space-y-1">
                                <code className="block bg-kiosk-surface px-2 py-1 rounded text-cyan-400 text-[11px]">{window.location.origin}/settings</code>
                                <span className="text-kiosk-text/60 text-[10px]">Em produção local:</span>
                                <code className="block bg-kiosk-surface px-2 py-1 rounded text-cyan-400/80 text-[10px]">https://midiaserver.local/jukebox/settings</code>
                              </div>
                            </li>
                            <li>Copie o Client ID e Client Secret</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Token Info */}
                {spotify.tokens && (
                  <div className="text-xs text-kiosk-text/40 space-y-1">
                    <p>Token expira em: {new Date(spotify.tokens.expiresAt).toLocaleString()}</p>
                    <p>Renovação automática ativa ✓</p>
                  </div>
                )}
              </div>
            </SettingsSection>

            {/* Spicetify Section */}
            <SpicetifySection />

            {/* YouTube Music Section */}
            <YouTubeMusicSection />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KioskLayout>
      <div className="min-h-screen bg-kiosk-background flex">
        {/* Sidebar */}
        <SettingsSidebar 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        {/* Main Content */}
        <motion.main
          className="flex-1 settings-content-area"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Logo */}
          <motion.div
            className="flex justify-center pt-6 pb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LogoBrand size="md" animate />
          </motion.div>

          {/* Breadcrumb */}
          <div className="px-6">
            <SettingsBreadcrumb 
              category={activeCategory} 
              onNavigateToCategory={setActiveCategory} 
            />
          </div>

          {/* Header */}
          <motion.header
            className="flex items-center gap-4 px-6 pb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80 button-3d"
              >
                <ArrowLeft className="w-5 h-5 text-kiosk-text" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gold-neon">{categoryTitles[activeCategory]}</h1>
              <p className="text-kiosk-text/60 text-sm">Configurações do TSi JUKEBOX</p>
            </div>
          </motion.header>

          {/* Content Area */}
          <div className="px-6 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="max-w-2xl mx-auto space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderCategoryContent()}
              </motion.div>
            </AnimatePresence>

            {/* Quick Actions */}
            <motion.div
              className="flex gap-3 justify-center pt-8 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('tsi_jukebox_settings');
                  localStorage.removeItem('tsi_jukebox_spotify');
                  window.location.reload();
                }}
                className="button-outline-neon"
              >
                Restaurar Padrões
              </Button>
              <Link to="/">
                <Button className="bg-kiosk-primary hover:bg-kiosk-primary/90">
                  Voltar ao Player
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </KioskLayout>
  );
}
