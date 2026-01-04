import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Code, FileCode, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type WcagCategory = 'decorative' | 'state-change' | 'disabled' | 'secondary';
type CommentFormat = 'inline' | 'multiline' | 'javascript';

interface WcagExceptionCommentProps {
  defaultFile?: string;
  defaultOpacity?: string;
  defaultElement?: string;
  onGenerate?: (comment: string) => void;
}

const OPACITY_OPTIONS = ['/20', '/30', '/40', '/50', '/60', '/70', '/80'];

const CATEGORIES: Record<WcagCategory, { label: string; description: string; color: string }> = {
  decorative: { 
    label: 'Decorativo', 
    description: 'Ícone puramente visual sem informação crítica',
    color: 'text-purple-400'
  },
  'state-change': { 
    label: 'Mudança de Estado', 
    description: 'Elemento com hover/focus que aumenta contraste',
    color: 'text-cyan-400'
  },
  disabled: { 
    label: 'Desabilitado', 
    description: 'Estado desabilitado intencionalmente dimmed',
    color: 'text-gray-400'
  },
  secondary: { 
    label: 'Secundário', 
    description: 'Informação secundária com elemento principal visível',
    color: 'text-amber-400'
  },
};

const FORMAT_OPTIONS: Record<CommentFormat, { label: string; icon: React.ReactNode }> = {
  inline: { label: 'JSX Inline', icon: <Code className="w-4 h-4" /> },
  multiline: { label: 'JSX Multi-linha', icon: <FileCode className="w-4 h-4" /> },
  javascript: { label: 'JS/TS', icon: <Sparkles className="w-4 h-4" /> },
};

export function WcagExceptionComment({ 
  defaultFile = '', 
  defaultOpacity = '/40',
  defaultElement = '',
  onGenerate 
}: WcagExceptionCommentProps) {
  const [file, setFile] = useState(defaultFile);
  const [opacity, setOpacity] = useState(defaultOpacity);
  const [element, setElement] = useState(defaultElement);
  const [justification, setJustification] = useState('');
  const [category, setCategory] = useState<WcagCategory>('decorative');
  const [hasHoverState, setHasHoverState] = useState(false);
  const [hoverColor, setHoverColor] = useState('');
  const [format, setFormat] = useState<CommentFormat>('inline');
  const [copied, setCopied] = useState(false);

  const generateComment = (): string => {
    const baseInfo = `${opacity} ${element}`;
    
    switch (format) {
      case 'inline':
        return `{/* WCAG Exception: ${baseInfo} - ${justification} */}`;
      
      case 'multiline':
        return `{/* 
  WCAG Exception: ${baseInfo}
  Category: ${category}
  File: ${file || 'N/A'}
  Justification: ${justification}
  ${hasHoverState ? `Hover State: ${hoverColor || 'improved contrast'}` : ''}
*/}`;
      
      case 'javascript':
        return `// WCAG Exception: ${baseInfo} - ${justification}`;
      
      default:
        return `{/* WCAG Exception: ${baseInfo} - ${justification} */}`;
    }
  };

  const comment = generateComment();

  const handleCopy = () => {
    navigator.clipboard.writeText(comment);
    setCopied(true);
    toast.success('Comentário copiado para clipboard!');
    onGenerate?.(comment);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValid = element.trim() && justification.trim();

  return (
    <Card className="card-neon-border bg-kiosk-surface/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-gold-neon flex items-center gap-2">
          <Code className="w-5 h-5 icon-neon-blue" />
          Gerador de Comentários WCAG
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File & Opacity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wcag-file" className="text-label-yellow">Arquivo</Label>
            <Input
              id="wcag-file"
              placeholder="Ex: QueuePanel.tsx"
              value={file}
              onChange={(e) => setFile(e.target.value)}
              className="bg-kiosk-bg/50 border-cyan-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wcag-opacity" className="text-label-yellow">Opacidade</Label>
            <Select value={opacity} onValueChange={setOpacity}>
              <SelectTrigger id="wcag-opacity" className="bg-kiosk-bg/50 border-cyan-500/30">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {OPACITY_OPTIONS.map((op) => (
                  <SelectItem key={op} value={op}>
                    text-kiosk-text{op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Element */}
        <div className="space-y-2">
          <Label htmlFor="wcag-element" className="text-label-yellow">
            Elemento <span className="text-red-400">*</span>
          </Label>
          <Input
            id="wcag-element"
            placeholder="Ex: GripVertical icon, Bookmark icon"
            value={element}
            onChange={(e) => setElement(e.target.value)}
            className="bg-kiosk-bg/50 border-cyan-500/30"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="wcag-category" className="text-label-yellow">Categoria</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as WcagCategory)}>
            <SelectTrigger id="wcag-category" className="bg-kiosk-bg/50 border-cyan-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, { label, description, color }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${color} border-current/30 text-xs`}>
                      {label}
                    </Badge>
                    <span className="text-description-visible text-xs hidden md:inline">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Justification */}
        <div className="space-y-2">
          <Label htmlFor="wcag-justification" className="text-label-yellow">
            Justificativa <span className="text-red-400">*</span>
          </Label>
          <Textarea
            id="wcag-justification"
            placeholder="Ex: Ícone de drag-drop invisível por padrão, aparece no group-hover"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="bg-kiosk-bg/50 border-cyan-500/30 min-h-[80px]"
          />
        </div>

        {/* Hover State Toggle */}
        <div className="flex items-center justify-between p-3 bg-kiosk-bg/30 rounded-lg">
          <div>
            <Label htmlFor="wcag-hover" className="text-nav-neon-white cursor-pointer">
              Tem estado hover/focus
            </Label>
            <p className="text-xs text-description-visible">
              Marque se o elemento aumenta contraste no hover
            </p>
          </div>
          <Switch
            id="wcag-hover"
            checked={hasHoverState}
            onCheckedChange={setHasHoverState}
          />
        </div>

        {/* Hover Color (conditional) */}
        {hasHoverState && (
          <div className="space-y-2">
            <Label htmlFor="wcag-hover-color" className="text-label-yellow">Cor no Hover</Label>
            <Input
              id="wcag-hover-color"
              placeholder="Ex: text-yellow-500, opacity-100"
              value={hoverColor}
              onChange={(e) => setHoverColor(e.target.value)}
              className="bg-kiosk-bg/50 border-cyan-500/30"
            />
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-2">
          <Label className="text-label-yellow">Formato do Comentário</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FORMAT_OPTIONS).map(([key, { label, icon }]) => (
              <Button
                key={key}
                variant={format === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat(key as CommentFormat)}
                className={format === key 
                  ? 'bg-kiosk-primary/30 border-cyan-500/50' 
                  : 'border-cyan-500/30 hover:bg-kiosk-surface/50'
                }
              >
                {icon}
                <span className="ml-1">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-label-yellow">Preview</Label>
          <div className="relative">
            <pre className="p-3 bg-kiosk-bg rounded-lg text-xs font-mono text-cyan-400/90 overflow-x-auto whitespace-pre-wrap border border-cyan-500/20">
              {comment}
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-7 w-7 hover:bg-kiosk-surface/50"
              onClick={handleCopy}
              disabled={!isValid}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-description-visible" />
              )}
            </Button>
          </div>
        </div>

        {/* Copy Button */}
        <Button
          onClick={handleCopy}
          disabled={!isValid}
          className="w-full bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/80 hover:to-blue-500/80"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Comentário
            </>
          )}
        </Button>

        {/* Validation Warning */}
        {!isValid && (
          <p className="text-xs text-amber-400/80 text-center">
            Preencha o elemento e a justificativa para gerar o comentário
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default WcagExceptionComment;
