// 아주 작은 정적 서버 (SPA 폴백 포함). 사용: node scripts/serve.mjs dist [port]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.map': 'application/json' };

export function serve(dir, port = 4173, base = process.env.BASE_PATH || '') {
  const root = path.resolve(dir);
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let pathname = url.pathname;
    // 하위경로 배포 재현(GitHub Pages 프로젝트 사이트): BASE_PATH=/repo 이면 /repo/ 아래만 서빙, 그 밖은 404
    if (base) { if (pathname !== base && !pathname.startsWith(base + '/')) { res.writeHead(404).end('not found'); return; } pathname = pathname.slice(base.length) || '/'; }
    let file = path.join(root, decodeURIComponent(pathname));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    try {
      const st = await stat(file);
      if (st.isDirectory()) file = path.join(file, 'index.html');
    } catch {
      if (path.extname(file)) { res.writeHead(404).end('not found'); return; }
      file = path.join(root, 'index.html'); // SPA 폴백
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const port = Number(process.argv[3] || 4173);
  await serve(process.argv[2] || 'dist', port);
  console.log(`http://127.0.0.1:${port}`);
}
