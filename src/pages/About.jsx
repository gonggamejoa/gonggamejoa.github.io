import { Link, useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import { PH } from '../lib/placeholders.js';

// 04~06번 카드는 이번 배포에서 제외된 기능이라 '준비 중' 배지를 붙였다 (문구는 디자인 그대로).
const CARDS = [
  ['01', '선바가 플레이한 공포게임을 한곳에', '게임 정보는 Steam에서, 플레이 영상은 YouTube에서 가져와 한 페이지에서 확인할 수 있어요.'],
  ['02', '해시태그로 내 취향 찾기', '장르, 시점, 나라 등 다양한 해시태그를 최대 5개까지 골라 원하는 공포게임을 찾아보세요.'],
  ['03', '시리즈는 재생목록으로', '영상이 여러 개인 게임은 1화부터 이어서 볼 수 있어요.'],
  ['04', '한줄평과 별점', '로그인하면 별점과 후기를 300자 이내로 남길 수 있어요.', true],
  ['05', '공포력과 배지', '활동할수록 레벨이 오르고 배지가 모여요.', true],
  ['06', '내 취향 추천', '즐겨찾기한 게임을 바탕으로 취향에 맞는 공포게임을 추천해요.', true],
];

export default function About() {
  useTitle('공겜조아단?');
  return (
    <Layout back="홈으로">
      <main style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 56px 24px 72px; flex: 1; display: flex; flex-direction: column; gap: 56px;')}>
        <div style={css('display: flex; flex-direction: column; gap: 20px; max-width: 720px;')}>
          <div style={css('width: 40px; height: 2px; background: var(--accent);')} />
          <h1 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: clamp(34px, 5vw, 56px); line-height: 1.25;")}>공겜조아단?</h1>
          <p style={css('margin: 0; font-size: 18px; line-height: 1.8; color: #a8a099; text-wrap: pretty;')}>공포게임을 조아하는 사람들을 위한 공포게임 아카이브예요. 선바가 플레이했던 다양한 공포게임을 내 취향대로 골라보세요.</p>
        </div>

        <section style={css('display: flex; flex-direction: column; gap: 24px;')}>
          <h2 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 26px;")}>이런 걸 할 수 있어요</h2>
          <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px;')}>
            {CARDS.map(([no, t, d, soon]) => (
              <div key={no} style={css('display: flex; flex-direction: column; gap: 12px; padding: 28px; background: #181615; border: 1px solid #2e2a27; border-radius: 16px;')}>
                <span style={css('display: flex; align-items: center; justify-content: space-between; gap: 8px;')}>
                  <span style={css('font-size: 14px; font-weight: 700; color: var(--accent-text);')}>{no}</span>
                  {soon && <span className="pill">준비 중</span>}
                </span>
                <span style={css("font-family: 'Noto Serif KR', serif; font-size: 20px; font-weight: 700; line-height: 1.4;")}>{t}</span>
                <span style={css('font-size: 15px; line-height: 1.7; color: #a8a099; text-wrap: pretty;')}>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={css('display: flex; flex-direction: column; gap: 16px; padding: 32px; border: 1px dashed #3a3531; border-radius: 16px;')}>
          <h2 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 26px;")}>주인장 소개</h2>
          <p style={css('margin: 0; font-size: 16px; line-height: 1.8; color: #a8a099;')}>{PH.ownerIntro}</p>
        </section>

        <div>
          <Link className="btn" to="/" style={css("display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 28px; border-radius: 10px; background: var(--accent); color: #fff; font: 700 16px/1 'Noto Sans KR', sans-serif;")}>공포게임 보러 가기</Link>
        </div>
      </main>
    </Layout>
  );
}
