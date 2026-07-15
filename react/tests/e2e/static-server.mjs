// Minimal static file server with SPA (history API) fallback, used by the
// Playwright parity suite to serve the built Angular and React apps.
// Usage: node static-server.mjs <rootDir> <port>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const root = resolve(process.argv[2]);
const port = Number(process.argv[3]);

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

async function tryFile(path) {
  try {
    const s = await stat(path);
    if (s.isFile()) return path;
  } catch {
    /* ignore */
  }
  return null;
}

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = join(root, urlPath);
  let found = await tryFile(filePath);
  if (!found && urlPath.endsWith('/')) {
    found = await tryFile(join(filePath, 'index.html'));
  }
  if (!found) {
    // SPA fallback
    found = join(root, 'index.html');
  }
  try {
    const data = await readFile(found);
    res.setHeader('Content-Type', MIME[extname(found)] || 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`static server for ${root} on http://localhost:${port}`);
});
