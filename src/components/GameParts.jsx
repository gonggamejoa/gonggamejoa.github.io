import { useEffect, useState } from 'react';
import { Link } from '../router.jsx';
import { css } from '../lib/css.js';
import { PH } from '../lib/placeholders.js';
import { gamePath, steamHeader, steamUrl, youtubeId, ytThumb } from '../lib/games.js';
import Img from './Img.jsx';
import { VideoUnavailable } from './States.jsx';

// ---- 영상 미리보기 + 4칸 썸네일 (Detail/Series 공통) ----
// 칸 1 = 영상(재생 버튼), 칸 2~4 = 스크린샷. 디자인에는 칸 클릭 동작이 없어 최소한의 전환만 구현(디자인 세션에 질문).
export function Stage({ title, videoUrl, screenshots, steamImg, playLabel, caption }) {
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);
  useEffect(() => { setSel(0); setPlaying(false); setBroken(false); }, [videoUrl]);
  const vid = youtubeId(videoUrl);
  const poster = ytThumb(videoUrl) || screenshots[0] || steamImg;
  const frame = css('position: relative; overflow: hidden; aspect-ratio: 16 / 9; background: #181615; border: 1px solid #2e2a27; border-radius: 14px; display: flex; align-items: center; justify-content: center;');

  let stage;
  if (sel > 0 && screenshots[sel]) {
    stage = <Img src={screenshots[sel]} alt={`${title} 스크린샷 ${sel + 1}`} />;
  } else if (sel > 0) {
    stage = null;
  } else if (playing && vid && !broken) {
    stage = <iframe title={`${title} 영상`} src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={() => setBroken(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />;
  } else if (playing) {
    stage = <div style={{ position: 'absolute', inset: 0, display: 'flex' }}><VideoUnavailable inline /></div>;
  } else {
    stage = (
      <>
        <Img src={poster} alt="" />
        <button className="play" type="button" aria-label={playLabel} onClick={() => setPlaying(true)} style={{ position: 'relative' }}>
          <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
        </button>
        {caption && <span style={css('position: absolute; left: 16px; bottom: 16px; max-width: calc(100% - 32px); padding: 8px 14px; background: rgba(15,14,13,0.85); border: 1px solid #3a3531; border-radius: 999px; font-size: 14px; line-height: 1.4;')}>{caption}</span>}
      </>
    );
  }

  return (
    <div style={css('flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 16px;')}>
      <div style={frame}>{stage}</div>
      <div style={css('display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;')}>
        {[0, 1, 2, 3].map((k) => (
          <button key={k} type="button" aria-label={k === 0 ? '영상 보기' : `스크린샷 ${k + 1}`} aria-pressed={sel === k} onClick={() => { setSel(k); if (k === 0) setPlaying(false); }}
            style={{ ...css('position: relative; overflow: hidden; padding: 0; cursor: pointer; aspect-ratio: 16 / 9; background: #181615; border-radius: 8px;'), border: '1px solid ' + (sel === k ? 'var(--accent)' : '#2e2a27') }}>
            <Img src={screenshots[k] || (k === 0 ? poster : null)} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- 오른쪽 정보 패널 ----
const dt = css('color: #a8a099;');
const dd = css('margin: 0;');
export function InfoAside({ game, kicker }) {
  return (
    <aside style={css('flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 24px;')}>
      <div style={css('display: flex; flex-direction: column; gap: 12px;')}>
        {kicker}
        {game.tags.length > 0 && (
          <div style={css('display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px; color:var(--accent-text);')}>
            {game.tags.map((t) => <span key={t}>{'#' + t}</span>)}
          </div>
        )}
        <h1 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: clamp(30px, 4vw, 44px); line-height: 1.2;")}>{game.title}</h1>
      </div>
      <p style={css('margin: 0; font-size: 16px; line-height: 1.75; color: #a8a099; text-wrap: pretty;')}>{game.description ?? PH.description}</p>
      <dl style={css('margin: 0; display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 14px 16px; padding: 20px 0; border-top: 1px solid #2e2a27; border-bottom: 1px solid #2e2a27; font-size: 15px;')}>
        <dt style={dt}>개발사</dt><dd style={dd}>{game.developer ?? PH.developer}</dd>
        <dt style={dt}>출시일</dt><dd style={dd}>{game.releaseDate ?? PH.release}</dd>
        <dt style={dt}>가격</dt><dd style={dd}>{game.price ?? PH.price}</dd>
        <dt style={dt}>한국어</dt><dd style={dd}>{game.korean ?? PH.korean}</dd>
      </dl>
      <div style={css('display: flex; flex-direction: column; gap: 12px;')}>
        <a className="btn" href={steamUrl(game)} target="_blank" rel="noopener">Steam에서 보기</a>
        {/* 즐겨찾기: 이번 배포 제외 -> 비활성 + 라벨 '즐겨찾기 · 준비 중' */}
        <button className="btn ghost" type="button" disabled aria-disabled="true">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z" /></svg>
          즐겨찾기 · 준비 중
        </button>
      </div>
    </aside>
  );
}

const h2 = css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 28px;");
// ---- 한줄평: 이번 배포 제외 -> '준비 중' 카드 ----
export function ReviewsSoon() {
  return (
    <section style={css('display: flex; flex-direction: column; gap: 28px;')}>
      <div style={css('display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid #2e2a27; padding-bottom: 20px;')}>
        <h2 style={h2}>게임 한줄평</h2>
        <span style={css('font-size: 15px; color: #a8a099;')}>별점과 후기는 준비 중이에요</span>
      </div>
      <div style={css('display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; background: #181615; border: 1px dashed #3a3531; border-radius: 16px;')}>
        <span style={css('font-size: 16px; line-height: 1.6; color: #a8a099;')}>로그인하고 한줄평을 남기는 기능을 준비하고 있어요.</span>
        <span className="pill">준비 중</span>
      </div>
    </section>
  );
}

// ---- 내 취향 추천 ----
export function RecSection({ title, sub, recs, series, emptyText }) {
  return (
    <section style={css('display: flex; flex-direction: column; gap: 28px;')}>
      <div style={css('display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid #2e2a27; padding-bottom: 20px;')}>
        <h2 style={h2}>{title}</h2>
        <span style={css('font-size: 15px; color: #a8a099;')}>{sub}</span>
      </div>
      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 24px;')}>
        {recs.map(({ game: r, common }) => (
          <Link key={r.id} className="card" to={gamePath(r)}>
            <div style={css('position: relative; aspect-ratio: 460 / 215; background: #211e1c; display: flex; align-items: center; justify-content: center; color: #a8a099; font-size: 13px; border-bottom: 1px solid #2e2a27;')}>
              <Img src={series ? (ytThumb(r.episodes[0]?.url) || steamHeader(r)) : steamHeader(r)} alt={r.title} fallback={series ? '1화 썸네일' : 'Steam 대표 이미지'} />
              {series && (
                <span style={css('position: absolute; left: 12px; top: 12px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(15,14,13,0.85); border: 1px solid #3a3531; border-radius: 999px; font-size: 13px; color: #efe9e2;')}>
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h12M4 11h12M4 16h7M17 14v6l5-3z" /></svg>
                  재생목록
                </span>
              )}
            </div>
            <div style={css('padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 8px;')}>
              <div style={css('font-size: 17px; font-weight: 700; line-height: 1.35;')}>{r.title}</div>
              <div style={css('font-size: 14px; line-height: 1.6; color: var(--accent-text);')}>{common.map((t) => '#' + t).join('  ')}</div>
              <div style={css('font-size: 13px; color: #a8a099;')}>공통 태그 {common.length}개</div>
            </div>
          </Link>
        ))}
      </div>
      {recs.length === 0 && (
        <div style={css('padding: 56px 24px; text-align: center; border: 1px dashed #3a3531; border-radius: 12px; font-size: 15px; color: #a8a099;')}>{emptyText}</div>
      )}
    </section>
  );
}
