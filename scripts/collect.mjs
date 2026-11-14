// YouTube 재생목록 -> (설명란의 한글 게임 제목) -> Steam 한국어 스토어 매칭 -> data/games.json
// 빌드 전에 사람이 수동 실행하고 결과를 커밋한다(방문자 요청마다 외부 API를 부르지 않음).
//
//   YOUTUBE_API_KEY=... node scripts/collect.mjs              # 권장: YouTube Data API v3 (무료 할당량)
//   node scripts/collect.mjs --source ytdlp                   # 키 없이: yt-dlp 설치 필요 (전체 영상, 설명·업로드일 포함)
//   node scripts/collect.mjs --source rss                     # 키 없이, 설치 없이: 최신 15개만(RSS 한계)
//   node scripts/collect.mjs --videos-file fixture.json       # 네트워크 없이 영상 목록만 파일로 대체(테스트)
//   node scripts/collect.mjs --refresh                       # 이미 받은 Steam 상세도 다시 받기
//   node scripts/collect.mjs --dry                            # 파일을 쓰지 않고 결과만 출력
//
// 단계: (1) 영상 목록·제목·업로드일·설명 수집 (2) 설명란에서 한글 게임 제목 추출 (3) Steam 검색/appdetails(l=koreana) 매칭
//       (4) 매칭 실패·모호한 건 data/unmatched.json 로 따로 출력 -> 사람이 data/steam-map.json 에 {"한글제목" 또는 "영상ID": steamAppId} 를 적고 재실행.
//       steam-map 값: 숫자=steamAppId, 문자열=그 제목으로 Steam 검색, null/"skip"=게임 아님(제외). 매칭 전 영상은 games.json 에 안 들어가므로 사이트에 노출되지 않는다.
// 키는 환경변수로만 받는다. 코드/저장소에 넣지 않는다.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { computeAutoTags, loadTagMap, summarizeUnmapped } from './tagmap.mjs';

const run = promisify(execFile);
const D = (f) => new URL('../data/' + f, import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const arg = (name) => { const i = process.argv.indexOf('--' + name); return i < 0 ? null : (process.argv[i + 1]?.startsWith('--') ? true : process.argv[i + 1] ?? true); };

// ======================================================================================
// [가정] 영상 설명란에 한글 게임 제목이 적히는 형식 — 실제 형식을 모르므로 여기 한 곳만 고치면 된다.
// 후보 제목을 우선순위 순서로 돌려준다. 가정한 형식(위에서부터 먼저 맞는 것):
//   0) [1순위, 사용자 확인] "스팀게임 (제목)입니다" / "공포게임 (제목)입니다." / "스팀게임 제목입니다"
//        - 괄호 있음/없음, '입니다' 뒤 마침표 있음/없음, '스팀 게임'처럼 띄어쓴 경우 모두 허용
//   1) (보조) 라벨 줄:  "게임: 제목" / "게임명 : 제목" / "게임 제목 - 제목" / "Game: 제목"
//   2) (보조) 대괄호 줄: "[게임] 제목" / "[게임명] 제목"
//   3) (보조) 아이콘 줄: "🎮 제목"
//   4) (보조) 따옴표 제목: "「제목」" "『제목』"
//   5) (보조) 폴백:     한글이 들어있고 URL/해시태그/타임스탬프/인사말이 아닌 첫 줄 (0~4가 모두 실패했을 때만)
// ======================================================================================
export function parseGameTitles(description = '') {
  const lines = description.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  const push = (t) => {
    const v = t?.replace(/^[\s"'“”‘’「『<\[(]+|[\s"'“”‘’」』>\])]+$/g, '').replace(/\s+/g, ' ').replace(/\s*(?:#?\d+\s*화|part\s*\d+|ep\.?\s*\d+)$/i, '').trim(); // 끝의 '1화' 같은 회차 표기 제거
    if (v && /[가-힣]/.test(v) && v.length <= 60 && !out.includes(v)) out.push(v);
  };
  for (const l of lines) {
    for (const m of l.matchAll(/(?:스팀|공포)\s*게임\s*[(（\[]?\s*([^()（）\[\]\n]+?)\s*[)）\]]?\s*입니다\.?/g)) push(m[1]);
  }
  for (const l of lines) { const m = l.match(/^(?:게임\s*(?:명|제목)?|game)\s*[:：\-–]\s*(.+)$/i); if (m) push(m[1]); }
  for (const l of lines) { const m = l.match(/^\[\s*게임(?:명|\s*제목)?\s*\]\s*(.+)$/); if (m) push(m[1]); }
  for (const l of lines) { const m = l.match(/^🎮\s*(.+)$/u); if (m) push(m[1]); }
  for (const l of lines) for (const m of l.matchAll(/[「『]([^」』]+)[」』]/g)) push(m[1]);
  if (!out.length) {
    for (const l of lines) {
      if (/https?:\/\/|^#|^\d{1,2}:\d{2}|구독|좋아요|안녕|감사|문의|후원/.test(l)) continue;
      if (/[가-힣]/.test(l)) { push(l); break; }
    }
  }
  return out;
}

// ---------- (1) YouTube ----------
export async function fetchVideos(playlistId) {
  const file = arg('videos-file');
  if (file && file !== true) return JSON.parse(await readFile(file, 'utf8'));
  const source = arg('source') || (process.env.YOUTUBE_API_KEY ? 'api' : 'rss');
  if (source === 'api') return viaApi(playlistId);
  if (source === 'ytdlp') return viaYtdlp(playlistId);
  return viaRss(playlistId);
}

// 반환 형식: [{ id, title, description, publishedAt(ISO) }]
async function viaApi(playlistId) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY 환경변수가 없어요 (--source ytdlp 또는 rss 로 키 없이 가능)');
  const ids = [];
  let token = '';
  do {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${key}${token}`);
    if (!r.ok) throw new Error('YouTube playlistItems HTTP ' + r.status);
    const d = await r.json();
    ids.push(...d.items.map((i) => i.contentDetails.videoId));
    token = d.nextPageToken ? '&pageToken=' + d.nextPageToken : '';
  } while (token);
  const vids = [];
  for (let i = 0; i < ids.length; i += 50) { // 설명 전체·업로드일은 videos.list 에서 (50개씩)
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.slice(i, i + 50).join(',')}&key=${key}`);
    if (!r.ok) throw new Error('YouTube videos HTTP ' + r.status);
    for (const v of (await r.json()).items) vids.push({ id: v.id, title: v.snippet.title, description: v.snippet.description, publishedAt: v.snippet.publishedAt });
  }
  return ids.map((id) => vids.find((v) => v.id === id)).filter(Boolean); // 재생목록 순서 유지(비공개/삭제 제외)
}

async function viaYtdlp(playlistId) {
  let stdout = '';
  try {
    ({ stdout } = await run('yt-dlp', ['--dump-json', '--skip-download', '--ignore-errors', 'https://www.youtube.com/playlist?list=' + playlistId], { maxBuffer: 1 << 30 }));
  } catch (e) {
    // --ignore-errors 라 일부 영상(비공개/삭제)만 실패해도 종료 코드가 1 이다 -> 결과가 있으면 경고만 하고 진행
    stdout = e.stdout || '';
    const err = String(e.stderr || e.message || '');
    if (e.code === 'ENOENT') throw new Error('yt-dlp 가 설치돼 있지 않아요. README의 설치 방법을 확인하세요 (Windows: winget install yt-dlp.yt-dlp / macOS: brew install yt-dlp / Actions: 워크플로가 pip 로 설치).');
    if (!stdout.trim()) throw new Error(ytdlpHint(err));
    console.warn('경고: 일부 영상은 yt-dlp 에서 실패했어요(비공개/삭제 등):', err.split('\n').filter((l) => /ERROR/.test(l)).slice(0, 3).join(' | '));
  }
  return stdout.split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((v) => ({
    id: v.id, title: v.title, description: v.description || '',
    publishedAt: v.upload_date ? `${v.upload_date.slice(0, 4)}-${v.upload_date.slice(4, 6)}-${v.upload_date.slice(6, 8)}T00:00:00Z` : null,
  }));
}

// yt-dlp 실패 원인을 알기 쉬운 안내로 바꾼다 (YouTube 가 GitHub Actions 같은 데이터센터 IP 를 봇으로 막는 경우가 있음)
function ytdlpHint(err) {
  const first = err.split('\n').find((l) => /ERROR/.test(l)) || err.slice(0, 300);
  if (/confirm you.?re not a bot|Sign in to confirm|not a bot/i.test(err)) {
    return `YouTube 가 이 서버(데이터센터 IP)를 봇으로 판단해 막았어요: "${first.trim()}"\n대안 1) 내 PC에서 \`npm run collect:full\` 실행 후 data/ 를 커밋·push  대안 2) YOUTUBE_API_KEY(저장소 Secret)를 설정하고 다시 실행(API 는 봇 차단을 받지 않아요).`;
  }
  if (/HTTP Error 429|Too Many Requests/i.test(err)) return `YouTube 요청 제한(429)에 걸렸어요: "${first.trim()}"\n잠시 뒤 다시 실행하거나 YOUTUBE_API_KEY 를 사용하세요.`;
  if (/Private|unavailable|does not exist|not (?:a )?valid/i.test(err)) return `재생목록을 읽을 수 없어요(비공개/삭제/잘못된 ID): "${first.trim()}"\n재생목록이 '공개' 또는 '일부 공개'인지, data/source.json 의 ID가 맞는지 확인하세요.`;
  return `yt-dlp 실행 실패: "${first.trim()}"\n\`yt-dlp -U\`(또는 pip install -U yt-dlp)로 최신 버전인지 확인하세요.`;
}

async function viaRss(playlistId) { // 최신 15개만 제공됨 — 전체 수집은 api/ytdlp 사용
  const r = await fetch('https://www.youtube.com/feeds/videos.xml?playlist_id=' + playlistId);
  if (!r.ok) throw new Error('YouTube RSS HTTP ' + r.status);
  const xml = await r.text();
  const un = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: e.match(/<yt:videoId>([^<]+)/)?.[1], title: un(e.match(/<title>([^<]*)/)?.[1] || ''),
    description: un(e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || ''),
    publishedAt: e.match(/<published>([^<]+)/)?.[1] || null,
  }));
}

// ---------- (3) Steam ----------
const norm = (s) => s.toLowerCase().replace(/[\s\-_:：·.,!?'"’“”()\[\]]/g, '');

async function steamSearch(term) {
  const r = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=koreana&cc=kr`);
  if (!r.ok) throw new Error('Steam 검색 HTTP ' + r.status);
  return ((await r.json()).items || []).map((i) => ({ id: i.id, name: i.name }));
}
async function steamDetails(appId) {
  const r = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=koreana&cc=kr`);
  if (!r.ok) throw new Error('Steam appdetails HTTP ' + r.status);
  const d = (await r.json())[appId];
  if (!d?.success) throw new Error('appdetails success=false (' + appId + ')');
  return d.data;
}
// Steam 사용자 태그(store tags)는 appdetails 에 없어서 상점 페이지의 태그 JSON 에서 읽는다. 실패해도 장르/카테고리만으로 진행.
async function steamStoreTags(appId) {
  try {
    const r = await fetch(`https://store.steampowered.com/app/${appId}/?l=koreana&cc=kr`, { headers: { cookie: 'birthtime=568022401; lastagecheckage=1-0-1988; wants_mature_content=1' } });
    if (!r.ok) return [];
    const m = (await r.text()).match(/InitAppTagModal\(\s*\d+,\s*(\[.*?\])\s*,/s);
    return m ? JSON.parse(m[1]).slice(0, 20).map((t) => t.name) : [];
  } catch { return []; }
}
// appdetails 응답 -> 태그 분류용 원본(이름 목록)
const steamRaw = (x, tags) => ({ genres: (x.genres || []).map((g) => g.description), categories: (x.categories || []).map((c) => c.description), tags });

// 정확히 일치(공백·기호 무시)하는 결과가 딱 1개일 때만 자동 매칭. 그 외는 사람이 확인.
function pickMatch(term, results) {
  const exact = results.filter((x) => norm(x.name) === norm(term));
  if (exact.length === 1) return { id: exact[0].id };
  return { reason: exact.length > 1 ? '모호함(정확 일치 여러 개)' : results.length ? '정확 일치 없음' : '검색 결과 없음', candidates: results.slice(0, 5) };
}

// ---------- 자동 태그 보조 ----------
async function writeUnmapped(games, tm) {
  const items = games.filter((g) => g.steam).map((g) => ({ title: g.title, unmapped: computeAutoTags(g.steam, tm).unmapped }));
  await writeFile(D('unmapped-tags.json'), JSON.stringify(summarizeUnmapped(items), null, 2) + '\n');
}
async function retag(games, tm, dry) {
  let n = 0;
  for (const g of games) if (g.steam) { g.autoTags = computeAutoTags(g.steam, tm).autoTags; n++; }
  console.log(`자동 태그 다시 계산: ${n}개 게임 (Steam 원본이 없는 게임은 건너뜀)`);
  if (dry) return;
  await writeUnmapped(games, tm);
  await writeFile(D('games.json'), JSON.stringify(games, null, 2) + '\n');
  console.log('data/games.json, data/unmapped-tags.json 저장');
}

// ---------- 메인 ----------
const isSkip = (v) => v === null || v === 'skip';
const asAppId = (v) => (typeof v === 'number' ? v : /^\d+$/.test(String(v)) ? Number(v) : null);

async function main() {
  const source = JSON.parse(await readFile(D('source.json'), 'utf8'));
  // steam-map.json: 한글제목 또는 영상ID -> steamAppId(숫자) | 검색에 쓸 제목(문자열) | null/"skip"(게임 아님, 건너뜀)
  const manual = existsSync(D('steam-map.json')) ? JSON.parse(await readFile(D('steam-map.json'), 'utf8')) : {};
  const existing = JSON.parse(await readFile(D('games.json'), 'utf8'));
  const oldUnmatched = existsSync(D('unmatched.json')) ? JSON.parse(await readFile(D('unmatched.json'), 'utf8')) : [];
  const dry = !!arg('dry');
  const tm = await loadTagMap();
  tm.warnings.forEach((w) => console.warn('경고:', w));
  if (arg('retag')) return retag(existing, tm, dry); // 네트워크 없이 매핑표만 다시 적용
  const srcName = arg('source') || (process.env.YOUTUBE_API_KEY ? 'api' : 'rss');
  const fullSource = !arg('videos-file') && (srcName === 'api' || srcName === 'ytdlp');
  const refresh = !!arg('refresh'); // Steam 상세를 다시 받음(기본: 이미 받은 게임은 재사용해 요청 수를 줄임)

  const videos = await fetchVideos(source.playlistId);
  console.log(`영상 ${videos.length}개 수집`);

  // 주인장 추천 재생목록(여러 개 가능): source.json 의 recommendedPlaylistIds[] (단일 recommendedPlaylistId 도 호환).
  // 여기 들어 있는 영상의 게임을 recommended 로 표시. 순서 = 배열 순서 -> 각 재생목록 안의 순서. 같은 영상/게임이 겹치면 앞선 순번 하나만.
  // 메인 목록에 없는 영상이면 그 영상도 게임으로 등록.
  const recIds = source.recommendedPlaylistIds || (source.recommendedPlaylistId ? [source.recommendedPlaylistId] : []);
  let recIndex = null; // videoId -> 추천 순번(1부터, 전체 통틀어)
  if (recIds.length && !arg('videos-file')) {
    recIndex = new Map();
    let offset = 0;
    for (const id of recIds) {
      const recVideos = await fetchVideos(id);
      recVideos.forEach((v, k) => { if (!recIndex.has(v.id)) recIndex.set(v.id, offset + k + 1); });
      for (const v of recVideos) if (!videos.some((x) => x.id === v.id)) videos.push(v);
      offset += recVideos.length;
      console.log(`추천 재생목록 ${id}: 영상 ${recVideos.length}개`);
    }
  }

  const unmatched = [];
  const byApp = new Map(); // steamAppId -> { title, vids[] }
  const cache = new Map();
  for (const v of videos) {
    const url = 'https://www.youtube.com/watch?v=' + v.id;
    const m = manual[v.id]; // 영상 ID 지정이 가장 우선
    if (isSkip(m) && v.id in manual) continue;
    let appId = m !== undefined ? asAppId(m) : null;
    let titles = m !== undefined && appId == null ? [String(m)] : v.id in manual ? [] : parseGameTitles(v.description);
    const base = { videoId: v.id, videoTitle: v.title, url, parsedTitles: titles };
    let last = null;
    if (!appId) {
      if (!titles.length) { unmatched.push({ ...base, reason: '설명란에서 한글 제목을 못 찾음 — steam-map.json 에 "' + v.id + '": steamAppId 를 추가하세요', descriptionHead: (v.description || '').slice(0, 200) }); continue; }
      for (const t of titles) {
        const mm = manual[t];
        if (mm !== undefined && asAppId(mm)) { appId = asAppId(mm); break; }
        if (!cache.has(t)) { cache.set(t, pickMatch(t, await steamSearch(t))); await sleep(1000); }
        last = cache.get(t);
        if (last.id) { appId = last.id; break; }
      }
    }
    if (!appId) { unmatched.push({ ...base, reason: last?.reason || '매칭 실패', candidates: last?.candidates || [] }); continue; }
    if (!byApp.has(appId)) byApp.set(appId, { title: titles[0], vids: [] });
    byApp.get(appId).vids.push(v);
  }

  // 같은 Steam 게임에 영상이 2개 이상이면 시리즈(에피소드는 업로드 오름차순 = 1화부터), 1개면 단일 게임
  const games = [];
  for (const [appId, { title, vids }] of byApp) {
    const prev = existing.find((g) => g.steamAppId === Number(appId) && !g.sample) || {};
    const x = !refresh && prev.description && prev.steam ? null : await steamDetails(appId);
    const storeTags = x ? await steamStoreTags(appId) : null;
    if (x) await sleep(1000);
    const steam = x ? steamRaw(x, storeTags) : prev.steam;
    const { autoTags } = computeAutoTags(steam, tm);
    // 증분 실행(rss 15개 등)에서도 이전 에피소드가 사라지지 않도록 기존 영상과 합친다 (URL 기준)
    const all = new Map();
    for (const e of prev.series ? prev.episodes : prev.videoUrl ? [{ title: null, url: prev.videoUrl, uploadedAt: prev.uploadedAt }] : []) all.set(e.url, { id: e.url, title: e.title, publishedAt: e.uploadedAt });
    for (const v of vids) all.set('https://www.youtube.com/watch?v=' + v.id, { id: v.id, title: v.title, publishedAt: v.publishedAt?.slice(0, 10) || all.get('https://www.youtube.com/watch?v=' + v.id)?.publishedAt || null });
    const list = [...all.entries()].map(([url, v]) => ({ title: v.title, url, uploadedAt: v.publishedAt })).sort((a, b) => (a.uploadedAt || '').localeCompare(b.uploadedAt || ''));
    const series = list.length > 1;
    const recOrders = vids.map((v) => recIndex?.get(v.id)).filter(Boolean);
    // 전체 소스(api/ytdlp)면 재생목록 그대로 반영. rss(최신 15개)·파일 소스는 일부만 보이므로 기존 추천을 유지(추가만 반영).
    const rec = recIndex ? (fullSource ? recOrders.length > 0 : recOrders.length > 0 || !!prev.recommended) : !!prev.recommended;
    games.push({
      // 수동 편집 필드(tags, ownerComment)는 기존 값 유지. 새 게임은 태그가 비어 있음(태그는 사람이 채움). ownerComment 가 비면 사이트가 config 의 기본 코멘트를 보여줌.
      id: prev.id || String(appId),
      title: x?.name || prev.title || title,
      steamAppId: Number(appId),
      tags: prev.tags || [],   // 사람이 직접 넣은 태그: 항상 우선, 재수집해도 덮어쓰지 않음
      autoTags,                // Steam 장르/카테고리/사용자 태그를 data/tag-map.json 으로 매핑한 자동 태그(재수집·retag 때 다시 계산). 사이트는 tags + autoTags 를 합쳐(중복 제거) 보여줌
      steam,                   // 자동 분류의 원본(Steam 이름 목록). npm run retag 가 네트워크 없이 이걸 다시 분류함
      series,
      uploadedAt: list[list.length - 1].uploadedAt,
      videoUrl: series ? null : list[0].url,
      episodes: series ? list : [],
      description: x ? x.short_description || null : prev.description ?? null,
      developer: x ? (x.developers || []).join(', ') || null : prev.developer ?? null,
      releaseDate: x ? x.release_date?.date || null : prev.releaseDate ?? null,
      price: x ? (x.is_free ? '무료' : x.price_overview?.final_formatted || null) : prev.price ?? null,
      korean: x ? (/한국어/.test(x.supported_languages || '') ? '지원' : '미지원') : prev.korean ?? null,
      screenshots: x ? (x.screenshots || []).slice(0, 4).map((s) => s.path_full) : prev.screenshots || [],
      recommended: rec,
      recommendedOrder: rec ? (recOrders.length && (fullSource || prev.recommendedOrder == null) ? Math.min(...recOrders) : prev.recommendedOrder ?? null) : null,
      ownerComment: prev.ownerComment ?? null,
    });
  }

  // 샘플(sample:true)은 실제 수집이 1건이라도 성공하면 제거. 이번 실행에 안 나온 기존 게임(증분 실행)은 유지.
  const kept = games.length ? existing.filter((g) => !g.sample && !games.some((n) => n.steamAppId === g.steamAppId)) : existing;
  const next = [...games, ...kept];
  // unmatched 는 영상 ID 기준으로 병합: 이번에 매칭된 영상은 제거, 이번에 안 본 영상(증분 실행)의 기존 항목은 유지
  const seen = new Set(videos.map((v) => v.id));
  const matchedIds = new Set(games.flatMap((g) => [g.videoUrl, ...g.episodes.map((e) => e.url)]).filter(Boolean).map((u) => u.split('v=')[1]));
  const nextUnmatched = [...unmatched, ...oldUnmatched.filter((u) => !seen.has(u.videoId) && !matchedIds.has(u.videoId) && !(u.videoId in manual && manual[u.videoId] !== undefined))];
  console.log(`매칭 ${games.length}개 게임 (시리즈 ${games.filter((g) => g.series).length}, 추천 ${games.filter((g) => g.recommended).length}), 수동 확인 필요 ${nextUnmatched.length}건`);
  if (dry) { console.log(JSON.stringify({ games: games.map((g) => [g.title, g.series, g.uploadedAt, g.recommended]), unmatched: nextUnmatched }, null, 1)); return; }
  for (const g of next) if (g.steam) g.autoTags = computeAutoTags(g.steam, tm).autoTags; // 이번에 안 본 게임도 최신 매핑표로
  await writeUnmapped(next, tm);
  await writeFile(D('games.json'), JSON.stringify(next, null, 2) + '\n');
  await writeFile(D('unmatched.json'), JSON.stringify(nextUnmatched, null, 2) + '\n');
  console.log('data/games.json, data/unmatched.json 저장');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    const msg = e.message + (e.cause?.code ? ' (' + e.cause.code + ')' : '');
    console.error('수집 실패(data/ 는 변경하지 않았어요):\n' + msg);
    // GitHub Actions 에서는 요약 화면에 오류로 표시
    if (process.env.GITHUB_ACTIONS) console.log('::error title=수집 실패 (data 는 그대로)::' + msg.replace(/\r?\n/g, ' '));
    process.exit(1);
  });
}
