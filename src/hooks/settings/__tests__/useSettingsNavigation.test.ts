import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsNavigation, type SettingsCategory } from '../useSettingsNavigation';

describe('useSettingsNavigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return dashboard as default category', () => {
    const { result } = renderHook(() => useSettingsNavigation());
    
    expect(result.current.activeCategory).toBe('dashboard');
  });

  it('should persist category to localStorage', () => {
    const { result } = renderHook(() => useSettingsNavigation());

    act(() => {
      result.current.setActiveCategory('connections');
    });

    expect(result.current.activeCategory).toBe('connections');
    expect(localStorage.getItem('settings_active_category')).toBe('connections');
  });

  it('should load persisted category on mount', () => {
    localStorage.setItem('settings_active_category', 'security');
    
    const { result } = renderHook(() => useSettingsNavigation());
    
    expect(result.current.activeCategory).toBe('security');
  });

  it('should ignore invalid categories from localStorage', () => {
    localStorage.setItem('settings_active_category', 'invalid_category');
    
    const { result } = renderHook(() => useSettingsNavigation());
    
    expect(result.current.activeCategory).toBe('dashboard');
  });

  it('should provide all category titles', () => {
    const { result } = renderHook(() => useSettingsNavigation());
    
    const expectedCategories: SettingsCategory[] = [
      'dashboard',
      'connections',
      'data',
      'system',
      'appearance',
      'security',
      'integrations',
    ];

    expectedCategories.forEach((category) => {
      expect(result.current.categoryTitles[category]).toBeDefined();
      expect(typeof result.current.categoryTitles[category]).toBe('string');
    });
  });

  it('should update category correctly for all valid values', () => {
    const { result } = renderHook(() => useSettingsNavigation());
    
    const categories: SettingsCategory[] = [
      'dashboard',
      'connections',
      'data',
      'system',
      'appearance',
      'security',
      'integrations',
    ];

    categories.forEach((category) => {
      act(() => {
        result.current.setActiveCategory(category);
      });
      
      expect(result.current.activeCategory).toBe(category);
    });
  });

  it('should have correct category titles in Portuguese', () => {
    const { result } = renderHook(() => useSettingsNavigation());
    
    expect(result.current.categoryTitles.dashboard).toBe('Dashboard');
    expect(result.current.categoryTitles.connections).toBe('Conexões');
    expect(result.current.categoryTitles.data).toBe('Dados & Backup');
    expect(result.current.categoryTitles.system).toBe('Sistema');
    expect(result.current.categoryTitles.appearance).toBe('Aparência');
    expect(result.current.categoryTitles.security).toBe('Segurança & Usuários');
    expect(result.current.categoryTitles.integrations).toBe('Integrações');
  });

  it('should return correct interface shape', () => {
    const { result } = renderHook(() => useSettingsNavigation());

    expect(result.current).toHaveProperty('activeCategory');
    expect(result.current).toHaveProperty('setActiveCategory');
    expect(result.current).toHaveProperty('categoryTitles');
    expect(typeof result.current.setActiveCategory).toBe('function');
  });
});
