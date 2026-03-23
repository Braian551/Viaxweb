import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { legalContent } from '../src/data/legalContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..');

const webPublicPath = path.join(webRoot, 'public', 'legal_content.json');
const appAssetPath = path.join(repoRoot, 'assets', 'legal', 'legal_content.json');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const payload = legalContent;

writeJson(webPublicPath, payload);
writeJson(appAssetPath, payload);

console.log('[legal-content] Export completado');
console.log(`- Web: ${webPublicPath}`);
console.log(`- App: ${appAssetPath}`);
