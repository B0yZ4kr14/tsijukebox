// Miscellaneous components templates - 5 files
// Tour, Debug, Help, System, Upload components

const VERSION = '4.2.0';

export function generateComponentsMiscContent(path: string): string | null {
  const now = new Date().toISOString();

  switch (path) {
    case 'src/components/tour/GuidedTour.tsx':
      return `// Guided Tour Component
// Version: ${VERSION}
// Last updated: ${now}

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ steps, isActive, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    if (!isActive || !steps[currentStep]) return;
    const element = document.querySelector(steps[currentStep].target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isActive || !targetRect) return null;

  const step = steps[currentStep];
  const position = step.position || 'bottom';

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    ...(position === 'bottom' && {
      top: targetRect.bottom + 16,
      left: targetRect.left + targetRect.width / 2,
      transform: 'translateX(-50%)',
    }),
    ...(position === 'top' && {
      bottom: window.innerHeight - targetRect.top + 16,
      left: targetRect.left + targetRect.width / 2,
      transform: 'translateX(-50%)',
    }),
    ...(position === 'left' && {
      top: targetRect.top + targetRect.height / 2,
      right: window.innerWidth - targetRect.left + 16,
      transform: 'translateY(-50%)',
    }),
    ...(position === 'right' && {
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.right + 16,
      transform: 'translateY(-50%)',
    }),
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onSkip}
      />
      
      {/* Highlight */}
      <div
        className="fixed z-[9998] ring-4 ring-primary rounded-lg pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <Card style={tooltipStyle} className="w-80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{step.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onSkip}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{step.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Finish'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>,
    document.body
  );
}

export default GuidedTour;
`;

    case 'src/components/debug/ContrastDebugPanel.tsx':
      return `// Contrast Debug Panel Component
// Version: ${VERSION}
// Last updated: ${now}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface ContrastResult {
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'Fail';
}

export function ContrastDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [results, setResults] = useState<ContrastResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const calculateContrast = (fg: string, bg: string): number => {
    // Simplified contrast calculation
    return 4.5; // Placeholder
  };

  const getLevel = (ratio: number): 'AAA' | 'AA' | 'A' | 'Fail' => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'A';
    return 'Fail';
  };

  const scanPage = () => {
    setIsScanning(true);
    // Simulated scan
    setTimeout(() => {
      setResults([
        { element: 'h1', foreground: '#000', background: '#fff', ratio: 21, level: 'AAA' },
        { element: '.card', foreground: '#333', background: '#f5f5f5', ratio: 8.5, level: 'AAA' },
        { element: '.muted', foreground: '#888', background: '#fff', ratio: 3.5, level: 'A' },
      ]);
      setIsScanning(false);
    }, 1000);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Contrast Debug</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={scanPage} disabled={isScanning}>
            <RefreshCw className={cn("h-4 w-4", isScanning && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto">
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click refresh to scan the page
          </p>
        ) : (
          <div className="space-y-2">
            {results.map((result, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs font-mono">{result.element}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{result.ratio.toFixed(1)}:1</span>
                  <Badge 
                    variant={result.level === 'Fail' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {result.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContrastDebugPanel;
`;

    case 'src/components/help/InteractiveTestMode.tsx':
      return `// Interactive Test Mode Component
// Version: ${VERSION}
// Last updated: ${now}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

interface InteractiveTestModeProps {
  testCases: TestCase[];
  onRunTest: (testId: string) => Promise<boolean>;
  onRunAll: () => Promise<void>;
}

export function InteractiveTestMode({ testCases, onRunTest, onRunAll }: InteractiveTestModeProps) {
  const [tests, setTests] = useState<TestCase[]>(testCases);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ));
    
    const passed = await onRunTest(testId);
    
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: passed ? 'passed' : 'failed' } : t
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    await onRunAll();
    setIsRunning(false);
  };

  const resetTests = () => {
    setTests(testCases.map(t => ({ ...t, status: 'pending' })));
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interactive Test Mode</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetTests}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={runAllTests} disabled={isRunning}>
            {isRunning ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map(test => (
            <div 
              key={test.id} 
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => runTest(test.id)}
                disabled={test.status === 'running'}
              >
                Run
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-4 pt-4 border-t">
          <Badge variant="default">
            Passed: {tests.filter(t => t.status === 'passed').length}
          </Badge>
          <Badge variant="destructive">
            Failed: {tests.filter(t => t.status === 'failed').length}
          </Badge>
          <Badge variant="secondary">
            Pending: {tests.filter(t => t.status === 'pending').length}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default InteractiveTestMode;
`;

    case 'src/components/system/TraceViewer.tsx':
      return `// Trace Viewer Component
// Version: ${VERSION}
// Last updated: ${now}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download } from 'lucide-react';

interface TraceSpan {
  id: string;
  name: string;
  service: string;
  duration: number;
  timestamp: string;
  status: 'ok' | 'error';
  children?: TraceSpan[];
}

interface TraceViewerProps {
  traces: TraceSpan[];
  onExport?: () => void;
}

export function TraceViewer({ traces, onExport }: TraceViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set());

  const toggleSpan = (spanId: string) => {
    setExpandedSpans(prev => {
      const next = new Set(prev);
      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }
      return next;
    });
  };

  const renderSpan = (span: TraceSpan, depth: number = 0) => {
    const hasChildren = span.children && span.children.length > 0;
    const isExpanded = expandedSpans.has(span.id);

    return (
      <div key={span.id}>
        <div 
          className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
          style={{ paddingLeft: \`\${depth * 24 + 8}px\` }}
          onClick={() => hasChildren && toggleSpan(span.id)}
        >
          {hasChildren && (
            <span className="text-muted-foreground">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <Badge variant={span.status === 'ok' ? 'default' : 'destructive'} className="text-xs">
            {span.status}
          </Badge>
          <span className="font-mono text-sm">{span.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {span.duration}ms
          </span>
        </div>
        {hasChildren && isExpanded && span.children?.map(child => renderSpan(child, depth + 1))}
      </div>
    );
  };

  const filteredTraces = traces.filter(trace =>
    trace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trace.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trace Viewer</CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search traces..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-96">
          <div className="space-y-1">
            {filteredTraces.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No traces found</p>
            ) : (
              filteredTraces.map(trace => renderSpan(trace))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TraceViewer;
`;

    case 'src/components/upload/AudioWaveformPreview.tsx':
      return `// Audio Waveform Preview Component
// Version: ${VERSION}
// Last updated: ${now}

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioWaveformPreviewProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function AudioWaveformPreview({ audioUrl, onTimeUpdate }: AudioWaveformPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Generate sample waveform data
    const data = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(data);
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / waveformData.length;
    const playedBars = Math.floor((currentTime / duration) * waveformData.length);

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = index < playedBars ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveformData, currentTime, duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const vol = value[0];
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    onTimeUpdate?.(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20 cursor-pointer"
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            audioRef.current.currentTime = percent * duration;
          }}
        />
        
        <div className="flex items-center gap-4 mt-4">
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <span className="text-sm font-mono min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AudioWaveformPreview;
`;

    default:
      return null;
  }
}
