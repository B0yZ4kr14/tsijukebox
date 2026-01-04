// Pages YouTube templates (5 files)

export function generatePagesYouTubeContent(path: string): string | null {
  switch (path) {
    case 'src/pages/youtube/index.ts':
      return `// YouTube Music pages barrel export
export { default as YouTubeMusicBrowser } from './YouTubeMusicBrowser';
export { default as YouTubeMusicLibrary } from './YouTubeMusicLibrary';
export { default as YouTubeMusicPlaylist } from './YouTubeMusicPlaylist';
export { default as YouTubeMusicSearch } from './YouTubeMusicSearch';
`;

    case 'src/pages/youtube/YouTubeMusicBrowser.tsx':
      return `import React from 'react';
import { useYouTubeMusic } from '@/contexts/YouTubeMusicContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Disc, Music, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function YouTubeMusicBrowser() {
  const { isAuthenticated, isLoading } = useYouTubeMusic();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta YouTube Music</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Explorar YouTube Music</h1>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home" className="gap-2">
            <Music className="h-4 w-4" />
            Início
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <Disc className="h-4 w-4" />
            Novidades
          </TabsTrigger>
          <TabsTrigger value="moods" className="gap-2">
            <Radio className="h-4 w-4" />
            Moods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-4">
          <div className="space-y-8">
            {/* Home content */}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <div className="grid gap-4">
            {/* Charts */}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* New releases */}
          </div>
        </TabsContent>

        <TabsContent value="moods" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Moods & genres */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;

    case 'src/pages/youtube/YouTubeMusicLibrary.tsx':
      return `import React from 'react';
import { useYouTubeMusic } from '@/contexts/YouTubeMusicContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, Disc, Heart, Clock, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function YouTubeMusicLibrary() {
  const { isAuthenticated } = useYouTubeMusic();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta YouTube Music</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Sua Biblioteca</h1>

      <Tabs defaultValue="playlists">
        <TabsList>
          <TabsTrigger value="playlists" className="gap-2">
            <ListMusic className="h-4 w-4" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-2">
            <Disc className="h-4 w-4" />
            Álbuns
          </TabsTrigger>
          <TabsTrigger value="liked" className="gap-2">
            <Heart className="h-4 w-4" />
            Curtidas
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="downloads" className="gap-2">
            <Download className="h-4 w-4" />
            Downloads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="mt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid gap-2">
              {/* User playlists */}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="albums" className="mt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Saved albums */}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="liked" className="mt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid gap-2">
              {/* Liked songs */}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid gap-2">
              {/* History */}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="downloads" className="mt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid gap-2">
              {/* Downloads */}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;

    case 'src/pages/youtube/YouTubeMusicPlaylist.tsx':
      return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useYouTubeMusic } from '@/contexts/YouTubeMusicContext';
import { Button } from '@/components/ui/button';
import { Play, Shuffle, Heart, MoreHorizontal, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function YouTubeMusicPlaylist() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useYouTubeMusic();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta YouTube Music</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Playlist Header */}
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-red-500/20 to-background">
        <div className="w-48 h-48 bg-muted rounded-lg shadow-lg" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">PLAYLIST</p>
          <h1 className="text-4xl font-bold">Playlist Name</h1>
          <p className="text-muted-foreground">Description</p>
          <p className="text-sm">
            <span className="font-medium">Channel</span> • 0 músicas
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 p-4">
        <Button size="lg" className="rounded-full bg-red-600 hover:bg-red-700">
          <Play className="h-5 w-5 mr-2" />
          Reproduzir
        </Button>
        <Button variant="outline" size="icon">
          <Shuffle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Download className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Tracks */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1">
          {/* Track list */}
        </div>
      </ScrollArea>
    </div>
  );
}
`;

    case 'src/pages/youtube/YouTubeMusicSearch.tsx':
      return `import React, { useState } from 'react';
import { useYouTubeMusic } from '@/contexts/YouTubeMusicContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Music, Disc, Users, ListMusic, Video } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function YouTubeMusicSearch() {
  const [query, setQuery] = useState('');
  const { isAuthenticated } = useYouTubeMusic();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta YouTube Music</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar músicas, álbuns, artistas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-red-600 hover:bg-red-700">Buscar</Button>
      </div>

      {query && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="songs" className="gap-2">
              <Music className="h-4 w-4" />
              Músicas
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="albums" className="gap-2">
              <Disc className="h-4 w-4" />
              Álbuns
            </TabsTrigger>
            <TabsTrigger value="artists" className="gap-2">
              <Users className="h-4 w-4" />
              Artistas
            </TabsTrigger>
            <TabsTrigger value="playlists" className="gap-2">
              <ListMusic className="h-4 w-4" />
              Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-6">
                {/* All results */}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="songs" className="mt-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-1">
                {/* Song results */}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Video results */}
            </div>
          </TabsContent>

          <TabsContent value="albums" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Album results */}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Artist results */}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Playlist results */}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
`;

    default:
      return null;
  }
}
