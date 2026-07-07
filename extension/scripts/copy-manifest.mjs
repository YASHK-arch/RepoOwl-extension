import { copyFileSync, mkdirSync, readdirSync, statSync, cpSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(__dirname, '..');

// Copy manifest (use the main manifest.json directly since we unified them)
copyFileSync(
  resolve(extensionRoot, 'manifest.json'),
  resolve(extensionRoot, 'dist', 'manifest.json')
);
console.log('Copied manifest.json to extension/dist');

// Copy icons folder
const iconsSource = resolve(extensionRoot, 'public', 'icons');
const iconsDest = resolve(extensionRoot, 'dist', 'icons');
try {
  cpSync(iconsSource, iconsDest, { recursive: true });
  console.log('Copied icons/ to extension/dist/icons');
} catch (e) {
  console.warn('Could not copy icons (may not exist yet):', e.message);
}
