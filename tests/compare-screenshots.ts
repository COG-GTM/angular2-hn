/**
 * Screenshot comparison + report generator (Phase 12c).
 *
 * Assumes the Playwright visual suite has already been run against both apps,
 * populating `screenshots/angular/` and `screenshots/react/` (see the
 * `test:visual:angular` / `test:visual:react` npm scripts). This script then:
 *
 *   1. Pairs up screenshots by filename.
 *   2. Compares each pair with pixelmatch.
 *   3. Writes a diff image to `screenshots/diffs/`.
 *   4. Classifies each pair PASS (<0.5%) / WARN (0.5-2%) / FAIL (>2%).
 *   5. Emits an HTML report (`screenshots/report.html`) showing
 *      Angular / React / Diff side-by-side.
 *
 * Exits non-zero if any pair is classified FAIL so CI can gate on it.
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');
const ANGULAR_DIR = path.join(SCREENSHOTS_DIR, 'angular');
const REACT_DIR = path.join(SCREENSHOTS_DIR, 'react');
const DIFFS_DIR = path.join(SCREENSHOTS_DIR, 'diffs');
const REPORT_PATH = path.join(SCREENSHOTS_DIR, 'report.html');

const PASS_THRESHOLD = 0.5; // percent
const WARN_THRESHOLD = 2.0; // percent

type Status = 'PASS' | 'WARN' | 'FAIL' | 'MISSING';

interface Result {
    name: string;
    width: number;
    height: number;
    diffPixels: number;
    totalPixels: number;
    percent: number;
    status: Status;
    angular: boolean;
    react: boolean;
}

function classify(percent: number): Status {
    if (percent < PASS_THRESHOLD) return 'PASS';
    if (percent <= WARN_THRESHOLD) return 'WARN';
    return 'FAIL';
}

async function listPngs(dir: string): Promise<string[]> {
    try {
        return (await fs.readdir(dir)).filter((f) => f.endsWith('.png'));
    } catch {
        return [];
    }
}

/** Copy a source PNG's pixels into a (possibly larger) RGBA canvas. */
function pad(src: PNG, width: number, height: number): Buffer {
    const out = Buffer.alloc(width * height * 4); // transparent by default
    for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
            const si = (src.width * y + x) * 4;
            const di = (width * y + x) * 4;
            out[di] = src.data[si];
            out[di + 1] = src.data[si + 1];
            out[di + 2] = src.data[si + 2];
            out[di + 3] = src.data[si + 3];
        }
    }
    return out;
}

async function comparePair(name: string): Promise<Result> {
    const aPath = path.join(ANGULAR_DIR, name);
    const rPath = path.join(REACT_DIR, name);
    const hasA = await fs
        .access(aPath)
        .then(() => true)
        .catch(() => false);
    const hasR = await fs
        .access(rPath)
        .then(() => true)
        .catch(() => false);

    if (!hasA || !hasR) {
        return {
            name,
            width: 0,
            height: 0,
            diffPixels: 0,
            totalPixels: 0,
            percent: 100,
            status: 'MISSING',
            angular: hasA,
            react: hasR,
        };
    }

    const a = PNG.sync.read(await fs.readFile(aPath));
    const r = PNG.sync.read(await fs.readFile(rPath));
    const width = Math.max(a.width, r.width);
    const height = Math.max(a.height, r.height);

    const aBuf = a.width === width && a.height === height ? a.data : pad(a, width, height);
    const rBuf = r.width === width && r.height === height ? r.data : pad(r, width, height);

    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(aBuf, rBuf, diff.data, width, height, {
        threshold: 0.1,
        includeAA: false,
    });

    await fs.mkdir(DIFFS_DIR, { recursive: true });
    await fs.writeFile(path.join(DIFFS_DIR, name), PNG.sync.write(diff));

    const totalPixels = width * height;
    const percent = (diffPixels / totalPixels) * 100;

    return {
        name,
        width,
        height,
        diffPixels,
        totalPixels,
        percent,
        status: classify(percent),
        angular: true,
        react: true,
    };
}

function badge(status: Status): string {
    const colors: Record<Status, string> = {
        PASS: '#1a7f37',
        WARN: '#9a6700',
        FAIL: '#cf222e',
        MISSING: '#57606a',
    };
    return `<span style="background:${colors[status]};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600">${status}</span>`;
}

function renderHtml(results: Result[]): string {
    const counts = results.reduce(
        (acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        },
        {} as Record<Status, number>,
    );

    const rows = results
        .map((r) => {
            const cell = (sub: string) =>
                r[sub as 'angular' | 'react'] || sub === 'diffs'
                    ? `<img loading="lazy" src="${sub}/${r.name}" alt="${sub} ${r.name}" />`
                    : '<div class="missing">missing</div>';
            return `<tr>
        <td class="name">${r.name}<br/>${badge(r.status)}
          <div class="meta">${r.percent.toFixed(3)}% (${r.diffPixels.toLocaleString()} px)<br/>${r.width}×${r.height}</div>
        </td>
        <td>${cell('angular')}</td>
        <td>${cell('react')}</td>
        <td>${r.status === 'MISSING' ? '<div class="missing">n/a</div>' : cell('diffs')}</td>
      </tr>`;
        })
        .join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Angular vs React — Visual Parity Report</title>
<style>
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; margin: 24px; color: #1f2328; }
  h1 { margin: 0 0 4px; }
  .summary { margin: 12px 0 24px; font-size: 14px; }
  .summary span { margin-right: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d0d7de; padding: 8px; vertical-align: top; text-align: left; }
  th { background: #f6f8fa; position: sticky; top: 0; }
  td.name { width: 200px; font-size: 13px; word-break: break-all; }
  td.name .meta { color: #57606a; font-size: 12px; margin-top: 6px; }
  img { max-width: 320px; height: auto; border: 1px solid #eaeef2; display: block; }
  .missing { color: #cf222e; font-style: italic; }
</style>
</head>
<body>
  <h1>Angular vs React — Visual Parity Report</h1>
  <div class="summary">
    <span>Total: <strong>${results.length}</strong></span>
    <span>${badge('PASS')} ${counts.PASS || 0}</span>
    <span>${badge('WARN')} ${counts.WARN || 0}</span>
    <span>${badge('FAIL')} ${counts.FAIL || 0}</span>
    <span>${badge('MISSING')} ${counts.MISSING || 0}</span>
    <span>PASS &lt; ${PASS_THRESHOLD}% &middot; WARN &le; ${WARN_THRESHOLD}% &middot; FAIL &gt; ${WARN_THRESHOLD}%</span>
  </div>
  <table>
    <thead>
      <tr><th>Test case</th><th>Angular</th><th>React</th><th>Diff</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function main(): Promise<void> {
    const angularFiles = await listPngs(ANGULAR_DIR);
    const reactFiles = await listPngs(REACT_DIR);
    const names = Array.from(new Set([...angularFiles, ...reactFiles])).sort();

    if (names.length === 0) {
        console.error(
            'No screenshots found. Run `npm run test:visual:angular` and `npm run test:visual:react` first.',
        );
        process.exit(1);
    }

    const results: Result[] = [];
    for (const name of names) {
        results.push(await comparePair(name));
    }

    await fs.writeFile(REPORT_PATH, renderHtml(results));

    // Console summary table.
    console.log('\nVisual parity comparison');
    console.log('='.repeat(72));
    for (const r of results) {
        const pct = r.status === 'MISSING' ? '   n/a' : `${r.percent.toFixed(3)}%`.padStart(8);
        console.log(`${r.status.padEnd(8)} ${pct}  ${r.name}`);
    }
    console.log('='.repeat(72));

    const counts = results.reduce(
        (acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc),
        {} as Record<Status, number>,
    );
    console.log(
        `PASS ${counts.PASS || 0}  WARN ${counts.WARN || 0}  FAIL ${counts.FAIL || 0}  MISSING ${counts.MISSING || 0}`,
    );
    console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`);

    const failures = (counts.FAIL || 0) + (counts.MISSING || 0);
    if (failures > 0) {
        console.error(`\n${failures} comparison(s) exceeded the 2% FAIL threshold (or were missing).`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
