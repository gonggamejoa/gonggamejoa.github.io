// PC/모바일 스크린샷 + 콘솔 오류 점검. 사용: npm run build && npm run shots
// (playwright 필요. CHROME_PATH 환경변수로 크롬 경로 지정 가능)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'shots');
await mkdir(out, { recursive: true });
const server = await serve(path.join(root, 'dist'), 4199);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });

const PAGES = [
  ['home', '/'], ['home-tag', '/?tags=%EC%83%9D%EC%A1%B4%EA%B3%B5%ED%8F%AC,%EA%B3%A0%EC%96%B4'], ['home-empty', '/?q=zzzz'],
  ['detail', '/game/phasmophobia'], ['series', '/series/silent-hill-2'], ['tags', '/tags'],
  ['collection', '/collection'], ['collection-best', '/collection?tab=best'], ['about', '/about'], ['legal', '/legal'], ['soon', '/soon/fear'], ['404', '/nope'],
];
const VIEWS = [['pc', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]];
const only = process.argv[2];
let problems = 0;
for (const [vn, vp] of VIEWS) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'ko-KR', reducedMotion: 'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com|steamstatic|ytimg/, (r) => r.abort());
  for (const [name, url] of PAGES) {
    if (only && !name.startsWith(only)) continue;
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
    await page.goto('http://127.0.0.1:4199' + url, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) errs.push('가로 스크롤 발생');
    await page.screenshot({ path: path.join(out, `${name}-${vn}.png`), fullPage: true });
    if (errs.length) { problems++; console.log(`[${vn}] ${name}:`, errs.join(' | ')); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(problems ? `문제 ${problems}건` : '콘솔 오류/가로 스크롤 없음', '-> shots/');
