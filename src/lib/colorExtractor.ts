/**
 * Color extraction utility for extracting dominant colors from images
 * Used for dynamic gradient backgrounds in fullscreen karaoke
 */

export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  isDark: boolean;
}

// Default colors when image can't be analyzed
const DEFAULT_COLORS: ExtractedColors = {
  primary: 'hsl(195, 100%, 50%)',
  secondary: 'hsl(280, 100%, 50%)',
  accent: 'hsl(320, 100%, 60%)',
  isDark: true,
};

/**
 * Extracts dominant colors from an image URL using Canvas API
 */
export async function extractDominantColors(imageUrl: string): Promise<ExtractedColors> {
  if (!imageUrl) {
    return DEFAULT_COLORS;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(DEFAULT_COLORS);
          return;
        }
        
        // Sample at smaller size for performance
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;
        
        // Collect color samples
        const colors: { r: number; g: number; b: number }[] = [];
        
        for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Skip very dark or very light pixels
          const brightness = (r + g + b) / 3;
          if (brightness > 30 && brightness < 225) {
            colors.push({ r, g, b });
          }
        }
        
        if (colors.length === 0) {
          resolve(DEFAULT_COLORS);
          return;
        }
        
        // Sort colors by saturation and pick diverse ones
        const sortedColors = colors.sort((a, b) => {
          const satA = getSaturation(a.r, a.g, a.b);
          const satB = getSaturation(b.r, b.g, b.b);
          return satB - satA;
        });
        
        // Get primary color (most saturated)
        const primary = sortedColors[0];
        
        // Get secondary color (different hue)
        const secondary = findDifferentHue(sortedColors, primary) || sortedColors[Math.floor(sortedColors.length / 3)];
        
        // Get accent color (most different from both)
        const accent = findDifferentHue(sortedColors, secondary) || sortedColors[Math.floor(sortedColors.length * 2 / 3)];
        
        // Calculate average brightness
        const avgBrightness = colors.reduce((sum, c) => sum + (c.r + c.g + c.b) / 3, 0) / colors.length;
        
        resolve({
          primary: rgbToHsl(primary.r, primary.g, primary.b),
          secondary: rgbToHsl(secondary.r, secondary.g, secondary.b),
          accent: rgbToHsl(accent.r, accent.g, accent.b),
          isDark: avgBrightness < 128,
        });
      } catch {
        resolve(DEFAULT_COLORS);
      }
    };
    
    img.onerror = () => {
      resolve(DEFAULT_COLORS);
    };
    
    // Handle CORS by using a proxy or fallback
    img.src = imageUrl;
    
    // Timeout fallback
    setTimeout(() => resolve(DEFAULT_COLORS), 3000);
  });
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function getHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  if (d === 0) return 0;
  
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  
  return h * 360;
}

function findDifferentHue(
  colors: { r: number; g: number; b: number }[], 
  reference: { r: number; g: number; b: number }
): { r: number; g: number; b: number } | null {
  const refHue = getHue(reference.r, reference.g, reference.b);
  
  for (const color of colors) {
    const hue = getHue(color.r, color.g, color.b);
    const hueDiff = Math.abs(hue - refHue);
    
    // Look for colors with significantly different hue (at least 40 degrees)
    if (hueDiff > 40 && hueDiff < 320) {
      return color;
    }
  }
  
  return null;
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Generates CSS gradient string from extracted colors
 */
export function generateAnimatedGradient(colors: ExtractedColors): string {
  return `linear-gradient(
    135deg, 
    ${colors.primary} 0%, 
    ${colors.secondary} 50%, 
    ${colors.accent} 100%
  )`;
}
