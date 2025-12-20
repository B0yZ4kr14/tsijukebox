import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCodeScan } from '../useCodeScan';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '@/integrations/supabase/client';

const mockScanResult = {
  success: true,
  data: {
    fileName: 'test.ts',
    issues: [
      {
        severity: 'critical',
        category: 'security',
        title: 'SQL Injection',
        message: 'Potential SQL injection vulnerability',
        line: 10,
        suggestion: 'Use parameterized queries',
      },
      {
        severity: 'high',
        category: 'performance',
        title: 'Inefficient loop',
        message: 'Nested loops causing O(n²) complexity',
        line: 25,
        suggestion: 'Use a Map for O(n) lookup',
      },
      {
        severity: 'medium',
        category: 'maintainability',
        title: 'Missing error handling',
        message: 'No try-catch block',
        line: 15,
        suggestion: 'Add error handling',
      },
      {
        severity: 'low',
        category: 'style',
        title: 'Naming convention',
        message: 'Variable name not descriptive',
        line: 5,
        suggestion: 'Rename to more descriptive name',
      },
    ],
    summary: 'Code has security and performance issues',
    score: 45,
    scannedAt: '2024-01-15T10:30:00Z',
  },
};

describe('useCodeScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty results', () => {
    const { result } = renderHook(() => useCodeScan());
    
    expect(result.current.results).toEqual([]);
    expect(result.current.isScanning).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.totalIssues).toBe(0);
    expect(result.current.criticalCount).toBe(0);
    expect(result.current.averageScore).toBe(0);
  });

  it('should scan single file successfully', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ data: mockScanResult, error: null });

    const { result } = renderHook(() => useCodeScan());

    let scanResult;
    await act(async () => {
      scanResult = await result.current.scanCode('const x = 1;', 'test.ts');
    });

    expect(scanResult).not.toBeNull();
    expect(scanResult?.fileName).toBe('test.ts');
    expect(scanResult?.issues.length).toBe(4);
    expect(result.current.results.length).toBe(1);
  });

  it('should handle multiple files with progress', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ data: mockScanResult, error: null });

    const { result } = renderHook(() => useCodeScan());

    const files = [
      { code: 'const a = 1;', fileName: 'file1.ts' },
      { code: 'const b = 2;', fileName: 'file2.ts' },
      { code: 'const c = 3;', fileName: 'file3.ts' },
    ];

    await act(async () => {
      await result.current.scanMultiple(files);
    });

    await waitFor(() => {
      expect(result.current.isScanning).toBe(false);
    });

    expect(result.current.progress).toBe(100);
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  it('should aggregate issues by severity', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ data: mockScanResult, error: null });

    const { result } = renderHook(() => useCodeScan());

    await act(async () => {
      await result.current.scanCode('const x = 1;', 'test.ts');
    });

    const criticalIssues = result.current.getIssuesBySeverity('critical');
    const highIssues = result.current.getIssuesBySeverity('high');
    const mediumIssues = result.current.getIssuesBySeverity('medium');
    const lowIssues = result.current.getIssuesBySeverity('low');

    expect(criticalIssues.length).toBe(1);
    expect(highIssues.length).toBe(1);
    expect(mediumIssues.length).toBe(1);
    expect(lowIssues.length).toBe(1);
  });

  it('should calculate average score correctly', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    
    // First file with score 45
    mockInvoke.mockResolvedValueOnce({ data: mockScanResult, error: null });
    
    // Second file with score 85
    mockInvoke.mockResolvedValueOnce({ 
      data: { 
        success: true, 
        data: { ...mockScanResult.data, fileName: 'file2.ts', score: 85, issues: [] } 
      }, 
      error: null 
    });

    const { result } = renderHook(() => useCodeScan());

    await act(async () => {
      await result.current.scanCode('code1', 'file1.ts');
      await result.current.scanCode('code2', 'file2.ts');
    });

    // Average of 45 and 85 = 65
    expect(result.current.averageScore).toBe(65);
  });

  it('should handle scan errors', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ 
      data: { success: false, error: 'Scan failed' }, 
      error: null 
    });

    const { result } = renderHook(() => useCodeScan());

    await expect(
      act(async () => {
        await result.current.scanCode('const x = 1;', 'test.ts');
      })
    ).rejects.toThrow('Scan failed');
  });

  it('should clear results', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ data: mockScanResult, error: null });

    const { result } = renderHook(() => useCodeScan());

    await act(async () => {
      await result.current.scanCode('const x = 1;', 'test.ts');
    });

    expect(result.current.results.length).toBe(1);

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should count total and critical issues', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ data: mockScanResult, error: null });

    const { result } = renderHook(() => useCodeScan());

    await act(async () => {
      await result.current.scanCode('const x = 1;', 'test.ts');
    });

    expect(result.current.totalIssues).toBe(4);
    expect(result.current.criticalCount).toBe(1);
  });

  it('should replace existing file result on rescan', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke
      .mockResolvedValueOnce({ data: mockScanResult, error: null })
      .mockResolvedValueOnce({ 
        data: { 
          success: true, 
          data: { ...mockScanResult.data, score: 90, issues: [] } 
        }, 
        error: null 
      });

    const { result } = renderHook(() => useCodeScan());

    await act(async () => {
      await result.current.scanCode('code1', 'test.ts');
    });

    expect(result.current.results[0].score).toBe(45);

    await act(async () => {
      await result.current.scanCode('code2', 'test.ts');
    });

    // Should still have 1 result, not 2
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].score).toBe(90);
  });
});
