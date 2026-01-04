import { designTokens } from "@/lib/design-tokens";

/**
 * useDesignTokens Hook - TSiJUKEBOX
 * 
 * Hook React para acessar os design tokens do sistema.
 * Fornece acesso type-safe a todas as variáveis de design.
 * 
 * @author B0.y_Z4kr14
 * @version 4.2.0
 * @reference src/lib/design-tokens.ts
 * 
 * @example
 * ```tsx
 * import { useDesignTokens } from '@/hooks/useDesignTokens';
 * 
 * function MyComponent() {
 *   const tokens = useDesignTokens();
 *   
 *   return (
 *     <div style={{ 
 *       backgroundColor: tokens.colors.background.primary,
 *       color: tokens.colors.text.primary,
 *       padding: tokens.spacing.lg,
 *       borderRadius: tokens.borderRadius.lg,
 *     }}>
 *       Hello World
 *     </div>
 *   );
 * }
 * ```
 */
export const useDesignTokens = () => {
  return designTokens;
};

/**
 * Hook para acessar apenas as cores do design system
 */
export const useColors = () => {
  return designTokens.colors;
};

/**
 * Hook para acessar apenas a tipografia do design system
 */
export const useTypography = () => {
  return designTokens.typography;
};

/**
 * Hook para acessar apenas o espaçamento do design system
 */
export const useSpacing = () => {
  return designTokens.spacing;
};

/**
 * Hook para acessar apenas as sombras do design system
 */
export const useShadows = () => {
  return designTokens.shadows;
};

/**
 * Hook para acessar apenas os breakpoints do design system
 */
export const useBreakpoints = () => {
  return designTokens.breakpoints;
};

/**
 * Hook para acessar apenas os componentes do design system
 */
export const useComponentTokens = () => {
  return designTokens.components;
};

export default useDesignTokens;
