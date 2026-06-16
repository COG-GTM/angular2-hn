import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ANGULAR_DIR = path.join(__dirname, 'screenshots', 'angular');
const REACT_DIR = path.join(__dirname, 'screenshots', 'react');
const DIFF_DIR = path.join(__dirname, 'screenshots', 'diffs');

const THRESHOLD = 2.0; // percent mismatch above which a view FAILS

type Result = { name: string; mismatchPct: number; status: 'PASS' | 'FAIL' | 'MISSING' };

function loadPng(file: string): PNG {
  return PNG.sync.read(fs.readFileSync(file));
}

// Pad a smaller image up to a target size with transparent pixels so two images
// of slightly different heights can still be compared.
function pad(src: PNG, width: number, height: number): PNG {
  if (src.width === width && src.height === height) return src;
  const dst = new PNG({ width, height });
  dst.data.fill(0);
  PNG.bitblt(src, dst, 0, 0, Math.min(src.width, width), Math.min(src.height, height), 0, 0);
  return dst;
}

function main() {
  fs.mkdirSync(DIFF_DIR, { recursive: true });
  const files = fs
    .readdirSync(ANGULAR_DIR)
    .filter((f) => f.endsWith('.png'))
    .sort();

  const results: Result[] = [];

  for (const file of files) {
    const aPath = path.join(ANGULAR_DIR, file);
    const bPath = path.join(REACT_DIR, file);
    const name = file.replace(/\.png$/, '');

    if (!fs.existsSync(bPath)) {
      results.push({ name, mismatchPct: 100, status: 'MISSING' });
      continue;
    }

    const a = loadPng(aPath);
    const b = loadPng(bPath);
    const width = Math.max(a.width, b.width);
    const height = Math.max(a.height, b.height);
    const ap = pad(a, width, height);
    const bp = pad(b, width, height);

    const diff = new PNG({ width, height });
    const numDiff = pixelmatch(ap.data, bp.data, diff.data, width, height, {
      threshold: 0.1,
    });
    const mismatchPct = (numDiff / (width * height)) * 100;

    fs.writeFileSync(path.join(DIFF_DIR, `${name}-diff.png`), PNG.sync.write(diff));

    results.push({
      name,
      mismatchPct,
      status: mismatchPct > THRESHOLD ? 'FAIL' : 'PASS',
    });
  }

  // Summary table
  const nameW = Math.max(...results.map((r) => r.name.length), 20);
  console.log('\nVisual Regression Summary (Angular baseline vs React)');
  console.log('='.repeat(nameW + 24));
  console.log(`${'View'.padEnd(nameW)}  ${'Mismatch'.padStart(10)}  Status`);
  console.log('-'.repeat(nameW + 24));
  for (const r of results) {
    console.log(
      `${r.name.padEnd(nameW)}  ${r.mismatchPct.toFixed(3).padStart(9)}%  ${r.status}`
    );
  }
  console.log('-'.repeat(nameW + 24));

  const failures = results.filter((r) => r.status !== 'PASS');
  const passed = results.length - failures.length;
  console.log(`\n${passed}/${results.length} views passed (threshold ${THRESHOLD}%).`);
  if (failures.length) {
    console.log('Failing views: ' + failures.map((f) => f.name).join(', '));
    process.exitCode = 1;
  }
}

main();
