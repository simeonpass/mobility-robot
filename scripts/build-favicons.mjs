// Format-only export of the approved image; macOS sips supplies PNG resizing.
// Usage: node scripts/build-favicons.mjs /absolute/path/to/favicon-master.png
import {execFileSync} from 'node:child_process';
import {copyFileSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = process.argv[2] && resolve(process.argv[2]);
if (!source) throw new Error('Provide the approved square favicon master.');
const output = mkdtempSync(join(tmpdir(), 'xsto-favicon-'));
const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
const pngs = new Map();
for (const size of sizes) {
  const path = join(output, `${size}.png`);
  execFileSync('sips', [
    '-s',
    'format',
    'png',
    '-z',
    String(size),
    String(size),
    source,
    '--out',
    path,
  ]);
  pngs.set(size, path);
}
for (const [size, paths] of [
  [
    512,
    [
      'app/assets/xsto-favicon.png',
      'app/assets/favicon.png',
      'app/assets/mobility-robot-icon.png',
    ],
  ],
  [192, ['app/assets/xsto-favicon-192.png']],
  [32, ['app/assets/xsto-favicon-32.png']],
  [180, ['app/assets/apple-touch-icon.png', 'public/apple-touch-icon.png']],
]) {
  for (const path of paths) copyFileSync(pngs.get(size), join(root, path));
}

// ICO directory plus PNG frames: preserves crisp icons at each browser size.
const frames = [16, 32, 48, 64, 128, 256].map((size) => ({
  size,
  bytes: readFileSync(pngs.get(size)),
}));
const header = Buffer.alloc(6 + frames.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach(({size, bytes}, index) => {
  const position = 6 + index * 16;
  header[position] = size === 256 ? 0 : size;
  header[position + 1] = size === 256 ? 0 : size;
  header.writeUInt16LE(1, position + 4);
  header.writeUInt16LE(32, position + 6);
  header.writeUInt32LE(bytes.length, position + 8);
  header.writeUInt32LE(offset, position + 12);
  offset += bytes.length;
});
const ico = Buffer.concat([header, ...frames.map((frame) => frame.bytes)]);
for (const path of ['app/assets/favicon.ico', 'public/favicon.ico'])
  writeFileSync(join(root, path), ico);

// Preserve the legacy SVG URL without leaving the retired monogram accessible.
const png = readFileSync(pngs.get(512)).toString('base64');
writeFileSync(
  join(root, 'public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${png}"/></svg>\n`,
);
console.log(
  `Exported PNG, Apple and multi-size ICO assets. Size previews: ${output}`,
);
