import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from './button';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  code: string;
  language?: 'python' | 'typescript' | 'javascript' | 'json' | 'yaml' | 'bash' | 'sql';
  fileName?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  onCopy?: () => void;
}

export function CodePreview({
  code,
  language = 'python',
  fileName,
  showLineNumbers = true,
  maxHeight = '400px',
  className,
  onCopy,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Código copiado!');
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Falha ao copiar código');
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className={cn('relative rounded-lg border bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-success/70" />
          </div>
          {fileName && (
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {fileName}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {lineCount} linhas
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)} aria-label="Minimizar">
            {isExpanded ? (
              <Minimize2 aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="h-7 w-7"
            onClick={handleCopy} aria-label="Confirmar">
            {copied ? (
              <Check aria-hidden="true" className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy aria-hidden="true" className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Code */}
      <div 
        className="overflow-auto"
        style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
      >
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: '1.5',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: 'hsl(var(--muted-foreground))',
            opacity: 0.5,
          }}
          wrapLines
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
