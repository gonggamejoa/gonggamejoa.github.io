// 디자인 파일의 inline style 문자열을 그대로 가져다 쓰기 위한 변환기 ("a:b;c:d" -> React style 객체)
const cache = new Map();
export function css(str) {
  let o = cache.get(str);
  if (o) return o;
  o = {};
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (!k) continue;
    if (k.startsWith('--')) o[k] = v;
    else o[k.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  cache.set(str, o);
  return o;
}
