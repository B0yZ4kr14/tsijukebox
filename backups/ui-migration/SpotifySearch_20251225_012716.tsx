import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SpotifySearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export function SpotifySearch({ 
  searchQuery, 
  onSearchQueryChange, 
  onSearch 
}: SpotifySearchProps) {
  return (
    <form onSubmit={onSearch} className="p-4 border-b border-kiosk-surface">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/90" />
        <Input
          type="text"
          placeholder="Buscar músicas, artistas..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-10 bg-kiosk-surface border-kiosk-surface/50 text-kiosk-text placeholder:text-kiosk-text/90 progress-track-3d"
        />
      </div>
    </form>
  );
}
