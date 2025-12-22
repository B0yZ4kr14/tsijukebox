/**
 * ============================================================================
 * TSiJUKEBOX - PAGES BARREL EXPORT
 * ============================================================================
 * 
 * @file        src/pages/index.ts
 * @description Exportação centralizada de todas as páginas organizadas por categoria
 * @version     4.2.0
 * @date        2025-01-20
 * @author      B0.y_Z4kr14
 * 
 * ============================================================================
 * ARQUITETURA DE PÁGINAS
 * ============================================================================
 * 
 * As páginas estão organizadas em subpastas por categoria:
 * 
 * - public/     → Páginas públicas (Index, Auth, Help, etc.)
 * - admin/      → Páginas administrativas
 * - dashboards/ → Dashboards de monitoramento
 * - spotify/    → Integração Spotify
 * - youtube/    → Integração YouTube Music
 * - settings/   → Configurações e diagnósticos
 * - brand/      → Identidade visual
 * - tools/      → Ferramentas de desenvolvimento
 * - social/     → Funcionalidades colaborativas
 * 
 * ============================================================================
 * COMO ADICIONAR NOVA PÁGINA
 * ============================================================================
 * 
 * 1. Criar arquivo na subpasta apropriada (ex: src/pages/public/NovaPage.tsx)
 * 2. Adicionar export no index.ts da subpasta
 * 3. O re-export automático via este arquivo já disponibiliza globalmente
 * 
 * ============================================================================
 */

// Public pages
export * from './public';

// Admin pages
export * from './admin';

// Dashboard pages
export * from './dashboards';

// Spotify pages
export * from './spotify';

// YouTube Music pages
export * from './youtube';

// Settings pages
export * from './settings';

// Brand pages
export * from './brand';

// Tools pages
export * from './tools';

// Social pages
export * from './social';
