import { useState } from 'react';
import { Link, useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import { TAG_GROUPS } from '../lib/games.js';
import { MAX_TAGS } from '../config.js';

const col = new Intl.Collator('ko');
const uniq = (xs) => Array.from(new Set(xs));
const GROUPS = TAG_GROUPS.slice().sort((a, b) => col.compare(a.name, b.name)).map((g) => ({ name: g.name, tags: uniq(g.tags).sort(col.compare) }));

export default function Tags() {
  useTitle('전체 해시태그');
  const [sel, setSel] = useState([]);
  const full = sel.length >= MAX_TAGS;
  const toggle = (name) => setSel((s) => (s.includes(name) ? s.filter((x) => x !== name) : s.length >= MAX_TAGS ? s : s.concat(name)));
  const go = '/?tags=' + sel.map(encodeURIComponent).join(',');

  return (
    <Layout back="홈으로">
      <main style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 56px 24px 72px; flex: 1; display: flex; flex-direction: column; gap: 48px;')}>
        <div style={css('display: flex; flex-direction: column; gap: 12px;')}>
          <h1 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: clamp(30px, 4vw, 44px); line-height: 1.25;")}>모든 해시태그</h1>
          <p style={css('margin: 0; font-size: 16px; line-height: 1.7; color: #a8a099;')}>마음에 드는 태그를 최대 5개까지 골라 취향에 맞는 공포게임을 찾아보세요.</p>
        </div>

        <div style={css('position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; background: #181615; border: 1px solid #2e2a27; border-radius: 14px;')}>
          <div style={css('display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1 1 280px;')} aria-live="polite">
            <span style={css('font-size: 16px; font-weight: 700;')}>선택한 태그 <span style={css('color: var(--accent-text);')}>{sel.length}/5</span></span>
            <span style={css('font-size: 14px; line-height: 1.6; color: #a8a099; overflow-wrap: anywhere;')}>{sel.length ? sel.map((n) => '#' + n).join('  ') : '선택한 태그가 없어요'}</span>
          </div>
          <div style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 10px;')}>
            <button className="chip" type="button" disabled={sel.length === 0} onClick={() => setSel([])}>초기화</button>
            {sel.length > 0 ? <Link className="go" to={go}>선택한 태그로 보기</Link> : <button className="go" type="button" disabled>선택한 태그로 보기</button>}
          </div>
        </div>

        <div style={css('display: flex; flex-direction: column; gap: 40px;')}>
          {GROUPS.map((grp) => (
            <section key={grp.name} style={css('display: flex; flex-direction: column; gap: 16px; padding-top: 24px; border-top: 1px solid #2e2a27;')}>
              <h2 style={css('margin: 0; font-size: 15px; font-weight: 500; color: #a8a099;')}>{grp.name}</h2>
              <div style={css('display: flex; flex-wrap: wrap; gap: 10px;')}>
                {grp.tags.map((name) => {
                  const on = sel.includes(name);
                  return <button key={name} className={'chip' + (on ? ' on' : '')} type="button" aria-pressed={on} disabled={full && !on} onClick={() => toggle(name)}>{'#' + name}</button>;
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
