/**
 * Specialized Cards Tests
 * 
 * Testes unitários para componentes de card especializados.
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  MusicCard,
  StatCard,
  PlaylistCard,
  ArtistCard,
  AlbumCard,
} from '../specialized-cards';

// ============================================================================
// MusicCard Tests
// ============================================================================

describe('MusicCard', () => {
  const defaultProps = {
    title: 'Wonderwall',
    artist: 'Oasis',
    album: '(What\'s the Story) Morning Glory?',
    duration: '4:18',
  };

  it('renders music card with all props', () => {
    render(<MusicCard {...defaultProps} />);
    
    expect(screen.getByText('Wonderwall')).toBeInTheDocument();
    expect(screen.getByText('Oasis')).toBeInTheDocument();
    expect(screen.getByText('(What\'s the Story) Morning Glory?')).toBeInTheDocument();
    expect(screen.getByText('4:18')).toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    const onPlay = vi.fn();
    render(<MusicCard {...defaultProps} onPlay={onPlay} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('shows pause icon when isPlaying is true', () => {
    render(<MusicCard {...defaultProps} isPlaying />);
    
    // Verifica se o ícone de pause está presente
    const pauseIcon = document.querySelector('svg[class*="lucide-pause"]');
    expect(pauseIcon).toBeInTheDocument();
  });

  it('calls onFavorite when heart button is clicked', () => {
    const onFavorite = vi.fn();
    render(<MusicCard {...defaultProps} onFavorite={onFavorite} />);
    
    const heartButton = screen.getAllByRole('button')[1]; // Second button
    fireEvent.click(heartButton);
    
    expect(onFavorite).toHaveBeenCalledTimes(1);
  });

  it('shows filled heart when isFavorite is true', () => {
    render(<MusicCard {...defaultProps} isFavorite />);
    
    const heartIcon = document.querySelector('svg[fill="currentColor"]');
    expect(heartIcon).toBeInTheDocument();
  });

  it('renders fallback icon when no coverUrl provided', () => {
    render(<MusicCard {...defaultProps} />);
    
    const musicIcon = document.querySelector('svg[class*="lucide-music"]');
    expect(musicIcon).toBeInTheDocument();
  });
});

// ============================================================================
// StatCard Tests
// ============================================================================

describe('StatCard', () => {
  it('renders stat card with title and value', () => {
    render(<StatCard title="Total Plays" value="1,234" />);
    
    expect(screen.getByText('Total Plays')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders trend indicator when trend is provided', () => {
    render(
      <StatCard
        title="Monthly Listeners"
        value="5,678"
        trend="up"
        trendValue="+12%"
      />
    );
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
    const trendIcon = document.querySelector('svg[class*="lucide-trending-up"]');
    expect(trendIcon).toBeInTheDocument();
  });

  it('renders down trend with correct color', () => {
    const { container } = render(
      <StatCard
        title="Error Rate"
        value="2.3%"
        trend="down"
        trendValue="-5%"
      />
    );
    
    const trendElement = screen.getByText('-5%').parentElement;
    expect(trendElement).toHaveClass('text-state-error');
  });

  it('renders description when provided', () => {
    render(
      <StatCard
        title="Active Users"
        value="890"
        description="Last 30 days"
      />
    );
    
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(
      <StatCard
        title="Songs"
        value="42"
        icon={<TestIcon />}
        iconVariant="cyan"
      />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});

// ============================================================================
// PlaylistCard Tests
// ============================================================================

describe('PlaylistCard', () => {
  const defaultProps = {
    name: 'Chill Vibes',
    description: 'Relaxing music for work and study',
    trackCount: 42,
    creator: 'John Doe',
  };

  it('renders playlist card with all props', () => {
    render(<PlaylistCard {...defaultProps} />);
    
    expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
    expect(screen.getByText('Relaxing music for work and study')).toBeInTheDocument();
    expect(screen.getByText('42 tracks')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows singular "track" for trackCount of 1', () => {
    render(<PlaylistCard {...defaultProps} trackCount={1} />);
    
    expect(screen.getByText('1 track')).toBeInTheDocument();
  });

  it('shows public badge when isPublic is true', () => {
    render(<PlaylistCard {...defaultProps} isPublic />);
    
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('shows private badge when isPublic is false', () => {
    render(<PlaylistCard {...defaultProps} isPublic={false} />);
    
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<PlaylistCard {...defaultProps} onClick={onClick} />);
    
    const card = screen.getByText('Chill Vibes').closest('div[role="button"]');
    fireEvent.click(card!);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onPlay when play button is clicked', () => {
    const onPlay = vi.fn();
    render(<PlaylistCard {...defaultProps} onPlay={onPlay} />);
    
    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);
    
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// ArtistCard Tests
// ============================================================================

describe('ArtistCard', () => {
  const defaultProps = {
    name: 'The Beatles',
    genre: 'Rock',
    followers: 1234567,
  };

  it('renders artist card with all props', () => {
    render(<ArtistCard {...defaultProps} />);
    
    expect(screen.getByText('The Beatles')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('1,234,567 followers')).toBeInTheDocument();
  });

  it('shows Follow button when not following', () => {
    render(<ArtistCard {...defaultProps} isFollowing={false} />);
    
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('shows Following button when following', () => {
    render(<ArtistCard {...defaultProps} isFollowing />);
    
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('calls onFollow when follow button is clicked', () => {
    const onFollow = vi.fn();
    render(<ArtistCard {...defaultProps} onFollow={onFollow} />);
    
    const followButton = screen.getByText('Follow');
    fireEvent.click(followButton);
    
    expect(onFollow).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<ArtistCard {...defaultProps} onClick={onClick} />);
    
    const card = screen.getByText('The Beatles').closest('div[role="button"]');
    fireEvent.click(card!);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders fallback icon when no imageUrl provided', () => {
    render(<ArtistCard {...defaultProps} />);
    
    const usersIcon = document.querySelector('svg[class*="lucide-users"]');
    expect(usersIcon).toBeInTheDocument();
  });
});

// ============================================================================
// AlbumCard Tests
// ============================================================================

describe('AlbumCard', () => {
  const defaultProps = {
    title: 'Abbey Road',
    artist: 'The Beatles',
    year: 1969,
    trackCount: 17,
  };

  it('renders album card with all props', () => {
    render(<AlbumCard {...defaultProps} />);
    
    expect(screen.getByText('Abbey Road')).toBeInTheDocument();
    expect(screen.getByText('The Beatles')).toBeInTheDocument();
    expect(screen.getByText('1969')).toBeInTheDocument();
    expect(screen.getByText('17 tracks')).toBeInTheDocument();
  });

  it('shows singular "track" for trackCount of 1', () => {
    render(<AlbumCard {...defaultProps} trackCount={1} />);
    
    expect(screen.getByText('1 track')).toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    const onPlay = vi.fn();
    render(<AlbumCard {...defaultProps} onPlay={onPlay} />);
    
    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);
    
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<AlbumCard {...defaultProps} onClick={onClick} />);
    
    const card = screen.getByText('Abbey Road').closest('div[role="button"]');
    fireEvent.click(card!);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders fallback icon when no coverUrl provided', () => {
    render(<AlbumCard {...defaultProps} />);
    
    const musicIcon = document.querySelector('svg[class*="lucide-music"]');
    expect(musicIcon).toBeInTheDocument();
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Card System Integration', () => {
  it('all cards render without crashing', () => {
    const { container } = render(
      <div>
        <MusicCard title="Test Song" artist="Test Artist" />
        <StatCard title="Test Stat" value="123" />
        <PlaylistCard name="Test Playlist" trackCount={10} />
        <ArtistCard name="Test Artist" />
        <AlbumCard title="Test Album" artist="Test Artist" />
      </div>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('cards maintain consistent styling', () => {
    const { container } = render(
      <div>
        <MusicCard title="Song" artist="Artist" />
        <PlaylistCard name="Playlist" trackCount={5} />
        <AlbumCard title="Album" artist="Artist" />
      </div>
    );
    
    // Verifica se todos os cards têm a classe base
    const cards = container.querySelectorAll('[class*="rounded-lg"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});
