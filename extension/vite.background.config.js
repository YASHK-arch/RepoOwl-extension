import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe the UI build
    lib: {
      entry: resolve(__dirname, 'src/background.js'),
      name: 'BackgroundWorker',
      formats: ['es'],
      fileName: () => 'background.js'
    }
  },
  define: {
    'process.env': {}
  }
});
