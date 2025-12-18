import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  Hand, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Play,
  Pause,
  Volume2,
  SkipForward,
  SkipBack,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KeyEvent {
  key: string;
  code: string;
  action: string;
  timestamp: Date;
  success: boolean;
}

interface GestureEvent {
  direction: 'left' | 'right' | 'up' | 'down' | 'none';
  deltaX: number;
  deltaY: number;
  duration: number;
  timestamp: Date;
  valid: boolean;
  action: string;
}

interface InteractiveTestModeProps {
  mode: 'keyboard' | 'gestures';
  onClose: () => void;
}

const VALID_KEYS: Record<string, { action: string; icon: React.ReactNode }> = {
  ' ': { action: 'Play/Pause', icon: <Play className="w-4 h-4" /> },
  'Space': { action: 'Play/Pause', icon: <Play className="w-4 h-4" /> },
  'ArrowUp': { action: 'Volume +5%', icon: <Volume2 className="w-4 h-4" /> },
  'ArrowDown': { action: 'Volume -5%', icon: <Volume2 className="w-4 h-4" /> },
  'ArrowLeft': { action: 'Música Anterior', icon: <SkipBack className="w-4 h-4" /> },
  'ArrowRight': { action: 'Próxima Música', icon: <SkipForward className="w-4 h-4" /> },
  '+': { action: 'Volume +5%', icon: <Volume2 className="w-4 h-4" /> },
  '-': { action: 'Volume -5%', icon: <Volume2 className="w-4 h-4" /> },
};

const GESTURE_THRESHOLD = 50;

export function InteractiveTestMode({ mode, onClose }: InteractiveTestModeProps) {
  const [keyEvents, setKeyEvents] = useState<KeyEvent[]>([]);
  const [gestureEvents, setGestureEvents] = useState<GestureEvent[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [currentGesture, setCurrentGesture] = useState<{ startX: number; startY: number; startTime: number } | null>(null);
  const [gestureVisual, setGestureVisual] = useState<{ x: number; y: number } | null>(null);
  const touchAreaRef = useRef<HTMLDivElement>(null);

  // Keyboard Test Mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const keyCode = e.code === 'Space' ? ' ' : e.key;
    const keyInfo = VALID_KEYS[e.code] || VALID_KEYS[keyCode];
    
    setActiveKeys(prev => new Set(prev).add(e.code));
    
    const newEvent: KeyEvent = {
      key: e.key === ' ' ? 'Espaço' : e.key,
      code: e.code,
      action: keyInfo?.action || 'Não reconhecido',
      timestamp: new Date(),
      success: !!keyInfo
    };
    
    setKeyEvents(prev => [newEvent, ...prev].slice(0, 20));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });
  }, []);

  // Gesture Test Mode
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setCurrentGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    });
    setGestureVisual({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setGestureVisual({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!currentGesture) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - currentGesture.startX;
    const deltaY = touch.clientY - currentGesture.startY;
    const duration = Date.now() - currentGesture.startTime;
    
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    const distance = isHorizontal ? Math.abs(deltaX) : Math.abs(deltaY);
    const valid = distance >= GESTURE_THRESHOLD;
    
    let direction: GestureEvent['direction'] = 'none';
    let action = 'Movimento muito curto';
    
    if (valid) {
      if (isHorizontal) {
        direction = deltaX > 0 ? 'right' : 'left';
        action = deltaX > 0 ? 'Música Anterior' : 'Próxima Música';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
        action = 'Gesto vertical (não utilizado)';
      }
    }
    
    const newEvent: GestureEvent = {
      direction,
      deltaX: Math.round(deltaX),
      deltaY: Math.round(deltaY),
      duration,
      timestamp: new Date(),
      valid: valid && isHorizontal,
      action
    };
    
    setGestureEvents(prev => [newEvent, ...prev].slice(0, 15));
    setCurrentGesture(null);
    setGestureVisual(null);
  }, [currentGesture]);

  // Attach keyboard listeners
  useEffect(() => {
    if (mode === 'keyboard') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [mode, handleKeyDown, handleKeyUp]);

  const clearHistory = () => {
    if (mode === 'keyboard') {
      setKeyEvents([]);
    } else {
      setGestureEvents([]);
    }
  };

  const stats = mode === 'keyboard' 
    ? { valid: keyEvents.filter(e => e.success).length, invalid: keyEvents.filter(e => !e.success).length }
    : { valid: gestureEvents.filter(e => e.valid).length, invalid: gestureEvents.filter(e => !e.valid).length };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden card-extreme-3d bg-kiosk-surface">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-gold-neon">
              {mode === 'keyboard' ? (
                <Keyboard className="w-6 h-6 icon-neon-blue" />
              ) : (
                <Hand className="w-6 h-6 icon-neon-blue" />
              )}
              {mode === 'keyboard' ? 'Teste de Atalhos de Teclado' : 'Teste de Gestos de Toque'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {mode === 'keyboard' ? (
            <>
              {/* Keyboard Visual */}
              <div className="p-6 rounded-xl bg-kiosk-bg border border-border">
                <p className="text-center text-kiosk-text/90 mb-6">
                  Pressione qualquer tecla de atalho para testar
                </p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'].map((key) => (
                    <motion.div
                      key={key}
                      animate={{ 
                        scale: activeKeys.has(key) ? 0.9 : 1,
                        backgroundColor: activeKeys.has(key) ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                      }}
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-kiosk-text font-mono text-lg shadow-lg"
                    >
                      {key === 'ArrowLeft' && <ArrowLeft className="w-6 h-6" />}
                      {key === 'ArrowUp' && <ArrowUp className="w-6 h-6" />}
                      {key === 'ArrowDown' && <ArrowDown className="w-6 h-6" />}
                      {key === 'ArrowRight' && <ArrowRight className="w-6 h-6" />}
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <motion.div
                    animate={{ 
                      scale: activeKeys.has('Space') ? 0.95 : 1,
                      backgroundColor: activeKeys.has('Space') ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                    }}
                    className="w-48 h-14 rounded-lg flex items-center justify-center text-kiosk-text font-mono shadow-lg"
                  >
                    {activeKeys.has('Space') ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    <span className="ml-2">Espaço</span>
                  </motion.div>
                </div>
                
                <div className="flex justify-center gap-4 mt-4">
                  <motion.div
                    animate={{ 
                      scale: activeKeys.has('Equal') || activeKeys.has('NumpadAdd') ? 0.9 : 1,
                      backgroundColor: activeKeys.has('Equal') || activeKeys.has('NumpadAdd') ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                    }}
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-kiosk-text font-mono text-2xl shadow-lg"
                  >
                    +
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: activeKeys.has('Minus') || activeKeys.has('NumpadSubtract') ? 0.9 : 1,
                      backgroundColor: activeKeys.has('Minus') || activeKeys.has('NumpadSubtract') ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                    }}
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-kiosk-text font-mono text-2xl shadow-lg"
                  >
                    -
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Gesture Touch Area */}
              <div 
                ref={touchAreaRef}
                className="relative h-64 rounded-xl bg-kiosk-bg border-2 border-dashed border-primary/30 overflow-hidden touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4 text-kiosk-text/40">
                      <ChevronLeft className="w-8 h-8 animate-pulse" />
                      <Hand className="w-12 h-12" />
                      <ChevronRight className="w-8 h-8 animate-pulse" />
                    </div>
                    <p className="text-kiosk-text/90">Deslize horizontalmente para testar</p>
                    <p className="text-xs text-kiosk-text/85">Mínimo: {GESTURE_THRESHOLD}px</p>
                  </div>
                </div>
                
                {/* Gesture Visual Indicator */}
                <AnimatePresence>
                  {gestureVisual && currentGesture && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute pointer-events-none"
                      style={{
                        left: currentGesture.startX - (touchAreaRef.current?.getBoundingClientRect().left || 0),
                        top: currentGesture.startY - (touchAreaRef.current?.getBoundingClientRect().top || 0),
                      }}
                    >
                      <svg width="200" height="200" style={{ transform: 'translate(-100px, -100px)' }}>
                        <line
                          x1="100"
                          y1="100"
                          x2={100 + (gestureVisual.x - currentGesture.startX)}
                          y2={100 + (gestureVisual.y - currentGesture.startY)}
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="100" cy="100" r="8" fill="hsl(var(--primary))" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Last Gesture Metrics */}
              {gestureEvents[0] && (
                <div className="grid grid-cols-4 gap-3 p-4 rounded-lg bg-kiosk-bg">
                  <div className="text-center">
                    <p className="text-xs text-kiosk-text/90">Direção</p>
                    <p className="text-sm font-medium text-kiosk-text">
                      {gestureEvents[0].direction === 'left' && '← Esquerda'}
                      {gestureEvents[0].direction === 'right' && '→ Direita'}
                      {gestureEvents[0].direction === 'up' && '↑ Cima'}
                      {gestureEvents[0].direction === 'down' && '↓ Baixo'}
                      {gestureEvents[0].direction === 'none' && '- Nenhuma'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-kiosk-text/90">Delta X</p>
                    <p className={`text-sm font-medium ${Math.abs(gestureEvents[0].deltaX) >= GESTURE_THRESHOLD ? 'text-green-400' : 'text-kiosk-text'}`}>
                      {gestureEvents[0].deltaX}px
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-kiosk-text/90">Delta Y</p>
                    <p className="text-sm font-medium text-kiosk-text">{gestureEvents[0].deltaY}px</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-kiosk-text/90">Duração</p>
                    <p className="text-sm font-medium text-kiosk-text">{gestureEvents[0].duration}ms</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Statistics */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-bg">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Válidos: {stats.valid}
              </Badge>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                <XCircle className="w-3 h-3 mr-1" />
                Inválidos: {stats.invalid}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>
          
          {/* Event History */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-label-yellow">Histórico de Eventos</h3>
            <ScrollArea className="h-48 rounded-lg border border-border">
              <div className="p-2 space-y-1">
                {mode === 'keyboard' ? (
                  keyEvents.length === 0 ? (
                    <p className="text-center text-kiosk-text/85 py-4">Nenhum evento registrado</p>
                  ) : (
                    keyEvents.map((event, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-2 rounded ${
                          event.success ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        {event.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-mono text-sm text-kiosk-text">{event.key}</span>
                        <span className="text-sm text-kiosk-text/90">→ {event.action}</span>
                        <span className="ml-auto text-xs text-kiosk-text/85">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </motion.div>
                    ))
                  )
                ) : (
                  gestureEvents.length === 0 ? (
                    <p className="text-center text-kiosk-text/85 py-4">Nenhum gesto registrado</p>
                  ) : (
                    gestureEvents.map((event, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-2 rounded ${
                          event.valid ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        {event.valid ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-mono text-sm text-kiosk-text">
                          {event.direction === 'left' && '←'}
                          {event.direction === 'right' && '→'}
                          {event.direction === 'up' && '↑'}
                          {event.direction === 'down' && '↓'}
                          {event.direction === 'none' && '·'}
                        </span>
                        <span className="text-sm text-kiosk-text/70">{event.action}</span>
                        <span className="text-xs text-kiosk-text/50">{event.deltaX}px</span>
                        <span className="ml-auto text-xs text-kiosk-text/50">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </motion.div>
                    ))
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
