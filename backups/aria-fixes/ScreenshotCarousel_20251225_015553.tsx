import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/themed";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { cn } from "@/lib/utils";

const screenshots = [
  { variant: "dashboard" as const, title: "Dashboard", description: "Visão geral completa" },
  { variant: "player" as const, title: "Player", description: "Reprodução imersiva" },
  { variant: "settings" as const, title: "Configurações", description: "Personalização total" },
  { variant: "stats" as const, title: "Estatísticas", description: "Insights detalhados" },
];

export function ScreenshotCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {screenshots.map((screenshot, index) => (
            <div
              key={screenshot.variant}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_80%] lg:flex-[0_0_60%] px-4"
            >
              <div 
                className={cn(
                  "transition-all duration-300",
                  selectedIndex === index ? "scale-100 opacity-100" : "scale-95 opacity-50"
                )}
              >
                <ScreenshotPreview variant={screenshot.variant} theme="dark" />
                <div className="text-center mt-4">
                  <h4 className="font-semibold text-foreground">{screenshot.title}</h4>
                  <p className="text-sm text-muted-foreground">{screenshot.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="xs"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border hover:bg-background"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <ChevronLeft aria-hidden="true" className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border hover:bg-background"
        onClick={scrollNext}
        disabled={!canScrollNext}
      >
        <ChevronRight aria-hidden="true" className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {screenshots.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              selectedIndex === index 
                ? "w-8 bg-primary" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
