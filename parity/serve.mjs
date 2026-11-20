// Minimal static server with SPA fallback for a production build: node serve.mjs <distDir> <port>
import http from 'http';
import fs from 'fs';
import path from 'path';

const [dir = '../dist/angular-hnpwa', port = '4200'] = process.argv.slice(2);
const root = path.resolve(fs.existsSync(path.join(dir, 'browser', 'index.html')) ? path.join(dir, 'browser') : dir);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(root, urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(root, 'index.html');
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(+port, () => console.log(`serving ${root} on http://localhost:${port}`));
