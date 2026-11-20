// Side-by-side (baseline | upgraded | diff) composites with pixel-diff % per page.
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = path.dirname(new URL(import.meta.url).pathname);
const screens = path.join(root, 'report', 'screens');
const out = path.join(root, 'report', 'side-by-side');
fs.mkdirSync(out, { recursive: true });

const pad = (img, w, h) => {
  const p = new PNG({ width: w, height: h });
  p.data.fill(255);
  PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0);
  return p;
};

const rows = [];
for (const file of fs.readdirSync(path.join(screens, 'baseline')).sort()) {
  const upFile = path.join(screens, 'upgraded', file);
  if (!fs.existsSync(upFile)) continue;
  const a0 = PNG.sync.read(fs.readFileSync(path.join(screens, 'baseline', file)));
  const b0 = PNG.sync.read(fs.readFileSync(upFile));
  const w = Math.max(a0.width, b0.width);
  const h = Math.max(a0.height, b0.height);
  const a = pad(a0, w, h);
  const b = pad(b0, w, h);
  const diff = new PNG({ width: w, height: h });
  const changed = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
  const pct = ((changed / (w * h)) * 100).toFixed(2);
  const gap = 16;
  const combo = new PNG({ width: w * 3 + gap * 2, height: h });
  combo.data.fill(255);
  PNG.bitblt(a, combo, 0, 0, w, h, 0, 0);
  PNG.bitblt(b, combo, 0, 0, w, h, w + gap, 0);
  PNG.bitblt(diff, combo, 0, 0, w, h, (w + gap) * 2, 0);
  fs.writeFileSync(path.join(out, file), PNG.sync.write(combo));
  rows.push({ page: file.replace('.png', ''), size: `${a0.width}x${a0.height} / ${b0.width}x${b0.height}`, pct });
}

const table = ['| Page | Size (baseline / upgraded) | Pixel diff |', '|---|---|---|',
  ...rows.map(r => `| ${r.page} | ${r.size} | ${r.pct}% |`)].join('\n');
fs.writeFileSync(path.join(root, 'report', 'diff.md'), table + '\n');
console.log(table);
