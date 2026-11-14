import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSetQuery, useTitle, href } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import BannerCarousel from '../components/BannerCarousel.jsx';
import { HomeCard } from '../components/GameCard.jsx';
import { filterGames } from '../lib/games.js';
import { HOME_TAGS, PAGE_SIZE, REPORT_FORM_URL } from '../config.js';

// 홈 배너 4개 (HANDOFF: 주인장 추천 / 베스트 공겜시리즈 / 해시태그로 찾기 / 제보·건의)
const BANNERS = [
  { cls: 'hi', icon: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z', title: '주인장 추천 공겜', desc: '주인장이 직접 고른 공포게임을 만나보세요.', href: '/collection?tab=pick' },
  { cls: '', icon: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5', title: '베스트 공겜시리즈', desc: '처음부터 끝까지 이어서 즐기는 공포게임 시리즈 모음.', href: '/collection?tab=best' },
  { cls: '', icon: 'M5 9h14M5 15h14M10 4L8 20M16 4l-2 16', title: '해시태그로 찾기', desc: '장르, 시점, 나라별 해시태그를 골라 내 취향의 공포게임을 찾아보세요.', href: '/tags' },
  { cls: '', icon: 'M4 5h16v11H9l-5 4V5z', title: '건의하기', desc: '보고 싶은 게임이나 개선할 점을 알려주세요.', href: REPORT_FORM_URL, external: true },
];

const parseTags = (params) => (params.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean);

export default function Home() {
  useTitle('');
  const { params } = useLocation();
  const setQuery = useSetQuery();
  const tags = parseTags(params);
  const tagKey = tags.join(',');
  const urlQ = params.get('q') || '';

  const [q, setQ] = useState(urlQ);
  const [shown, setShown] = useState(PAGE_SIZE);
  useEffect(() => { setQ((cur) => (cur === urlQ ? cur : urlQ)); }, [urlQ]);
  useEffect(() => { setShown(PAGE_SIZE); }, [tagKey]);

  const games = useMemo(() => filterGames(tags, q), [tagKey, q]);
  const page = games.slice(0, shown);

  const onQuery = (e) => { setQ(e.target.value); setShown(PAGE_SIZE); setQuery({ q: e.target.value.trim() ? e.target.value : null }); };
  // 칩: 하나만 고르면 디자인대로 단일 선택, 여러 개(태그 페이지에서 온 경우)면 토글
  const pick = (t) => {
    if (t === '전체') return setQuery({ tags: null });
    if (tags.length <= 1) return setQuery({ tags: t });
    setQuery({ tags: (tags.includes(t) ? tags.filter((x) => x !== t) : tags.concat(t)).join(',') || null });
  };
  const chips = ['전체', ...tags.filter((t) => !HOME_TAGS.includes(t)), ...HOME_TAGS];
  const heading = tags.length === 0 ? '모든 공포게임 보기' : tags.map((t) => '#' + t).join(' ');

  return (
    <Layout>
      <section style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 72px 24px 56px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 28px;')}>
        <div style={css('width: 40px; height: 2px; background: var(--accent);')} />
        <h1 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: clamp(34px, 5.4vw, 60px); line-height: 1.25; text-wrap: balance;")}>
          <span style={{ color: '#FF0000' }}>공</span>포<span style={{ color: '#FF0000' }}>겜</span>을 <span style={{ color: '#FF0000' }}>조아</span>한다면,<br />지금 만나보기
        </h1>
        <p style={css('margin: 0; font-size: 17px; line-height: 1.7; color: #a8a099; max-width: 520px; text-wrap: pretty;')}>선바가 플레이했던 다양한 공포게임을 내 취향대로 골라보세요.</p>

        <form onSubmit={(e) => e.preventDefault()} role="search" style={css('width: 100%; max-width: 720px; margin-top: 8px;')}>
          <div className="sbox" style={css('display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 20px; background: #181615; border: 1px solid #3a3531; border-radius: 14px;')}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8a099" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <label htmlFor="q" className="sr-only">공포게임 검색</label>
            <input id="q" className="q" type="search" placeholder="게임 이름, 키워드로 검색" value={q} onChange={onQuery} autoComplete="off" />
            <button className="go" type="submit">검색</button>
          </div>
        </form>

        <div role="group" aria-label="카테고리 해시태그" style={css('width: 100%; max-width: 820px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;')}>
          {chips.map((t) => {
            const on = t === '전체' ? tags.length === 0 : tags.includes(t);
            return <button key={t} className={'chip' + (on ? ' on' : '')} type="button" aria-pressed={on} onClick={() => pick(t)}>{t === '전체' ? '전체' : '#' + t}</button>;
          })}
          <Link className="chip" to="/tags" style={css('border-style: dashed;')}>
            더보기
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </section>

      <BannerCarousel banners={BANNERS} />

      <main id="list" style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 8px 24px 72px; flex: 1; display: flex; flex-direction: column; gap: 24px;')}>
        <div style={css('display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; border-bottom: 1px solid #2e2a27; padding-bottom: 16px;')}>
          <h2 style={css('margin: 0; font-size: 20px; font-weight: 700;')}>{heading}</h2>
          <span style={css('font-size: 15px; color: #a8a099;')}>최신순 · {games.length}개의 게임</span>
        </div>

        <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 24px;')}>
          {page.map((g) => <HomeCard key={g.id} g={g} />)}
        </div>

        {games.length > page.length && (
          <div style={css('display: flex; flex-direction: column; align-items: center; gap: 10px;')}>
            <button className="chip" type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} style={css('min-width: 200px; justify-content: center;')}>게임 더보기</button>
            <span style={css('font-size: 13px; color: #a8a099;')}>{page.length} / {games.length}</span>
          </div>
        )}

        {games.length === 0 && (
          <div style={css('padding: 72px 24px; text-align: center; border: 1px dashed #3a3531; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px;')}>
            <img src={href('/logo-stack.png')} alt="공겜조아단" style={css('height: 96px; width: auto; display: block; margin-bottom: 14px;')} />
            <div style={css("font-family: 'Noto Serif KR', serif; font-size: 22px; font-weight: 700;")}>찾는 게임이 어둠 속에 숨었어요</div>
            <div style={css('font-size: 15px; color: #a8a099;')}>다른 키워드나 해시태그로 다시 찾아보세요.</div>
          </div>
        )}
      </main>
    </Layout>
  );
}
