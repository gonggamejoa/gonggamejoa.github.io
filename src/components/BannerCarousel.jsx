import { useEffect, useRef, useState } from 'react';
import { Link } from '../router.jsx';
import { css } from '../lib/css.js';

// Main.dc.html 롤링배너를 그대로 이식: 5초 자동(왼쪽으로 이동), 호버/포커스 시 정지, 복제 3개로 이음새 없는 루프.
// 배너 개수 N은 props.banners.length (이번 배포는 4개). 복제는 처음 3개.
const CLONES = 3;

export default function BannerCarousel({ banners }) {
  const N = banners.length;
  const [i, setI] = useState(0);
  const [anim, setAnim] = useState(true);
  const paused = useRef(false);
  const busy = useRef(false);
  const iRef = useRef(0);
  const timers = useRef({});
  const interval = useRef(null);
  iRef.current = i;

  const step = (dir) => {
    if (busy.current) return;
    const cur = iRef.current;
    if (dir > 0) {
      setAnim(true); setI(cur + 1);
      if (cur + 1 >= N) {
        busy.current = true;
        timers.current.t1 = setTimeout(() => { setAnim(false); setI(0); busy.current = false; }, 650);
      }
    } else if (cur === 0) {
      busy.current = true;
      setAnim(false); setI(N);
      timers.current.t1 = setTimeout(() => {
        setAnim(true); setI(N - 1);
        timers.current.t2 = setTimeout(() => { busy.current = false; }, 650);
      }, 50);
    } else {
      setAnim(true); setI(cur - 1);
    }
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  const startTimer = () => {
    clearInterval(interval.current);
    interval.current = setInterval(() => { if (!paused.current) stepRef.current(1); }, 5000);
  };
  useEffect(() => {
    startTimer();
    return () => { clearInterval(interval.current); clearTimeout(timers.current.t1); clearTimeout(timers.current.t2); };
  }, []);

  const items = banners.concat(banners.slice(0, CLONES)).map((b, k) => ({ ...b, hidden: k >= N, key: k }));
  const trackStyle = {
    ...css('display: flex; gap: 16px; width: 100%;'),
    transform: `translateX(calc(-1 * ${i} * ((100% - 16px * (var(--n) - 0.5)) / var(--n) + 16px)))`,
    transition: anim ? 'transform .6s ease' : 'none',
  };
  const pause = () => { paused.current = true; };
  const resume = () => { paused.current = false; };

  return (
    <section aria-roledescription="carousel" aria-label="공겜조아단 배너" style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px 64px; display: flex; flex-direction: column; gap: 16px;')}>
      <div onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume} style={css('position: relative; overflow: hidden; border-radius: 16px; width: 100%; max-width: 928px;')}>
        <div className="track" style={trackStyle}>
          {items.map((b) => (
            <Link key={b.key} className={'ban ' + (b.cls || '')} to={b.href} target={b.external ? '_blank' : undefined} rel={b.external ? 'noopener' : undefined}
              aria-hidden={b.hidden ? 'true' : 'false'} tabIndex={b.hidden ? -1 : 0}
              style={css('flex: 0 0 calc((100% - 16px * (var(--n) - 0.5)) / var(--n)); min-width: 0;')}>
              <span className="bi">
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
              </span>
              <span style={css('display: flex; flex-direction: column; gap: 8px;')}>
                <span className="bt" style={css("font-family: 'Noto Serif KR', serif; font-size: clamp(17px, 6cqw, 23px); font-weight: 700; line-height: 1.3;")}>{b.title}</span>
                <span className="bd" style={css('font-size: clamp(12px, 3.8cqw, 14px); line-height: 1.5; color: #a8a099; text-wrap: pretty; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;')}>{b.desc}</span>
              </span>
              <span className="bc">
                바로가기
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </Link>
          ))}
        </div>
        <div aria-hidden="true" style={css('position: absolute; top: 0; right: 0; bottom: 0; width: 22%; background: linear-gradient(to right, rgba(15,14,13,0), #0f0e0d); pointer-events: none;')} />
      </div>
      <div style={css('display: flex; justify-content: flex-end; gap: 10px; width: 100%; max-width: 928px;')}>
        <button className="arw" type="button" aria-label="이전 배너" onClick={() => { step(-1); startTimer(); }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button className="arw" type="button" aria-label="다음 배너" onClick={() => { step(1); startTimer(); }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </section>
  );
}
