import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { VoiceCommandEvent } from './useVoiceControl';

interface VoiceSearchOptions {
  autoNavigate?: boolean;
  provider?: 'spotify' | 'youtube' | 'local';
  onSearchTriggered?: (query: string) => void;
}

interface UseVoiceSearchReturn {
  lastSearchQuery: string | null;
  isSearching: boolean;
  searchByVoice: (query: string) => void;
  clearSearch: () => void;
}

export function useVoiceSearch(options: VoiceSearchOptions = {}): UseVoiceSearchReturn {
  const navigate = useNavigate();
  const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    autoNavigate = true, 
    provider = 'spotify',
    onSearchTriggered 
  } = options;

  const searchByVoice = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setLastSearchQuery(query);
    setIsSearching(true);
    
    toast.info(`🔍 Buscando: "${query}"`, { duration: 2000 });
    
    // Trigger callback if provided
    if (onSearchTriggered) {
      onSearchTriggered(query);
    }
    
    // Navigate to search page if enabled
    if (autoNavigate) {
      const searchPath = provider === 'youtube' 
        ? `/youtube-music/search?q=${encodeURIComponent(query)}`
        : `/spotify/search?q=${encodeURIComponent(query)}`;
      
      navigate(searchPath);
    }
    
    setIsSearching(false);
  }, [autoNavigate, provider, navigate, onSearchTriggered]);

  const clearSearch = useCallback(() => {
    setLastSearchQuery(null);
  }, []);

  // Listen for voice search commands
  useEffect(() => {
    const handleVoiceSearch = (event: CustomEvent<VoiceCommandEvent>) => {
      const { action, searchQuery } = event.detail;
      
      if (action !== 'search' || !searchQuery) return;
      
      searchByVoice(searchQuery);
    };

    window.addEventListener('voice-command', handleVoiceSearch as EventListener);
    return () => window.removeEventListener('voice-command', handleVoiceSearch as EventListener);
  }, [searchByVoice]);

  return {
    lastSearchQuery,
    isSearching,
    searchByVoice,
    clearSearch
  };
}
