import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const SOURCE_DIR = path.join(__dirname, 'screenshots', 'source');
const REACT_DIR = path.join(__dirname, 'screenshots', 'react');
const DIFF_DIR = path.join(__dirname, 'screenshots', 'diff');

const THRESHOLD = 0.02; // 2% mismatch threshold

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readPNG(filePath: string): PNG {
  const data = fs.readFileSync(filePath);
  return PNG.sync.read(data);
}

function comparePair(filename: string): { mismatch: number; pass: boolean } {
  const sourcePath = path.join(SOURCE_DIR, filename);
  const reactPath = path.join(REACT_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.log(`  SKIP: source/${filename} not found`);
    return { mismatch: -1, pass: false };
  }
  if (!fs.existsSync(reactPath)) {
    console.log(`  SKIP: react/${filename} not found`);
    return { mismatch: -1, pass: false };
  }

  const source = readPNG(sourcePath);
  const react = readPNG(reactPath);

  // Crop both images to matching dimensions if needed
  const width = Math.min(source.width, react.width);
  const height = Math.min(source.height, react.height);

  // Create properly cropped buffers with correct stride
  const sourceCropped = new PNG({ width, height });
  const reactCropped = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * source.width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      sourceCropped.data[dstIdx] = source.data[srcIdx];
      sourceCropped.data[dstIdx + 1] = source.data[srcIdx + 1];
      sourceCropped.data[dstIdx + 2] = source.data[srcIdx + 2];
      sourceCropped.data[dstIdx + 3] = source.data[srcIdx + 3];

      const reactSrcIdx = (y * react.width + x) * 4;
      reactCropped.data[dstIdx] = react.data[reactSrcIdx];
      reactCropped.data[dstIdx + 1] = react.data[reactSrcIdx + 1];
      reactCropped.data[dstIdx + 2] = react.data[reactSrcIdx + 2];
      reactCropped.data[dstIdx + 3] = react.data[reactSrcIdx + 3];
    }
  }

  const diff = new PNG({ width, height });
  const totalPixels = width * height;

  const mismatchedPixels = pixelmatch(
    sourceCropped.data,
    reactCropped.data,
    diff.data,
    width,
    height,
    { threshold: 0.2 }
  );

  const mismatchPercent = mismatchedPixels / totalPixels;

  // Save diff image
  ensureDir(DIFF_DIR);
  const diffPath = path.join(DIFF_DIR, filename);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    mismatch: mismatchPercent,
    pass: mismatchPercent < THRESHOLD,
  };
}

async function compareAll() {
  ensureDir(DIFF_DIR);

  const sourceFiles = fs.existsSync(SOURCE_DIR)
    ? fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.png'))
    : [];

  const reactFiles = fs.existsSync(REACT_DIR)
    ? fs.readdirSync(REACT_DIR).filter(f => f.endsWith('.png'))
    : [];

  const allFiles = [...new Set([...sourceFiles, ...reactFiles])].sort();

  if (allFiles.length === 0) {
    console.log('No screenshots found. Run capture scripts first.');
    return;
  }

  console.log(`\nComparing ${allFiles.length} screenshots...\n`);

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const filename of allFiles) {
    const result = comparePair(filename);

    if (result.mismatch === -1) {
      skipped++;
      continue;
    }

    const percent = (result.mismatch * 100).toFixed(2);
    const status = result.pass ? 'PASS' : 'FAIL';
    const icon = result.pass ? '  ' : '! ';

    console.log(`${icon}${status} ${filename}: ${percent}% mismatch`);

    if (result.pass) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n--- Results ---`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${allFiles.length}`);
  console.log(`Threshold: <${THRESHOLD * 100}%`);

  if (failed > 0) {
    console.log(`\nDiff images saved to: ${DIFF_DIR}`);
    process.exit(1);
  }
}

compareAll().catch(console.error);
