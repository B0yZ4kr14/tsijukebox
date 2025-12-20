import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JamReaction {
  id: string;
  emoji: string;
  participant_nickname: string;
  created_at: string;
  position?: { x: number; y: number };
}

export type ReactionEmoji = '🔥' | '👏' | '❤️' | '😂' | '🎵' | '💯';

export const REACTION_EMOJIS: ReactionEmoji[] = ['🔥', '👏', '❤️', '😂', '🎵', '💯'];

export function useJamReactions(
  sessionId: string | null,
  participantId: string | null,
  nickname: string | null
) {
  const [reactions, setReactions] = useState<JamReaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [isOnCooldown, setIsOnCooldown] = useState<Record<string, boolean>>({});
  const reactionIdCounter = useRef(0);

  // Subscribe to realtime reactions
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`jam-reactions:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jam_reactions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newReaction = payload.new as {
            id: string;
            emoji: string;
            participant_nickname: string;
            created_at: string;
          };

          // Add random position for animation
          const reactionWithPosition: JamReaction = {
            ...newReaction,
            position: {
              x: Math.random() * 80 + 10, // 10-90% horizontal
              y: Math.random() * 20, // 0-20% vertical offset
            },
          };

          // Add to visible reactions
          setReactions((prev) => [...prev, reactionWithPosition]);

          // Update counts
          setReactionCounts((prev) => ({
            ...prev,
            [newReaction.emoji]: (prev[newReaction.emoji] || 0) + 1,
          }));

          // Remove after animation (3 seconds)
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Send a reaction
  const sendReaction = useCallback(
    async (emoji: ReactionEmoji, trackId?: string) => {
      if (!sessionId || !participantId || !nickname) {
        console.warn('Cannot send reaction: missing session, participant, or nickname');
        return false;
      }

      // Check cooldown
      if (isOnCooldown[emoji]) {
        return false;
      }

      // Set cooldown
      setIsOnCooldown((prev) => ({ ...prev, [emoji]: true }));
      setTimeout(() => {
        setIsOnCooldown((prev) => ({ ...prev, [emoji]: false }));
      }, 1500); // 1.5 second cooldown

      try {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${reactionIdCounter.current++}`;
        
        // Optimistic update for immediate feedback
        const optimisticReaction: JamReaction = {
          id: tempId,
          emoji,
          participant_nickname: nickname,
          created_at: new Date().toISOString(),
          position: {
            x: Math.random() * 80 + 10,
            y: Math.random() * 20,
          },
        };

        setReactions((prev) => [...prev, optimisticReaction]);

        // Remove optimistic reaction after animation
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== tempId));
        }, 3000);

        // Insert to database (will trigger realtime for others)
        const { error } = await supabase.from('jam_reactions').insert({
          session_id: sessionId,
          participant_id: participantId,
          participant_nickname: nickname,
          emoji,
          track_id: trackId || null,
        });

        if (error) {
          console.error('Error sending reaction:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error sending reaction:', error);
        return false;
      }
    },
    [sessionId, participantId, nickname, isOnCooldown]
  );

  // Reset counts periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setReactionCounts({});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    reactions,
    reactionCounts,
    sendReaction,
    isOnCooldown,
    REACTION_EMOJIS,
  };
}
