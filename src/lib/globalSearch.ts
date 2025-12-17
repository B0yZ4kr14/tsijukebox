import { wikiCategories, getAllArticles, WikiArticle } from '@/components/wiki/wikiData';

export interface UnifiedSearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  source: 'help' | 'wiki';
  category: string;
  categoryId: string;
  path: string;
  matchType: 'title' | 'content' | 'steps' | 'tips';
  relevanceScore: number;
}

export interface SearchFilters {
  sources: ('help' | 'wiki')[];
  categories: string[];
}

export interface HelpSection {
  id: string;
  title: string;
  items: HelpItem[];
}

export interface HelpItem {
  id?: string;
  question: string;
  answer: string;
  steps?: string[];
  tips?: string[];
}

// Calculate relevance score based on where the match was found
function calculateRelevance(query: string, result: { title: string; content: string; matchType: string }): number {
  const q = query.toLowerCase();
  let score = 0;
  
  // Title match is most relevant
  if (result.title.toLowerCase().includes(q)) {
    score += 100;
    // Exact match bonus
    if (result.title.toLowerCase() === q) score += 50;
  }
  
  // Content match
  if (result.content.toLowerCase().includes(q)) {
    score += 50;
    // Count occurrences
    const occurrences = (result.content.toLowerCase().match(new RegExp(q, 'g')) || []).length;
    score += Math.min(occurrences * 5, 25);
  }
  
  // Match type bonus
  if (result.matchType === 'title') score += 20;
  if (result.matchType === 'steps') score += 10;
  
  return score;
}

// Search through Help sections
export function searchHelp(query: string, helpSections: HelpSection[], filters: SearchFilters): UnifiedSearchResult[] {
  if (!filters.sources.includes('help')) return [];
  
  const results: UnifiedSearchResult[] = [];
  const q = query.toLowerCase();
  
  helpSections.forEach(section => {
    // Filter by category if specified
    if (filters.categories.length > 0 && !filters.categories.includes(section.id)) {
      return;
    }
    
    section.items.forEach(item => {
      let matchType: 'title' | 'content' | 'steps' | 'tips' = 'content';
      let matched = false;
      
      // Check question (title)
      if (item.question.toLowerCase().includes(q)) {
        matchType = 'title';
        matched = true;
      }
      
      // Check answer (content)
      if (item.answer.toLowerCase().includes(q)) {
        matched = true;
      }
      
      // Check steps
      if (item.steps?.some(step => step.toLowerCase().includes(q))) {
        matchType = 'steps';
        matched = true;
      }
      
      // Check tips
      if (item.tips?.some(tip => tip.toLowerCase().includes(q))) {
        matchType = 'tips';
        matched = true;
      }
      
      if (matched) {
        const result: UnifiedSearchResult = {
          id: item.id || `help-${section.id}-${item.question.slice(0, 20)}`,
          title: item.question,
          description: item.answer.slice(0, 150) + (item.answer.length > 150 ? '...' : ''),
          content: item.answer,
          source: 'help',
          category: section.title,
          categoryId: section.id,
          path: `Help > ${section.title}`,
          matchType,
          relevanceScore: calculateRelevance(query, { title: item.question, content: item.answer, matchType })
        };
        results.push(result);
      }
    });
  });
  
  return results;
}

// Search through Wiki articles
export function searchWiki(query: string, filters: SearchFilters): UnifiedSearchResult[] {
  if (!filters.sources.includes('wiki')) return [];
  
  const results: UnifiedSearchResult[] = [];
  const q = query.toLowerCase();
  
  wikiCategories.forEach(category => {
    // Filter by category if specified
    if (filters.categories.length > 0 && !filters.categories.includes(category.id)) {
      return;
    }
    
    category.subSections.forEach(subSection => {
      subSection.articles.forEach(article => {
        let matchType: 'title' | 'content' | 'steps' | 'tips' = 'content';
        let matched = false;
        
        // Check title
        if (article.title.toLowerCase().includes(q)) {
          matchType = 'title';
          matched = true;
        }
        
        // Check description
        if (article.description?.toLowerCase().includes(q)) {
          matched = true;
        }
        
        // Check content
        if (article.content?.toLowerCase().includes(q)) {
          matched = true;
        }
        
        // Check steps
        if (article.steps?.some(step => step.toLowerCase().includes(q))) {
          matchType = 'steps';
          matched = true;
        }
        
        // Check tips
        if (article.tips?.some(tip => tip.toLowerCase().includes(q))) {
          matchType = 'tips';
          matched = true;
        }
        
        if (matched) {
          const result: UnifiedSearchResult = {
            id: article.id,
            title: article.title,
            description: article.description || article.content?.slice(0, 150) || '',
            content: article.content || '',
            source: 'wiki',
            category: category.title,
            categoryId: category.id,
            path: `Wiki > ${category.title} > ${subSection.title}`,
            matchType,
            relevanceScore: calculateRelevance(query, { 
              title: article.title, 
              content: article.content || article.description || '', 
              matchType 
            })
          };
          results.push(result);
        }
      });
    });
  });
  
  return results;
}

// Get all available categories for filtering
export function getSearchCategories(): { id: string; title: string; source: 'help' | 'wiki' }[] {
  const categories: { id: string; title: string; source: 'help' | 'wiki' }[] = [];
  
  // Wiki categories
  wikiCategories.forEach(cat => {
    categories.push({ id: cat.id, title: cat.title, source: 'wiki' });
  });
  
  return categories;
}

// Get help categories (needs to be called with helpSections)
export function getHelpCategories(helpSections: HelpSection[]): { id: string; title: string; source: 'help' | 'wiki' }[] {
  return helpSections.map(section => ({
    id: section.id,
    title: section.title,
    source: 'help' as const
  }));
}
