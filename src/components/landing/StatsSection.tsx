import { motion } from "framer-motion";
import { Music, Globe, Palette, Shield, Smartphone, Users, Zap, Cloud } from "lucide-react";

const stats = [
  { 
    icon: Music, 
    number: "3+", 
    label: "Provedores", 
    description: "Spotify, YouTube, Local",
    color: "from-emerald-500 to-teal-500"
  },
  { 
    icon: Globe, 
    number: "3", 
    label: "Idiomas", 
    description: "PT, EN, ES",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Palette, 
    number: "2", 
    label: "Temas", 
    description: "Dark Neon & Light Silver",
    color: "from-purple-500 to-pink-500"
  },
  { 
    icon: Shield, 
    number: "WCAG", 
    label: "2.1 AA", 
    description: "Acessibilidade garantida",
    color: "from-amber-500 to-orange-500"
  },
];

const features = [
  { icon: Smartphone, label: "PWA Instalável" },
  { icon: Users, label: "Multi-usuário" },
  { icon: Zap, label: "Performance" },
  { icon: Cloud, label: "Cloud Sync" },
];

export function StatsSection() {
  return (
    <div className="space-y-12">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" 
                 style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
            
            <div className="relative p-6 rounded-2xl bg-card border border-border text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Pills */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {features.map((feature) => (
          <div 
            key={feature.label}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <feature.icon className="w-4 h-4" />
            {feature.label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
