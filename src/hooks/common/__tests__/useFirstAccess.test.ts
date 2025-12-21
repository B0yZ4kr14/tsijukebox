import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFirstAccess } from '../useFirstAccess';
import { STORAGE_KEYS } from '@/lib/constants';

describe('useFirstAccess', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return isFirstAccess true when SETUP_COMPLETE not in storage', () => {
    const { result } = renderHook(() => useFirstAccess());
    expect(result.current.isFirstAccess).toBe(true);
  });

  it('should return isFirstAccess false when SETUP_COMPLETE exists', () => {
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
    
    const { result } = renderHook(() => useFirstAccess());
    expect(result.current.isFirstAccess).toBe(false);
  });

  it('should set storage when markSetupComplete is called', () => {
    const { result } = renderHook(() => useFirstAccess());
    
    expect(result.current.isFirstAccess).toBe(true);
    
    act(() => {
      result.current.markSetupComplete();
    });

    expect(localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE)).toBe('true');
  });

  it('should remove storage when resetSetup is called', () => {
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
    
    const { result } = renderHook(() => useFirstAccess());
    
    act(() => {
      result.current.resetSetup();
    });

    expect(localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE)).toBeNull();
  });

  it('should return all expected functions', () => {
    const { result } = renderHook(() => useFirstAccess());
    
    expect(typeof result.current.isFirstAccess).toBe('boolean');
    expect(typeof result.current.markSetupComplete).toBe('function');
    expect(typeof result.current.resetSetup).toBe('function');
  });
});
