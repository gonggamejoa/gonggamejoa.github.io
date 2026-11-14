// 개발 서버: esbuild watch + 정적 서버 (http://127.0.0.1:5173)
import * as esbuild from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOptions, copyPublic, writeHtml } from './build.mjs';
import { serve } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const opts = buildOptions({ watch: true });
opts.plugins = [{ name: 'html', setup(b) { b.onEnd(async (r) => { if (r.metafile) { await copyPublic(); await writeHtml(r.metafile); } }); } }];
const ctx = await esbuild.context(opts);
await ctx.watch();
await serve(dist, 5173);
console.log('dev: http://127.0.0.1:5173  (저장하면 자동 재빌드, 새로고침으로 확인)');
