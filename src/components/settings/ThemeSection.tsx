import { Palette, Check } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { useSettings, ThemeColor } from '@/contexts/SettingsContext';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';

const themes: { id: ThemeColor; name: string; color: string; gradient: string }[] = [
  { 
    id: 'blue', 
    name: 'Neon Azul',
    color: 'hsl(195 100% 50%)',
    gradient: 'from-cyan-500 to-blue-600'
  },
  { 
    id: 'green', 
    name: 'Neon Verde',
    color: 'hsl(145 100% 45%)',
    gradient: 'from-emerald-500 to-green-600'
  },
  { 
    id: 'purple', 
    name: 'Neon Roxo',
    color: 'hsl(280 100% 60%)',
    gradient: 'from-purple-500 to-violet-600'
  },
];

export function ThemeSection() {
  const { theme, setTheme } = useSettings();
  const { t } = useTranslation();

  return (
    <SettingsSection
      icon={<Palette className="w-5 h-5 icon-neon-blue" />}
      title="Tema de Cores"
      description="Escolha a cor neon do sistema"
      delay={0.15}
    >
      <div className="grid grid-cols-3 gap-3">
        {themes.map((themeOption) => (
          <motion.button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`
              relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl
              transition-all duration-300 ripple-effect
              ${theme === themeOption.id ? 'card-option-selected-3d' : 'card-option-dark-3d'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Color preview circle */}
            <div 
              className={`
                w-10 h-10 rounded-full bg-gradient-to-br ${themeOption.gradient}
                shadow-lg transition-all duration-300
              `}
              style={{
                boxShadow: theme === themeOption.id 
                  ? `0 0 30px ${themeOption.color}, 0 0 60px ${themeOption.color}50`
                  : `0 0 15px ${themeOption.color}40`
              }}
            />
            
            {/* Label */}
            <span className={`text-xs font-medium ${theme === themeOption.id ? 'text-label-yellow' : 'text-kiosk-text/80'}`}>
              {themeOption.name}
            </span>

            {/* Selected indicator */}
            {theme === themeOption.id && (
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
    </SettingsSection>
  );
}