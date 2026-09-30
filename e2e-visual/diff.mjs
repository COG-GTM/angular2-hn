// Pixel-diffs two screenshot directories (same file names) and writes diff PNGs + report.
// Usage: node diff.mjs --ref ../reference-screenshots --actual ../react-screenshots --out ../screenshot-diffs
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const { values } = parseArgs({
  options: {
    ref: { type: 'string', default: '../reference-screenshots' },
    actual: { type: 'string', default: '../react-screenshots' },
    out: { type: 'string', default: '../screenshot-diffs' },
    threshold: { type: 'string', default: '0.1' },
    'max-diff-pct': { type: 'string', default: '1' },
  },
});
const maxPct = Number(values['max-diff-pct']);

function pad(png, width, height) {
  if (png.width === width && png.height === height) return png;
  const out = new PNG({ width, height });
  out.data.fill(255);
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

await mkdir(values.out, { recursive: true });
const files = (await readdir(values.ref)).filter((f) => f.endsWith('.png')).sort();
const rows = [];
for (const file of files) {
  const actualPath = path.join(values.actual, file);
  if (!existsSync(actualPath)) {
    rows.push({ file, status: 'MISSING', diffPct: 100 });
    continue;
  }
  const ref = PNG.sync.read(await readFile(path.join(values.ref, file)));
  const act = PNG.sync.read(await readFile(actualPath));
  const width = Math.max(ref.width, act.width);
  const height = Math.max(ref.height, act.height);
  const a = pad(ref, width, height);
  const b = pad(act, width, height);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: Number(values.threshold),
  });
  const diffPct = (mismatched / (width * height)) * 100;
  await writeFile(path.join(values.out, file), PNG.sync.write(diff));
  rows.push({
    file,
    status: diffPct <= maxPct ? 'PASS' : 'FAIL',
    diffPct: Number(diffPct.toFixed(3)),
    refSize: `${ref.width}x${ref.height}`,
    actualSize: `${act.width}x${act.height}`,
  });
}

const md = [
  '| Screenshot | Status | Diff % | Ref size | Actual size |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.file} | ${r.status} | ${r.diffPct} | ${r.refSize ?? ''} | ${r.actualSize ?? ''} |`),
].join('\n');
await writeFile(path.join(values.out, 'report.md'), md + '\n');
await writeFile(path.join(values.out, 'report.json'), JSON.stringify(rows, null, 2));
console.log(md);
const failed = rows.filter((r) => r.status !== 'PASS').length;
console.log(`\n${rows.length - failed}/${rows.length} within ${maxPct}% pixel difference`);
process.exitCode = failed ? 1 : 0;
