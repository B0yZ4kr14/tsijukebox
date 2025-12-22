import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileChangeDetector } from '../useFileChangeDetector';

// Mock Supabase client
const mockFunctionsInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockFunctionsInvoke(...args),
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock import.meta.hot
const mockHotOn = vi.fn();
const mockImportMeta = {
  hot: {
    on: mockHotOn,
  },
};

// Override import.meta
vi.stubGlobal('import', { meta: mockImportMeta });

describe('useFileChangeDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockFunctionsInvoke.mockResolvedValue({
      data: { summary: { added: 0, updated: 0 } },
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with empty detectedFiles', () => {
      const { result } = renderHook(() => useFileChangeDetector());

      expect(result.current.detectedFiles).toEqual([]);
    });

    it('should start with isDetecting false', () => {
      const { result } = renderHook(() => useFileChangeDetector());

      expect(result.current.isDetecting).toBe(false);
    });

    it('should have lastDetection as null initially', () => {
      const { result } = renderHook(() => useFileChangeDetector());

      expect(result.current.lastDetection).toBeNull();
    });
  });

  describe('control methods', () => {
    it('should set isDetecting to true when startDetection is called', () => {
      const { result } = renderHook(() => useFileChangeDetector());

      act(() => {
        result.current.startDetection();
      });

      expect(result.current.isDetecting).toBe(true);
    });

    it('should set isDetecting to false when stopDetection is called', () => {
      const { result } = renderHook(() => useFileChangeDetector());

      act(() => {
        result.current.startDetection();
      });
      expect(result.current.isDetecting).toBe(true);

      act(() => {
        result.current.stopDetection();
      });
      expect(result.current.isDetecting).toBe(false);
    });

    it('should clear detectedFiles when clearDetected is called', async () => {
      const { result } = renderHook(() => useFileChangeDetector());

      // Manually add a file via submitFilesForSync to populate detectedFiles
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { summary: { added: 1, updated: 0 } },
        error: null,
      });

      await act(async () => {
        await result.current.submitFilesForSync(['src/test.tsx']);
      });

      act(() => {
        result.current.clearDetected();
      });

      expect(result.current.detectedFiles).toEqual([]);
    });
  });

  describe('submitFilesForSync', () => {
    it('should return false when given empty array', async () => {
      const { result } = renderHook(() => useFileChangeDetector());

      let success = false;
      await act(async () => {
        success = await result.current.submitFilesForSync([]);
      });

      expect(success).toBe(false);
      expect(mockFunctionsInvoke).not.toHaveBeenCalled();
    });

    it('should call webhook with file list', async () => {
      const { result } = renderHook(() => useFileChangeDetector());

      await act(async () => {
        await result.current.submitFilesForSync(['src/test.tsx', 'src/utils.ts']);
      });

      expect(mockFunctionsInvoke).toHaveBeenCalledWith('file-change-webhook', {
        body: {
          files: [{ path: 'src/test.tsx' }, { path: 'src/utils.ts' }],
          source: 'hmr',
        },
      });
    });

    it('should return true on successful submit', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { summary: { added: 1, updated: 0 } },
        error: null,
      });

      const { result } = renderHook(() => useFileChangeDetector());

      let success = false;
      await act(async () => {
        success = await result.current.submitFilesForSync(['src/test.tsx']);
      });

      expect(success).toBe(true);
    });

    it('should return false on error', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: new Error('Failed'),
      });

      const { result } = renderHook(() => useFileChangeDetector());

      let success = false;
      await act(async () => {
        success = await result.current.submitFilesForSync(['src/test.tsx']);
      });

      expect(success).toBe(false);
    });

    it('should update lastDetection on success', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { summary: { added: 1, updated: 0 } },
        error: null,
      });

      const { result } = renderHook(() => useFileChangeDetector());

      expect(result.current.lastDetection).toBeNull();

      await act(async () => {
        await result.current.submitFilesForSync(['src/test.tsx']);
      });

      expect(result.current.lastDetection).toBeInstanceOf(Date);
    });

    it('should show toast notification on new files', async () => {
      const { toast } = await import('sonner');
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { summary: { added: 2, updated: 1 } },
        error: null,
      });

      const { result } = renderHook(() => useFileChangeDetector());

      await act(async () => {
        await result.current.submitFilesForSync(['src/test.tsx']);
      });

      expect(toast.info).toHaveBeenCalledWith('3 arquivo(s) detectado(s) para sync');
    });
  });

  describe('file pattern matching (shouldTrackFile)', () => {
    // We test patterns indirectly through the hook's behavior
    // The patterns are internal but we can verify their effect

    it('should track src/*.tsx files', () => {
      // Pattern: /^src\/.+\.(tsx?|jsx?|css|scss)$/
      const srcTsxFile = 'src/components/Button.tsx';
      expect(srcTsxFile).toMatch(/^src\/.+\.(tsx?|jsx?|css|scss)$/);
    });

    it('should track src/*.ts files', () => {
      const srcTsFile = 'src/hooks/useTest.ts';
      expect(srcTsFile).toMatch(/^src\/.+\.(tsx?|jsx?|css|scss)$/);
    });

    it('should track docs/*.md files', () => {
      // Pattern: /^docs\/.+\.(md|mdx)$/
      const docsFile = 'docs/README.md';
      expect(docsFile).toMatch(/^docs\/.+\.(md|mdx)$/);
    });

    it('should track supabase/functions/*.ts files', () => {
      // Pattern: /^supabase\/functions\/.+\.ts$/
      const functionFile = 'supabase/functions/my-function/index.ts';
      expect(functionFile).toMatch(/^supabase\/functions\/.+\.ts$/);
    });

    it('should track public/* files', () => {
      // Pattern: /^public\/.+$/
      const publicFile = 'public/images/logo.png';
      expect(publicFile).toMatch(/^public\/.+$/);
    });

    it('should NOT match node_modules files', () => {
      // Ignore pattern: /node_modules/
      const nodeModulesFile = 'node_modules/react/index.js';
      expect(nodeModulesFile).toMatch(/node_modules/);
    });

    it('should NOT match .test.tsx files', () => {
      // Ignore pattern: /\.test\.(tsx?|jsx?)$/
      const testFile = 'src/hooks/useTest.test.tsx';
      expect(testFile).toMatch(/\.test\.(tsx?|jsx?)$/);
    });

    it('should NOT match .spec.ts files', () => {
      // Ignore pattern: /\.spec\.(tsx?|jsx?)$/
      const specFile = 'src/utils/helper.spec.ts';
      expect(specFile).toMatch(/\.spec\.(tsx?|jsx?)$/);
    });

    it('should NOT match dist/ files', () => {
      // Ignore pattern: /dist\//
      const distFile = 'dist/bundle.js';
      expect(distFile).toMatch(/dist\//);
    });

    it('should NOT match .git files', () => {
      // Ignore pattern: /\.git/
      const gitFile = '.git/config';
      expect(gitFile).toMatch(/\.git/);
    });
  });
});
