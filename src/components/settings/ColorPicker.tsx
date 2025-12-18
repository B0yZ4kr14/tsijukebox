import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { hslToHex, hexToHsl } from '@/hooks/useThemeCustomizer';
import { motion } from 'framer-motion';

interface ColorPickerProps {
  label: string;
  value: string; // HSL format: "195 100% 50%"
  onChange: (hsl: string) => void;
  presets?: string[]; // Array of HEX colors for quick selection
}

function parseHsl(hsl: string): { h: number; s: number; l: number } {
  const parts = hsl.split(' ').map(p => parseFloat(p.replace('%', '')));
  return {
    h: parts[0] || 195,
    s: parts[1] || 100,
    l: parts[2] || 50,
  };
}

export function ColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(() => hslToHex(value));
  const [hslValues, setHslValues] = useState(() => parseHsl(value));

  useEffect(() => {
    setHexValue(hslToHex(value));
    setHslValues(parseHsl(value));
  }, [value]);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const hsl = hexToHsl(hex);
      onChange(hsl);
    }
  };

  const handleSliderChange = (key: 'h' | 's' | 'l', val: number) => {
    const newValues = { ...hslValues, [key]: val };
    setHslValues(newValues);
    const hslString = `${newValues.h} ${newValues.s}% ${newValues.l}%`;
    onChange(hslString);
  };

  const handlePresetClick = (preset: string) => {
    setHexValue(preset);
    const hsl = hexToHsl(preset);
    onChange(hsl);
  };

  const currentHex = hslToHex(value);

  return (
    <div className="space-y-3">
      <Label className="text-settings-label text-sm font-medium">{label}</Label>
      
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <motion.div
          className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg"
          style={{ backgroundColor: currentHex }}
          animate={{
            boxShadow: `0 0 20px ${currentHex}60, 0 0 40px ${currentHex}30`,
          }}
        />
        
        {/* HEX input */}
        <div className="flex-1">
          <Input
            type="text"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#00BFFF"
            className="input-3d font-mono uppercase"
            maxLength={7}
          />
        </div>

        {/* Native color picker */}
        <div className="relative">
          <input
            type="color"
            value={currentHex}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/20"
            style={{ background: 'transparent' }}
          />
        </div>
      </div>

      {/* HSL Sliders */}
      <div className="space-y-2 pt-2">
        {/* Hue */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-kiosk-text/80 w-8">H</span>
          <Slider
            value={[hslValues.h]}
            min={0}
            max={360}
            step={1}
            onValueChange={([v]) => handleSliderChange('h', v)}
            className="flex-1"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
          />
          <span className="text-xs text-kiosk-text/80 w-10 text-right">{hslValues.h}°</span>
        </div>

        {/* Saturation */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-kiosk-text/80 w-8">S</span>
          <Slider
            value={[hslValues.s]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => handleSliderChange('s', v)}
            className="flex-1"
          />
          <span className="text-xs text-kiosk-text/80 w-10 text-right">{hslValues.s}%</span>
        </div>

        {/* Lightness */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-kiosk-text/80 w-8">L</span>
          <Slider
            value={[hslValues.l]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => handleSliderChange('l', v)}
            className="flex-1"
          />
          <span className="text-xs text-kiosk-text/80 w-10 text-right">{hslValues.l}%</span>
        </div>
      </div>

      {/* Quick presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {presets.map((preset) => (
            <motion.button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`
                w-7 h-7 rounded-full border-2 transition-all
                ${currentHex.toLowerCase() === preset.toLowerCase() 
                  ? 'border-white scale-110' 
                  : 'border-white/20 hover:border-white/50'}
              `}
              style={{ backgroundColor: preset }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
