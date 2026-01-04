/**
 * About Page
 * 
 * Information about TSiJUKEBOX project, team, and design system
 * 
 * @author B0.y_Z4kr14
 * @version 1.0.0
 */

import { motion } from 'framer-motion';
import { 
  Info, 
  Github, 
  Heart, 
  Code, 
  Music, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { BackButton } from '@/components/ui/BackButton';
import { SectionIconsShowcase } from '@/components/ui/SectionIconsShowcase';
import { BrandText } from '@/components/ui/BrandText';
import { Badge, Button, Card } from "@/components/ui/themed"

const features = [
  { name: 'Multi-Provider', description: 'Spotify, YouTube Music, Arquivos Locais', status: 'complete' },
  { name: 'Kiosk Mode', description: 'Interface touch otimizada', status: 'complete' },
  { name: 'Karaoke Mode', description: 'Letras sincronizadas em fullscreen', status: 'complete' },
  { name: 'Cloud Backup', description: 'Storj, Google Drive, AWS S3', status: 'complete' },
  { name: 'RBAC', description: 'Roles: Admin, User, Newbie', status: 'complete' },
  { name: 'System Monitor', description: 'CPU, RAM, temperatura em tempo real', status: 'complete' },
  { name: 'i18n', description: 'Português, English, Español', status: 'complete' },
  { name: 'WCAG 2.1 AA', description: 'Acessibilidade validada', status: 'complete' },
];

const techStack = [
  { name: 'React', version: '18.3', color: '#61dafb' },
  { name: 'TypeScript', version: '5.0', color: '#3178c6' },
  { name: 'Vite', version: '5.0', color: '#646CFF' },
  { name: 'Tailwind CSS', version: '3.4', color: '#06B6D4' },
  { name: 'Framer Motion', version: '11.x', color: '#ff0055' },
  { name: 'FastAPI', version: '0.100+', color: '#009688' },
  { name: 'SQLite', version: '3.40+', color: '#003B57' },
  { name: 'Docker', version: '24+', color: '#2496ED' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <Info className="w-6 h-6 text-accent-cyan" />
                  Sobre
                </h1>
                <p className="text-sm text-text-secondary">Informações do projeto</p>
              </div>
            </div>
            <LogoBrand size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <LogoBrand size="xl" animate={true} />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-text-primary">
              <BrandText /> Enterprise
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Sistema kiosk musical profissional com integração Spotify, YouTube Music e arquivos locais.
              Projetado para bares, restaurantes, eventos e uso doméstico.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Badge className="bg-accent-cyan text-black">v4.2.1</Badge>
            <Badge variant="outline" className="border-accent-greenNeon text-accent-greenNeon">
              Stable
            </Badge>
            <Badge variant="outline" className="border-accent-yellowGold text-accent-yellowGold">
              Public Domain
            </Badge>
          </div>
        </motion.section>

        {/* Section Icons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-bg-secondary border-border-default">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                Seções da Documentação
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                8 ícones modernos representando as principais áreas do projeto
              </p>
            
            <div className="mt-4">
              <SectionIconsShowcase variant="grid" />
            </div>
          </Card>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-bg-secondary border-border-default">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Music className="w-5 h-5 text-accent-magenta" />
                Recursos Principais
              </h3>
            
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {features.map((feature) => (
                  <div 
                    key={feature.name}
                    className="p-4 rounded-lg bg-bg-tertiary border border-border-default"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-accent-greenNeon" />
                      <span className="font-medium text-text-primary">{feature.name}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-bg-secondary border-border-default">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Code className="w-5 h-5 text-accent-yellowGold" />
                Stack Tecnológico
              </h3>
            
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {techStack.map((tech) => (
                  <div 
                    key={tech.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tech.color }}
                    />
                    <div>
                      <span className="font-medium text-text-primary">{tech.name}</span>
                      <span className="text-xs text-text-tertiary ml-2">v{tech.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button asChild variant="outline" className="border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10">
            <a href="https://github.com/B0yZ4kr14/TSiJUKEBOX" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              GitHub
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" className="border-accent-magenta text-accent-magenta hover:bg-accent-magenta/10">
            <Link to="/design-system">
              <Sparkles className="w-4 h-4 mr-2" />
              Design System
              <ChevronRight className="w-3 h-3 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-accent-greenNeon text-accent-greenNeon hover:bg-accent-greenNeon/10">
            <Link to="/help">
              <Info className="w-4 h-4 mr-2" />
              Documentação
              <ChevronRight className="w-3 h-3 ml-2" />
            </Link>
          </Button>
        </motion.section>

        {/* Credits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <span>Desenvolvido com</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>por</span>
            <span className="font-semibold text-accent-cyan">B0.y_Z4kr14</span>
          </div>
          <p className="text-sm text-text-tertiary">
            TSI Telecom • Public Domain License
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-default py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-text-secondary">
            <BrandText /> v4.2.1
          </p>
          <p className="text-xs text-text-tertiary mt-2">
            © 2024 TSI Telecom • Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
