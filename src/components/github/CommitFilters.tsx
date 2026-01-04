import { useState, useEffect, useMemo } from 'react';
import { Search, User, Calendar, Tag, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GitHubCommit, GitHubContributor } from '@/hooks/system/useGitHubStats';
import { COMMIT_TYPES, parseCommitType, CommitType } from '@/lib/constants/commitTypes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge, Button, Input } from "@/components/ui/themed"

interface CommitFiltersProps {
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  onFilter: (filtered: GitHubCommit[]) => void;
}

interface FilterState {
  search: string;
  author: string | null;
  dateRange: { start: Date | null; end: Date | null };
  types: CommitType[];
}

const initialFilters: FilterState = {
  search: '',
  author: null,
  dateRange: { start: null, end: null },
  types: [],
};

export function CommitFilters({ commits, contributors, onFilter }: CommitFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const uniqueAuthors = useMemo(() => {
    const authors = new Set<string>();
    commits.forEach(commit => {
      if (commit.author?.login) {
        authors.add(commit.author.login);
      } else if (commit.commit.author.name) {
        authors.add(commit.commit.author.name);
      }
    });
    return Array.from(authors);
  }, [commits]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.author) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.types.length > 0) count++;
    return count;
  }, [filters]);

  useEffect(() => {
    let filtered = [...commits];

    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(commit =>
        commit.commit.message.toLowerCase().includes(searchLower) ||
        commit.sha.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por autor
    if (filters.author) {
      filtered = filtered.filter(commit =>
        commit.author?.login === filters.author ||
        commit.commit.author.name === filters.author
      );
    }

    // Filtro por data
    if (filters.dateRange.start) {
      filtered = filtered.filter(commit => {
        const commitDate = new Date(commit.commit.author.date);
        return commitDate >= filters.dateRange.start!;
      });
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(commit => {
        const commitDate = new Date(commit.commit.author.date);
        return commitDate <= filters.dateRange.end!;
      });
    }

    // Filtro por tipo de commit
    if (filters.types.length > 0) {
      filtered = filtered.filter(commit => {
        const commitType = parseCommitType(commit.commit.message);
        return filters.types.includes(commitType);
      });
    }

    onFilter(filtered);
  }, [commits, filters, onFilter]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const toggleType = (type: CommitType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mensagem ou SHA..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9 h-9"
          />
        </div>

        {/* Filtro por autor */}
        <Select
          value={filters.author ?? 'all'}
          onValueChange={value => setFilters(prev => ({ ...prev, author: value === 'all' ? null : value }))}
        >
          <SelectTrigger className="w-[180px] h-9">
            <User aria-hidden="true" className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Autor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os autores</SelectItem>
            {uniqueAuthors.map(author => (
              <SelectItem key={author} value={author}>
                {author}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por data */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="h-4 w-4 mr-2" />
              {filters.dateRange.start || filters.dateRange.end ? (
                <span className="text-xs">
                  {filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM', { locale: ptBR }) : '...'} 
                  {' - '}
                  {filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM', { locale: ptBR }) : '...'}
                </span>
              ) : (
                'Data'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <Label className="text-xs">Data inicial</Label>
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.start ?? undefined}
                  onSelect={date => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: date ?? null },
                  }))}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="text-xs">Data final</Label>
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.end ?? undefined}
                  onSelect={date => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: date ?? null },
                  }))}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  dateRange: { start: null, end: null },
                }))}
                className="w-full"
              >
                Limpar datas
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro por tipo */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Tag className="h-4 w-4 mr-2" />
              Tipo
              {filters.types.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {filters.types.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              {Object.entries(COMMIT_TYPES).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${key}`}
                    checked={filters.types.includes(key as CommitType)}
                    onCheckedChange={() => toggleType(key as CommitType)}
                  />
                  <Label
                    htmlFor={`type-${key}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <span className={`w-2 h-2 rounded-full ${value.color}`} />
                    {value.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Limpar filtros */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X aria-hidden="true" className="h-4 w-4 mr-1" />
            Limpar ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Badges dos filtros ativos */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.author && (
            <Badge variant="secondary" className="gap-1">
              <User aria-hidden="true" className="h-3 w-3" />
              {filters.author}
              <button aria-label="Aplicar filtro" type="button" onClick={() => setFilters(prev => ({ ...prev, author: null }))}>
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.types.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              <span className={`w-2 h-2 rounded-full ${COMMIT_TYPES[type].color}`} />
              {COMMIT_TYPES[type].label}
              <button aria-label="PREENCHER" type="button" onClick={() => toggleType(type)}>
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM') : '...'} 
              {' - '}
              {filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM') : '...'}
              <button aria-label="Aplicar filtro" type="button" onClick={() => setFilters(prev => ({
                ...prev,
                dateRange: { start: null, end: null },
              }))}>
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
