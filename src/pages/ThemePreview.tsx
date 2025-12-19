import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sun, Moon, Sparkles, Eye, Palette, Columns, LayoutGrid } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { builtInPresets, applyCustomColors, type ThemePreset } from '@/hooks';
import { toast } from 'sonner';

export default function ThemePreview() {
  const [previewPreset, setPreviewPreset] = useState<ThemePreset | null>(null);
  const [splitMode, setSplitMode] = useState(false);

  // Apply preview on mount - default to dark-neon
  useEffect(() => {
    const initialPreset = builtInPresets.find(p => p.id === 'dark-neon') || builtInPresets[0];
    setPreviewPreset(initialPreset);
    applyCustomColors(initialPreset.colors);
  }, []);

  // Apply preview colors when preset changes
  useEffect(() => {
    if (previewPreset && !splitMode) {
      applyCustomColors(previewPreset.colors);
    }
    return () => {
      // Restore dark-neon on unmount
      const darkPreset = builtInPresets.find(p => p.id === 'dark-neon');
      if (darkPreset) {
        applyCustomColors(darkPreset.colors);
      }
    };
  }, [previewPreset, splitMode]);

  const applyTheme = (preset: ThemePreset) => {
    document.documentElement.classList.add('theme-transitioning');
    applyCustomColors(preset.colors);
    setPreviewPreset(preset);
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 600);
    
    toast.success(`Tema "${preset.name}" aplicado!`);
  };

  const currentPreset = previewPreset || builtInPresets[0];
  const isDarkTheme = currentPreset.id === 'dark-neon';
  const isLightTheme = currentPreset.id === 'light-neon-silver';
  
  const darkPreset = builtInPresets.find(p => p.id === 'dark-neon')!;
  const lightPreset = builtInPresets.find(p => p.id === 'light-neon-silver')!;

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
          <LogoBrand size="md" variant={isDarkTheme ? "mirror" : "mirror-dark"} animate />
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gold-neon">Preview de Temas</h1>
            <p className="text-kiosk-text/85 text-sm">
              2 variantes disponíveis • Dark Neon & Light Neon Silver
            </p>
          </div>
          
          {/* Split Mode Toggle */}
          <Button
            variant={splitMode ? "default" : "outline"}
            size="sm"
            onClick={() => setSplitMode(!splitMode)}
            className="gap-2"
          >
            {splitMode ? <LayoutGrid className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            {splitMode ? 'Normal' : 'Comparar'}
          </Button>
        </motion.header>

        <div className="max-w-6xl mx-auto space-y-8 pb-8">
          {/* Split Mode - Side by Side Comparison */}
          {splitMode ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Dark Theme Panel */}
              <div 
                className="rounded-2xl overflow-hidden border border-cyan-500/30"
                style={{ background: `hsl(${darkPreset.colors.background})` }}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: `hsl(${darkPreset.colors.text})` }}
                    >
                      {darkPreset.name}
                    </h3>
                    <Moon className="w-6 h-6" style={{ color: `hsl(${darkPreset.colors.primary})` }} />
                  </div>
                  
                  <div className="flex justify-center py-4">
                    <LogoBrand size="lg" variant="mirror" animate />
                  </div>
                  
                  {/* Sample UI */}
                  <div 
                    className="p-4 rounded-xl space-y-3"
                    style={{ background: `hsl(${darkPreset.colors.surface})` }}
                  >
                    <div 
                      className="w-full py-2.5 rounded-lg text-center font-medium text-sm"
                      style={{ 
                        background: `hsl(${darkPreset.colors.primary})`,
                        color: 'black',
                        boxShadow: `0 0 15px hsl(${darkPreset.colors.primaryGlow} / 0.5)`
                      }}
                    >
                      Botão Primário
                    </div>
                    
                    <div 
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: `hsl(${darkPreset.colors.background})` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ background: `hsl(${darkPreset.colors.accent})` }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: `hsl(${darkPreset.colors.text})` }}>
                          Item de Lista
                        </p>
                        <p className="text-xs opacity-70" style={{ color: `hsl(${darkPreset.colors.text})` }}>
                          Descrição secundária
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Swatches */}
                  <div className="flex gap-2 justify-center pt-2">
                    {['primary', 'primaryGlow', 'accent', 'surface'].map(key => (
                      <div 
                        key={key}
                        className="w-8 h-8 rounded-full shadow-lg border border-white/10"
                        style={{ background: `hsl(${darkPreset.colors[key as keyof typeof darkPreset.colors]})` }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => applyTheme(darkPreset)}
                  className="w-full py-3 text-center font-medium text-sm transition-colors"
                  style={{ 
                    background: `hsl(${darkPreset.colors.surface})`,
                    color: `hsl(${darkPreset.colors.primary})`
                  }}
                >
                  {currentPreset.id === 'dark-neon' ? '✓ Ativo' : 'Aplicar Dark Neon'}
                </button>
              </div>

              {/* Light Theme Panel */}
              <div 
                className="rounded-2xl overflow-hidden border border-amber-500/30"
                style={{ background: `hsl(${lightPreset.colors.background})` }}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: `hsl(${lightPreset.colors.text})` }}
                    >
                      {lightPreset.name}
                    </h3>
                    <Sun className="w-6 h-6" style={{ color: `hsl(${lightPreset.colors.accent})` }} />
                  </div>
                  
                  <div className="flex justify-center py-4">
                    <LogoBrand size="lg" variant="mirror-dark" animate />
                  </div>
                  
                  {/* Sample UI */}
                  <div 
                    className="p-4 rounded-xl space-y-3"
                    style={{ background: `hsl(${lightPreset.colors.surface})` }}
                  >
                    <div 
                      className="w-full py-2.5 rounded-lg text-center font-medium text-sm"
                      style={{ 
                        background: `hsl(${lightPreset.colors.primary})`,
                        color: 'white',
                        boxShadow: `0 0 15px hsl(${lightPreset.colors.primaryGlow} / 0.5)`
                      }}
                    >
                      Botão Primário
                    </div>
                    
                    <div 
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: `hsl(${lightPreset.colors.background})` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ background: `hsl(${lightPreset.colors.accent})` }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: `hsl(${lightPreset.colors.text})` }}>
                          Item de Lista
                        </p>
                        <p className="text-xs opacity-70" style={{ color: `hsl(${lightPreset.colors.text})` }}>
                          Descrição secundária
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Swatches */}
                  <div className="flex gap-2 justify-center pt-2">
                    {['primary', 'primaryGlow', 'accent', 'surface'].map(key => (
                      <div 
                        key={key}
                        className="w-8 h-8 rounded-full shadow-lg border border-black/10"
                        style={{ background: `hsl(${lightPreset.colors[key as keyof typeof lightPreset.colors]})` }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => applyTheme(lightPreset)}
                  className="w-full py-3 text-center font-medium text-sm transition-colors"
                  style={{ 
                    background: `hsl(${lightPreset.colors.surface})`,
                    color: `hsl(${lightPreset.colors.primary})`
                  }}
                >
                  {currentPreset.id === 'light-neon-silver' ? '✓ Ativo' : 'Aplicar Light Neon'}
                </button>
              </div>
            </motion.div>
          ) : (
          /* Normal Mode - Theme Selector */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-label-yellow font-semibold mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 icon-neon-blue" />
              Escolha seu Tema
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {builtInPresets.map((preset) => {
                const isActive = previewPreset?.id === preset.id;
                const isDark = preset.id === 'dark-neon';
                
                return (
                  <motion.button
                    key={preset.id}
                    onClick={() => applyTheme(preset)}
                    className={`
                      relative flex flex-col rounded-2xl overflow-hidden
                      transition-all duration-300
                      ${isActive ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-[1.02]'}
                    `}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Theme Preview Card */}
                    <div 
                      className="relative p-8 min-h-[280px]"
                      style={{ 
                        background: `hsl(${preset.colors.background})`,
                      }}
                    >
                      {/* Theme Icon */}
                      <div className="absolute top-4 right-4">
                        {isDark ? (
                          <Moon className="w-8 h-8" style={{ color: `hsl(${preset.colors.primary})` }} />
                        ) : (
                          <Sun className="w-8 h-8" style={{ color: `hsl(${preset.colors.accent})` }} />
                        )}
                      </div>

                      {/* Logo Preview */}
                      <div className="flex justify-center mb-6">
                        <LogoBrand 
                          size="md" 
                          variant={isDark ? "mirror" : "mirror-dark"} 
                          animate={isActive}
                        />
                      </div>

                      {/* Sample UI Elements */}
                      <div className="space-y-3">
                        {/* Sample Button */}
                        <div 
                          className="w-full py-3 rounded-lg text-center font-semibold text-sm"
                          style={{ 
                            background: `hsl(${preset.colors.primary})`,
                            color: isDark ? 'black' : 'white',
                            boxShadow: `0 0 20px hsl(${preset.colors.primaryGlow} / 0.5)`
                          }}
                        >
                          Botão Primário
                        </div>

                        {/* Sample Surface */}
                        <div 
                          className="w-full p-4 rounded-lg flex items-center gap-3"
                          style={{ 
                            background: `hsl(${preset.colors.surface})`,
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ background: `hsl(${preset.colors.accent})` }}
                          />
                          <div className="flex-1 text-left">
                            <p 
                              className="font-medium text-sm"
                              style={{ color: `hsl(${preset.colors.text})` }}
                            >
                              Elemento de Surface
                            </p>
                            <p 
                              className="text-xs opacity-70"
                              style={{ color: `hsl(${preset.colors.text})` }}
                            >
                              Descrição do item
                            </p>
                          </div>
                        </div>

                        {/* Color Palette Preview */}
                        <div className="flex gap-2 justify-center pt-2">
                          <div 
                            className="w-8 h-8 rounded-full shadow-lg"
                            style={{ background: `hsl(${preset.colors.primary})` }}
                            title="Primary"
                          />
                          <div 
                            className="w-8 h-8 rounded-full shadow-lg"
                            style={{ background: `hsl(${preset.colors.primaryGlow})` }}
                            title="Glow"
                          />
                          <div 
                            className="w-8 h-8 rounded-full shadow-lg"
                            style={{ background: `hsl(${preset.colors.accent})` }}
                            title="Accent"
                          />
                          <div 
                            className="w-8 h-8 rounded-full shadow-lg border border-white/20"
                            style={{ background: `hsl(${preset.colors.surface})` }}
                            title="Surface"
                          />
                        </div>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-5 h-5 text-black" />
                        </motion.div>
                      )}
                    </div>

                    {/* Theme Info Footer */}
                    <div 
                      className="p-4 text-center"
                      style={{ background: `hsl(${preset.colors.surface})` }}
                    >
                      <h3 
                        className="text-lg font-bold mb-1"
                        style={{ color: `hsl(${preset.colors.text})` }}
                      >
                        {preset.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: `hsl(${preset.colors.primary} / 0.5)`,
                          color: `hsl(${preset.colors.primary})`
                        }}
                      >
                        {isDark ? 'DARK MODE' : 'LIGHT MODE'}
                      </Badge>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
          )}

          {/* Logo Variants Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-label-yellow font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 icon-neon-blue" />
              Variantes da Logo por Tema
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dark Theme Logo */}
              <Card className="overflow-hidden card-neon-border">
                <div className="bg-[hsl(240_10%_10%)] p-8 flex flex-col items-center justify-center min-h-[180px]">
                  <LogoBrand size="lg" variant="mirror" animate />
                  <p className="mt-4 text-cyan-400/80 text-sm">Dark Neon (Fundo Escuro)</p>
                </div>
                <div className="bg-kiosk-surface p-3 text-center">
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                    variant="mirror"
                  </Badge>
                </div>
              </Card>
              
              {/* Light Theme Logo */}
              <Card className="overflow-hidden card-neon-border">
                <div className="bg-[hsl(220_15%_92%)] p-8 flex flex-col items-center justify-center min-h-[180px]">
                  <LogoBrand size="lg" variant="mirror-dark" animate />
                  <p className="mt-4 text-gray-700 text-sm">Light Neon Silver (Fundo Claro)</p>
                </div>
                <div className="bg-kiosk-surface p-3 text-center">
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                    variant="mirror-dark"
                  </Badge>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Current Theme Details */}
          {currentPreset && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-neon-border bg-kiosk-surface/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gold-neon text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 icon-neon-blue" />
                    Tema Ativo: {currentPreset.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { key: 'primary', label: 'Primary' },
                      { key: 'primaryGlow', label: 'Glow' },
                      { key: 'accent', label: 'Accent' },
                      { key: 'background', label: 'Background' },
                      { key: 'surface', label: 'Surface' },
                      { key: 'text', label: 'Text' },
                    ].map(({ key, label }) => (
                      <div key={key} className="text-center">
                        <div 
                          className="w-full h-10 rounded-lg mb-1 shadow-lg border border-white/10"
                          style={{ background: `hsl(${currentPreset.colors[key as keyof typeof currentPreset.colors]})` }}
                        />
                        <span className="text-xs text-kiosk-text/80">{label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-kiosk-bg/50 rounded-lg">
                    <p className="text-xs text-kiosk-text/70 text-center">
                      {isDarkTheme ? (
                        <>Tema escuro com ícones neon cyan e dourado. Ideal para ambientes com pouca luz.</>
                      ) : (
                        <>Tema claro prateado com ícones neon vibrantes. Ideal para ambientes bem iluminados.</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </KioskLayout>
  );
}
