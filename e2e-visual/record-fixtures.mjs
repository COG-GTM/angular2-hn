// Records live HN API responses into fixtures/ so both apps render identical data.
import { mkdir, writeFile } from 'node:fs/promises';
import { API_BASE, FIXTURE_REQUESTS, FIXTURE_SOURCE_OVERRIDES, fixtureFile } from './config.mjs';

await mkdir(new URL('./fixtures/', import.meta.url), { recursive: true });
for (const path of FIXTURE_REQUESTS) {
  const res = await fetch(FIXTURE_SOURCE_OVERRIDES[path] ?? `${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const body = await res.text();
  await writeFile(new URL(`./fixtures/${fixtureFile(path)}`, import.meta.url), body);
  console.log('recorded', path, body.length, 'bytes');
}
