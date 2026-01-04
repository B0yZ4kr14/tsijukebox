import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Heart, Clock, Disc, Library, RefreshCw } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from "@/components/ui/themed";
import { Skeleton } from '@/components/ui/skeleton';
import { YouTubeMusicPlaylistCard, YouTubeMusicUserBadge } from '@/components/youtube';
import { useYouTubeMusicLibrary } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { toast } from 'sonner';
import { ComponentBoundary } from '@/components/errors/SuspenseBoundary';

export default function YouTubeMusicBrowser() {
  const navigate = useNavigate();
  const { youtubeMusic } = useSettings();
  const { playlists, likedSongs, recentlyPlayed, isLoading, fetchAll } = useYouTubeMusicLibrary();
  const [user, setUser] = useState(youtubeMusic.user);

  useEffect(() => {
    if (!youtubeMusic.isConnected) {
      toast.error('Conecte-se ao YouTube Music nas configurações');
      navigate('/settings');
    }
  }, [youtubeMusic.isConnected, navigate]);

  useEffect(() => {
    if (youtubeMusic.user) {
      setUser(youtubeMusic.user);
    }
  }, [youtubeMusic.user]);

  const quickAccessItems = [
    {
      id: 'liked',
      title: 'Músicas Curtidas',
      icon: Heart,
      count: likedSongs.length,
      color: 'bg-gradient-to-br from-red-500 to-pink-500',
      onClick: () => navigate('/youtube-music/library?tab=liked'),
    },
    {
      id: 'recent',
      title: 'Tocadas Recentemente',
      icon: Clock,
      count: recentlyPlayed.length,
      color: 'bg-gradient-to-br from-orange-500 to-amber-500',
      onClick: () => navigate('/youtube-music/library?tab=recent'),
    },
    {
      id: 'albums',
      title: 'Álbuns',
      icon: Disc,
      count: 0,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      onClick: () => navigate('/youtube-music/library?tab=albums'),
    },
    {
      id: 'library',
      title: 'Biblioteca',
      icon: Library,
      count: playlists.length,
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      onClick: () => navigate('/youtube-music/library'),
    },
  ];

  return (
    <KioskLayout>
      <div className="min-h-screen bg-kiosk-background">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between p-4 border-b border-kiosk-border"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              {/* YouTube Music Logo */}
              <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-kiosk-text">YouTube Music</h1>
                <p className="text-sm text-kiosk-text/90">Navegue sua biblioteca</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="kiosk-outline"
              onClick={() => navigate('/youtube-music/search')}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={fetchAll}
              disabled={isLoading}
              className="w-10 h-10"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.header>

        <div className="p-6 space-y-8">
          {/* User Badge */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <YouTubeMusicUserBadge user={user} size="lg" />
            </motion.div>
          )}

          {/* Quick Access */}
          <ComponentBoundary loadingMessage="Carregando acesso rápido...">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-kiosk-text mb-4">Acesso Rápido</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickAccessItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={item.onClick}
                    className={`${item.color} p-4 rounded-xl text-white text-left hover:scale-[1.02] transition-transform`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-8 h-8 mb-2" />
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-white/90">{item.count} itens</p>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          </ComponentBoundary>

          {/* Playlists */}
          <ComponentBoundary loadingMessage="Carregando playlists...">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-kiosk-text">Suas Playlists</h2>
                <Button variant="ghost" size="sm" className="text-[#FF0000]">
                  <Plus className="w-4 h-4 mr-1" />
                  Nova Playlist
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : playlists.length === 0 ? (
                <div className="text-center py-12 text-kiosk-text/85">
                  {/* WCAG Exception: Decorative icon at /30 opacity, not critical content */}
                  <Library className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma playlist encontrada</p>
                  <p className="text-sm">Crie sua primeira playlist no YouTube Music</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((playlist) => (
                    <YouTubeMusicPlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onClick={() => navigate(`/youtube-music/playlist/${playlist.id}`)}
                    />
                  ))}
                </div>
              )}
            </motion.section>
          </ComponentBoundary>
        </div>
      </div>
    </KioskLayout>
  );
}
