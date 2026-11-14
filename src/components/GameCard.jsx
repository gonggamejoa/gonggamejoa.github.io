import { Link } from '../router.jsx';
import { css } from '../lib/css.js';
import { gamePath, steamHeader, tagText } from '../lib/games.js';
import Img from './Img.jsx';

// 홈 카드 (Main.dc.html .card)
export function HomeCard({ g }) {
  return (
    <Link className="card" to={gamePath(g)}>
      <div style={css('position: relative; aspect-ratio: 460 / 215; background: #211e1c; display: flex; align-items: center; justify-content: center; color: #a8a099; font-size: 13px; border-bottom: 1px solid #2e2a27;')}>
        <Img src={steamHeader(g)} alt={g.title} fallback="Steam 대표 이미지" />
        {g.series && (
          <span style={css('position: absolute; left: 12px; top: 12px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(15,14,13,0.85); border: 1px solid #3a3531; border-radius: 999px; font-size: 13px; color: #efe9e2;')}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h12M4 11h12M4 16h7M17 14v6l5-3z" /></svg>
            재생목록
          </span>
        )}
      </div>
      <div style={css('padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 8px;')}>
        <div style={css('font-size: 17px; font-weight: 700; line-height: 1.35;')}>{g.title}</div>
        {g.tags.length > 0 && <div style={css('font-size: 14px; color: #C92408')}>{tagText(g)}</div>}
      </div>
    </Link>
  );
}
