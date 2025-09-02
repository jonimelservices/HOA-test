const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg'
};

function isPathInside(child, parent) {
  const rel = path.relative(parent, child);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => send404(res));
  stream.pipe(res);
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

function serveIndex(res) {
  const indexPath = path.join(ROOT, 'index.html');
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) return send404(res);
    sendFile(res, indexPath, 200);
  });
}

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url);
    let pathname = decodeURIComponent(parsed.pathname || '/');

    // Normalize and resolve path
    let filePath = path.join(ROOT, pathname);

    // Prevent path traversal
    const resolved = path.resolve(filePath);
    if (!isPathInside(resolved, ROOT) && resolved !== ROOT) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(resolved, (err, stats) => {
      if (!err && stats.isDirectory()) {
        // Directories fall back to index.html
        return serveIndex(res);
      }

      if (!err && stats.isFile()) {
        return sendFile(res, resolved, 200);
      }

      // If file not found, SPA fallback to index.html for navigation routes
      const accept = req.headers['accept'] || '';
      if (accept.includes('text/html')) {
        return serveIndex(res);
      }

      return send404(res);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
