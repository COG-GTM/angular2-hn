import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const html = new DOMParser().parseFromString(readFileSync('index.html', 'utf8'), 'text/html');

it('ships one manifest and the original theme color', () => {
  expect(Array.from(html.querySelectorAll('link[rel="manifest"]'), link => link.getAttribute('href'))).toEqual(['/manifest.json']);
  expect(Array.from(html.querySelectorAll('meta[name="theme-color"]'), meta => meta.getAttribute('content'))).toEqual(['#b92b27']);
});

it('ships every icon referenced by the manifest', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8')) as { icons: { src: string }[] };
  expect(manifest.icons.length).toBeGreaterThan(0);
  for (const icon of manifest.icons) expect(existsSync(`public/${icon.src}`), icon.src).toBe(true);
});

it('keeps a skip target, loading logo and no-script message before React starts', () => {
  expect(html.querySelector('#skip a')?.getAttribute('href')).toBe('#content');
  expect(html.querySelector('#content #root .app-loader img')?.getAttribute('src')).toBe('assets/images/logo.svg');
  expect(html.querySelector('#root noscript')?.textContent).toContain('JavaScript needs to be enabled');
});
