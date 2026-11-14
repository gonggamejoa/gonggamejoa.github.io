import { Link, useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';

// 이번 배포 제외 기능의 '준비 중' 안내 페이지 (디자인 파일에 없는 화면 -> States 카드 스타일 재사용)
const NAMES = { fear: '공포력', login: '로그인', favorites: '즐겨찾기', reviews: '내 한줄평' };

export default function ComingSoon({ feature }) {
  const name = NAMES[feature] || '이 기능';
  useTitle(name + ' · 준비 중');
  return (
    <Layout back="홈으로">
      <main style={css('width: 100%; max-width: 560px; margin: 0 auto; padding: 72px 24px; flex: 1; display: flex; flex-direction: column;')}>
        <div className="cd" role="status" style={css('padding: 40px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;')}>
          <span className="pill">준비 중</span>
          <div style={css("font-family: 'Noto Serif KR', serif; font-size: 22px; font-weight: 700;")}>{name} 기능은 준비 중이에요</div>
          <div style={css('font-size: 15px; line-height: 1.7; color: #a8a099; max-width: 360px;')}>더 좋은 모습으로 곧 찾아올게요. 그동안은 공포게임을 둘러보세요.</div>
          <div style={css('display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 6px;')}><Link className="btn" to="/">홈으로</Link></div>
        </div>
      </main>
    </Layout>
  );
}
