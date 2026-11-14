import { useEffect, useRef, useState } from 'react';
import { Link, href } from '../router.jsx';
import { css } from '../lib/css.js';
import { REPORT_FORM_URL } from '../config.js';

const Logo = ({ h }) => <img src={href('/logo-wide.png')} alt="공겜조아단" style={css(`height: ${h}px; width: auto; display: block;`)} />;

const MenuIcon = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
const BackIcon = <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>;
const SI = (d) => <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const SOON = <span className="pill soon">준비 중</span>;

function Sidebar({ onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div style={css('position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 50; display: flex; justify-content: flex-end;')}>
      <button type="button" aria-label="메뉴 닫기" tabIndex={-1} onClick={onClose} style={css('position: absolute; top: 0; right: 0; bottom: 0; left: 0; border: 0; background: rgba(0,0,0,0.6); cursor: pointer;')} />
      <nav aria-label="사이드바" onClick={(e) => { if (e.target.closest('a')) onClose(); }} style={css('position: relative; width: min(320px, 86vw); height: 100%; background: #181615; border-left: 1px solid #2e2a27; padding: 20px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto;')}>
        <div style={css('display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; margin-bottom: 8px; border-bottom: 1px solid #2e2a27;')}>
          <Logo h={32} />
          <button ref={closeRef} className="menu" type="button" aria-label="메뉴 닫기" onClick={onClose}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {/* 공포력: 이번 배포 제외 -> 준비 중 */}
        <Link className="pw" to="/soon/fear" aria-label="공포력, 준비 중">
          <span style={css('display: flex; align-items: center; gap: 12px;')}>
            <span className="pwb"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V11a7 7 0 0 1 14 0v10l-2.6-2-2.2 2-2.2-2-2.2 2-2.2-2z" /><circle cx="9.5" cy="11" r="1" fill="currentColor" /><circle cx="14.5" cy="11" r="1" fill="currentColor" /></svg></span>
            <span style={css('display: flex; flex-direction: column; gap: 2px;')}>
              <span style={css('font-size: 16px; font-weight: 700;')}>공포력</span>
              <span style={css('font-size: 14px; color: var(--accent-text);')}>레벨과 배지</span>
            </span>
            {SOON}
          </span>
        </Link>
        <Link className="sitem" to="/soon/login">{SI(<><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 4.5-6 8-6s7 2 8 6" /></>)}로그인{SOON}</Link>
        <Link className="sitem" to="/soon/favorites">{SI(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z" />)}즐겨찾기{SOON}</Link>
        <Link className="sitem" to="/soon/reviews">{SI(<path d="M4 5h16v11H9l-5 4V5z" />)}내 한줄평{SOON}</Link>
        <Link className="sitem" to="/about">{SI(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 16.8v.1" /></>)}공겜조아단?</Link>
        <a className="sitem" href={REPORT_FORM_URL} target="_blank" rel="noopener">{SI(<path d="M5 21V4M5 4h11l-2 4 2 4H5" />)}제보하기</a>
      </nav>
    </div>
  );
}

export function Header({ back }) {
  const [open, setOpen] = useState(false);
  const menuBtn = useRef(null);
  const close = () => { setOpen(false); menuBtn.current?.focus(); };
  const pad = back ? '28px 24px 8px' : '28px 24px';
  return (
    <>
      <header style={css(`width: 100%; max-width: 1200px; margin: 0 auto; padding: ${pad}; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;`)}>
        <Link to="/" aria-label="공겜조아단 홈" style={css('display: inline-flex;')}><Logo h={40} /></Link>
        <div style={css('display: flex; align-items: center; gap: 8px;')}>
          {back && <Link className="back" to="/">{BackIcon}{back}</Link>}
          <button ref={menuBtn} className="menu" type="button" aria-label="메뉴 열기" aria-expanded={open} onClick={() => setOpen(true)}>{MenuIcon}</button>
        </div>
      </header>
      {open && <Sidebar onClose={close} />}
    </>
  );
}

const flink = css('color: #a8a099; text-decoration: underline; text-underline-offset: 3px;');
export function Footer() {
  return (
    <footer style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 28px 24px 40px; border-top: 1px solid #2e2a27; font-size: 13px; color: #a8a099; line-height: 1.7;')}>
      <Logo h={28} />
      <div style={{ height: 14 }} />
      게임 정보는 Steam, 스트리밍 영상은 YouTube에서 불러옵니다. 각 게임의 정보와 영상의 저작권은 원 권리자에게 있습니다.
      <div style={css('display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 12px;')}>
        <Link to="/legal?tab=terms" style={flink}>이용약관</Link>
        <Link to="/legal?tab=privacy" style={flink}>개인정보처리방침</Link>
        <a href={REPORT_FORM_URL} target="_blank" rel="noopener" style={flink}>제보 · 건의</a>
      </div>
    </footer>
  );
}

export default function Layout({ back, children }) {
  return (
    <div style={css('flex: 1; display: flex; flex-direction: column; background: #0f0e0d; color: #efe9e2; font-family: \'Noto Sans KR\', system-ui, sans-serif;')}>
      <Header back={back} />
      {children}
      <Footer />
    </div>
  );
}
