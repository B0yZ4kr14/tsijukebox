// Utils templates - 12 arquivos utilitários

const VERSION = '2.0.0';

export function generateUtilsContent(path: string): string | null {
  const utilsMap: Record<string, () => string> = {
    'src/lib/utils.ts': generateUtilsMain,
    'src/lib/utils/fileChangeDetector.ts': generateFileChangeDetector,
    'src/lib/formatters.ts': generateFormatters,
    'src/lib/date-utils.ts': generateDateUtils,
    'src/lib/colorExtractor.ts': generateColorExtractor,
    'src/lib/contrastUtils.ts': generateContrastUtils,
    'src/lib/theme-utils.ts': generateThemeUtils,
    'src/lib/globalSearch.ts': generateGlobalSearch,
    'src/lib/lrcParser.ts': generateLrcParser,
    'src/lib/lyricsCache.ts': generateLyricsCache,
    'src/lib/documentExporter.ts': generateDocumentExporter,
    'src/lib/constants.ts': generateConstants,
  };

  const generator = utilsMap[path];
  return generator ? generator() : null;
}

function generateUtilsMain(): string {
  return `// TSiJUKEBOX Utils - v${VERSION}
// Core utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration from milliseconds to mm:ss or hh:mm:ss
 */
export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return \`\${hours}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
  }
  return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return \`\${Date.now().toString(36)}-\${Math.random().toString(36).slice(2, 11)}\`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
`;
}

function generateFileChangeDetector(): string {
  return `// TSiJUKEBOX File Change Detector - v${VERSION}
// Detect file changes for sync optimization

interface FileInfo {
  path: string;
  content: string;
  hash: string;
  lastModified: number;
}

interface ChangeResult {
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
}

/**
 * Simple hash function for content comparison
 */
export function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Compare two file sets and detect changes
 */
export function detectChanges(
  previous: Map<string, FileInfo>,
  current: Map<string, FileInfo>
): ChangeResult {
  const added: string[] = [];
  const modified: string[] = [];
  const deleted: string[] = [];
  const unchanged: string[] = [];

  // Check for added and modified files
  for (const [path, info] of current) {
    const prevInfo = previous.get(path);
    if (!prevInfo) {
      added.push(path);
    } else if (prevInfo.hash !== info.hash) {
      modified.push(path);
    } else {
      unchanged.push(path);
    }
  }

  // Check for deleted files
  for (const path of previous.keys()) {
    if (!current.has(path)) {
      deleted.push(path);
    }
  }

  return { added, modified, deleted, unchanged };
}

/**
 * Create file info object
 */
export function createFileInfo(path: string, content: string): FileInfo {
  return {
    path,
    content,
    hash: hashContent(content),
    lastModified: Date.now(),
  };
}

/**
 * Build file map from array
 */
export function buildFileMap(files: Array<{ path: string; content: string }>): Map<string, FileInfo> {
  const map = new Map<string, FileInfo>();
  for (const file of files) {
    map.set(file.path, createFileInfo(file.path, file.content));
  }
  return map;
}
`;
}

function generateFormatters(): string {
  return `// TSiJUKEBOX Formatters - v${VERSION}
// Number, date and string formatters

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return \`\${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} \${sizes[i]}\`;
}

/**
 * Format number with locale
 */
export function formatNumber(num: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return \`\${(value * 100).toFixed(decimals)}%\`;
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date, locale = 'pt-BR'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
}
`;
}

function generateDateUtils(): string {
  return `// TSiJUKEBOX Date Utils - v${VERSION}
// Date manipulation utilities

/**
 * Format date to ISO string without time
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date to locale string
 */
export function toLocaleDate(date: Date, locale = 'pt-BR'): string {
  return date.toLocaleDateString(locale);
}

/**
 * Format date and time
 */
export function toLocaleDateTime(date: Date, locale = 'pt-BR'): string {
  return date.toLocaleString(locale);
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return toISODate(date) === toISODate(today);
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Get difference in days
 */
export function diffInDays(date1: Date, date2: Date): number {
  const diff = date1.getTime() - date2.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Parse ISO date string safely
 */
export function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}
`;
}

function generateColorExtractor(): string {
  return `// TSiJUKEBOX Color Extractor - v${VERSION}
// Extract dominant colors from images

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorResult {
  dominant: string;
  palette: string[];
  isDark: boolean;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Calculate relative luminance
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if color is dark
 */
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return getLuminance(rgb.r, rgb.g, rgb.b) < 0.5;
}

/**
 * Extract colors from image element
 */
export async function extractColors(imgElement: HTMLImageElement): Promise<ColorResult> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve({
        dominant: '#1a1a1a',
        palette: ['#1a1a1a', '#2a2a2a', '#3a3a3a'],
        isDark: true,
      });
      return;
    }

    const size = 100;
    canvas.width = size;
    canvas.height = size;
    
    ctx.drawImage(imgElement, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size).data;
    
    const colorCounts = new Map<string, number>();
    
    for (let i = 0; i < imageData.length; i += 4) {
      const r = Math.round(imageData[i] / 32) * 32;
      const g = Math.round(imageData[i + 1] / 32) * 32;
      const b = Math.round(imageData[i + 2] / 32) * 32;
      const hex = rgbToHex(r, g, b);
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    }
    
    const sorted = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0]?.[0] || '#1a1a1a';
    const palette = sorted.slice(0, 5).map(([color]) => color);
    
    resolve({
      dominant,
      palette,
      isDark: isDarkColor(dominant),
    });
  });
}
`;
}

function generateContrastUtils(): string {
  return `// TSiJUKEBOX Contrast Utils - v${VERSION}
// WCAG contrast ratio utilities

interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'Fail';
  isLargeText: boolean;
}

/**
 * Get relative luminance from hex color
 */
function getLuminanceFromHex(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(c => {
    const val = parseInt(c, 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminanceFromHex(color1);
  const l2 = getLuminanceFromHex(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance level
 */
export function getWCAGLevel(ratio: number, isLargeText = false): 'AAA' | 'AA' | 'A' | 'Fail' {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'Fail';
  }
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'A';
  return 'Fail';
}

/**
 * Analyze contrast between two colors
 */
export function analyzeContrast(foreground: string, background: string, isLargeText = false): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  return {
    ratio: Math.round(ratio * 100) / 100,
    level: getWCAGLevel(ratio, isLargeText),
    isLargeText,
  };
}

/**
 * Suggest accessible color alternative
 */
export function suggestAccessibleColor(foreground: string, background: string, targetRatio = 4.5): string {
  const bgLum = getLuminanceFromHex(background);
  
  // Determine if we need lighter or darker foreground
  if (bgLum > 0.5) {
    // Light background, need dark foreground
    return '#000000';
  }
  // Dark background, need light foreground
  return '#ffffff';
}

/**
 * Check if contrast meets minimum requirements
 */
export function meetsMinimumContrast(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
`;
}

function generateThemeUtils(): string {
  return `// TSiJUKEBOX Theme Utils - v${VERSION}
// Theme management utilities

export type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get stored theme preference
 */
export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme') as Theme | null;
}

/**
 * Store theme preference
 */
export function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
}

/**
 * Resolve theme to actual value
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
}

/**
 * Get current theme config
 */
export function getThemeConfig(): ThemeConfig {
  const theme = getStoredTheme() || 'system';
  return {
    theme,
    resolvedTheme: resolveTheme(theme),
  };
}

/**
 * Subscribe to system theme changes
 */
export function onSystemThemeChange(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches ? 'dark' : 'light');
  
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
`;
}

function generateGlobalSearch(): string {
  return `// TSiJUKEBOX Global Search - v${VERSION}
// Global search functionality

export interface SearchResult {
  id: string;
  type: 'track' | 'artist' | 'album' | 'playlist' | 'setting';
  title: string;
  subtitle?: string;
  icon?: string;
  url?: string;
  score: number;
}

export interface SearchOptions {
  types?: SearchResult['type'][];
  limit?: number;
  threshold?: number;
}

/**
 * Calculate fuzzy match score
 */
export function fuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;
  
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  
  if (t === q) return 1;
  if (t.startsWith(q)) return 0.9;
  if (t.includes(q)) return 0.7;
  
  // Character-by-character matching
  let score = 0;
  let lastIndex = -1;
  
  for (const char of q) {
    const index = t.indexOf(char, lastIndex + 1);
    if (index === -1) continue;
    score += 1 / (index - lastIndex);
    lastIndex = index;
  }
  
  return Math.min(score / q.length, 0.6);
}

/**
 * Search through items
 */
export function search<T extends { id: string }>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
  options: { limit?: number; threshold?: number } = {}
): Array<T & { score: number }> {
  const { limit = 10, threshold = 0.3 } = options;
  
  if (!query.trim()) return [];
  
  const results = items
    .map(item => ({
      ...item,
      score: fuzzyScore(query, getSearchText(item)),
    }))
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return results;
}

/**
 * Highlight matched text
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(\`(\${query})\`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Debounced search handler
 */
export function createSearchHandler(
  onSearch: (query: string) => void,
  delay = 300
): (query: string) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (query: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => onSearch(query), delay);
  };
}
`;
}

function generateLrcParser(): string {
  return `// TSiJUKEBOX LRC Parser - v${VERSION}
// Parse LRC lyrics format

export interface LyricLine {
  time: number;
  text: string;
}

export interface ParsedLyrics {
  lines: LyricLine[];
  metadata: Record<string, string>;
}

/**
 * Parse time tag [mm:ss.xx] to milliseconds
 */
export function parseTimeTag(tag: string): number {
  const match = tag.match(/\\[(\\d+):(\\d+)(?:\\.(\\d+))?\\]/);
  if (!match) return 0;
  
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const centiseconds = match[3] ? parseInt(match[3].padEnd(2, '0').slice(0, 2), 10) : 0;
  
  return (minutes * 60 + seconds) * 1000 + centiseconds * 10;
}

/**
 * Parse LRC content
 */
export function parseLRC(content: string): ParsedLyrics {
  const lines: LyricLine[] = [];
  const metadata: Record<string, string> = {};
  
  const rawLines = content.split('\\n');
  
  for (const line of rawLines) {
    // Metadata tags like [ar:Artist]
    const metaMatch = line.match(/^\\[([a-z]+):(.+)\\]$/i);
    if (metaMatch) {
      metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      continue;
    }
    
    // Time-tagged lyrics
    const timeMatches = line.match(/\\[\\d+:\\d+(?:\\.\\d+)?\\]/g);
    if (timeMatches) {
      const text = line.replace(/\\[\\d+:\\d+(?:\\.\\d+)?\\]/g, '').trim();
      if (text) {
        for (const tag of timeMatches) {
          lines.push({
            time: parseTimeTag(tag),
            text,
          });
        }
      }
    }
  }
  
  // Sort by time
  lines.sort((a, b) => a.time - b.time);
  
  return { lines, metadata };
}

/**
 * Find current lyric line by time
 */
export function findCurrentLine(lyrics: LyricLine[], currentTime: number): number {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (lyrics[i].time <= currentTime) {
      return i;
    }
  }
  return -1;
}

/**
 * Generate LRC content from lyrics
 */
export function generateLRC(lyrics: LyricLine[], metadata?: Record<string, string>): string {
  const lines: string[] = [];
  
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      lines.push(\`[\${key}:\${value}]\`);
    }
    lines.push('');
  }
  
  for (const line of lyrics) {
    const mins = Math.floor(line.time / 60000);
    const secs = Math.floor((line.time % 60000) / 1000);
    const cs = Math.floor((line.time % 1000) / 10);
    lines.push(\`[\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}.\${cs.toString().padStart(2, '0')}]\${line.text}\`);
  }
  
  return lines.join('\\n');
}
`;
}

function generateLyricsCache(): string {
  return `// TSiJUKEBOX Lyrics Cache - v${VERSION}
// Cache lyrics for offline access

import { LyricLine } from './lrcParser';

interface CachedLyrics {
  trackId: string;
  lyrics: LyricLine[];
  source: string;
  cachedAt: number;
  expiresAt: number;
}

const CACHE_KEY = 'tsijukebox_lyrics_cache';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get all cached lyrics
 */
function getCache(): Map<string, CachedLyrics> {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    if (!data) return new Map();
    
    const entries = JSON.parse(data) as Array<[string, CachedLyrics]>;
    return new Map(entries);
  } catch {
    return new Map();
  }
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: Map<string, CachedLyrics>): void {
  try {
    const entries = Array.from(cache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('[LyricsCache] Failed to save cache:', error);
  }
}

/**
 * Get cached lyrics for a track
 */
export function getCachedLyrics(trackId: string): LyricLine[] | null {
  const cache = getCache();
  const entry = cache.get(trackId);
  
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(trackId);
    saveCache(cache);
    return null;
  }
  
  return entry.lyrics;
}

/**
 * Cache lyrics for a track
 */
export function cacheLyrics(
  trackId: string,
  lyrics: LyricLine[],
  source: string,
  ttl = DEFAULT_TTL
): void {
  const cache = getCache();
  
  cache.set(trackId, {
    trackId,
    lyrics,
    source,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttl,
  });
  
  saveCache(cache);
}

/**
 * Remove cached lyrics for a track
 */
export function removeCachedLyrics(trackId: string): void {
  const cache = getCache();
  cache.delete(trackId);
  saveCache(cache);
}

/**
 * Clear all cached lyrics
 */
export function clearLyricsCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; size: number; oldestEntry: number | null } {
  const cache = getCache();
  const data = localStorage.getItem(CACHE_KEY) || '';
  
  let oldestEntry: number | null = null;
  for (const entry of cache.values()) {
    if (!oldestEntry || entry.cachedAt < oldestEntry) {
      oldestEntry = entry.cachedAt;
    }
  }
  
  return {
    count: cache.size,
    size: new Blob([data]).size,
    oldestEntry,
  };
}

/**
 * Prune expired entries from cache
 */
export function pruneExpiredEntries(): number {
  const cache = getCache();
  const now = Date.now();
  let pruned = 0;
  
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) {
      cache.delete(key);
      pruned++;
    }
  }
  
  if (pruned > 0) {
    saveCache(cache);
  }
  
  return pruned;
}
`;
}

function generateDocumentExporter(): string {
  return `// TSiJUKEBOX Document Exporter - v${VERSION}
// Export data to various formats

export type ExportFormat = 'json' | 'csv' | 'md' | 'txt';

interface ExportOptions {
  filename?: string;
  format: ExportFormat;
  pretty?: boolean;
}

/**
 * Convert data to CSV format
 */
export function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'string' && value.includes(',')) {
        return \`"\${value.replace(/"/g, '""')}"\`;
      }
      return String(value ?? '');
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\\n');
}

/**
 * Convert data to Markdown table
 */
export function toMarkdownTable(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const headerRow = '| ' + headers.join(' | ') + ' |';
  const separatorRow = '| ' + headers.map(() => '---').join(' | ') + ' |';
  const dataRows = data.map(item =>
    '| ' + headers.map(h => String(item[h] ?? '')).join(' | ') + ' |'
  );
  
  return [headerRow, separatorRow, ...dataRows].join('\\n');
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to specified format
 */
export function exportData(data: unknown, options: ExportOptions): void {
  const { format, filename = 'export', pretty = true } = options;
  
  let content: string;
  let mimeType: string;
  let extension: string;
  
  switch (format) {
    case 'json':
      content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      mimeType = 'application/json';
      extension = 'json';
      break;
    
    case 'csv':
      content = toCSV(data as Record<string, unknown>[]);
      mimeType = 'text/csv';
      extension = 'csv';
      break;
    
    case 'md':
      content = toMarkdownTable(data as Record<string, unknown>[]);
      mimeType = 'text/markdown';
      extension = 'md';
      break;
    
    case 'txt':
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      mimeType = 'text/plain';
      extension = 'txt';
      break;
    
    default:
      throw new Error(\`Unsupported format: \${format}\`);
  }
  
  downloadFile(content, \`\${filename}.\${extension}\`, mimeType);
}
`;
}

function generateConstants(): string {
  return `// TSiJUKEBOX Constants - v${VERSION}
// Application-wide constants

export const APP_NAME = 'TSiJUKEBOX';
export const APP_VERSION = '${VERSION}';
export const APP_DESCRIPTION = 'Sistema de Jukebox Inteligente';

// API Endpoints
export const API_ENDPOINTS = {
  SPOTIFY: 'https://api.spotify.com/v1',
  GENIUS: 'https://api.genius.com',
  LASTFM: 'https://ws.audioscrobbler.com/2.0',
} as const;

// Player Constants
export const PLAYER = {
  DEFAULT_VOLUME: 0.7,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  SEEK_STEP: 5000, // 5 seconds
  VOLUME_STEP: 0.1,
} as const;

// Queue Constants
export const QUEUE = {
  MAX_SIZE: 500,
  HISTORY_SIZE: 50,
  PREVIEW_SIZE: 5,
} as const;

// Cache Constants
export const CACHE = {
  TTL_SHORT: 5 * 60 * 1000,      // 5 minutes
  TTL_MEDIUM: 60 * 60 * 1000,    // 1 hour
  TTL_LONG: 24 * 60 * 60 * 1000, // 24 hours
  MAX_ENTRIES: 1000,
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints (match Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Keyboard Shortcuts
export const SHORTCUTS = {
  PLAY_PAUSE: ' ',
  NEXT: 'ArrowRight',
  PREVIOUS: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'm',
  FULLSCREEN: 'f',
  SEARCH: '/',
  ESCAPE: 'Escape',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'tsijukebox_theme',
  VOLUME: 'tsijukebox_volume',
  QUEUE: 'tsijukebox_queue',
  HISTORY: 'tsijukebox_history',
  SETTINGS: 'tsijukebox_settings',
  AUTH: 'tsijukebox_auth',
} as const;

// Error Messages
export const ERRORS = {
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  AUTH: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER: 'Erro no servidor. Tente novamente.',
  VALIDATION: 'Dados inválidos.',
} as const;
`;
}
