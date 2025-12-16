/**
 * Theme morphing utilities for smooth transitions
 */

const TRANSITION_DURATION = 500; // ms

/**
 * Apply theme with smooth morphing transition
 */
export function applyThemeWithTransition(
  theme: string,
  onApply: () => void
): void {
  const root = document.documentElement;
  
  // Add transition class for smooth morphing
  root.classList.add('theme-transitioning');
  
  // Apply the theme change
  onApply();
  
  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('theme-transitioning');
  }, TRANSITION_DURATION);
}

/**
 * Apply high contrast mode with transition
 */
export function setHighContrast(enabled: boolean): void {
  applyThemeWithTransition('high-contrast', () => {
    document.documentElement.setAttribute('data-high-contrast', String(enabled));
  });
}

/**
 * Apply reduced motion preference
 */
export function setReducedMotion(enabled: boolean): void {
  document.documentElement.setAttribute('data-reduced-motion', String(enabled));
}
