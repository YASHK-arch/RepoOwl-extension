import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe the UI build
    lib: {
      entry: resolve(__dirname, 'src/content/index.js'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'content.js'
    },
    rollupOptions: {
      // Don't externalize React/Supabase because they need to be bundled inside the content script
    }
  },
  define: {
    'process.env': JSON.stringify({}),
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process': { env: {} }
  }
});

