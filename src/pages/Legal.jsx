import { useLocation, useSetQuery, useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import { LEGAL_EFFECTIVE_DATE } from '../config.js';

// Legal.dc.html 구조. 1차 배포 기준 사실만 담은 최소 문구(로그인·개인정보 수집 없음). '후기 작성 규칙' 탭은 한줄평이 준비 중이라 제외.
const TERMS = [
  ['제1조 (목적)', '이 약관은 공겜조아단(이하 "사이트")이 제공하는 공포게임 소개 서비스의 이용 조건을 정하는 것을 목적으로 해요.'],
  ['제2조 (서비스 내용)', '사이트는 공포게임 정보 소개, 플레이 영상 연결, 해시태그 검색과 추천을 제공해요. 회원가입이나 로그인 없이 누구나 이용할 수 있고, 일부 기능은 준비 중이며 운영상 필요에 따라 변경하거나 중단할 수 있어요.'],
  ['제3조 (콘텐츠의 저작권)', '게임 정보와 이미지의 저작권은 Steam 및 각 게임의 원 권리자에게, 영상의 저작권은 YouTube 및 각 영상의 원 권리자에게 있어요. 사이트가 직접 작성한 소개 문구와 디자인의 권리는 운영자에게 있어요.'],
  ['제4조 (외부 서비스)', '사이트는 Steam, YouTube, Google Fonts, 구글 폼 등 외부 서비스를 연결하거나 불러와요. 외부 서비스의 이용에는 해당 서비스의 약관과 정책이 적용돼요.'],
  ['제5조 (책임 제한)', '사이트는 게임 정보의 정확성과 최신성을 위해 노력하지만 이를 보장하지는 않아요. 오류나 문의는 제보 · 건의(구글 폼)로 알려주세요.'],
  ['제6조 (약관의 변경)', '약관을 변경할 때는 사이트에 안내해요. 로그인 등 새로운 기능이 생기면 그에 맞게 약관을 개정해요.'],
];
const PRIV = [
  ['1. 수집하는 개인정보', '사이트는 회원가입과 로그인이 없고, 이용자의 개인정보를 직접 수집하거나 저장하지 않아요.'],
  ['2. 외부 서비스 이용', '사이트는 Google Fonts로 글꼴을 불러오고, Steam 이미지와 YouTube 영상(임베드)을 보여줘요. 이 과정에서 각 서비스가 접속 정보(IP 주소 등)를 받거나 자체 쿠키와 로그를 사용할 수 있어요. 이는 해당 서비스의 정책에 따라 처리돼요.'],
  ['3. 제보 · 건의', '제보와 건의는 외부 구글 폼으로 접수돼요. 폼에 입력한 정보는 구글 폼의 정책에 따라 처리되고, 사이트는 이 폼 외의 경로로 정보를 받지 않아요.'],
  ['4. 쿠키', '사이트 자체는 쿠키를 사용하지 않아요. 브라우저 설정에서 쿠키를 제한할 수 있고, 제한하면 일부 외부 서비스(영상 재생 등)가 다르게 동작할 수 있어요.'],
  ['5. 문의와 개정', '개인정보와 관련한 문의는 제보 · 건의(구글 폼)로 받아요. 로그인 등 개인정보를 수집하는 기능이 생기면 이 방침을 개정하고 사이트에 안내해요.'],
];
const TABS = [['terms', '이용약관', TERMS], ['privacy', '개인정보처리방침', PRIV]];

export default function Legal() {
  const { params } = useLocation();
  const setQuery = useSetQuery();
  const key = params.get('tab') === 'privacy' ? 'privacy' : 'terms';
  const [, label, secs] = TABS.find((t) => t[0] === key);
  useTitle(label);
  return (
    <Layout back="홈으로">
      <main style={css('width: 100%; max-width: 800px; margin: 0 auto; padding: 48px 24px 72px; flex: 1; display: flex; flex-direction: column; gap: 32px;')}>
        <div style={css('display: flex; flex-direction: column; gap: 12px;')}>
          <h1 style={css("margin: 0; font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: clamp(28px, 4vw, 40px); line-height: 1.25;")}>약관 및 정책</h1>
          <p style={css('margin: 0; font-size: 16px; line-height: 1.7; color: #a8a099; max-width: 640px; text-wrap: pretty;')}>서비스 이용 전에 확인해 주세요.</p>
        </div>
        <div role="tablist" aria-label="약관" style={css('display: flex; gap: 4px; border-bottom: 1px solid #2e2a27; overflow-x: auto;')}>
          {TABS.map(([k, l]) => <button key={k} className={'tab' + (key === k ? ' on' : '')} type="button" role="tab" aria-selected={key === k} onClick={() => setQuery({ tab: k === 'terms' ? null : k })}>{l}</button>)}
        </div>
        <div style={css('font-size: 13px; color: #a8a099;')}>시행일 {LEGAL_EFFECTIVE_DATE || '[YYYY.MM.DD]'}</div>
        <div style={css('display: flex; flex-direction: column; gap: 28px;')}>
          {secs.map(([h, p]) => (
            <section key={h} style={css('display: flex; flex-direction: column; gap: 8px;')}>
              <h3 style={css('margin: 0; font-size: 18px;')}>{h}</h3>
              <p style={css('margin: 0; font-size: 15px; line-height: 1.8; color: #a8a099; text-wrap: pretty;')}>{p}</p>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
