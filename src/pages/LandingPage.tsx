import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandText } from "@/components/ui/BrandText";
import { ScreenshotCarousel } from "@/components/landing/ScreenshotCarousel";
import { ThemeComparison } from "@/components/landing/ThemeComparison";
import { StatsSection } from "@/components/landing/StatsSection";
import { motion } from "framer-motion";
import { 
  Music, Play, Mic2, Monitor, Cloud, Globe, Shield, Users,
  Github, BookOpen, Download, Sparkles, Zap, Eye
} from "lucide-react";

const features = [
  { icon: Music, title: "Multi-Provider", desc: "Spotify, YouTube Music e arquivos locais" },
  { icon: Monitor, title: "Modo Kiosk", desc: "Interface dedicada para estabelecimentos" },
  { icon: Mic2, title: "Karaoke", desc: "Letras sincronizadas em tela cheia" },
  { icon: Cloud, title: "Cloud Backup", desc: "Sincronização segura via Storj" },
  { icon: Users, title: "RBAC", desc: "Controle de acesso por papéis" },
  { icon: Globe, title: "Multi-idioma", desc: "Português, English, Español" },
  { icon: Shield, title: "WCAG 2.1 AA", desc: "Acessibilidade garantida" },
  { icon: Zap, title: "PWA", desc: "Instalável como app nativo" },
];

const techStack = [
  { name: "React", color: "text-cyan-400" },
  { name: "TypeScript", color: "text-blue-400" },
  { name: "Tailwind", color: "text-teal-400" },
  { name: "Supabase", color: "text-emerald-400" },
  { name: "Vite", color: "text-purple-400" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">v2.0 - Enterprise Ready</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              <BrandText size="3xl" weight="extrabold" />
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl">
              Sistema kiosk musical profissional com integração Spotify, YouTube Music e suporte completo a acessibilidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2 text-lg px-8">
                <Link to="/install">
                  <Download className="w-5 h-5" />
                  Instalar Agora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-lg px-8">
                <Link to="/">
                  <Play className="w-5 h-5" />
                  Ver Demo
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-8">
              {techStack.map((tech) => (
                <span key={tech.name} className={`text-sm font-medium ${tech.color}`}>
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Em Números</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma solução completa para sua experiência musical
            </p>
          </motion.div>
          
          <StatsSection />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tudo o que você precisa para criar a experiência musical perfeita
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Preview Interativo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Veja em Ação</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interface moderna e intuitiva para a melhor experiência musical
            </p>
          </motion.div>
          
          <ScreenshotCarousel />
        </div>
      </section>

      {/* Theme Comparison Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Escolha Seu Estilo</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dois temas cuidadosamente desenhados para qualquer ambiente
            </p>
          </motion.div>
          
          <ThemeComparison />
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Instalação Rápida</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Configure o TSiJUKEBOX em minutos
            </p>
            
            <div className="bg-card border border-border rounded-xl p-6 text-left">
              <pre className="text-sm sm:text-base overflow-x-auto">
                <code className="text-muted-foreground">
{`# Clone o repositório
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
cd TSiJUKEBOX

# Execute o instalador
cd scripts/installer
python main.py`}
                </code>
              </pre>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/wiki">
                  <BookOpen className="w-4 h-4" />
                  Documentação
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="https://github.com/B0yZ4kr14/TSiJUKEBOX" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandText size="lg" />
              <span className="text-muted-foreground">© Public Domain</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link to="/wiki" className="text-muted-foreground hover:text-foreground transition-colors">
                Wiki
              </Link>
              <Link to="/brand" className="text-muted-foreground hover:text-foreground transition-colors">
                Brand
              </Link>
              <Link to="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                Changelog
              </Link>
              <a 
                href="https://github.com/B0yZ4kr14/TSiJUKEBOX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
