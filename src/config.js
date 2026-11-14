// 사이트 설정값. 비밀번호/API 키는 여기에 넣지 않는다.
export const SITE_NAME = '공겜조아단';

// 제보·건의 외부 폼(구글 폼) 주소. 사이드바·푸터·건의하기 배너·영상 재생 불가 화면이 모두 이 값을 쓴다(새 탭).
export const REPORT_FORM_URL = 'https://forms.gle/eYfrkLQptB863xFV6';

// 약관·개인정보처리방침 시행일. 배포일이 정해지면 'YYYY.MM.DD' 형식으로 채운다.
export const LEGAL_EFFECTIVE_DATE = '';

// 도메인은 코드가 아니라 빌드 시 환경변수로 받는다: SITE_URL=https://example.com npm run build (canonical/og:url에 반영). 미정이면 생략.

// 점검 화면 켜기. true 로 바꾸고 재배포하면 모든 페이지가 점검 화면으로 바뀐다.
export const MAINTENANCE = { on: false, until: '[점검 종료 예정 시각]' };

// 홈 해시태그 칩 (디자인 Main 샘플의 목록. '인디' → 태그 페이지 표기에 맞춰 '인디게임')
export const HOME_TAGS = ['생존공포', '심리', '좀비', '협동', '1인칭', '3인칭', '인디게임', '고어', '퍼즐'];

// 주인장 추천 카드에 표시할 기본 코멘트(임시, 사용자 문구 그대로). 게임별 코멘트는 data/games.json 의 ownerComment 로 덮어쓴다.
export const OWNER_COMMENT_DEFAULT = '주인장이 N번째 돌려보는 단나더';

export const PAGE_SIZE = 8;        // 홈 '게임 더보기' 단위
export const MAX_TAGS = 5;         // 태그 페이지 최대 선택
export const MIN_SHARED_GAME = 3;  // 상세: 내 취향 공겜 추천 최소 겹침
export const MIN_SHARED_SERIES = 2; // 시리즈: 내 취향 시리즈 추천 최소 겹침
