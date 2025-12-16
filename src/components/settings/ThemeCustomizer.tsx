import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Save, Trash2, Check, RotateCcw, Sparkles, Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from './ColorPicker';
import { 
  useThemeCustomizer, 
  CustomThemeColors, 
  ThemePreset,
  hslToHex,
  builtInPresets,
  defaultColors 
} from '@/hooks/useThemeCustomizer';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Color presets for quick selection
const colorPresets = {
  primary: ['#00BFFF', '#00FF7F', '#9B59B6', '#FF6B35', '#FF1493', '#FFD700'],
  accent: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'],
  background: ['#1A1A2E', '#0D1117', '#1E1E2E', '#2D2D44', '#111827', '#18181B'],
};

export function ThemeCustomizer() {
  const { theme, setTheme } = useSettings();
  const {
    allPresets,
    customPresets,
    activeColors,
    isCustomMode,
    setColors,
    savePreset,
    deletePreset,
    loadPreset,
    resetToDefault,
    updateColor,
  } = useThemeCustomizer();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingColors, setEditingColors] = useState<CustomThemeColors>(activeColors);

  // Sync editingColors with activeColors when it changes
  const handleColorChange = (key: keyof CustomThemeColors, value: string | number | boolean) => {
    const newColors = { ...editingColors, [key]: value };
    setEditingColors(newColors);
    setColors(newColors);
  };

  const handlePresetClick = (preset: ThemePreset) => {
    // If built-in preset, switch to that theme mode
    if (preset.isBuiltIn && ['blue', 'green', 'purple'].includes(preset.id)) {
      resetToDefault();
      setTheme(preset.id as 'blue' | 'green' | 'purple');
      setEditingColors(preset.colors);
    } else {
      loadPreset(preset);
      setEditingColors(preset.colors);
    }
    toast.success(`Tema "${preset.name}" aplicado!`);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Digite um nome para o preset');
      return;
    }
    
    savePreset(presetName.trim(), editingColors);
    toast.success(`Preset "${presetName}" salvo com sucesso!`);
    setPresetName('');
    setSaveDialogOpen(false);
  };

  const handleDeletePreset = (preset: ThemePreset) => {
    deletePreset(preset.id);
    toast.success(`Preset "${preset.name}" removido`);
  };

  const handleReset = () => {
    resetToDefault();
    setTheme('blue');
    setEditingColors(defaultColors);
    toast.success('Cores restauradas ao padrão');
  };

  return (
    <div className="space-y-6">
      {/* Presets Grid */}
      <div>
        <Label className="text-label-yellow text-sm font-semibold mb-3 block">
          Temas Predefinidos
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {builtInPresets.map((preset) => {
            const isSelected = !isCustomMode && theme === preset.id;
            return (
              <motion.button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl
                  transition-all duration-300 ripple-effect
                  ${isSelected ? 'card-option-selected-3d' : 'card-option-dark-3d'}
                `}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div 
                  className="w-8 h-8 rounded-full shadow-lg"
                  style={{
                    backgroundColor: hslToHex(preset.colors.primary),
                    boxShadow: isSelected 
                      ? `0 0 25px ${hslToHex(preset.colors.primary)}80`
                      : `0 0 12px ${hslToHex(preset.colors.primary)}40`,
                  }}
                />
                <span className={`text-xs font-medium ${isSelected ? 'text-label-yellow' : 'text-kiosk-text/80'}`}>
                  {preset.name.replace('Neon ', '')}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-black" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Presets */}
      {customPresets.length > 0 && (
        <div>
          <Label className="text-label-orange text-sm font-semibold mb-3 block">
            Meus Presets
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {customPresets.map((preset) => {
              const isSelected = isCustomMode && 
                JSON.stringify(activeColors) === JSON.stringify(preset.colors);
              return (
                <motion.div
                  key={preset.id}
                  className={`
                    relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl
                    transition-all duration-300 cursor-pointer group
                    ${isSelected ? 'card-option-selected-3d' : 'card-option-dark-3d'}
                  `}
                  onClick={() => handlePresetClick(preset)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div 
                    className="w-8 h-8 rounded-full shadow-lg"
                    style={{
                      backgroundColor: hslToHex(preset.colors.primary),
                      boxShadow: `0 0 15px ${hslToHex(preset.colors.primary)}50`,
                    }}
                  />
                  <span className="text-xs font-medium text-kiosk-text/80 text-center truncate w-full">
                    {preset.name}
                  </span>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/20 
                               hover:bg-red-500/40 flex items-center justify-center opacity-0 
                               group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Pickers */}
      <div className="space-y-4 p-4 rounded-xl card-option-dark-3d">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 icon-neon-blue" />
          <Label className="text-label-yellow text-sm font-semibold">
            Personalizar Cores
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPicker
            label="Cor Primária"
            value={editingColors.primary}
            onChange={(v) => handleColorChange('primary', v)}
            presets={colorPresets.primary}
          />
          
          <ColorPicker
            label="Glow Primário"
            value={editingColors.primaryGlow}
            onChange={(v) => handleColorChange('primaryGlow', v)}
            presets={colorPresets.primary}
          />
          
          <ColorPicker
            label="Cor de Destaque"
            value={editingColors.accent}
            onChange={(v) => handleColorChange('accent', v)}
            presets={colorPresets.accent}
          />
          
          <ColorPicker
            label="Cor de Fundo"
            value={editingColors.background}
            onChange={(v) => handleColorChange('background', v)}
            presets={colorPresets.background}
          />
          
          <ColorPicker
            label="Cor da Superfície"
            value={editingColors.surface}
            onChange={(v) => handleColorChange('surface', v)}
            presets={colorPresets.background}
          />
          
          <ColorPicker
            label="Cor do Texto"
            value={editingColors.text}
            onChange={(v) => handleColorChange('text', v)}
            presets={['#F5F5F5', '#E5E5E5', '#D4D4D4', '#A3A3A3', '#737373']}
          />
        </div>
      </div>

      {/* Gradient Section */}
      <div className="space-y-4 p-4 rounded-xl card-option-dark-3d">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 icon-neon-blue" />
            <Label className="text-label-yellow text-sm font-semibold">
              Fundo com Degradê
            </Label>
          </div>
          <Switch
            checked={editingColors.gradientEnabled}
            onCheckedChange={(checked) => handleColorChange('gradientEnabled', checked)}
          />
        </div>

        <AnimatePresence>
          {editingColors.gradientEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Cor Inicial"
                  value={editingColors.gradientStart}
                  onChange={(v) => handleColorChange('gradientStart', v)}
                  presets={colorPresets.background}
                />
                
                <ColorPicker
                  label="Cor Final"
                  value={editingColors.gradientEnd}
                  onChange={(v) => handleColorChange('gradientEnd', v)}
                  presets={colorPresets.background}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-settings-label">
                    Ângulo do Degradê
                  </Label>
                  <span className="text-label-orange text-sm font-mono">
                    {editingColors.gradientAngle}°
                  </span>
                </div>
                <Slider
                  value={[editingColors.gradientAngle]}
                  onValueChange={([v]) => handleColorChange('gradientAngle', v)}
                  min={0}
                  max={360}
                  step={5}
                />
              </div>
              
              {/* Gradient Preview */}
              <div className="space-y-2">
                <Label className="text-settings-label text-xs">Preview do Degradê</Label>
                <div 
                  className="h-20 rounded-xl border border-white/10"
                  style={{
                    background: `linear-gradient(${editingColors.gradientAngle}deg, hsl(${editingColors.gradientStart}), hsl(${editingColors.gradientEnd}))`
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl card-option-dark-3d">
        <Label className="text-label-yellow text-sm font-semibold mb-4 block">
          Preview em Tempo Real
        </Label>
        <div 
          className="p-4 rounded-xl space-y-3"
          style={{
            background: editingColors.gradientEnabled 
              ? `linear-gradient(${editingColors.gradientAngle}deg, hsl(${editingColors.gradientStart}), hsl(${editingColors.gradientEnd}))`
              : `hsl(${editingColors.background})`,
          }}
        >
          {/* Preview buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{
                backgroundColor: `hsl(${editingColors.primary})`,
                boxShadow: `0 0 20px hsl(${editingColors.primaryGlow} / 0.4)`,
              }}
            >
              Botão Primário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all border"
              style={{
                borderColor: `hsl(${editingColors.primary} / 0.5)`,
                color: `hsl(${editingColors.primaryGlow})`,
                backgroundColor: `hsl(${editingColors.surface})`,
              }}
            >
              Botão Outline
            </button>
          </div>
          
          {/* Preview card */}
          <div 
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: `hsl(${editingColors.surface})`,
              borderColor: `hsl(${editingColors.primary} / 0.3)`,
              boxShadow: `0 0 15px hsl(${editingColors.primary} / 0.15)`,
            }}
          >
            <p 
              className="text-sm font-medium"
              style={{ color: `hsl(${editingColors.text})` }}
            >
              Este é um exemplo de card
            </p>
            <p 
              className="text-xs opacity-70"
              style={{ color: `hsl(${editingColors.text})` }}
            >
              Com texto secundário
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button className="button-primary-glow-3d ripple-effect flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar como Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="card-admin-extreme-3d border-none">
            <DialogHeader>
              <DialogTitle className="text-gold-neon">Salvar Preset de Cores</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-settings-label">Nome do Preset</Label>
                <Input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Ex: Meu Tema Noturno"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSavePreset}
                  className="button-primary-glow-3d flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                  className="button-outline-neon"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={handleReset}
          className="button-outline-neon"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrão
        </Button>
      </div>
    </div>
  );
}
