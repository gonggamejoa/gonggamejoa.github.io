// 정적 빌드: esbuild로 번들 -> dist/ (서버 없이 어디서나 호스팅 가능)
import * as esbuild from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, ''); // 도메인 미정이면 비워 둠
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, ''); // 예: GitHub Pages 프로젝트 사이트면 "/repo"

export function buildOptions({ watch = false } = {}) {
  return {
    entryPoints: [path.join(root, 'src/main.jsx')],
    outdir: path.join(dist, 'assets'),
    entryNames: watch ? 'app' : 'app-[hash]',
    bundle: true,
    minify: !watch,
    sourcemap: watch,
    format: 'esm',
    target: 'es2020',
    jsx: 'automatic',
    loader: { '.json': 'json' },
    define: {
      __BASE__: JSON.stringify(BASE),
      'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production'),
    },
    metafile: true,
    logLevel: 'info',
  };
}

export async function writeHtml(metafile) {
  const outs = Object.keys(metafile.outputs);
  const js = outs.find((f) => f.endsWith('.js'));
  const css = outs.find((f) => f.endsWith('.css'));
  const rel = (f) => BASE + '/' + path.relative(dist, path.join(root, f)).split(path.sep).join('/');
  let html = await readFile(path.join(root, 'index.html'), 'utf8');
  html = html
    .replaceAll('%BASE%', BASE)
    .replace('<!--CANONICAL-->', SITE_URL ? `<link rel="canonical" href="${SITE_URL}${BASE}/">\n<meta property="og:url" content="${SITE_URL}${BASE}/">` : '')
    .replace('<!--CSS-->', css ? `<link rel="stylesheet" href="${rel(css)}">` : '')
    .replace('<!--JS-->', `<script type="module" src="${rel(js)}"></script>`);
  await writeFile(path.join(dist, 'index.html'), html);
  // GitHub Pages 등 SPA 폴백이 없는 호스트용
  await writeFile(path.join(dist, '404.html'), html);
}

export async function copyPublic() {
  const pub = path.join(root, 'public');
  if (existsSync(pub)) await cp(pub, dist, { recursive: true });
}

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  const result = await esbuild.build(buildOptions());
  await copyPublic();
  await writeHtml(result.metafile);
  const files = await readdir(path.join(dist, 'assets'));
  console.log('\n빌드 완료 -> dist/  (' + files.join(', ') + ')');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
