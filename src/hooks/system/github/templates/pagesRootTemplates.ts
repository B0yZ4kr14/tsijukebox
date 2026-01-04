// Pages Root templates (1 file)

export function generatePagesRootContent(path: string): string | null {
  switch (path) {
    case 'src/pages/index.ts':
      return `// Pages barrel export - Main entry point for all page exports

// Admin pages
export * from './admin';

// Brand pages
export * from './brand';

// Dashboard pages
export * from './dashboards';

// Public pages
export * from './public';

// Settings pages
export * from './settings';

// Social pages
export * from './social';

// Spotify pages
export * from './spotify';

// Tools pages
export * from './tools';

// YouTube pages
export * from './youtube';
`;

    default:
      return null;
  }
}
