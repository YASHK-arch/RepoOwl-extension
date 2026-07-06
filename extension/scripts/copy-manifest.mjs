import { copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(__dirname, '..');

copyFileSync(
  resolve(extensionRoot, 'manifest.dist.json'),
  resolve(extensionRoot, 'dist', 'manifest.json')
);

console.log('Copied manifest.json to extension/dist');
