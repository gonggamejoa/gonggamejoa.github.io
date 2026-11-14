// 디자인 파일(.dc.html)의 샘플 12개 게임으로 data/games.json 초기본을 만든다.
// 실제 데이터는 `npm run collect`(Steam/YouTube 수집)로 덮어쓰거나, 이 JSON을 직접 편집한다.
import { writeFileSync } from 'node:fs';

const eps = (n) => Array.from({ length: n }, () => ({ title: null, url: null }));
// uploadedAt = YouTube 영상 업로드일(정렬 기준). 샘플은 기존 출시월을 임시 값으로 사용. sample:true 는 수집 성공 시 자동 제거됨.
const g = (id, title, steamAppId, release, tags, extra = {}) => ({
  id, title, steamAppId, uploadedAt: release + '-01', tags, sample: true,
  series: false, videoUrl: null, episodes: [],
  description: null, developer: null, price: null, korean: null,
  screenshots: [], recommended: false, recommendedOrder: null, ownerComment: null,
  ...extra,
});

// tags 순서 = 홈 카드에 보이는 앞 2개(디자인 Main 샘플 순서) + 상세/시리즈 샘플에서 추가된 태그
const games = [
  g('silent-hill-2', 'Silent Hill 2', 2124490, '2024-10', ['심리', '3인칭', '생존공포', '이상현상', '크리처'], { series: true, episodes: eps(8), recommended: true, recommendedOrder: 3 }),
  g('lethal-company', 'Lethal Company', 1966720, '2023-10', ['협동', '인디게임', '1인칭', '서바이벌', '크리처'], { recommended: true, recommendedOrder: 5 }),
  g('amnesia-the-bunker', 'Amnesia: The Bunker', 1944430, '2023-06', ['1인칭', '생존공포', '심리', '서바이벌', '크리처'], { recommended: true, recommendedOrder: 1 }),
  g('resident-evil-4', 'Resident Evil 4', 2050650, '2023-03', ['생존공포', '3인칭', '고어', '크리처'], { series: true, episodes: eps(12) }),
  g('dead-space', 'Dead Space', 1693980, '2023-01', ['생존공포', '3인칭', '고어', '크리처'], { series: true, episodes: eps(10) }),
  g('visage', 'Visage', 594330, '2020-10', ['심리', '1인칭', '인디게임', '오컬트', '이상현상'], { recommended: true, recommendedOrder: 6 }),
  g('phasmophobia', 'Phasmophobia', 739630, '2020-09', ['협동', '1인칭', '인디게임', '이상현상', '오컬트'], { recommended: true, recommendedOrder: 2 }),
  g('little-nightmares', 'Little Nightmares', 424840, '2017-04', ['퍼즐', '인디게임', '심리']),
  g('alien-isolation', 'Alien: Isolation', 214490, '2014-10', ['1인칭', '생존공포', '크리처', '서바이벌']),
  g('five-nights-at-freddys', "Five Nights at Freddy's", 319510, '2014-08', ['인디게임', '생존공포']),
  g('outlast', 'Outlast', 238320, '2013-09', ['1인칭', '생존공포', '고어'], { recommended: true, recommendedOrder: 4 }),
  g('left-4-dead-2', 'Left 4 Dead 2', 550, '2009-11', ['좀비', '협동', '1인칭', '고어']),
];

// 시리즈 재생목록 샘플 URL은 디자인과 같이 YouTube 홈으로 연결
for (const x of games) for (const e of x.episodes) e.url = 'https://www.youtube.com/';

writeFileSync(new URL('../data/games.json', import.meta.url), JSON.stringify(games, null, 2) + '\n');
console.log('data/games.json', games.length, '개');
