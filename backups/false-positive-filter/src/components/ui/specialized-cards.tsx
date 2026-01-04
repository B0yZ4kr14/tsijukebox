/**
 * Specialized Cards
 * 
 * Componentes de card especializados para casos de uso específicos do TSiJUKEBOX.
 * Inclui MusicCard, StatCard, PlaylistCard, ArtistCard, e AlbumCard.
 * 
 * @component
 * @version 1.0.0
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, MoreVertical, Music, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { CardImage, CardBadge, CardIcon, CardStat, CardActions } from './card-extensions';

// ============================================================================
// MusicCard Component
// ============================================================================

export interface MusicCardProps {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  coverUrl?: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
  onMore?: () => void;
  className?: string;
}

export const MusicCard = React.forwardRef<HTMLDivElement, MusicCardProps>(
  (
    {
      title,
      artist,
      album,
      duration,
      coverUrl,
      isPlaying = false,
      isFavorite = false,
      onPlay,
      onFavorite,
      onMore,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          variant="interactive"
          padding="none"
          className={cn('overflow-hidden group', className)}
        >
          {/* Cover Image */}
          <div className="relative">
            {coverUrl ? (
              <CardImage
                src={coverUrl}
                alt={`${title} cover`}
                aspectRatio="1/1"
                overlay
                overlayGradient="bottom"
              />
            ) : (
              <div className="aspect-square bg-bg-tertiary flex items-center justify-center">
                <Music className="w-16 h-16 text-gray-600" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onPlay}
                className="w-14 h-14 rounded-full bg-accent-cyan/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent-cyan hover:scale-110 transition-all shadow-glow-cyan"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-black" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                )}
              </button>
            </div>

            {/* Duration Badge */}
            {duration && (
              <CardBadge variant="primary" position="bottom-right" size="sm">
                {duration}
              </CardBadge>
            )}

            {/* Playing Indicator */}
            {isPlaying && (
              <CardBadge variant="cyan" position="top-left" size="sm">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-accent-cyan animate-pulse" />
                  <div className="w-1 h-4 bg-accent-cyan animate-pulse delay-75" />
                  <div className="w-1 h-3 bg-accent-cyan animate-pulse delay-150" />
                </div>
              </CardBadge>
            )}
          </div>

          {/* Content */}
          <div className="mt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white truncate">{title}</h3>
                <p className="text-sm text-text-secondary truncate">{artist}</p>
                {album && <p className="text-xs text-gray-500 truncate mt-1">{album}</p>}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={onFavorite}
                  className={cn(
                    'p-2 rounded-full hover:bg-bg-tertiary transition-colors',
                    isFavorite && 'text-accent-magenta'
                  )}
                >
                  <Heart aria-hidden="true" className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={onMore}
                  className="p-2 rounded-full hover:bg-bg-tertiary transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
);
MusicCard.displayName = 'MusicCard';

// ============================================================================
// StatCard Component
// ============================================================================

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  iconVariant?: 'cyan' | 'green' | 'magenta' | 'yellow' | 'purple' | 'orange';
  className?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      description,
      trend,
      trendValue,
      icon,
      iconVariant = 'cyan',
      className,
    },
    ref
  ) => {
    const trendColors = {
      up: 'text-state-success',
      down: 'text-state-error',
      neutral: 'text-gray-400',
    };

    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

    return (
      <Card ref={ref} variant="elevated" padding="lg" className={className}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              {trend && trendValue && (
                <div className={cn('flex items-center gap-1 text-sm font-medium', trendColors[trend])}>
                  <TrendIcon aria-hidden="true" className="w-4 h-4" />
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          
          {icon && (
            <CardIcon aria-hidden="true" variant={iconVariant} size="lg" glow>
              {icon}
            </CardIcon>
          )}
        </div>
      </Card>
    );
  }
);
StatCard.displayName = 'StatCard';

// ============================================================================
// PlaylistCard Component
// ============================================================================

export interface PlaylistCardProps {
  name: string;
  description?: string;
  trackCount: number;
  coverUrl?: string;
  isPublic?: boolean;
  creator?: string;
  onPlay?: () => void;
  onClick?: () => void;
  className?: string;
}

export const PlaylistCard = React.forwardRef<HTMLDivElement, PlaylistCardProps>(
  (
    {
      name,
      description,
      trackCount,
      coverUrl,
      isPublic = false,
      creator,
      onPlay,
      onClick,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          variant="interactive"
          padding="none"
          className={cn('overflow-hidden group cursor-pointer', className)}
          onClick={onClick}
        >
          {/* Cover Image */}
          <div className="relative">
            {coverUrl ? (
              <CardImage
                src={coverUrl}
                alt={`${name} playlist cover`}
                aspectRatio="1/1"
                overlay
                overlayGradient="bottom"
              />
            ) : (
              <div className="aspect-square bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center">
                <Music className="w-16 h-16 text-accent-cyan" />
              </div>
            )}
            
            {/* Play Button */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.();
                }}
                className="w-12 h-12 rounded-full bg-accent-cyan/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent-cyan hover:scale-110 transition-all shadow-glow-cyan"
              >
                <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
              </button>
            </div>

            {/* Public/Private Badge */}
            <CardBadge
              variant={isPublic ? 'green' : 'default'}
              position="top-right"
              size="sm"
            >
              {isPublic ? 'Public' : 'Private'}
            </CardBadge>
          </div>

          {/* Content */}
          <div className="mt-4">
            <h3 className="text-base font-semibold text-white truncate mb-1">{name}</h3>
            {description && (
              <p className="text-sm text-text-secondary line-clamp-2 mb-2">{description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{trackCount} {trackCount === 1 ? 'track' : 'tracks'}</span>
              {creator && (
                <>
                  <span>•</span>
                  <span className="truncate">{creator}</span>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
);
PlaylistCard.displayName = 'PlaylistCard';

// ============================================================================
// ArtistCard Component
// ============================================================================

export interface ArtistCardProps {
  name: string;
  genre?: string;
  followers?: number;
  imageUrl?: string;
  isFollowing?: boolean;
  onFollow?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ArtistCard = React.forwardRef<HTMLDivElement, ArtistCardProps>(
  (
    {
      name,
      genre,
      followers,
      imageUrl,
      isFollowing = false,
      onFollow,
      onClick,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          variant="interactive"
          padding="lg"
          className={cn('text-center group', className)}
          onClick={onClick}
        >
          {/* Artist Image */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-accent-cyan/50 transition-colors"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-magenta/20 to-accent-purple/20 flex items-center justify-center border-2 border-white/10">
                <Users className="w-12 h-12 text-accent-magenta" />
              </div>
            )}
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
          {genre && (
            <p className="text-sm text-text-secondary mb-2">{genre}</p>
          )}
          {followers !== undefined && (
            <p className="text-xs text-gray-500 mb-4">
              {followers.toLocaleString()} followers
            </p>
          )}

          {/* Follow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow?.();
            }}
            className={cn(
              'px-6 py-2 rounded-full font-medium text-sm transition-all',
              isFollowing
                ? 'bg-bg-tertiary text-white border border-white/20 hover:bg-bg-tertiary/80'
                : 'bg-accent-cyan text-black hover:bg-accent-cyan/90 shadow-glow-cyan'
            )}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </Card>
      </motion.div>
    );
  }
);
ArtistCard.displayName = 'ArtistCard';

// ============================================================================
// AlbumCard Component
// ============================================================================

export interface AlbumCardProps {
  title: string;
  artist: string;
  year?: number;
  trackCount?: number;
  coverUrl?: string;
  onPlay?: () => void;
  onClick?: () => void;
  className?: string;
}

export const AlbumCard = React.forwardRef<HTMLDivElement, AlbumCardProps>(
  (
    {
      title,
      artist,
      year,
      trackCount,
      coverUrl,
      onPlay,
      onClick,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          variant="interactive"
          padding="none"
          className={cn('overflow-hidden group', className)}
          onClick={onClick}
        >
          {/* Cover Image */}
          <div className="relative">
            {coverUrl ? (
              <CardImage
                src={coverUrl}
                alt={`${title} album cover`}
                aspectRatio="1/1"
                overlay
                overlayGradient="bottom"
              />
            ) : (
              <div className="aspect-square bg-gradient-to-br from-accent-yellowGold/20 to-accent-orange/20 flex items-center justify-center">
                <Music className="w-16 h-16 text-accent-yellowGold" />
              </div>
            )}
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.();
                }}
                className="w-14 h-14 rounded-full bg-accent-cyan/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent-cyan hover:scale-110 transition-all shadow-glow-cyan"
              >
                <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
              </button>
            </div>

            {/* Year Badge */}
            {year && (
              <CardBadge variant="primary" position="top-right" size="sm">
                {year}
              </CardBadge>
            )}
          </div>

          {/* Content */}
          <div className="mt-4">
            <h3 className="text-base font-semibold text-white truncate mb-1">{title}</h3>
            <p className="text-sm text-text-secondary truncate mb-2">{artist}</p>
            {trackCount && (
              <p className="text-xs text-gray-500">
                {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }
);
AlbumCard.displayName = 'AlbumCard';

// ============================================================================
// Exports
// ============================================================================

export default {
  MusicCard,
  StatCard,
  PlaylistCard,
  ArtistCard,
  AlbumCard,
};
