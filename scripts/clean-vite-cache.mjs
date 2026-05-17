import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteCache = path.join(root, 'node_modules', '.vite');

if (fs.existsSync(viteCache)) {
    fs.rmSync(viteCache, { recursive: true, force: true });
    console.log('Removed', viteCache);
} else {
    console.log('No Vite cache at', viteCache);
}
