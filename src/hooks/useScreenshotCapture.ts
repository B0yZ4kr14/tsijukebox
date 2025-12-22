import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';

export interface ScreenshotResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
}

export interface ScreenshotOptions {
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  logging?: boolean;
}

const DEFAULT_OPTIONS: ScreenshotOptions = {
  quality: 0.92,
  scale: 2,
  backgroundColor: '#0a0a0f',
  logging: false,
};

/**
 * Hook para capturar screenshots de elementos ou páginas
 * 
 * @example
 * ```tsx
 * const { captureElement, captureFullPage, isCapturing } = useScreenshotCapture();
 * 
 * // Capturar elemento específico
 * const result = await captureElement(document.getElementById('my-element'));
 * 
 * // Capturar página inteira
 * const result = await captureFullPage('home-page');
 * ```
 */
export function useScreenshotCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastResult, setLastResult] = useState<ScreenshotResult | null>(null);

  /**
   * Captura screenshot de um elemento específico
   */
  const captureElement = useCallback(async (
    element: HTMLElement | null,
    filename: string,
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotResult> => {
    if (!element) {
      return { success: false, error: 'Element not found' };
    }

    setIsCapturing(true);
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    try {
      const canvas = await html2canvas(element, {
        scale: mergedOptions.scale,
        backgroundColor: mergedOptions.backgroundColor,
        logging: mergedOptions.logging,
        useCORS: true,
        allowTaint: true,
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
          mergedOptions.quality
        );
      });

      // Upload to Supabase Storage
      const filepath = `screenshots/${filename}-${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(filepath, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filepath);

      const result: ScreenshotResult = {
        success: true,
        url: urlData.publicUrl,
        filename: filepath,
      };

      setLastResult(result);
      return result;
    } catch (error) {
      const result: ScreenshotResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  /**
   * Captura screenshot da página inteira
   */
  const captureFullPage = useCallback(async (
    pageName: string,
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotResult> => {
    const element = document.documentElement;
    return captureElement(element, pageName, options);
  }, [captureElement]);

  /**
   * Captura screenshot do viewport atual
   */
  const captureViewport = useCallback(async (
    name: string,
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotResult> => {
    const element = document.body;
    return captureElement(element, name, options);
  }, [captureElement]);

  /**
   * Download local de screenshot (sem upload)
   */
  const downloadScreenshot = useCallback(async (
    element: HTMLElement | null,
    filename: string,
    options: ScreenshotOptions = {}
  ): Promise<ScreenshotResult> => {
    if (!element) {
      return { success: false, error: 'Element not found' };
    }

    setIsCapturing(true);
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    try {
      const canvas = await html2canvas(element, {
        scale: mergedOptions.scale,
        backgroundColor: mergedOptions.backgroundColor,
        logging: mergedOptions.logging,
        useCORS: true,
        allowTaint: true,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png', mergedOptions.quality);
      link.click();

      const result: ScreenshotResult = {
        success: true,
        filename: `${filename}.png`,
      };

      setLastResult(result);
      return result;
    } catch (error) {
      const result: ScreenshotResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return {
    captureElement,
    captureFullPage,
    captureViewport,
    downloadScreenshot,
    isCapturing,
    lastResult,
  };
}
