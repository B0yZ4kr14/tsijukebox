import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Play, RotateCcw, Code2, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Slider, Toggle } from "@/components/ui/themed"

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  default: string | number | boolean;
  options?: string[];
  description?: string;
  min?: number;
  max?: number;
}

export interface CodePlaygroundProps {
  title: string;
  description?: string;
  code: string;
  language?: string;
  props?: PropDefinition[];
  preview?: React.ReactNode;
  renderPreview?: (props: Record<string, unknown>) => React.ReactNode;
}

export function CodePlayground({
  title,
  description,
  code,
  language = 'tsx',
  props = [],
  preview,
  renderPreview,
}: CodePlaygroundProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [propValues, setPropValues] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    props.forEach(p => {
      defaults[p.name] = p.default;
    });
    return defaults;
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Falha ao copiar');
    }
  };

  const handleReset = () => {
    const defaults: Record<string, unknown> = {};
    props.forEach(p => {
      defaults[p.name] = p.default;
    });
    setPropValues(defaults);
    toast.success('Props resetadas');
  };

  const updateProp = (name: string, value: unknown) => {
    setPropValues(prev => ({ ...prev, [name]: value }));
  };

  // Generate code with current prop values
  const generatedCode = useMemo(() => {
    let result = code;
    
    props.forEach(prop => {
      const value = propValues[prop.name];
      const placeholder = `{${prop.name}}`;
      
      if (prop.type === 'string') {
        result = result.replace(placeholder, `"${value}"`);
      } else if (prop.type === 'boolean') {
        result = result.replace(placeholder, value ? 'true' : 'false');
        // Also handle {prop} vs prop={true}
        if (value) {
          result = result.replace(`${prop.name}={true}`, prop.name);
        }
      } else {
        result = result.replace(placeholder, String(value));
      }
    });
    
    return result;
  }, [code, props, propValues]);

  // Render preview with current props
  const renderedPreview = useMemo(() => {
    if (renderPreview) {
      return renderPreview(propValues);
    }
    return preview;
  }, [preview, renderPreview, propValues]);

  return (
    <Card className="card-neon-border overflow-hidden">
      <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <Code2 className="w-5 h-5 icon-neon-blue" />
              {title}
            </h3>
            {description && (
              <p className="text-kiosk-text/70 text-sm mt-1">{description}</p>
            )}
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">
            {language.toUpperCase()}
          </Badge>
        </div>
      
      
      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}>
          <div className="px-4 border-b border-border">
            <TabsList className="bg-transparent h-10">
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-kiosk-surface gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="data-[state=active]:bg-kiosk-surface gap-2"
              >
                <Code2 className="w-4 h-4" />
                Código
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="preview" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Preview Area */}
              <div className="lg:col-span-2 p-6 bg-kiosk-bg/50 min-h-[200px] flex items-center justify-center">
                <motion.div
                  key={JSON.stringify(propValues)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderedPreview}
                </motion.div>
              </div>
              
              {/* Props Editor */}
              {props.length > 0 && (
                <div className="border-l border-border p-4 bg-kiosk-surface/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-kiosk-text">Props</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-4 pr-2">
                      {props.map(prop => (
                        <div key={prop.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-kiosk-text/80">
                              {prop.name}
                            </Label>
                            {prop.type === 'boolean' && (
                              <Switch
                                checked={propValues[prop.name] as boolean}
                                onCheckedChange={(v) => updateProp(prop.name, v)}
                              />
                            )}
                          </div>
                          
                          {prop.type === 'string' && (
                            <Input
                              value={propValues[prop.name] as string}
                              onChange={(e) => updateProp(prop.name, e.target.value)}
                              className="h-8 text-sm bg-kiosk-bg"
                            />
                          )}
                          
                          {prop.type === 'number' && (
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[propValues[prop.name] as number]}
                                onValueChange={([v]) => updateProp(prop.name, v)}
                                min={prop.min ?? 0}
                                max={prop.max ?? 100}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-xs text-kiosk-text/70 w-8 text-right">
                                {propValues[prop.name] as number}
                              </span>
                            </div>
                          )}
                          
                          {prop.type === 'select' && prop.options && (
                            <div className="flex flex-wrap gap-1">
                              {prop.options.map(opt => (
                                <Button
                                  key={opt}
                                  variant={propValues[prop.name] === opt ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-6 text-xs px-2"
                                  onClick={() => updateProp(prop.name, opt)}
                                >
                                  {opt}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {prop.description && (
                            <p className="text-[10px] text-kiosk-text/50">
                              {prop.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="m-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-8 gap-1 z-10"
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" className="w-4 h-4 text-green-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
              
              <ScrollArea className="h-[240px]">
                <pre className="p-4 bg-[hsl(220_25%_8%)] text-sm overflow-x-auto">
                  <code className="text-cyan-400 font-mono whitespace-pre">
                    {generatedCode}
                  </code>
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

export default CodePlayground;
