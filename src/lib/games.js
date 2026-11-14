import games from '../../data/games.json';
import tagGroups from '../../data/tags.json';
import { MIN_SHARED_GAME, MIN_SHARED_SERIES } from '../config.js';

// 최신순 기준 = YouTube 영상 업로드일(확정). 시리즈는 '가장 최근 에피소드 업로드일', 단일 게임은 영상 업로드일(uploadedAt).
// 날짜가 없는 게임은 맨 뒤.
export const sortDate = (g) => g.episodes.reduce((m, e) => (e.uploadedAt && e.uploadedAt > m ? e.uploadedAt : m), g.uploadedAt || '');
const byRecent = (a, b) => {
  const x = sortDate(a), y = sortDate(b);
  return x === y ? a.title.localeCompare(b.title) : x < y ? 1 : -1;
};
// 표시용 태그 = 직접 넣은 tags(우선) + 자동 분류 autoTags(Steam 기반), 중복 제거. 원본은 manualTags/autoTags 로 구분 유지.
const withTags = (g) => ({ ...g, manualTags: g.tags || [], autoTags: g.autoTags || [], tags: Array.from(new Set([...(g.tags || []), ...(g.autoTags || [])])) });
export const ALL_GAMES = games.map(withTags).sort(byRecent);
export const TAG_GROUPS = tagGroups;

export const getGame = (id) => ALL_GAMES.find((g) => g.id === id);
export const gamePath = (g) => (g.series ? '/series/' : '/game/') + g.id;
export const tagText = (g) => g.tags.slice(0, 2).map((t) => '#' + t).join('  ');

// 홈 필터: 선택한 태그를 모두 가진 게임(AND) + 검색어(제목/태그)
export function filterGames(tags, q) {
  const needle = q.trim().replace(/^#/, '').toLowerCase();
  return ALL_GAMES.filter((g) => {
    const byTag = tags.every((t) => g.tags.indexOf(t) >= 0);
    const hay = (g.title + ' ' + g.tags.join(' ')).toLowerCase();
    return byTag && (!needle || hay.indexOf(needle) >= 0);
  });
}

function recommend(current, pool, min) {
  return pool
    .filter((g) => g.id !== current.id)
    .map((g) => ({ game: g, common: g.tags.filter((t) => current.tags.indexOf(t) >= 0) }))
    .filter((x) => x.common.length >= min)
    .sort((a, b) => b.common.length - a.common.length || a.game.title.localeCompare(b.game.title));
}
// 상세: 해시태그 3개 이상 겹치는 게임 / 시리즈: 2개 이상 겹치는 시리즈
export const recommendGames = (g) => recommend(g, ALL_GAMES, MIN_SHARED_GAME);
export const recommendSeries = (g) => recommend(g, ALL_GAMES.filter((x) => x.series), MIN_SHARED_SERIES);

export const recommendedList = () =>
  ALL_GAMES.filter((g) => g.recommended).sort((a, b) => (a.recommendedOrder ?? 99) - (b.recommendedOrder ?? 99));
export const bestSeriesList = () => ALL_GAMES.filter((g) => g.series);

// ---- 이미지/영상 URL 헬퍼 (수집된 steamAppId / YouTube URL 기반, 런타임 API 호출 없음) ----
export const steamHeader = (g) => (g.steamAppId ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamAppId}/header.jpg` : null);
export const steamUrl = (g) => (g.steamAppId ? `https://store.steampowered.com/app/${g.steamAppId}/` : 'https://store.steampowered.com/');

export function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.hostname.endsWith('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const m = u.pathname.match(/\/(embed|shorts)\/([\w-]{6,})/);
      return m ? m[2] : null;
    }
  } catch { /* noop */ }
  return null;
}
export const ytThumb = (url) => { const id = youtubeId(url); return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null; };
