// Builds parity/report/README.md: per-test results for both projects and
// side-by-side screenshots (baseline left, upgraded right) with a pixel-diff %.
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), 'report');
const screens = path.join(root, 'screens');
const outDir = path.join(root, 'side-by-side');
fs.mkdirSync(outDir, { recursive: true });

function pad(img, w, h) {
  const out = new PNG({ width: w, height: h });
  out.data.fill(255);
  PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
  return out;
}

const rows = [];
const names = fs.existsSync(path.join(screens, 'baseline'))
  ? fs.readdirSync(path.join(screens, 'baseline')).filter((f) => f.endsWith('.png')).sort()
  : [];
for (const file of names) {
  const upFile = path.join(screens, 'upgraded', file);
  if (!fs.existsSync(upFile)) {
    rows.push({ name: file, diff: 'missing' });
    continue;
  }
  const a = PNG.sync.read(fs.readFileSync(path.join(screens, 'baseline', file)));
  const b = PNG.sync.read(fs.readFileSync(upFile));
  const w = Math.max(a.width, b.width);
  const h = Math.max(a.height, b.height);
  const pa = pad(a, w, h);
  const pb = pad(b, w, h);
  const changed = pixelmatch(pa.data, pb.data, null, w, h, { threshold: 0.1 });
  const gap = 16;
  const combo = new PNG({ width: w * 2 + gap, height: h });
  combo.data.fill(0);
  PNG.bitblt(pa, combo, 0, 0, w, h, 0, 0);
  PNG.bitblt(pb, combo, 0, 0, w, h, w + gap, 0);
  fs.writeFileSync(path.join(outDir, file), PNG.sync.write(combo));
  rows.push({ name: file, diff: ((changed / (w * h)) * 100).toFixed(2) + '%', size: `${a.width}x${a.height} / ${b.width}x${b.height}` });
}

const results = {};
const resultsFile = path.join(root, 'results.json');
if (fs.existsSync(resultsFile)) {
  const json = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  const walk = (suite, file) => {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests) {
        const key = `${file} › ${spec.title}`;
        results[key] = results[key] || {};
        const status = { expected: 'pass', flaky: 'pass (retried)', unexpected: 'FAIL', skipped: 'skipped' }[t.status] || t.status;
        results[key][t.projectName] = status;
      }
    }
    for (const s of suite.suites || []) walk(s, file || s.title);
  };
  for (const s of json.suites) walk(s, s.title);
}

const count = (p) => Object.values(results).filter((r) => (r[p] || '').startsWith('pass')).length;
const total = Object.keys(results).length;
let md = `# Parity report: Angular 9 baseline vs Angular 21 upgrade\n\n`;
md += `Same Playwright specs run against the baseline (\`:4000\`) and the upgraded app (\`:4200\`). `;
md += `All specs except \`live.spec.ts\` serve recorded API responses from \`parity/fixtures\`, so both apps render identical data. `;
md += `\`retries: 1\` is set because \`live.spec.ts\` hits the public HN APIs.\n\n`;
md += `**Result:** baseline ${count('baseline')}/${total} passed, upgraded ${count('upgraded')}/${total} passed.\n\n`;
md += `| Page / flow | Baseline | Upgraded |\n|---|---|---|\n`;
for (const [k, v] of Object.entries(results)) md += `| ${k} | ${v.baseline || '-'} | ${v.upgraded || '-'} |\n`;
md += `\n## Screenshots (baseline left, upgraded right)\n\n| Screen | Pixel diff | Size (baseline / upgraded) |\n|---|---|---|\n`;
for (const r of rows) md += `| [${r.name}](side-by-side/${r.name}) | ${r.diff} | ${r.size || ''} |\n`;
md += `\nRegenerate: serve both apps, then \`cd parity && npm test; npm run report\`.\n`;
fs.writeFileSync(path.join(root, 'README.md'), md);
console.log(md);
