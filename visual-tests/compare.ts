import * as fs from 'fs';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { screenshotDir } from './capture';
import { VIEWPORTS, VIEWS } from './matrix';

const configuredThreshold = Number(process.env.MISMATCH_THRESHOLD);
const THRESHOLD_PCT = Number.isFinite(configuredThreshold) && configuredThreshold > 0 ? configuredThreshold : 2;
const diffDir = path.join(__dirname, 'screenshots', 'diff');

interface Result {
    name: string;
    mismatchPct: number;
    passed: boolean;
}

/** Pads both images to a common canvas so height differences do not crash pixelmatch. */
function padTo(png: PNG, width: number, height: number): PNG {
    if (png.width === width && png.height === height) {
        return png;
    }
    const padded = new PNG({ width, height, fill: true });
    PNG.bitblt(png, padded, 0, 0, Math.min(png.width, width), Math.min(png.height, height), 0, 0);
    return padded;
}

function comparePair(name: string): Result {
    const sourceFile = path.join(screenshotDir('source'), `${name}.png`);
    const reactFile = path.join(screenshotDir('react'), `${name}.png`);
    const source = PNG.sync.read(fs.readFileSync(sourceFile));
    const react = PNG.sync.read(fs.readFileSync(reactFile));
    const width = Math.max(source.width, react.width);
    const height = Math.max(source.height, react.height);
    const a = padTo(source, width, height);
    const b = padTo(react, width, height);
    const diff = new PNG({ width, height });
    const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1 });
    fs.writeFileSync(path.join(diffDir, `${name}.png`), PNG.sync.write(diff));
    const mismatchPct = (mismatched / (width * height)) * 100;
    return { name, mismatchPct, passed: mismatchPct < THRESHOLD_PCT };
}

function main(): void {
    fs.mkdirSync(diffDir, { recursive: true });
    const results: Result[] = [];
    for (const view of VIEWS) {
        for (const viewport of VIEWPORTS) {
            results.push(comparePair(`${view.name}-${viewport.name}`));
        }
    }
    results.sort((x, y) => y.mismatchPct - x.mismatchPct);
    for (const result of results) {
        console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${result.mismatchPct.toFixed(3)}%  ${result.name}`);
    }
    const failures = results.filter((result) => !result.passed);
    console.log(
        `\n${results.length - failures.length}/${results.length} pairs under ${THRESHOLD_PCT}% ` +
            `(worst ${results[0].mismatchPct.toFixed(3)}%)`
    );
    if (failures.length > 0) {
        process.exit(1);
    }
}

main();
