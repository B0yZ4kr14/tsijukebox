import { Music, Settings, BarChart3, Play, Pause, SkipForward, Volume2, Heart, ListMusic } from "lucide-react";
import { motion } from "framer-motion";

interface ScreenshotPreviewProps {
  variant: "dashboard" | "player" | "settings" | "stats";
  theme?: "dark" | "light";
}

export function ScreenshotPreview({ variant, theme = "dark" }: ScreenshotPreviewProps) {
  const isDark = theme === "dark";
  
  const bgClass = isDark 
    ? "bg-zinc-900 border-zinc-700" 
    : "bg-zinc-100 border-zinc-300";
  
  const textClass = isDark ? "text-zinc-100" : "text-zinc-900";
  const mutedClass = isDark ? "text-zinc-400" : "text-zinc-600";
  const cardClass = isDark 
    ? "bg-zinc-800/50 border-zinc-700" 
    : "bg-white border-zinc-200";
  const accentClass = isDark ? "text-emerald-400" : "text-emerald-600";

  if (variant === "dashboard") {
    return (
      <div className={`rounded-xl border ${bgClass} p-4 aspect-video overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center`}>
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold ${textClass}`}>TSiJUKEBOX</span>
          </div>
          <div className="flex gap-2">
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-red-500' : 'bg-red-400'}`} />
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-yellow-500' : 'bg-yellow-400'}`} />
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-green-500' : 'bg-green-400'}`} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Músicas", value: "2,847" },
            { label: "Playlists", value: "42" },
            { label: "Horas", value: "156" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg border ${cardClass} p-2 text-center`}>
              <div className={`text-sm font-bold ${accentClass}`}>{stat.value}</div>
              <div className={`text-xs ${mutedClass}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Tracks */}
        <div className={`rounded-lg border ${cardClass} p-2`}>
          <div className={`text-xs font-medium ${mutedClass} mb-2`}>Recentes</div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <div className={`w-6 h-6 rounded ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
              <div className="flex-1">
                <div className={`text-xs ${textClass} truncate`}>Track {i}</div>
                <div className={`text-[10px] ${mutedClass}`}>Artist</div>
              </div>
              <Play className={`w-3 h-3 ${mutedClass}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "player") {
    return (
      <div className={`rounded-xl border ${bgClass} p-4 aspect-video overflow-hidden`}>
        {/* Album Art */}
        <div className="flex items-center justify-center mb-4">
          <motion.div 
            className={`w-24 h-24 rounded-xl bg-gradient-to-br ${isDark ? 'from-purple-600 to-pink-600' : 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg`}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Music className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-3">
          <div className={`font-semibold ${textClass}`}>Música Incrível</div>
          <div className={`text-sm ${mutedClass}`}>Artista Favorito</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className={`h-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`}>
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          </div>
          <div className={`flex justify-between text-xs ${mutedClass} mt-1`}>
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Heart className={`w-5 h-5 ${mutedClass}`} />
          <div className="flex items-center gap-2">
            <button className={`p-1 ${mutedClass}`}>
              <SkipForward className="w-5 h-5 rotate-180" />
            </button>
            <button className={`p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`}>
              <Pause className="w-5 h-5 text-white" />
            </button>
            <button className={`p-1 ${mutedClass}`}>
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <Volume2 className={`w-5 h-5 ${mutedClass}`} />
        </div>
      </div>
    );
  }

  if (variant === "settings") {
    return (
      <div className={`rounded-xl border ${bgClass} p-4 aspect-video overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Settings className={`w-5 h-5 ${accentClass}`} />
          <span className={`font-semibold ${textClass}`}>Configurações</span>
        </div>

        {/* Settings List */}
        <div className="space-y-2">
          {[
            { label: "Tema", value: isDark ? "Dark Neon" : "Light Silver" },
            { label: "Idioma", value: "Português" },
            { label: "Qualidade", value: "Alta (320kbps)" },
            { label: "Modo Kiosk", value: "Ativo" },
          ].map((setting) => (
            <div key={setting.label} className={`flex items-center justify-between p-2 rounded-lg border ${cardClass}`}>
              <span className={`text-sm ${textClass}`}>{setting.label}</span>
              <span className={`text-sm ${accentClass}`}>{setting.value}</span>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div className={`flex items-center justify-between mt-3 p-2 rounded-lg border ${cardClass}`}>
          <span className={`text-sm ${textClass}`}>Acessibilidade</span>
          <div className="w-10 h-5 rounded-full bg-emerald-500 flex items-center p-0.5">
            <div className="w-4 h-4 rounded-full bg-white ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className={`rounded-xl border ${bgClass} p-4 aspect-video overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className={`w-5 h-5 ${accentClass}`} />
          <span className={`font-semibold ${textClass}`}>Estatísticas</span>
        </div>

        {/* Chart Mockup */}
        <div className="flex items-end gap-1 h-20 mb-3">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((height, i) => (
            <div 
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-emerald-600 to-teal-400"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: ListMusic, label: "Top: Rock", value: "45%" },
            { icon: Play, label: "Plays hoje", value: "847" },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${cardClass}`}>
              <stat.icon className={`w-4 h-4 ${accentClass}`} />
              <div>
                <div className={`text-xs ${mutedClass}`}>{stat.label}</div>
                <div className={`text-sm font-semibold ${textClass}`}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
