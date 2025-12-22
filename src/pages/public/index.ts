/**
 * Public Pages - Accessible without authentication
 * 
 * @description Páginas públicas acessíveis sem autenticação
 * @since 4.2.0
 */

// Eagerly loaded (critical path)
export { default as Index } from './Index';
export { default as Auth } from './Auth';
export { default as SetupWizard } from './SetupWizard';
export { default as NotFound } from './NotFound';
export { default as Login } from './Login';

// Lazy loaded
export { default as Install } from './Install';
export { default as Help } from './Help';
export { default as Wiki } from './Wiki';
export { default as LandingPage } from './LandingPage';
