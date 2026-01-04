// Pages Spotify templates (5 files)

export function generatePagesSpotifyContent(path: string): string | null {
  switch (path) {
    case 'src/pages/spotify/index.ts':
      return `// Spotify pages barrel export
export { default as SpotifyBrowser } from './SpotifyBrowser';
export { default as SpotifyLibrary } from './SpotifyLibrary';
export { default as SpotifyPlaylist } from './SpotifyPlaylist';
export { default as SpotifySearch } from './SpotifySearch';
`;

    case 'src/pages/spotify/SpotifyBrowser.tsx':
      return `import React from 'react';
import { useSpotify } from '@/contexts/SpotifyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Disc, Users, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SpotifyBrowser() {
  const { isAuthenticated, isLoading } = useSpotify();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta Spotify para explorar</p>
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
      <h1 className="text-2xl font-bold">Explorar Spotify</h1>

      <Tabs defaultValue="featured">
        <TabsList>
          <TabsTrigger value="featured" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Em Destaque
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <Disc className="h-4 w-4" />
            Lançamentos
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Music className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Featured playlists */}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* New releases */}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Categories */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;

    case 'src/pages/spotify/SpotifyLibrary.tsx':
      return `import React from 'react';
import { useSpotify } from '@/contexts/SpotifyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListMusic, Disc, Heart, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SpotifyLibrary() {
  const { isAuthenticated } = useSpotify();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta Spotify</p>
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
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-4 w-4" />
            Recentes
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

        <TabsContent value="recent" className="mt-4">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid gap-2">
              {/* Recently played */}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;

    case 'src/pages/spotify/SpotifyPlaylist.tsx':
      return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useSpotify } from '@/contexts/SpotifyContext';
import { Button } from '@/components/ui/button';
import { Play, Shuffle, Heart, MoreHorizontal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function SpotifyPlaylist() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useSpotify();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta Spotify</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Playlist Header */}
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-primary/20 to-background">
        <div className="w-48 h-48 bg-muted rounded-lg shadow-lg" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">PLAYLIST</p>
          <h1 className="text-4xl font-bold">Playlist Name</h1>
          <p className="text-muted-foreground">Description</p>
          <p className="text-sm">
            <span className="font-medium">Owner</span> • 0 músicas
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 p-4">
        <Button size="lg" className="rounded-full">
          <Play className="h-5 w-5 mr-2" />
          Reproduzir
        </Button>
        <Button variant="outline" size="icon">
          <Shuffle className="h-5 w-5" />
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

    case 'src/pages/spotify/SpotifySearch.tsx':
      return `import React, { useState } from 'react';
import { useSpotify } from '@/contexts/SpotifyContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Music, Disc, Users, ListMusic } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SpotifySearch() {
  const [query, setQuery] = useState('');
  const { isAuthenticated } = useSpotify();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Conecte sua conta Spotify</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="O que você quer ouvir?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>Buscar</Button>
      </div>

      {query && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="tracks" className="gap-2">
              <Music className="h-4 w-4" />
              Músicas
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

          <TabsContent value="tracks" className="mt-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-1">
                {/* Track results */}
              </div>
            </ScrollArea>
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
