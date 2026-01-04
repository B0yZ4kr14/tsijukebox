import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Mic2, AlignLeft, Music, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LyricsDisplay } from '@/components/player/LyricsDisplay';
import { KaraokeLyrics } from '@/components/player/KaraokeLyrics';
import { FullscreenKaraoke } from '@/components/player/FullscreenKaraoke';
import { useLyrics, useTranslation } from '@/hooks';
import { formatTime } from '@/lib/lrcParser';
import { Link } from 'react-router-dom';

// Demo tracks for testing with album covers
const DEMO_TRACKS = [
  { id: '1', name: 'Bohemian Rhapsody', artist: 'Queen', duration: 354, cover: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png' },
  { id: '2', name: 'Billie Jean', artist: 'Michael Jackson', duration: 294, cover: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png' },
  { id: '3', name: 'Shape of You', artist: 'Ed Sheeran', duration: 234, cover: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Shape_Of_You_%28Official_Single_Cover%29_by_Ed_Sheeran.png' },
  { id: '4', name: 'Blinding Lights', artist: 'The Weeknd', duration: 200, cover: 'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png' },
  { id: '5', name: 'Smells Like Teen Spirit', artist: 'Nirvana', duration: 301, cover: 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg' },
];

type DisplayMode = 'line' | 'karaoke';

export default function LyricsTest() {
  const { t } = useTranslation();
  const [selectedTrack, setSelectedTrack] = useState(DEMO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('line');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch real lyrics
  const { data: lyricsData, isLoading, error } = useLyrics(
    selectedTrack.name,
    selectedTrack.artist
  );
  
  // Simulate playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setPosition((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= selectedTrack.duration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, selectedTrack.duration]);
  
  // Reset position when track changes
  useEffect(() => {
    setPosition(0);
    setIsPlaying(false);
  }, [selectedTrack.id]);
  
  const handleSeek = (value: number[]) => {
    setPosition(value[0]);
  };
  
  const handleReset = () => {
    setPosition(0);
    setIsPlaying(false);
  };
  
  const handlePrevTrack = () => {
    const currentIndex = DEMO_TRACKS.findIndex(t => t.id === selectedTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : DEMO_TRACKS.length - 1;
    setSelectedTrack(DEMO_TRACKS[prevIndex]);
  };
  
  const handleNextTrack = () => {
    const currentIndex = DEMO_TRACKS.findIndex(t => t.id === selectedTrack.id);
    const nextIndex = currentIndex < DEMO_TRACKS.length - 1 ? currentIndex + 1 : 0;
    setSelectedTrack(DEMO_TRACKS[nextIndex]);
  };
  
  return (
    <div className="min-h-screen bg-kiosk-bg p-6">
      {/* Fullscreen Karaoke */}
      <FullscreenKaraoke
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        trackName={selectedTrack.name}
        artistName={selectedTrack.artist}
        albumCover={selectedTrack.cover}
        position={position}
        isPlaying={isPlaying}
      />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                ← {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-kiosk-text">
              {t('lyrics.testPage')}
            </h1>
          </div>
          
          {/* Display Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={displayMode === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDisplayMode('line')}
            >
              <AlignLeft className="w-4 h-4 mr-2" />
              {t('lyrics.lineMode')}
            </Button>
            <Button
              variant={displayMode === 'karaoke' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDisplayMode('karaoke')}
            >
              <Mic2 className="w-4 h-4 mr-2" />
              {t('lyrics.karaokeMode')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              {t('lyrics.fullscreen')}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1 bg-kiosk-surface border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-label-yellow flex items-center gap-2">
                <Music className="w-5 h-5" />
                {t('lyrics.controls')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Track Selector */}
              <div className="space-y-2">
                <label className="text-sm text-kiosk-text/85 font-medium">{t('lyrics.selectTrackLabel')}</label>
                <Select
                  value={selectedTrack.id}
                  onValueChange={(id) => {
                    const track = DEMO_TRACKS.find(t => t.id === id);
                    if (track) setSelectedTrack(track);
                  }}
                >
                  <SelectTrigger className="bg-kiosk-bg border-cyan-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_TRACKS.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name} - {track.artist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Now Playing Info */}
              <div className="p-4 bg-kiosk-bg rounded-lg border border-cyan-500/20">
                <p className="font-semibold text-kiosk-text">{selectedTrack.name}</p>
                <p className="text-sm text-kiosk-text/85">{selectedTrack.artist}</p>
              </div>
              
              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevTrack}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextTrack}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-kiosk-text/85">
                  <span>{formatTime(position)}</span>
                  <span>{formatTime(selectedTrack.duration)}</span>
                </div>
                <Slider
                  value={[position]}
                  max={selectedTrack.duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
              </div>
              
              {/* Playback Speed */}
              <div className="space-y-2">
                <label className="text-sm text-kiosk-text/85">{t('lyrics.speed')}: {playbackSpeed}x</label>
                <Slider
                  value={[playbackSpeed]}
                  min={0.5}
                  max={2}
                  step={0.25}
                  onValueChange={(v) => setPlaybackSpeed(v[0])}
                />
              </div>
              
              {/* Lyrics Info */}
              <div className="space-y-2">
                <p className="text-sm text-kiosk-text/85 font-medium">{t('lyrics.source')}:</p>
                {isLoading ? (
                  <Badge variant="outline">{t('lyrics.loading')}</Badge>
                ) : error ? (
                  <Badge variant="destructive">{t('lyrics.error')}</Badge>
                ) : lyricsData ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{lyricsData.source.toUpperCase()}</Badge>
                    <Badge variant={lyricsData.synced ? 'default' : 'outline'}>
                      {lyricsData.synced ? t('lyrics.synced') : t('lyrics.notSynced')}
                    </Badge>
                    <Badge variant="outline">{lyricsData.lines.length} {t('lyrics.lines')}</Badge>
                  </div>
                ) : (
                  <Badge variant="outline">{t('lyrics.notAvailable')}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Lyrics Display */}
          <Card className="lg:col-span-2 bg-kiosk-surface border-cyan-500/20 min-h-[600px]">
            <CardContent className="p-0 h-full">
              {displayMode === 'line' ? (
                <LyricsDisplay
                  trackId={selectedTrack.id}
                  trackName={selectedTrack.name}
                  artistName={selectedTrack.artist}
                  position={position}
                  isPlaying={isPlaying}
                />
              ) : (
                lyricsData && lyricsData.lines.length > 0 ? (
                  <KaraokeLyrics
                    lines={lyricsData.lines}
                    position={position}
                    className="h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-kiosk-text/85">
                    <div className="text-center">
                      <Mic2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{isLoading ? t('lyrics.loading') : t('lyrics.notAvailable')}</p>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
