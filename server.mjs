import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(process.env.SERVE_DIST === '1' ? 'dist' : '.');
const port = Number(process.env.PORT || 3016);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
const allowed = new Set(['/index.html', '/app.js', '/core.js', '/map-view.js', '/geo-data.js', '/styles.css', '/events.json', '/favicon.svg', '/vendor/leaflet.js', '/vendor/leaflet.css']);
http.createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/') path = '/index.html';
    if (!allowed.has(path) && !/^\/assets\/[a-z0-9-]+\.(jpg|svg|webp|png)$/.test(path)) {
      res.writeHead(404); return res.end('Not found');
    }
    const data = await readFile(resolve(root, '.' + path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Elsewhere preview: http://localhost:${port}`));
