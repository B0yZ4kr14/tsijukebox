import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Check, Sun, Moon, Eye, Zap, Sparkles } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { useSettings, ThemeColor } from '@/contexts/SettingsContext';
import { builtInPresets, applyCustomColors, type ThemePreset } from '@/hooks';
import { toast } from 'sonner';

export default function ThemePreview() {
  const navigate = useNavigate();
  const { theme, setTheme } = useSettings();
  const [previewPreset, setPreviewPreset] = useState<ThemePreset | null>(null);

  // Separate solid and gradient themes
  const solidThemes = useMemo(() => builtInPresets.filter(t => !t.colors.gradientEnabled), []);
  const gradientThemes = useMemo(() => builtInPresets.filter(t => t.colors.gradientEnabled), []);

  const applyTheme = (preset: ThemePreset) => {
    document.documentElement.classList.add('theme-transitioning');
    
    // Apply colors
    applyCustomColors(preset.colors);
    
    // Also set base theme
    if (preset.id === 'blue' || preset.id === 'green' || preset.id === 'purple') {
      setTheme(preset.id as ThemeColor);
    }
    
    setPreviewPreset(preset);
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 600);
    
    toast.success(`Tema "${preset.name}" aplicado!`);
  };

  // Apply preview on mount
  useEffect(() => {
    const initialPreset = builtInPresets.find(p => p.id === theme) || builtInPresets[0];
    setPreviewPreset(initialPreset);
  }, []);

  // Apply preview colors when preset changes
  useEffect(() => {
    if (previewPreset) {
      applyCustomColors(previewPreset.colors);
    }
    return () => {
      // Restore original theme on unmount
      const originalPreset = builtInPresets.find(p => p.id === theme);
      if (originalPreset) {
        applyCustomColors(originalPreset.colors);
      }
    };
  }, [previewPreset]);

  const currentPreset = previewPreset || builtInPresets[0];

  // Generate gradient CSS for preview
  const getGradientStyle = (preset: ThemePreset) => {
    if (!preset.colors.gradientEnabled) return {};
    return {
      background: `linear-gradient(${preset.colors.gradientAngle}deg, hsl(${preset.colors.gradientStart}), hsl(${preset.colors.gradientEnd}))`
    };
  };

  // Get primary color for solid theme preview
  const getPrimaryColor = (preset: ThemePreset) => {
    return `hsl(${preset.colors.primary})`;
  };

  return (
    <KioskLayout>
      <motion.div
        className="min-h-screen bg-kiosk-background p-4 md:p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LogoBrand size="md" variant="metal" animate />
        </motion.div>

        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80 button-3d"
            >
              <ArrowLeft className="w-6 h-6 text-kiosk-text" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gold-neon">Preview de Temas</h1>
            <p className="text-kiosk-text/85 text-sm">
              {builtInPresets.length} presets disponíveis • {solidThemes.length} sólidos + {gradientThemes.length} gradientes
            </p>
          </div>
        </motion.header>

        <div className="max-w-6xl mx-auto space-y-8 pb-8">
          {/* Logo Variants Comparison Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            <h2 className="text-label-yellow font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 icon-neon-blue" />
              Variantes da Logo
            </h2>
            
            {/* Main Comparison: Mirror vs Mirror-Dark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* MIRROR - Fundo escuro (uso padrão) */}
              <Card className="overflow-hidden card-neon-border">
                <div className="bg-[hsl(220_25%_8%)] p-8 flex flex-col items-center justify-center min-h-[180px]">
                  <LogoBrand size="lg" variant="mirror" animate />
                  <p className="mt-4 text-cyan-400/80 text-sm">Fundo Escuro (Padrão)</p>
                </div>
                <div className="bg-kiosk-surface p-3 text-center">
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                    variant="mirror"
                  </Badge>
                </div>
              </Card>
              
              {/* MIRROR-DARK - Fundo claro (alto contraste) */}
              <Card className="overflow-hidden card-neon-border">
                <div className="bg-[hsl(220_20%_85%)] p-8 flex flex-col items-center justify-center min-h-[180px]">
                  <LogoBrand size="lg" variant="mirror-dark" animate />
                  <p className="mt-4 text-gray-700 text-sm">Fundo Claro (Alto Contraste)</p>
                </div>
                <div className="bg-kiosk-surface p-3 text-center">
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                    variant="mirror-dark"
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Extended Contrast Testing Grid */}
            <h3 className="text-kiosk-text/80 text-sm font-medium mb-3">Teste de Contraste (mirror-dark)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Fundo branco puro */}
              <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
                <LogoBrand size="md" variant="mirror-dark" animate />
                <p className="mt-2 text-gray-600 text-xs">Branco #FFFFFF</p>
              </div>
              
              {/* Fundo cinza claro */}
              <div className="bg-gray-200 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
                <LogoBrand size="md" variant="mirror-dark" animate />
                <p className="mt-2 text-gray-600 text-xs">Cinza Claro</p>
              </div>
              
              {/* Fundo azul claro */}
              <div className="bg-sky-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
                <LogoBrand size="md" variant="mirror-dark" animate />
                <p className="mt-2 text-gray-600 text-xs">Azul Claro</p>
              </div>
              
              {/* Fundo amarelo claro */}
              <div className="bg-amber-50 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
                <LogoBrand size="md" variant="mirror-dark" animate />
                <p className="mt-2 text-gray-600 text-xs">Amarelo Claro</p>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <Card className="overflow-hidden card-admin-extreme-3d">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold-neon text-base">
                  Comparação Direta: Mirror vs Mirror-Dark
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2">
                  {/* Coluna Mirror */}
                  <div className="space-y-0">
                    <div className="bg-[hsl(220_25%_8%)] p-4 flex justify-center border-r border-border">
                      <LogoBrand size="sm" variant="mirror" animate />
                    </div>
                    <div className="bg-white p-4 flex justify-center border-r border-border">
                      <LogoBrand size="sm" variant="mirror" animate />
                    </div>
                  </div>
                  
                  {/* Coluna Mirror-Dark */}
                  <div className="space-y-0">
                    <div className="bg-[hsl(220_25%_8%)] p-4 flex justify-center">
                      <LogoBrand size="sm" variant="mirror-dark" animate />
                    </div>
                    <div className="bg-white p-4 flex justify-center">
                      <LogoBrand size="sm" variant="mirror-dark" animate />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 text-center border-t border-border bg-kiosk-surface/50">
                  <div className="p-2 text-xs text-cyan-400/80 border-r border-border">mirror</div>
                  <div className="p-2 text-xs text-amber-400/80">mirror-dark</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Solid Themes Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-label-yellow font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 icon-neon-blue" />
              Temas Sólidos ({solidThemes.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {solidThemes.map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => setPreviewPreset(preset)}
                  className={`
                    relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl
                    transition-all duration-300 ripple-effect
                    ${previewPreset?.id === preset.id ? 'card-option-selected-3d' : 'card-option-dark-3d'}
                  `}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="w-14 h-14 rounded-full shadow-2xl"
                    style={{
                      background: getPrimaryColor(preset),
                      boxShadow: previewPreset?.id === preset.id 
                        ? `0 0 40px ${getPrimaryColor(preset)}, 0 0 80px ${getPrimaryColor(preset)}50`
                        : `0 0 20px ${getPrimaryColor(preset)}40`
                    }}
                  />
                  <div className="text-center">
                    <p className={`font-semibold text-sm ${previewPreset?.id === preset.id ? 'text-label-yellow' : 'text-kiosk-text'}`}>
                      {preset.name}
                    </p>
                  </div>
                  {previewPreset?.id === preset.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Gradient Themes Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-label-yellow font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 icon-neon-blue" />
              Temas com Gradiente ({gradientThemes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gradientThemes.map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => setPreviewPreset(preset)}
                  className={`
                    relative flex flex-col items-center gap-3 p-4 rounded-2xl
                    transition-all duration-300 ripple-effect
                    ${previewPreset?.id === preset.id ? 'card-option-selected-3d' : 'card-option-dark-3d'}
                  `}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient Preview */}
                  <div 
                    className="w-full h-20 rounded-lg relative overflow-hidden"
                    style={getGradientStyle(preset)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-black/40 text-white border-none">
                        {preset.colors.gradientAngle}°
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Color Pills */}
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded-full shadow-lg"
                      style={{ background: `hsl(${preset.colors.gradientStart})` }}
                      title="Cor inicial"
                    />
                    <span className="text-kiosk-text/85 text-xs">→</span>
                    <div 
                      className="w-6 h-6 rounded-full shadow-lg"
                      style={{ background: `hsl(${preset.colors.gradientEnd})` }}
                      title="Cor final"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className={`font-semibold ${previewPreset?.id === preset.id ? 'text-label-yellow' : 'text-kiosk-text'}`}>
                      {preset.name}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs border-primary/50 text-primary">
                      GRADIENT
                    </Badge>
                  </div>
                  
                  {previewPreset?.id === preset.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Current Theme Info */}
          {currentPreset && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gold-neon text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5 icon-neon-blue" />
                      Pré-visualizando: {currentPreset.name}
                    </span>
                    {currentPreset.colors.gradientEnabled && (
                      <Badge className="bg-primary/20 text-primary border-primary/50">
                        GRADIENT • {currentPreset.colors.gradientAngle}°
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-3">
                    <div className="text-center">
                      <div 
                        className="w-full h-10 rounded-lg mb-1 shadow-lg"
                        style={{ background: `hsl(${currentPreset.colors.primary})` }}
                      />
                      <span className="text-xs text-kiosk-text/80">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-10 rounded-lg mb-1 shadow-lg"
                        style={{ background: `hsl(${currentPreset.colors.primaryGlow})` }}
                      />
                      <span className="text-xs text-kiosk-text/80">Glow</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-10 rounded-lg mb-1 shadow-lg"
                        style={{ background: `hsl(${currentPreset.colors.accent})` }}
                      />
                      <span className="text-xs text-kiosk-text/80">Accent</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-10 rounded-lg mb-1 shadow-lg border border-white/10"
                        style={{ background: `hsl(${currentPreset.colors.background})` }}
                      />
                      <span className="text-xs text-kiosk-text/80">Background</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-10 rounded-lg mb-1 shadow-lg border border-white/10"
                        style={{ background: `hsl(${currentPreset.colors.surface})` }}
                      />
                      <span className="text-xs text-kiosk-text/85">Surface</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-10 rounded-lg mb-1 shadow-lg border border-white/10"
                        style={{ background: `hsl(${currentPreset.colors.text})` }}
                      />
                      <span className="text-xs text-kiosk-text/85">Text</span>
                    </div>
                  </div>
                  
                  {currentPreset.colors.gradientEnabled && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-label-yellow mb-2">Preview do Gradiente</p>
                      <div 
                        className="w-full h-16 rounded-lg"
                        style={getGradientStyle(currentPreset)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Component Showcase */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="card-admin-extreme-3d bg-kiosk-surface/90">
              <CardHeader>
                <CardTitle className="text-gold-neon flex items-center gap-2">
                  <Palette className="w-5 h-5 icon-neon-blue" />
                  Demonstração de Componentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Buttons Section */}
                <div className="space-y-4">
                  <h3 className="text-label-yellow font-medium">Botões</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="button-primary-glow-3d ripple-effect">
                      Botão Primário
                    </Button>
                    <Button variant="outline" className="button-outline-neon ripple-effect">
                      Botão Outline
                    </Button>
                    <Button variant="outline" className="button-action-neon ripple-effect">
                      Botão Ação
                    </Button>
                    <Button variant="outline" className="button-destructive-neon ripple-effect">
                      Botão Destrutivo
                    </Button>
                  </div>
                </div>

                {/* Cards Section */}
                <div className="space-y-4">
                  <h3 className="text-label-yellow font-medium">Cards</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="card-option-dark-3d rounded-lg p-4">
                      <p className="text-kiosk-text font-medium">Card Normal</p>
                      <p className="text-xs text-kiosk-text/85 mt-1">Estado padrão</p>
                    </div>
                    <div className="card-option-selected-3d rounded-lg p-4">
                      <p className="text-kiosk-text font-medium">Card Selecionado</p>
                      <p className="text-xs text-kiosk-text/85 mt-1">Estado ativo</p>
                    </div>
                    <div className="card-neon-border rounded-lg p-4 bg-kiosk-surface">
                      <p className="text-kiosk-text font-medium">Card Neon</p>
                      <p className="text-xs text-kiosk-text/85 mt-1">Borda brilhante</p>
                    </div>
                  </div>
                </div>

                {/* Form Elements */}
                <div className="space-y-4">
                  <h3 className="text-label-yellow font-medium">Formulários</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-settings-label text-sm">Input de Texto</label>
                      <Input 
                        placeholder="Digite algo..." 
                        className="input-3d bg-kiosk-bg"
                      />
                    </div>
                    <div className="card-option-dark-3d rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-kiosk-text">Switch Neon</span>
                        <Switch variant="neon" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges & Text */}
                <div className="space-y-4">
                  <h3 className="text-label-yellow font-medium">Badges e Textos</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Badge variant="default">Badge Padrão</Badge>
                    <Badge variant="secondary">Badge Secundário</Badge>
                    <Badge variant="outline" className="border-primary text-primary">Badge Outline</Badge>
                    <span className="text-gold-neon font-medium">Texto Dourado</span>
                    <span className="text-label-yellow">Label Amarelo</span>
                    <span className="text-label-orange">Label Laranja</span>
                  </div>
                </div>

                {/* Icons */}
                <div className="space-y-4">
                  <h3 className="text-label-yellow font-medium">Ícones com Glow</h3>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <Sun className="w-8 h-8 icon-neon-blue" />
                      <span className="text-xs text-kiosk-text/85">Neon Blue</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Moon className="w-8 h-8 icon-neon-blue-hover" />
                      <span className="text-xs text-kiosk-text/85">Hover Effect</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Zap className="w-8 h-8 text-label-yellow" style={{ filter: 'drop-shadow(0 0 8px hsl(45 100% 50%))' }} />
                      <span className="text-xs text-kiosk-text/85">Yellow Glow</span>
                    </div>
                  </div>
                </div>

                {/* Progress/Slider */}
                <div className="space-y-4">
                  <h3 className="text-label-yellow font-medium">Controles Deslizantes</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-settings-label text-sm">Slider de Volume</label>
                      <Slider defaultValue={[70]} max={100} step={1} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Apply Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Button
              onClick={() => currentPreset && applyTheme(currentPreset)}
              className="flex-1 button-primary-glow-3d ripple-effect h-14 text-lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Aplicar Tema {currentPreset?.name}
            </Button>
            <Link to="/settings" className="flex-shrink-0">
              <Button variant="outline" className="button-outline-neon h-14 px-8">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </KioskLayout>
  );
}
