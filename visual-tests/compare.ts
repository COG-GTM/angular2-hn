import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const SOURCE_DIR = path.join(SCREENSHOT_DIR, 'source');
const REACT_DIR = path.join(SCREENSHOT_DIR, 'react');
const DIFF_DIR = path.join(SCREENSHOT_DIR, 'diff');
const THRESHOLD = 0.02; // 2% mismatch threshold

interface ComparisonResult {
    name: string;
    mismatchPercent: number;
    passed: boolean;
    totalPixels: number;
    diffPixels: number;
}

function compareImages(sourcePath: string, reactPath: string, diffPath: string): ComparisonResult {
    const name = path.basename(sourcePath);

    if (!fs.existsSync(sourcePath) || !fs.existsSync(reactPath)) {
        return {
            name,
            mismatchPercent: 100,
            passed: false,
            totalPixels: 0,
            diffPixels: 0,
        };
    }

    const sourceImg = PNG.sync.read(fs.readFileSync(sourcePath));
    const reactImg = PNG.sync.read(fs.readFileSync(reactPath));

    // Use the larger dimensions
    const width = Math.max(sourceImg.width, reactImg.width);
    const height = Math.max(sourceImg.height, reactImg.height);

    // Create padded images if sizes differ
    const padImage = (img: PNG, w: number, h: number): PNG => {
        if (img.width === w && img.height === h) return img;
        const padded = new PNG({ width: w, height: h });
        // Fill with white
        for (let i = 0; i < padded.data.length; i += 4) {
            padded.data[i] = 255;
            padded.data[i + 1] = 255;
            padded.data[i + 2] = 255;
            padded.data[i + 3] = 255;
        }
        // Copy original
        PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0);
        return padded;
    };

    const paddedSource = padImage(sourceImg, width, height);
    const paddedReact = padImage(reactImg, width, height);

    const diff = new PNG({ width, height });
    const totalPixels = width * height;

    const diffPixels = pixelmatch(
        paddedSource.data,
        paddedReact.data,
        diff.data,
        width,
        height,
        { threshold: 0.15, includeAA: false }
    );

    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const mismatchPercent = (diffPixels / totalPixels) * 100;

    return {
        name,
        mismatchPercent,
        passed: mismatchPercent < (THRESHOLD * 100),
        totalPixels,
        diffPixels,
    };
}

function main(): void {
    fs.mkdirSync(DIFF_DIR, { recursive: true });

    const sourceFiles = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.png'));
    const results: ComparisonResult[] = [];

    console.log('\n=== Visual Regression Test Results ===\n');

    for (const file of sourceFiles) {
        const sourcePath = path.join(SOURCE_DIR, file);
        const reactPath = path.join(REACT_DIR, file);
        const diffPath = path.join(DIFF_DIR, file);

        const result = compareImages(sourcePath, reactPath, diffPath);
        results.push(result);

        const status = result.passed ? 'PASS' : 'FAIL';
        const icon = result.passed ? '✓' : '✗';
        console.log(`${icon} [${status}] ${result.name}: ${result.mismatchPercent.toFixed(2)}% mismatch (${result.diffPixels}/${result.totalPixels} pixels)`);
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log(`\n=== Summary ===`);
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Threshold: <${THRESHOLD * 100}% pixel mismatch`);

    if (failed > 0) {
        console.log('\nFailed comparisons:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.mismatchPercent.toFixed(2)}%`);
        });
        process.exit(1);
    } else {
        console.log('\nAll visual regression tests passed!');
    }
}

main();
