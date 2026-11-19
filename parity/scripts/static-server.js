// Serves a production build with SPA fallback (unknown paths -> index.html).
// No dependencies, CommonJS, so it runs on Node 14 (legacy) and Node 24 (angular21).
const http = require('http');
const fs = require('fs');
const path = require('path');

const [root, port] = [path.resolve(process.argv[2]), Number(process.argv[3])];
const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.join(root, path.normalize(urlPath));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        file = path.extname(urlPath) ? null : path.join(root, 'index.html');
    }
    if (!file) {
        res.writeHead(404).end('Not found');
        return;
    }
    res.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
