import fs from 'fs';
import path from 'path';

const root = process.cwd();
const srcPkgDir = path.join(root, 'node_modules', '@tldraw', 'assets');
const srcPkgJsonPath = path.join(srcPkgDir, 'package.json');
const destDir = path.join(root, 'public', 'tldraw-assets');
const versionMarkerPath = path.join(destDir, '.version');

if (!fs.existsSync(srcPkgJsonPath)) {
  console.log('[copy-tldraw-assets] @tldraw/assets not found in node_modules, skipping.');
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(srcPkgJsonPath, 'utf8'));
const expectedVersion = String(pkg.version || 'unknown');
const assetFolders = ['fonts', 'icons', 'translations', 'embed-icons'];

const allFoldersExist = assetFolders.every((folder) =>
  fs.existsSync(path.join(destDir, folder))
);
const currentVersion = fs.existsSync(versionMarkerPath)
  ? fs.readFileSync(versionMarkerPath, 'utf8').trim()
  : null;

if (allFoldersExist && currentVersion === expectedVersion) {
  console.log(`[copy-tldraw-assets] Assets already up to date (v${expectedVersion}).`);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
for (const folder of assetFolders) {
  const from = path.join(srcPkgDir, folder);
  const to = path.join(destDir, folder);
  if (fs.existsSync(from)) {
    fs.cpSync(from, to, { recursive: true, force: true });
  }
}

fs.writeFileSync(versionMarkerPath, `${expectedVersion}\n`, 'utf8');
console.log(`[copy-tldraw-assets] Copied tldraw assets v${expectedVersion} to public/tldraw-assets.`);
