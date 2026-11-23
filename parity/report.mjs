// Builds parity/report: side-by-side (baseline | react) PNGs with a pixel-diff % per screenshot.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const shots = 'screenshots';
const out = 'report';
mkdirSync(join(out, 'side-by-side'), { recursive: true });

function pad(png, width, height) {
  const out = new PNG({ width, height });
  out.data.fill(255);
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

const names = readdirSync(join(shots, 'baseline')).filter((f) => f.endsWith('.png')).sort();
const rows = [];
for (const name of names) {
  const reactPath = join(shots, 'react', name);
  if (!existsSync(reactPath)) {
    rows.push({ name, diff: null });
    continue;
  }
  const a = PNG.sync.read(readFileSync(join(shots, 'baseline', name)));
  const b = PNG.sync.read(readFileSync(reactPath));
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const pa = pad(a, width, height);
  const pb = pad(b, width, height);
  const diffPng = new PNG({ width, height });
  const changed = pixelmatch(pa.data, pb.data, diffPng.data, width, height, { threshold: 0.1 });
  const gap = 16;
  const side = new PNG({ width: width * 2 + gap, height });
  side.data.fill(255);
  PNG.bitblt(pa, side, 0, 0, width, height, 0, 0);
  PNG.bitblt(pb, side, 0, 0, width, height, width + gap, 0);
  writeFileSync(join(out, 'side-by-side', name), PNG.sync.write(side));
  rows.push({ name, diff: (changed / (width * height)) * 100, sizeA: `${a.width}x${a.height}`, sizeB: `${b.width}x${b.height}` });
}

const lines = [
  '# Angular → React parity report',
  '',
  'Same Playwright specs and fixture data against both apps. Left = Angular 9 (baseline), right = React.',
  '',
  '| Screenshot | Baseline size | React size | Pixel diff |',
  '| --- | --- | --- | --- |',
  ...rows.map((r) =>
    r.diff === null ? `| ${r.name} | | missing | n/a |` : `| [${r.name}](side-by-side/${r.name}) | ${r.sizeA} | ${r.sizeB} | ${r.diff.toFixed(2)}% |`
  ),
  '',
];
writeFileSync(join(out, 'README.md'), lines.join('\n'));
console.log(lines.join('\n'));
