// Steam 장르/카테고리/사용자 태그 -> 사이트 태그(autoTags). 매핑표는 data/tag-map.json 한 곳.
// 사이트 태그 목록(data/tags.json)에 없는 태그는 만들지 않는다(표에 있어도 무시하고 경고).
import { readFile } from 'node:fs/promises';

const D = (f) => new URL('../data/' + f, import.meta.url);
export const norm = (s) => String(s).toLowerCase().replace(/[\s\-_/.,:：&'"’()]/g, '');

export async function loadTagMap() {
  const raw = JSON.parse(await readFile(D('tag-map.json'), 'utf8'));
  const groups = JSON.parse(await readFile(D('tags.json'), 'utf8'));
  const valid = new Set(groups.flatMap((g) => g.tags));
  const map = new Map();
  const warnings = [];
  for (const [k, v] of Object.entries(raw.map || {})) {
    const vals = (Array.isArray(v) ? v : [v]).filter((t) => (valid.has(t) ? true : (warnings.push(`tag-map: "${k}" -> "${t}" 는 사이트 태그 목록에 없어 무시`), false)));
    if (vals.length) map.set(norm(k), vals);
  }
  return { map, ignore: new Set((raw.ignore || []).map(norm)), valid, warnings };
}

// steam = { genres[], categories[], tags[] } (이름 문자열). 반환: { autoTags[], unmapped[{name, source}] }
export function computeAutoTags(steam, tm) {
  const auto = [];
  const unmapped = [];
  const add = (t) => { if (!auto.includes(t)) auto.push(t); };
  for (const [source, names] of [['category', steam?.categories || []], ['genre', steam?.genres || []], ['tag', steam?.tags || []]]) {
    for (const name of names) {
      const hit = tm.map.get(norm(name));
      if (hit) hit.forEach(add);
      // 카테고리는 기술 항목(도전 과제·클라우드 등)이 대부분이라 unmapped 목록에서 제외
      else if (source !== 'category' && !tm.ignore.has(norm(name))) unmapped.push({ name, source });
    }
  }
  return { autoTags: auto, unmapped };
}

// 전체 게임에서 매핑 안 된 Steam 장르/태그를 집계 -> data/unmapped-tags.json 용
export function summarizeUnmapped(items) {
  const m = new Map();
  for (const { title, unmapped } of items) {
    for (const { name, source } of unmapped) {
      const e = m.get(name) || { name, source, count: 0, games: [] };
      e.count++; if (e.games.length < 5) e.games.push(title);
      m.set(name, e);
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));
}
