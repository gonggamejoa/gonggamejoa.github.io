import { useEffect, useState } from 'react';
import { useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import Img from '../components/Img.jsx';
import { InfoAside, RecSection, ReviewsSoon, Stage } from '../components/GameParts.jsx';
import { recommendSeries, steamHeader, ytThumb } from '../lib/games.js';
import { PH } from '../lib/placeholders.js';
import { MIN_SHARED_SERIES } from '../config.js';

const h2 = css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 28px;");

function usePerView() {
  const get = () => (typeof window !== 'undefined' && window.innerWidth < 760 ? 2 : 4);
  const [n, setN] = useState(get);
  useEffect(() => { const f = () => setN(get()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return n;
}

export default function Series({ game }) {
  useTitle(game.title + ' 재생목록');
  const eps = game.episodes;
  const first = eps[0];
  const rest = eps.slice(1).map((e, k) => ({ ...e, no: k + 2 }));
  const perView = usePerView();
  const maxI = Math.max(0, rest.length - perView);
  const [riState, setRi] = useState(0);
  useEffect(() => setRi(0), [game.id]);
  const ri = Math.min(riState, maxI);
  // 재생목록은 자동 롤링 없음. 화살표로만 이동 (Series.dc.html railStyle 그대로)
  const railStyle = { ...css('display: flex; gap: 16px; width: 100%;'), '--n': perView, transform: `translateX(calc(${ri} * (-100% / ${perView} - 16px / ${perView})))`, transition: 'transform .5s ease' };

  return (
    <Layout back="목록으로">
      <main style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 24px 24px 72px; display: flex; flex-direction: column; gap: 72px;')}>
        <section style={css('display: flex; flex-wrap: wrap; gap: 40px;')}>
          <Stage title={game.title} videoUrl={first?.url} screenshots={game.screenshots} steamImg={steamHeader(game)} playLabel="1화 재생" caption={`1화 · ${first?.title ?? PH.epTitle}`} />
          <InfoAside game={game} kicker={
            <div style={css('display: flex; align-items: center; gap: 8px; font-size: 14px; color: #a8a099;')}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h12M4 11h12M4 16h7M17 14v6l5-3z" /></svg>재생목록 · 총 {eps.length}편
            </div>} />
        </section>

        <section aria-label="재생목록" style={css('display: flex; flex-direction: column; gap: 24px;')}>
          <div style={css('display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid #2e2a27; padding-bottom: 20px;')}>
            <h2 style={h2}>재생목록</h2>
            <span style={css('font-size: 15px; color: #a8a099;')}>1화는 위 미리보기에서 볼 수 있어요. 2화부터 이어서 만나보세요</span>
          </div>
          <div style={css('display: flex; align-items: center; gap: 12px;')}>
            <button className="arw" type="button" aria-label="이전 영상" disabled={ri <= 0} onClick={() => setRi(Math.max(0, ri - 1))}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <div style={css('flex: 1 1 0; min-width: 0; overflow: hidden;')}>
              <div style={railStyle}>
                {rest.map((e) => (
                  <a key={e.no} className="vid" href={e.url || 'https://www.youtube.com/'} target="_blank" rel="noopener" style={css('flex: 0 0 calc((100% - (var(--n) - 1) * 16px) / var(--n)); min-width: 0;')}>
                    <div className="thumb" style={css('position: relative; overflow: hidden; aspect-ratio: 16 / 9; background: #181615; border-radius: 12px; display: flex; align-items: center; justify-content: center;')}>
                      <Img src={ytThumb(e.url)} alt="" />
                      <svg aria-hidden="true" width="36" height="36" viewBox="0 0 44 44" fill="none" style={{ position: 'relative' }}><circle cx="22" cy="22" r="21" stroke="#a8a099" strokeWidth="1.5" /><path d="M18 14.5l12 7.5-12 7.5z" fill="#a8a099" /></svg>
                      <span style={css('position: absolute; left: 10px; top: 10px; padding: 4px 10px; background: rgba(15,14,13,0.85); border: 1px solid #3a3531; border-radius: 999px; font-size: 13px; line-height: 1.3;')}>{e.no}화</span>
                    </div>
                    <div style={css('font-size: 16px; font-weight: 500; line-height: 1.45; overflow-wrap: anywhere;')}>{e.title ?? PH.epTitle}</div>
                  </a>
                ))}
              </div>
            </div>
            <button className="arw" type="button" aria-label="다음 영상" disabled={ri >= maxI} onClick={() => setRi(Math.min(maxI, ri + 1))}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </section>

        <ReviewsSoon />
        {game.tags.length > 0 && <RecSection series title="내 취향 시리즈 추천" sub={`이 시리즈와 해시태그가 ${MIN_SHARED_SERIES}개 이상 겹치는 재생목록이에요`} recs={recommendSeries(game)} emptyText={`해시태그가 ${MIN_SHARED_SERIES}개 이상 겹치는 시리즈가 아직 없어요.`} />}
      </main>
    </Layout>
  );
}
