// Landing Page Components Templates - 6 arquivos

export function generateLandingComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/landing/DemoAnimated.tsx':
      return `import { motion } from 'framer-motion';
import { Music, Play, Users, Zap } from 'lucide-react';

export function DemoAnimated() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-3xl" />
      
      {/* Main Demo Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-muted-foreground ml-2">TSiJUKEBOX</span>
        </div>

        {/* Content */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Left: Now Playing */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="h-24 w-24 text-white/80" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Now Playing</h3>
              <p className="text-muted-foreground">Your favorite music, anywhere</p>
            </div>
          </motion.div>

          {/* Right: Features */}
          <div className="space-y-4">
            {[
              { icon: Play, label: 'Multi-provider streaming', delay: 0.4 },
              { icon: Users, label: 'Collaborative playlists', delay: 0.5 },
              { icon: Zap, label: 'Real-time sync', delay: 0.6 },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: feature.delay }}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
`;

    case 'src/components/landing/FAQSection.tsx':
      return `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is TSiJUKEBOX?',
    answer: 'TSiJUKEBOX is a modern music jukebox application that allows you to stream music from multiple providers, create collaborative playlists, and manage kiosk displays for venues.',
  },
  {
    question: 'Which music providers are supported?',
    answer: 'Currently, we support Spotify and YouTube Music integration. More providers are planned for future releases.',
  },
  {
    question: 'Can I use it for my business?',
    answer: 'Yes! TSiJUKEBOX includes a kiosk mode perfect for bars, restaurants, and other venues. It features touch-friendly controls and can be managed remotely.',
  },
  {
    question: 'Is it open source?',
    answer: 'Yes, TSiJUKEBOX is open source and available on GitHub. Contributions are welcome!',
  },
  {
    question: 'How do Jam Sessions work?',
    answer: 'Jam Sessions allow multiple people to collaborate on a playlist in real-time. The host creates a session, shares a code, and anyone can join to add songs and vote on the queue.',
  },
];

export function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={\`item-\${index}\`}
              className="bg-card border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
`;

    case 'src/components/landing/ScreenshotCarousel.tsx':
      return `import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Screenshot {
  src: string;
  alt: string;
  title: string;
}

interface ScreenshotCarouselProps {
  screenshots: Screenshot[];
  autoPlay?: boolean;
  interval?: number;
}

export function ScreenshotCarousel({
  screenshots,
  autoPlay = true,
  interval = 5000,
}: ScreenshotCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % screenshots.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, screenshots.length]);

  const prev = () => setCurrent((c) => (c - 1 + screenshots.length) % screenshots.length);
  const next = () => setCurrent((c) => (c + 1) % screenshots.length);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Main Image */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-2xl">
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              index === current ? 'opacity-100' : 'opacity-0'
            )}
          >
            <img
              src={screenshot.src}
              alt={screenshot.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-medium">{screenshot.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
        onClick={prev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
        onClick={next}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === current ? 'bg-primary w-6' : 'bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}
`;

    case 'src/components/landing/ScreenshotPreview.tsx':
      return `import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ScreenshotPreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ScreenshotPreview({ src, alt, className }: ScreenshotPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300',
          className
        )}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <img src={src} alt={alt} className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </>
  );
}
`;

    case 'src/components/landing/StatsSection.tsx':
      return `import { useEffect, useState, useRef } from 'react';
import { Users, Music, Headphones, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { icon: Users, value: 10000, suffix: '+', label: 'Active Users' },
  { icon: Music, value: 500000, suffix: '+', label: 'Tracks Played' },
  { icon: Headphones, value: 50000, suffix: '+', label: 'Jam Sessions' },
  { icon: Globe, value: 120, suffix: '+', label: 'Countries' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

    case 'src/components/landing/ThemeComparison.tsx':
      return `import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeComparison() {
  const [position, setPosition] = useState(50);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Light & Dark Themes
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Drag to compare. Works beautifully in any environment.
        </p>

        <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
          {/* Light Theme */}
          <div className="absolute inset-0 bg-white p-8">
            <div className="h-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <Sun className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">Light Theme</p>
              </div>
            </div>
          </div>

          {/* Dark Theme (clipped) */}
          <div
            className="absolute inset-0 bg-gray-950 p-8"
            style={{ clipPath: \`inset(0 0 0 \${position}%)\` }}
          >
            <div className="h-full rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <Moon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-white font-medium">Dark Theme</p>
              </div>
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
            style={{ left: \`\${position}%\` }}
            onMouseDown={(e) => {
              const rect = e.currentTarget.parentElement!.getBoundingClientRect();
              const handleMove = (e: MouseEvent) => {
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                setPosition(Math.max(0, Math.min(100, x)));
              };
              const handleUp = () => {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
              };
              document.addEventListener('mousemove', handleMove);
              document.addEventListener('mouseup', handleUp);
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary shadow-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-primary-foreground rounded" />
                <div className="w-0.5 h-3 bg-primary-foreground rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;

    default:
      return null;
  }
}
