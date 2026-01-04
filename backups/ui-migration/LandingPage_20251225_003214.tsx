import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandText } from "@/components/ui/BrandText";
import { ScreenshotCarousel } from "@/components/landing/ScreenshotCarousel";
import { ThemeComparison } from "@/components/landing/ThemeComparison";
import { StatsSection } from "@/components/landing/StatsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Parallax */}
      <motion.section 
        className="relative overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"
          animate={{
            background: [
              "radial-gradient(ellipse at top, hsl(var(--primary) / 0.2) 0%, transparent 50%)",
              "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
              "radial-gradient(ellipse at top, hsl(var(--primary) / 0.2) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
        
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <motion.div 
            className="flex flex-col items-center text-center space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={scaleIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">v2.0 - Enterprise Ready</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-7xl font-bold tracking-tight"
            >
              <BrandText size="3xl" weight="extrabold" />
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-muted-foreground max-w-2xl"
            >
              Sistema kiosk musical profissional com integração Spotify, YouTube Music e suporte completo a acessibilidade.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="gap-2 text-lg px-8 group">
                <Link to="/install">
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                  Instalar Agora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-lg px-8 group">
                <Link to="/">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Ver Demo
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="flex items-center gap-6 pt-8"
            >
              {techStack.map((tech, index) => (
                <motion.span 
                  key={tech.name} 
                  className={`text-sm font-medium ${tech.color}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {tech.name}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
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
      <section className="py-24 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tudo o que você precisa para criar a experiência musical perfeita
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                variants={scaleIn}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Preview Interativo</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Veja em Ação</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interface moderna e intuitiva para a melhor experiência musical
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ScreenshotCarousel />
          </motion.div>
        </div>
      </section>

      {/* Theme Comparison Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Escolha Seu Estilo</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dois temas cuidadosamente desenhados para qualquer ambiente
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ThemeComparison />
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Installation Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Instalação Rápida</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Configure o TSiJUKEBOX em minutos
            </p>
            
            <motion.div 
              className="bg-card border border-border rounded-xl p-6 text-left"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
            
            <div className="flex justify-center gap-4 mt-8">
              <Button asChild variant="outline" className="gap-2 group">
                <Link to="/wiki">
                  <BookOpen className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Documentação
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 group">
                <a href="https://github.com/B0yZ4kr14/TSiJUKEBOX" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  GitHub
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <BrandText size="lg" />
              <span className="text-muted-foreground">© Public Domain</span>
            </motion.div>
            
            <div className="flex items-center gap-6">
              {[
                { to: "/wiki", label: "Wiki" },
                { to: "/brand", label: "Brand" },
                { to: "/changelog", label: "Changelog" },
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
              <motion.a 
                href="https://github.com/B0yZ4kr14/TSiJUKEBOX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
