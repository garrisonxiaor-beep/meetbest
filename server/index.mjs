import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, getCounts, readSeed, importContent, loadContent, projectRoot } from './content.mjs';

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json; charset=utf-8'
};
const security = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
};

export function createApp({ databasePath, seedPath, distPath = resolve(projectRoot, 'dist') } = {}) {
  const db = openDatabase(databasePath);
  const counts = getCounts(db);
  if (Object.values(counts).every(n => n === 0)) importContent(db, readSeed(seedPath));
  let cached;
  function snapshot() {
    const version = db.prepare('PRAGMA data_version').get().data_version;
    if (!cached || cached.version !== version) {
      const content = loadContent(db);
      const body = JSON.stringify(content);
      cached = { version, content, body, etag: `"${createHash('sha256').update(body).digest('hex').slice(0,24)}"` };
    }
    return cached;
  }
  function json(req, res, code, data, headers = {}) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    res.writeHead(code, { ...security, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    res.end(req.method === 'HEAD' ? undefined : body);
  }
  const server = createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) {
        json(req, res, 405, { error: '该接口仅支持读取' }, { Allow: 'GET, HEAD' });
        return;
      }
      let pathname, url;
      try {
        url = new URL(req.url, 'http://localhost');
        pathname = decodeURIComponent(url.pathname);
      } catch {
        json(req, res, 400, { error: '请求地址无效' });
        return;
      }
      if (pathname.includes('\0') || pathname.split('/').some(p => p.startsWith('.') || p.includes('\\'))) {
        json(req, res, 404, { error: '内容不存在' }); return;
      }
      if (pathname === '/api/health') {
        db.prepare('SELECT 1').get();
        json(req, res, 200, { status: 'ok', database: 'ok', counts: getCounts(db) }); return;
      }
      if (pathname === '/api/content') {
        const data = snapshot();
        const headers = { ETag: data.etag, 'Cache-Control': 'public, max-age=0, must-revalidate' };
        if (req.headers['if-none-match'] === data.etag) {
          res.writeHead(304, { ...security, ...headers }); res.end(); return;
        }
        json(req, res, 200, data.body, headers); return;
      }
      const api = /^\/api\/(exercises|supplements|plans)(?:\/([a-z0-9-]+))?\/?$/.exec(pathname);
      if (api) {
        const rows = snapshot().content[api[1]];
        if (api[2]) {
          const row = rows.find(r => r.id === api[2]);
          json(req, res, row ? 200 : 404, row || { error: '内容不存在' }); return;
        }
        const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase();
        const filters = ['bodyPart', 'equipment', 'category', 'evidence'];
        const result = rows.filter(r =>
          (!query || `${r.name} ${r.summary || ''} ${r.equipment || ''} ${(r.muscles || []).join(' ')}`.toLocaleLowerCase().includes(query))
          && filters.every(f => !url.searchParams.has(f) || r[f] === url.searchParams.get(f)));
        json(req, res, 200, result); return;
      }
      if (pathname.startsWith('/api/')) {
        json(req, res, 404, { error: '接口不存在' }); return;
      }
      const root = resolve(distPath);
      let file = resolve(root, '.' + pathname);
      if (!file.startsWith(root + sep) && file !== root) {
        json(req, res, 404, { error: '内容不存在' }); return;
      }
      if (pathname === '/') file = resolve(root, 'index.html');
      const type = mime[extname(file)];
      if (!type) { json(req, res, 404, { error: '文件不存在' }); return; }
      let details;
      try { details = await stat(file); } catch {
        json(req, res, 404, { error: '文件不存在，请先构建网站' }); return;
      }
      if (!details.isFile()) { json(req, res, 404, { error: '文件不存在' }); return; }
      const body = await readFile(file);
      const etag = `"${createHash('sha256').update(body).digest('hex').slice(0,24)}"`;
      const headers = {
        ...security, 'Content-Type': type, ETag: etag,
        'Cache-Control': pathname.startsWith('/assets/') && /-[a-zA-Z0-9_-]{8,}\./.test(pathname)
          ? 'public, max-age=31536000, immutable' : 'no-cache'
      };
      if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); res.end(); return; }
      res.writeHead(200, { ...headers, 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      console.error('Request failed:', error.message);
      if (!res.headersSent) json(req, res, 500, { error: '服务暂时不可用，请稍后重试' });
      else res.destroy();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.on('close', () => db.close());
  return { server, db };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(resolve(process.argv[1]))) {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 3100);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT 无效');
  const { server } = createApp();
  server.listen(port, host, () => console.log(`练有据 listening on http://${host}:${port}`));
  const close = () => server.close(() => process.exit(0));
  process.on('SIGTERM', close);
  process.on('SIGINT', close);
}
