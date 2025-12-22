import { useState, useMemo } from 'react';
import { FileCode, FolderOpen, Check, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FILE_CATEGORIES, SAFE_SYNC_FILES } from '@/hooks/system/github/types';

interface FileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFiles: string[]) => void;
  isLoading?: boolean;
}

export function FileSelectionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false 
}: FileSelectionModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(SAFE_SYNC_FILES)
  );

  const toggleFile = (path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedFiles(new Set(SAFE_SYNC_FILES));
  };

  const clearAll = () => {
    setSelectedFiles(new Set());
  };

  const toggleCategory = (category: keyof typeof FILE_CATEGORIES) => {
    const categoryFiles = FILE_CATEGORIES[category];
    const allSelected = categoryFiles.every(f => selectedFiles.has(f));
    
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (allSelected) {
        categoryFiles.forEach(f => next.delete(f));
      } else {
        categoryFiles.forEach(f => next.add(f));
      }
      return next;
    });
  };

  const categoryStats = useMemo(() => {
    return Object.entries(FILE_CATEGORIES).map(([category, files]) => ({
      category,
      total: files.length,
      selected: files.filter(f => selectedFiles.has(f)).length,
    }));
  }, [selectedFiles]);

  const handleConfirm = () => {
    onConfirm(Array.from(selectedFiles));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Selecionar Arquivos para Sincronizar
          </DialogTitle>
          <DialogDescription>
            Escolha quais arquivos serão incluídos na sincronização com o GitHub.
            Arquivos de configuração críticos (package.json, etc.) não podem ser sincronizados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Check className="h-3 w-3" />
              {selectedFiles.size} selecionados
            </Badge>
            <Badge variant="secondary" className="text-xs">
              de {SAFE_SYNC_FILES.length} arquivos
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Selecionar Todos
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Limpar
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {Object.entries(FILE_CATEGORIES).map(([category, files]) => {
              const stats = categoryStats.find(s => s.category === category);
              const allSelected = stats?.selected === stats?.total;
              const someSelected = stats?.selected && stats.selected > 0 && !allSelected;

              return (
                <div key={category} className="space-y-2">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => toggleCategory(category as keyof typeof FILE_CATEGORIES)}
                  >
                    <Checkbox 
                      checked={allSelected}
                      className={someSelected ? 'bg-primary/50' : ''}
                    />
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{category}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {stats?.selected}/{stats?.total}
                    </Badge>
                  </div>
                  
                  <div className="ml-6 space-y-1">
                    {files.map(file => (
                      <div
                        key={file}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => toggleFile(file)}
                      >
                        <Checkbox 
                          checked={selectedFiles.has(file)}
                          onCheckedChange={() => toggleFile(file)}
                        />
                        <FileCode className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-mono truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedFiles.size === 0 || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>Sincronizando...</>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Sincronizar {selectedFiles.size} Arquivos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
