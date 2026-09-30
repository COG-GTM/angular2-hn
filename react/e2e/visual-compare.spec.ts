import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { states } from './states.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), 'screenshots');
const referenceDir = join(root, 'angular');
const actualDir = join(root, 'react');
const diffDir = join(root, 'diff');
const MAX_MISMATCH_RATIO = Number(process.env.MAX_MISMATCH_RATIO ?? 0.002);

test.afterAll(() => {
    const report = Object.fromEntries(
        readdirSync(diffDir)
            .filter((f) => f.endsWith('.result.json'))
            .sort()
            .map((f) => [f.replace('.result.json', ''), JSON.parse(readFileSync(join(diffDir, f), 'utf8'))])
    );
    writeFileSync(join(diffDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
});

test.describe('react vs angular screenshots', () => {
    mkdirSync(diffDir, { recursive: true });
    for (const state of states) {
        test(state.name, () => {
            const refPath = join(referenceDir, `${state.name}.png`);
            const actPath = join(actualDir, `${state.name}.png`);
            expect(existsSync(refPath), `missing reference ${refPath}`).toBe(true);
            expect(existsSync(actPath), `missing screenshot ${actPath}`).toBe(true);
            const ref = PNG.sync.read(readFileSync(refPath));
            const act = PNG.sync.read(readFileSync(actPath));
            const width = Math.max(ref.width, act.width);
            const height = Math.max(ref.height, act.height);
            const pad = (img: PNG) => {
                if (img.width === width && img.height === height) return img;
                const out = new PNG({ width, height });
                out.data.fill(255);
                PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
                return out;
            };
            const diff = new PNG({ width, height });
            const mismatched = pixelmatch(pad(ref).data, pad(act).data, diff.data, width, height, { threshold: 0.1 });
            writeFileSync(join(diffDir, `${state.name}.png`), PNG.sync.write(diff));
            const ratio = mismatched / (width * height);
            const result = {
                size: `${ref.width}x${ref.height} vs ${act.width}x${act.height}`,
                mismatchedPixels: mismatched,
                ratio,
            };
            writeFileSync(join(diffDir, `${state.name}.result.json`), JSON.stringify(result) + '\n');
            expect.soft(`${act.width}x${act.height}`, 'page dimensions').toBe(`${ref.width}x${ref.height}`);
            expect(ratio, `${mismatched} mismatched pixels`).toBeLessThanOrEqual(MAX_MISMATCH_RATIO);
        });
    }
});
