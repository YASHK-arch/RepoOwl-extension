import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe the UI or content build
    lib: {
      entry: resolve(__dirname, 'src/content/sidebarCard.js'),
      name: 'SidebarCard',
      formats: ['iife'],
      fileName: () => 'sidebarCard.js'
    },
    rollupOptions: {}
  },
  define: {
    'process.env': {}
  }
});
