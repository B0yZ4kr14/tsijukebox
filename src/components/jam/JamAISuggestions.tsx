import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Loader2, ChevronDown, ChevronUp, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { JamQueueItem, AddTrackParams } from '@/hooks/jam/useJamQueue';
import { toast } from 'sonner';
import { Badge, Button, Card } from "@/components/ui/themed"

interface AISuggestion {
  trackName: string;
  artistName: string;
  reason: string;
}

interface AIAnalysis {
  suggestions: AISuggestion[];
  mood?: string;
  genre?: string;
}

interface JamAISuggestionsProps {
  sessionId: string;
  queue: JamQueueItem[];
  currentTrack?: { trackName: string; artistName: string } | null;
  onAddTrack: (track: AddTrackParams) => Promise<boolean>;
  isHost?: boolean;
}

export function JamAISuggestions({
  sessionId,
  queue,
  currentTrack,
  onAddTrack,
  isHost = false,
}: JamAISuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [addingTrack, setAddingTrack] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (queue.length === 0 && !currentTrack) {
      toast.info('Adicione músicas à fila para receber sugestões');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-jam', {
        body: {
          action: 'suggest-tracks',
          queue: queue.map(q => ({
            trackName: q.track_name,
            artistName: q.artist_name,
          })),
          currentTrack: currentTrack ? {
            trackName: currentTrack.trackName,
            artistName: currentTrack.artistName,
          } : undefined,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      setIsExpanded(true);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast.error('Erro ao buscar sugestões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = async (suggestion: AISuggestion) => {
    setAddingTrack(suggestion.trackName);
    try {
      const success = await onAddTrack({
        trackId: `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        trackName: suggestion.trackName,
        artistName: suggestion.artistName,
        albumArt: null,
        durationMs: 180000, // Default 3 minutes
      });

      if (success) {
        toast.success(`"${suggestion.trackName}" adicionada à fila`);
        // Remove from suggestions
        setAnalysis(prev => prev ? {
          ...prev,
          suggestions: prev.suggestions.filter(s => s.trackName !== suggestion.trackName),
        } : null);
      }
    } finally {
      setAddingTrack(null);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Sugestões da IA
          </h3>
          
          <div className="flex items-center gap-2">
            {analysis?.mood && (
              <Badge variant="secondary" className="text-xs">
                {analysis.mood}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? (
                <ChevronUp aria-hidden="true" className="w-4 h-4" />
              ) : (
                <ChevronDown aria-hidden="true" className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mt-4">
              {!analysis && !isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSuggestions}
                  className="w-full gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Sugestões com Claude Opus 4
                </Button>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analisando músicas...</span>
                </div>
              )}

              {analysis?.suggestions && analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={`${suggestion.trackName}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {suggestion.trackName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {suggestion.artistName}
                        </p>
                        <p className="text-xs text-primary/70 truncate mt-0.5">
                          {suggestion.reason}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddSuggestion(suggestion)}
                        disabled={addingTrack === suggestion.trackName}
                        className="h-8 w-8 p-0"
                      >
                        {addingTrack === suggestion.trackName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus aria-hidden="true" className="w-4 h-4" />
                        )}
                      </Button>
                    </motion.div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                    className="w-full mt-2 text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar novas sugestões
                  </Button>
                </div>
              )}

              {analysis && analysis.suggestions?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Todas as sugestões foram adicionadas!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && !analysis && (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="w-full text-xs gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isLoading ? 'Analisando...' : 'Pedir sugestões'}
          </Button>
        </div>
      )}
    </Card>
  );
}
