/**
 * SectionIconsShowcase Component
 * 
 * Displays the 8 section icons with their colors and descriptions
 * Used in documentation and about pages
 * 
 * @author B0.y_Z4kr14
 * @version 1.0.0
 */

import { motion } from 'framer-motion';
import { Download, Settings, BookOpen, Code, Database, Shield, Activity, TestTube } from 'lucide-react';

interface SectionIcon {
  id: string;
  name: string;
  color: string;
  colorName: string;
  hex: string;
  icon: React.ReactNode;
  description: string;
  imagePath: string;
}

const sectionIcons: SectionIcon[] = [
  {
    id: 'installation',
    name: 'Instalação',
    color: 'text-accent-greenNeon',
    colorName: 'Verde Neon',
    hex: '#00ff88',
    icon: <Download className="w-8 h-8" />,
    description: 'Guias de instalação e setup do sistema',
    imagePath: '/docs/assets/icons/installation.png',
  },
  {
    id: 'configuration',
    name: 'Configuração',
    color: 'text-accent-cyan',
    colorName: 'Cyan',
    hex: '#00d4ff',
    icon: <Settings className="w-8 h-8" />,
    description: 'Ajustes e preferências do sistema',
    imagePath: '/docs/assets/icons/configuration.png',
  },
  {
    id: 'tutorials',
    name: 'Tutoriais',
    color: 'text-accent-magenta',
    colorName: 'Magenta',
    hex: '#ff00d4',
    icon: <BookOpen className="w-8 h-8" />,
    description: 'Guias passo-a-passo e documentação',
    imagePath: '/docs/assets/icons/tutorials.png',
  },
  {
    id: 'development',
    name: 'Desenvolvimento',
    color: 'text-accent-yellowGold',
    colorName: 'Amarelo Ouro',
    hex: '#ffd400',
    icon: <Code className="w-8 h-8" />,
    description: 'API, contribuição e desenvolvimento',
    imagePath: '/docs/assets/icons/development.png',
  },
  {
    id: 'api',
    name: 'API',
    color: 'text-accent-purple',
    colorName: 'Roxo',
    hex: '#d400ff',
    icon: <Database className="w-8 h-8" />,
    description: 'Endpoints, storage e integração',
    imagePath: '/docs/assets/icons/api.png',
  },
  {
    id: 'security',
    name: 'Segurança',
    color: 'text-accent-orange',
    colorName: 'Laranja',
    hex: '#ff4400',
    icon: <Shield className="w-8 h-8" />,
    description: 'Autenticação, SSL e permissões',
    imagePath: '/docs/assets/icons/security.png',
  },
  {
    id: 'monitoring',
    name: 'Monitoramento',
    color: 'text-accent-greenLime',
    colorName: 'Verde Lima',
    hex: '#00ff44',
    icon: <Activity className="w-8 h-8" />,
    description: 'Health checks, logs e métricas',
    imagePath: '/docs/assets/icons/monitoring.png',
  },
  {
    id: 'testing',
    name: 'Testes',
    color: 'text-accent-blueElectric',
    colorName: 'Azul Elétrico',
    hex: '#4400ff',
    icon: <TestTube className="w-8 h-8" />,
    description: 'QA, validação e CI/CD',
    imagePath: '/docs/assets/icons/testing.png',
  },
];

interface SectionIconsShowcaseProps {
  variant?: 'grid' | 'list';
  showImages?: boolean;
}

export function SectionIconsShowcase({ 
  variant = 'grid',
  showImages = false 
}: SectionIconsShowcaseProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {sectionIcons.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-lg bg-bg-secondary border border-border-default hover:border-border-hover transition-colors"
          >
            <div className={`p-3 rounded-lg bg-bg-tertiary ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">{item.name}</h3>
              <p className="text-sm text-text-secondary">{item.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-tertiary">{item.colorName}</div>
              <div className="text-xs font-mono text-text-secondary">{item.hex}</div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {sectionIcons.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-bg-secondary border border-border-default hover:border-border-hover hover:shadow-lg transition-all"
        >
          {showImages ? (
            <img 
              src={item.imagePath} 
              alt={item.name}
              className="w-20 h-20 object-contain"
            />
          ) : (
            <div 
              className={`p-4 rounded-xl bg-bg-tertiary ${item.color}`}
              style={{ boxShadow: `0 0 20px ${item.hex}40` }}
            >
              {item.icon}
            </div>
          )}
          <div className="text-center">
            <h3 className="text-base font-semibold text-text-primary">{item.name}</h3>
            <p className="text-xs text-text-tertiary mt-1">{item.colorName}</p>
            <p className="text-xs font-mono text-text-secondary mt-0.5">{item.hex}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { sectionIcons };
