import { Palette, Download, Upload, Eye, Sliders } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { useSettings, ThemeColor } from '@/contexts/SettingsContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ThemeCustomizer } from './ThemeCustomizer';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeCustomizer, CustomThemeColors } from '@/hooks/useThemeCustomizer';

interface ExportedSettings {
  version: string;
  exportDate: string;
  theme: ThemeColor;
  language: string;
  customColors?: CustomThemeColors;
  customPresets?: Array<{
    id: string;
    name: string;
    colors: CustomThemeColors;
  }>;
  accessibility?: {
    highContrast: boolean;
    fontSize: number;
    reducedMotion: boolean;
  };
  weather?: {
    city: string;
    isEnabled: boolean;
  };
}

export function ThemeSection() {
  const { theme, setTheme, language, weather } = useSettings();
  const { t } = useTranslation();
  const { activeColors, customPresets, isCustomMode } = useThemeCustomizer();
  const [activeTab, setActiveTab] = useState<string>('customize');

  const exportSettings = () => {
    try {
      const accessibilityData = localStorage.getItem('tsi_jukebox_accessibility');
      const accessibility = accessibilityData ? JSON.parse(accessibilityData) : null;

      const exportData: ExportedSettings = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        theme,
        language,
        ...(isCustomMode && { customColors: activeColors }),
        ...(customPresets.length > 0 && { 
          customPresets: customPresets.map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
          }))
        }),
        ...(accessibility && { accessibility }),
        weather: {
          city: weather.city,
          isEnabled: weather.isEnabled,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tsi-jukebox-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Configurações exportadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar configurações');
    }
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data: ExportedSettings = JSON.parse(text);

        if (!data.version || !data.theme) {
          throw new Error('Arquivo de configuração inválido');
        }

        // Apply theme
        document.documentElement.classList.add('theme-transitioning');
        setTheme(data.theme);
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
        }, 600);

        // Import custom presets if present
        if (data.customPresets && data.customPresets.length > 0) {
          const existingPresets = JSON.parse(localStorage.getItem('tsi_jukebox_custom_themes') || '[]');
          const newPresets = data.customPresets.filter(
            imported => !existingPresets.some((existing: any) => existing.id === imported.id)
          ).map(p => ({
            ...p,
            isBuiltIn: false,
            createdAt: new Date().toISOString(),
          }));
          
          if (newPresets.length > 0) {
            localStorage.setItem(
              'tsi_jukebox_custom_themes', 
              JSON.stringify([...existingPresets, ...newPresets])
            );
          }
        }

        // Apply accessibility settings if present
        if (data.accessibility) {
          localStorage.setItem('tsi_jukebox_accessibility', JSON.stringify(data.accessibility));
          document.documentElement.setAttribute('data-high-contrast', String(data.accessibility.highContrast));
          document.documentElement.setAttribute('data-reduced-motion', String(data.accessibility.reducedMotion));
          document.documentElement.style.fontSize = `${data.accessibility.fontSize}%`;
        }

        toast.success('Configurações importadas com sucesso! Recarregue a página para aplicar todas as mudanças.');
      } catch (error) {
        toast.error('Erro ao importar configurações. Verifique se o arquivo é válido.');
      }
    };

    input.click();
  };

  const instructions = {
    title: "🎨 O que são Temas de Cores?",
    steps: [
      "Os temas mudam a cor principal de todo o sistema do Jukebox.",
      "Escolha um tema predefinido ou crie suas próprias combinações de cores.",
      "Use os sliders HSL para ajuste fino de cada cor.",
      "Salve suas criações como presets para usar depois!",
      "Você pode exportar e importar configurações entre Jukeboxes."
    ],
    tips: [
      "💡 Clique em 'Personalizar' para criar seu tema único",
      "💡 Os presets salvos ficam disponíveis mesmo após recarregar",
      "💡 Use 'Exportar' para fazer backup das suas preferências"
    ]
  };

  return (
    <SettingsSection
      icon={<Palette className="w-5 h-5 icon-neon-blue" />}
      title="Tema de Cores"
      description="Personalize a aparência visual do sistema"
      instructions={instructions}
      delay={0.15}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-tour="theme-customizer">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-kiosk-surface/50" data-tour="theme-tools">
          <TabsTrigger 
            value="customize" 
            className="text-kiosk-text/90 hover:text-white data-[state=active]:bg-primary/20 data-[state=active]:text-white"
          >
            <Sliders className="w-4 h-4 mr-2" />
            Personalizar
          </TabsTrigger>
          <TabsTrigger 
            value="tools"
            className="text-kiosk-text/90 hover:text-white data-[state=active]:bg-primary/20 data-[state=active]:text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ferramentas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="space-y-4">
          <ThemeCustomizer />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          {/* Preview Link */}
          <Link to="/theme-preview">
            <Button
              variant="kiosk-outline"
              className="w-full ripple-effect"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Preview Completo dos Temas
            </Button>
          </Link>

          {/* Export/Import Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="kiosk-outline"
              onClick={exportSettings}
              className="ripple-effect"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="kiosk-outline"
              onClick={importSettings}
              className="ripple-effect"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </SettingsSection>
  );
}
