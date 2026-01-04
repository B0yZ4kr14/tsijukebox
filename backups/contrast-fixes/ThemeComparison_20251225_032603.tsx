import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { ScreenshotPreview } from "./ScreenshotPreview";

export function ThemeComparison() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Dark Theme */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group"
      >
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/90 backdrop-blur-sm border border-zinc-700">
            <Moon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-100">Dark Neon</span>
          </div>
          
          <ScreenshotPreview variant="player" theme="dark" />
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-foreground">Tema Escuro Neon</h4>
            <p className="text-sm text-muted-foreground">
              Interface elegante com acentos vibrantes em verde neon. Ideal para ambientes com pouca luz e uso prolongado.
            </p>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-border" title="Background" />
              <div className="w-6 h-6 rounded-full bg-emerald-500 border border-border" title="Accent" />
              <div className="w-6 h-6 rounded-full bg-teal-500 border border-border" title="Secondary" />
              <div className="w-6 h-6 rounded-full bg-zinc-100 border border-border" title="Text" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Light Theme */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="group"
      >
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/90 backdrop-blur-sm border border-zinc-300">
            <Sun className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-zinc-900">Light Silver</span>
          </div>
          
          <ScreenshotPreview variant="player" theme="light" />
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-foreground">Tema Claro Silver</h4>
            <p className="text-sm text-muted-foreground">
              Visual clean e moderno com tons suaves de prata. Perfeito para ambientes bem iluminados e maior legibilidade.
            </p>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-100 border border-border" title="Background" />
              <div className="w-6 h-6 rounded-full bg-emerald-600 border border-border" title="Accent" />
              <div className="w-6 h-6 rounded-full bg-teal-600 border border-border" title="Secondary" />
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-border" title="Text" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
