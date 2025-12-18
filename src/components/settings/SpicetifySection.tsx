import { Palette, Download, RefreshCw, Settings, Check, X, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSpicetifyIntegration } from '@/hooks/useSpicetifyIntegration';
import { useTranslation } from '@/hooks/useTranslation';

export function SpicetifySection() {
  const { t } = useTranslation();
  const {
    status,
    themes,
    extensions,
    isLoading,
    error,
    isInstalled,
    currentTheme,
    applyTheme,
    toggleExtension,
    backup,
    restore,
    refresh,
  } = useSpicetifyIntegration();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="card-dark-neon-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gold-neon font-bold">
            <Palette className="w-5 h-5 icon-neon-blue" />
            Spicetify
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-label-yellow font-semibold">Status</span>
            {isInstalled ? (
              <Badge variant="default" className="bg-green-600 text-white font-bold">
                <Check className="w-3 h-3 mr-1" />
                Instalado v{status?.version}
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-bold">
                <X className="w-3 h-3 mr-1" />
                Não detectado
              </Badge>
            )}
          </div>

          {isInstalled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-label-yellow font-semibold">Tema atual</span>
                <span className="text-kiosk-text font-medium">{currentTheme || 'Padrão'}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="kiosk-outline"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                  className="button-control-extreme-3d"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Atualizar
                </Button>
                <Button
                  variant="kiosk-outline"
                  size="sm"
                  onClick={backup}
                  disabled={isLoading}
                  className="button-control-extreme-3d"
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Backup
                </Button>
                <Button
                  variant="kiosk-outline"
                  size="sm"
                  onClick={restore}
                  disabled={isLoading}
                  className="button-control-extreme-3d"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Restaurar
                </Button>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-kiosk-text/90">
              {error}. <a href="https://spicetify.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">Instalar Spicetify</a>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Themes */}
      {isInstalled && themes.length > 0 && (
        <Card className="card-dark-neon-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-label-yellow text-sm font-bold">TEMAS DISPONÍVEIS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme.name}
                  variant={theme.isActive ? 'default' : 'outline'}
                  className={`h-auto py-3 flex-col items-start ${theme.isActive ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => applyTheme(theme.name)}
                  disabled={isLoading || theme.isActive}
                >
                  <span className="font-bold text-kiosk-text">{theme.name}</span>
                  {theme.author && (
                    <span className="text-xs text-kiosk-text/90">por {theme.author}</span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extensions */}
      {isInstalled && extensions.length > 0 && (
        <Card className="card-dark-neon-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-label-yellow text-sm font-bold">EXTENSÕES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extensions.map((ext) => (
                <div key={ext.name} className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/70 border border-cyan-500/20">
                  <div>
                    <p className="font-bold text-kiosk-text">{ext.name}</p>
                    {ext.description && (
                      <p className="text-xs text-kiosk-text/90">{ext.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={ext.enabled}
                    onCheckedChange={(checked) => toggleExtension(ext.name, checked)}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
