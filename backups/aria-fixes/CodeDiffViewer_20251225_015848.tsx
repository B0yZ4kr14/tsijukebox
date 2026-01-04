import React, { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Button } from './button';
import { Badge } from './badge';
import { Columns, Rows, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CodeDiffViewerProps {
  oldCode: string;
  newCode: string;
  oldTitle?: string;
  newTitle?: string;
  language?: string;
  className?: string;
  maxHeight?: string;
}

// Custom dark theme matching our design system
const customDarkTheme = {
  variables: {
    dark: {
      diffViewerBackground: 'hsl(222.2 84% 4.9%)',
      diffViewerColor: 'hsl(210 40% 98%)',
      addedBackground: 'hsla(142.1 76.2% 36.3% / 0.15)',
      addedColor: 'hsl(142.1 70.6% 45.3%)',
      removedBackground: 'hsla(0 84.2% 60.2% / 0.15)',
      removedColor: 'hsl(0 84.2% 60.2%)',
      wordAddedBackground: 'hsla(142.1 76.2% 36.3% / 0.3)',
      wordRemovedBackground: 'hsla(0 84.2% 60.2% / 0.3)',
      addedGutterBackground: 'hsla(142.1 76.2% 36.3% / 0.2)',
      removedGutterBackground: 'hsla(0 84.2% 60.2% / 0.2)',
      gutterBackground: 'hsl(222.2 47.4% 11.2%)',
      gutterBackgroundDark: 'hsl(222.2 47.4% 8%)',
      highlightBackground: 'hsla(217.2 91.2% 59.8% / 0.15)',
      highlightGutterBackground: 'hsla(217.2 91.2% 59.8% / 0.2)',
      codeFoldGutterBackground: 'hsl(222.2 47.4% 11.2%)',
      codeFoldBackground: 'hsl(222.2 47.4% 11.2%)',
      emptyLineBackground: 'hsl(222.2 47.4% 11.2%)',
      gutterColor: 'hsl(215.4 16.3% 46.9%)',
      addedGutterColor: 'hsl(142.1 70.6% 45.3%)',
      removedGutterColor: 'hsl(0 84.2% 60.2%)',
      codeFoldContentColor: 'hsl(215.4 16.3% 46.9%)',
      diffViewerTitleBackground: 'hsl(222.2 47.4% 11.2%)',
      diffViewerTitleColor: 'hsl(210 40% 98%)',
      diffViewerTitleBorderColor: 'hsl(217.2 32.6% 17.5%)',
    },
  },
  line: {
    padding: '4px 8px',
    fontSize: '13px',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  gutter: {
    minWidth: '40px',
    padding: '0 8px',
    fontSize: '12px',
  },
  marker: {
    padding: '0 6px',
  },
  content: {
    width: 'auto',
  },
  codeFold: {
    fontSize: '12px',
    fontWeight: '500',
  },
};

export function CodeDiffViewer({
  oldCode,
  newCode,
  oldTitle = 'Original',
  newTitle = 'Refatorado',
  className,
  maxHeight = '500px',
}: CodeDiffViewerProps) {
  const [splitView, setSplitView] = useState(true);
  const [copied, setCopied] = useState<'old' | 'new' | null>(null);

  // Calculate diff stats
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  
  // Simple line diff calculation
  const linesAdded = newLines.filter(line => !oldLines.includes(line)).length;
  const linesRemoved = oldLines.filter(line => !newLines.includes(line)).length;

  const handleCopy = async (code: string, type: 'old' | 'new') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      toast.success(`Código ${type === 'old' ? 'original' : 'refatorado'} copiado!`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Falha ao copiar código');
    }
  };

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">Comparação de Código</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
              +{linesAdded} linhas
            </Badge>
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
              -{linesRemoved} linhas
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={splitView ? 'default' : 'outline'}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setSplitView(true)}
          >
            <Columns className="h-3 w-3" />
            Split
          </Button>
          <Button
            variant={!splitView ? 'default' : 'outline'}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setSplitView(false)}
          >
            <Rows className="h-3 w-3" />
            Unified
          </Button>
        </div>
      </div>
      
      {/* Copy buttons for each side */}
      {splitView && (
        <div className="flex border-b">
          <div className="flex-1 flex items-center justify-between px-3 py-1.5 border-r bg-muted/20">
            <span className="text-xs text-muted-foreground">{oldTitle}</span>
            <Button
              variant="ghost"
              size="xs"
              className="h-6 w-6"
              onClick={() => handleCopy(oldCode, 'old')}
            >
              {copied === 'old' ? (
                <Check aria-hidden="true" className="h-3 w-3 text-success" />
              ) : (
                <Copy aria-hidden="true" className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-muted/20">
            <span className="text-xs text-muted-foreground">{newTitle}</span>
            <Button
              variant="ghost"
              size="xs"
              className="h-6 w-6"
              onClick={() => handleCopy(newCode, 'new')}
            >
              {copied === 'new' ? (
                <Check aria-hidden="true" className="h-3 w-3 text-success" />
              ) : (
                <Copy aria-hidden="true" className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Diff viewer */}
      <div 
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <ReactDiffViewer
          oldValue={oldCode}
          newValue={newCode}
          splitView={splitView}
          compareMethod={DiffMethod.WORDS}
          useDarkTheme
          styles={customDarkTheme}
          leftTitle={!splitView ? oldTitle : undefined}
          rightTitle={!splitView ? newTitle : undefined}
          showDiffOnly={false}
          extraLinesSurroundingDiff={3}
        />
      </div>
    </div>
  );
}
