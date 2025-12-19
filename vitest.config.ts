import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/vitest',
      include: [
        'src/hooks/**/*.ts',
        'src/components/**/*.tsx',
        'src/contexts/**/*.tsx',
        'src/lib/**/*.ts',
      ],
      exclude: [
        'src/**/index.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/integrations/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
