import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    assetsInlineLimit: 2048,
    rollupOptions: { output: { chunkFileNames: 'assets/[name]-[hash].js' } }
  },
  plugins: mode === 'analyze'
    ? [visualizer({ filename: 'dist/bundle-report.html', gzipSize: true, brotliSize: true })]
    : []
}));
