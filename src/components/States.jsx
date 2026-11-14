import { Link } from '../router.jsx';
import { css } from '../lib/css.js';
import { REPORT_FORM_URL } from '../config.js';

// States.dc.html 의 카드(.cd) 이식: 404 / 점검 / 불러오기 실패 / 영상 재생 불가
const serif22 = css("font-family: 'Noto Serif KR', serif; font-size: 22px; font-weight: 700;");
const body15 = css('font-size: 15px; line-height: 1.7; color: #a8a099; max-width: 360px;');
const row = css('display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 6px;');
const card = css('flex: 1; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;');

export function NotFoundCard() {
  return (
    <div className="cd" style={card}>
      <div style={css("font-family: 'Noto Serif KR', serif; font-size: 64px; font-weight: 700; color: var(--accent-text); line-height: 1;")}>404</div>
      <div style={serif22}>이 페이지는 어둠 속으로 사라졌어요</div>
      <div style={body15}>주소가 바뀌었거나 삭제된 페이지예요.</div>
      <div style={row}><Link className="btn" to="/">홈으로</Link><Link className="btn ghost" to="/#list">게임 검색하기</Link></div>
    </div>
  );
}

export function MaintenanceCard({ until }) {
  return (
    <div className="cd" style={card}>
      <div style={serif22}>잠시 점검 중이에요</div>
      <div style={body15}>더 안정적인 서비스를 위해 점검하고 있어요. {until}에 다시 열려요.</div>
      <div style={row}><button className="btn ghost" type="button" onClick={() => window.location.reload()}>새로고침</button></div>
    </div>
  );
}

export function ErrorCard({ onRetry }) {
  return (
    <div className="cd" style={card}>
      <div style={serif22}>정보를 불러오지 못했어요</div>
      <div style={body15}>Steam 또는 YouTube 연결이 불안정해요. 잠시 후 다시 시도해 주세요.</div>
      <div style={row}><button className="btn" type="button" onClick={onRetry}>다시 시도</button><Link className="btn ghost" to="/">홈으로</Link></div>
    </div>
  );
}

// inline: 플레이어 영역 안에 꽉 채워 표시할 때
export function VideoUnavailable({ inline }) {
  const box = (
    <>
      <div style={css('width: 100%; aspect-ratio: 16 / 9; background: #211e1c; border: 1px solid #2e2a27; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: #a8a099; font-size: 14px; padding: 12px;')}>
        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M5 6v12l9-6" /></svg>
        <span>영상을 재생할 수 없어요</span>
      </div>
    </>
  );
  if (inline) {
    return (
      <div role="status" style={css('flex: 1; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; background: #181615; overflow: auto;')}>
        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a8a099" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M5 6v12l9-6" /></svg>
        <div style={css("font-family: 'Noto Serif KR', serif; font-size: 18px; font-weight: 700;")}>삭제되었거나 비공개인 영상이에요</div>
        <div style={css('font-size: 14px; line-height: 1.6; color: #a8a099;')}>잘못된 링크라면 알려주세요.</div>
        <a className="btn ghost" href={REPORT_FORM_URL} target="_blank" rel="noopener" style={css('min-height: 40px; font-size: 14px; padding: 0 16px; margin-top: 4px;')}>링크 오류 신고</a>
      </div>
    );
  }
  return (
    <div className="cd" style={card}>
      {box}
      <div style={serif22}>삭제되었거나 비공개인 영상이에요</div>
      <div style={body15}>잘못된 링크라면 알려주세요.</div>
      <div style={row}><a className="btn ghost" href={REPORT_FORM_URL} target="_blank" rel="noopener">링크 오류 신고</a></div>
    </div>
  );
}
