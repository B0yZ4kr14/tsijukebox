import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, X, Check, Music, FileAudio } from 'lucide-react';
import { Button } from "@/components/ui/themed";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks';

interface AudioWaveformPreviewProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
}

export function AudioWaveformPreview({ file, isOpen, onClose, onConfirm }: AudioWaveformPreviewProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Generate waveform from audio file
  const analyzeAudio = useCallback(async (audioFile: File) => {
    setIsAnalyzing(true);
    
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      // Sample the audio data for waveform visualization (64 bars)
      const samples = 64;
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }
      
      // Normalize
      const max = Math.max(...waveform);
      const normalized = waveform.map(v => (v / max) * 100);
      
      setWaveformData(normalized);
      setDuration(audioBuffer.duration);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      // Generate placeholder waveform
      setWaveformData(Array.from({ length: 64 }, () => Math.random() * 60 + 20));
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (file && isOpen) {
      analyzeAudio(file);
      
      // Create audio element for playback
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      return () => {
        audio.pause();
        URL.revokeObjectURL(url);
        audioContextRef.current?.close();
      };
    }
  }, [file, isOpen, analyzeAudio]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleConfirm = () => {
    if (file) {
      audioRef.current?.pause();
      onConfirm(file);
    }
  };

  const handleClose = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    onClose();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-kiosk-bg border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gold-neon">
            <FileAudio className="w-5 h-5 icon-neon-blue" />
            {t('upload.audioPreview')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center" aria-hidden="true">
              <Music className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-kiosk-text truncate">{file?.name}</p>
              <div className="flex gap-3 text-sm text-kiosk-text/85 mt-1">
                <span>{formatFileSize(file?.size || 0)}</span>
                <span>•</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="space-y-3">
            <div 
              className="relative h-24 rounded-lg bg-kiosk-surface/30 overflow-hidden cursor-pointer"
              onClick={handleSeek}
            >
              {isAnalyzing ? (
                <div className="absolute inset-0 flex items-center justify-center" role="presentation">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                </div>
              ) : (
                <>
                  {/* Waveform Bars */}
                  <div className="absolute inset-0 flex items-center gap-[2px] px-2" role="presentation">
                    {waveformData.map((height, index) => {
                      const barProgress = (index / waveformData.length) * 100;
                      const isPlayed = barProgress <= progress;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 10)}%` }}
                          transition={{ delay: index * 0.01, duration: 0.3 }}
                          className={`flex-1 rounded-full transition-colors ${
                            isPlayed 
                              ? 'bg-gradient-to-t from-cyan-500 to-cyan-300' 
                              : 'bg-kiosk-text/20'
                          }`}
                          style={{ minHeight: '4px' }}
                        />
                      );
                    })}
                  </div>

                  {/* Progress Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-cyan-500/50"
                    style={{ left: `${progress}%` }}
                  />
                </>
              )}
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-sm text-kiosk-text/85">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={togglePlayback}
              disabled={isAnalyzing}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/30"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X aria-hidden="true" className="w-4 h-4 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isAnalyzing}>
            <Check aria-hidden="true" className="w-4 h-4 mr-2" />
            {t('upload.confirmUpload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
