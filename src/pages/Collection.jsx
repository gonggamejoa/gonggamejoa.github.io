import { Link, useLocation, useSetQuery, useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import Img from '../components/Img.jsx';
import { bestSeriesList, gamePath, recommendedList, steamHeader, tagText } from '../lib/games.js';
import { OWNER_COMMENT_DEFAULT } from '../config.js';

// Collection.dc.html 중 이번 배포 범위: '주인장 추천' / '베스트 시리즈' 2개 탭 (신규 탭 제외)
const TABS = [['pick', '주인장 추천'], ['best', '베스트 시리즈']];
const META = { pick: ['주인장 추천 공겜', '주인장이 직접 고른 공포게임이에요.'], best: ['베스트 공겜시리즈', '처음부터 끝까지 이어서 즐기는 재생목록 모음이에요.'] };

export default function Collection() {
  const { params } = useLocation();
  const setQuery = useSetQuery();
  const tab = params.get('tab') === 'best' ? 'best' : 'pick';
  const [title, sub] = META[tab];
  useTitle(title);
  const list = tab === 'pick' ? recommendedList() : bestSeriesList();
  const note = (g) => (tab === 'pick' ? g.ownerComment || OWNER_COMMENT_DEFAULT : '재생목록 ' + g.episodes.length + '편');

  return (
    <Layout back="홈으로">
      <main style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px 24px 72px; flex: 1; display: flex; flex-direction: column; gap: 40px;')}>
        <div style={css('display: flex; flex-direction: column; gap: 12px;')}>
          <h1 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: clamp(28px, 4vw, 40px); line-height: 1.25;")}>{title}</h1>
          <p style={css('margin: 0; font-size: 16px; line-height: 1.7; color: #a8a099; max-width: 640px; text-wrap: pretty;')}>{sub}</p>
        </div>

        <div role="tablist" aria-label="모아보기" style={css('display: flex; gap: 4px; border-bottom: 1px solid #2e2a27; overflow-x: auto;')}>
          {TABS.map(([k, l]) => (
            <button key={k} className={'tab' + (tab === k ? ' on' : '')} type="button" role="tab" aria-selected={tab === k} onClick={() => setQuery({ tab: k === 'pick' ? null : k })}>{l}</button>
          ))}
        </div>

        {list.length === 0 && (
          <div style={css('padding: 56px 24px; text-align: center; border: 1px dashed #3a3531; border-radius: 12px; font-size: 15px; color: #a8a099;')}>
            {tab === 'pick' ? '아직 추천 게임이 없어요. 곧 채워질 거예요.' : '아직 시리즈가 없어요. 곧 채워질 거예요.'}
          </div>
        )}
        <div style={css('display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 20px;')}>
          {list.map((g) => (
            <Link key={g.id} className="gc" to={gamePath(g)}>
              <div style={css('position: relative; aspect-ratio: 460 / 215; background: #211e1c; display: flex; align-items: center; justify-content: center; color: #a8a099; font-size: 13px; border-bottom: 1px solid #2e2a27;')}>
                <Img src={steamHeader(g)} alt={g.title} fallback="Steam 대표 이미지" />
                {g.series && <span style={css('position: absolute; left: 10px; top: 10px; padding: 3px 10px; background: rgba(15,14,13,0.85); border: 1px solid #3a3531; border-radius: 999px; font-size: 12px; color: #efe9e2;')}>재생목록</span>}
              </div>
              <div style={css('padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px;')}>
                <div style={css('font-size: 16px; font-weight: 700; line-height: 1.35;')}>{g.title}</div>
                {g.tags.length > 0 && <div style={css('font-size: 14px; color: var(--accent-text);')}>{tagText(g)}</div>}
                <div style={css('font-size: 13px; line-height: 1.6; color: #a8a099;')}>{note(g)}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
