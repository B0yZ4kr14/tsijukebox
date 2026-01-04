import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
  },
  plugins: [
    react(),
    // Bundle analyzer - only when BUILD_ANALYZE=true
    process.env.BUILD_ANALYZE === 'true' && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});
