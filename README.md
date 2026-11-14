# 공겜조아단

선바가 플레이한 공포게임 아카이브. React + esbuild 정적 사이트(서버 없음). 데이터는 `data/*.json`, 배포는 GitHub Pages.

## 첫 배포 체크리스트 (순서대로)
저장소 이름 `gonggamejoa.github.io` → 주소 `https://gonggamejoa.github.io/` (root 경로, `BASE_PATH` 빈 값이 기본이며 워크플로가 자동 처리).
1. **계정/저장소 만들기**: GitHub 계정(또는 조직) 이름 `gonggamejoa`, 그 안에 저장소 **`gonggamejoa.github.io`** (Public) 생성
2. **Pages 설정**: 저장소 Settings > Pages > Source = **GitHub Actions**
3. **코드 push**: 이 폴더를 저장소에 올리기 (`git init && git add . && git commit -m "init" && git branch -M main && git remote add origin https://github.com/gonggamejoa/gonggamejoa.github.io.git && git push -u origin main`). 이때 한 번 샘플 데이터로 배포되고, 사이트가 뜨는지 확인할 수 있어요
4. **전체 재수집 수동 실행**: 저장소 Actions 탭 > `update-and-deploy` > Run workflow > **"전체 재수집" 체크** > 실행 (YouTube API 키 Secret 이 있으면 API, 없으면 러너에 yt-dlp 를 설치해 사용). 실패하면 아래 '문제 해결'
5. **결과 확인**: 실행이 끝나면 `data/` 가 자동 커밋돼요(커밋 목록에 `chore(data): 자동 수집 업데이트`). `data/games.json`(게임 목록), `data/unmatched.json`(매칭 안 된 영상), `data/unmapped-tags.json`(자동 분류에서 빠진 Steam 태그)를 확인
6. **사이트 확인**: https://gonggamejoa.github.io/ 에서 홈·상세·시리즈·모아보기·태그 페이지 확인 → 이후 매일 04:00 KST 에 자동 업데이트(RSS 증분)

문제 해결(전체 재수집):
- **`Sign in to confirm you're not a bot`** → YouTube 가 GitHub 러너(데이터센터 IP)를 막은 것. 이때 `data/` 와 배포는 바뀌지 않아요. 대안 ① 내 PC에서 yt-dlp 로 `npm run collect:full` 후 `data/` 커밋·push (아래 '첫 전체 수집') ② 저장소 Settings > Secrets > Actions 에 `YOUTUBE_API_KEY` 를 추가하고 다시 실행(API 는 봇 차단 대상이 아님)
- `429 / Too Many Requests` → 잠시 뒤 재실행 또는 API 키 사용
- 재생목록 읽기 실패(비공개/삭제) → 재생목록이 '공개/일부 공개'인지, `data/source.json` ID 확인
- 실패해도 기존 `data/` 는 절대 덮어쓰지 않는다. 로그의 빨간 `수집 실패` 주석에 원인과 대안이 나와요



## 명령
| | |
|---|---|
| `npm install` | 설치 (react, react-dom, esbuild) |
| `npm run dev` | 개발 서버 http://127.0.0.1:5173 (저장 시 재빌드) |
| `npm run build` | `dist/` 생성 |
| `npm run preview` | `dist/` 로컬 미리보기 |
| `npm run shots` | PC/모바일 스크린샷·콘솔 점검 (playwright 필요) |
| `npm run collect:full` | **첫 전체 수집** (yt-dlp 필요) |
| `npm run collect` | 증분 수집 (키 없으면 RSS 최신 15개) — Actions가 매일 실행 |
| `npm run retag` | `data/tag-map.json` 수정 후 자동 태그만 다시 계산 (네트워크 불필요) |

설정값은 `src/config.js`(구글 폼 주소, 점검 모드, 기본 주인장 코멘트 등). 비밀번호·API 키는 코드/저장소에 넣지 않는다.

## 운영 흐름 한눈에
1. **첫 전체 수집**: Actions 수동 실행(전체 재수집) — 막히면 내 PC에서 yt-dlp 로 → `data/` 커밋·push
2. 이후 **GitHub Actions가 매일 04:00 KST에 증분 수집**(yt-dlp 없이 RSS만으로 최신 15개를 기존 데이터에 합침) → 변경 있으면 커밋 → 빌드 → 배포
3. 이름이 안 맞은 영상은 `data/unmatched.json` 을 보고 `data/steam-map.json` 에 적기, 태그는 `data/games.json` 의 `tags` 에 직접 넣기

## 첫 전체 수집을 내 PC에서 하려면 (yt-dlp) — Actions 수동 실행이 막힐 때의 대안
1. **Node 20+ 와 yt-dlp 설치** (영상 목록·설명·업로드일을 읽는 도구)
   - Windows(PowerShell): `winget install yt-dlp.yt-dlp` → 터미널을 닫았다 다시 열기
   - macOS: `brew install yt-dlp`
   - 확인: `yt-dlp --version` 이 버전을 출력해야 함
2. 프로젝트 폴더에서 `npm install`
3. 실행: `npm run collect:full` (영상 수 × 1~2초 걸려요. 수십 개면 몇 분)
4. 결과 확인
   - 콘솔: `영상 N개 수집` → `매칭 M개 게임 (시리즈 …, 추천 …), 수동 확인 필요 K건`
   - `data/games.json` 에 게임이 생겼는지(샘플 12개는 자동 삭제됨), `npm run dev` 로 사이트 확인
   - `data/unmatched.json`(매칭 안 된 영상), `data/unmapped-tags.json`(자동 분류에서 빠진 Steam 장르/태그)
5. `git add data && git commit -m "data: 첫 전체 수집" && git push` → Actions가 배포
6. 문제 시 확인
   - `yt-dlp: command not found`/`ENOENT` → 설치·PATH 확인(터미널 재시작)
   - yt-dlp 오류·영상 0개 → `yt-dlp -U` 로 업데이트 후 재실행, 재생목록이 비공개/링크 공유 아님인지 확인
   - `Steam … fetch failed` → 네트워크 확인 후 재실행. 수집이 중간에 실패하면 `data/` 는 바뀌지 않고, 다시 실행하면 처음부터 진행돼요(한 번 성공하면 이후엔 받아 둔 게임을 재사용)
   - 매칭이 거의 안 됨 → 영상 설명란이 `스팀게임 (제목)입니다` 형식인지 확인, 다르면 `scripts/collect.mjs` 의 `parseGameTitles()` 수정

API 키를 쓰고 싶으면 `YOUTUBE_API_KEY=… npm run collect`(YouTube Data API, 저장소엔 넣지 말고 환경변수/Secret만).

## 데이터 수집 규칙 (`scripts/collect.mjs`)
`data/source.json` 의 재생목록(`playlistId`, 주인장 추천용 `recommendedPlaylistIds` 배열 — 여러 개 가능, 단일 `recommendedPlaylistId` 도 호환)에서 영상을 읽고, 설명란의 한글 게임 제목으로 Steam 한국어 스토어에서 게임을 찾아 `steamAppId` 를 연결한다. 같은 게임의 영상이 2개 이상이면 시리즈(업로드 순 = 1화부터).

- **주인장 추천**: `recommendedPlaylistIds` 의 모든 재생목록에 든 영상의 게임이 `recommended`(모아보기 > 주인장 추천). 순서는 배열 순서 → 재생목록 안 순서, 겹치는 영상/게임은 앞 순번 한 번만. 추천이 하나도 없으면 탭에 빈 상태 문구가 나온다.
- **증분 수집(Actions)**: 소스가 RSS(최신 15개)여도 이미 받은 영상·에피소드·Steam 상세는 유지하고 새 것만 합친다. 추천 표시는 기존 값 유지 + 추가만 반영(전체 소스일 때만 재생목록 그대로 반영).
- **매칭 전 영상은 사이트에 나오지 않는다.** `data/unmatched.json`(영상 ID·제목·링크·후보)을 보고 `data/steam-map.json` 에 적은 뒤 다시 수집:
  ```json
  { "영상ID또는한글제목": 739630, "다른영상ID": "Steam에서 검색할 제목", "잡담영상ID": null }
  ```
  숫자 = steamAppId, 문자열 = 이 제목으로 Steam 검색, `null`/`"skip"` = 게임 아님(제외).
- **해시태그 자동 분류**: Steam 장르·카테고리(싱글/협동/다인용)·사용자 태그(1인칭/3인칭, 생존 공포, 좀비 …)를 `data/tag-map.json` 표로 사이트 태그(`data/tags.json` 에 있는 것만)에 매핑해 `autoTags` 에 저장한다. 근거 없는 시점·나라 태그는 채우지 않는다. 표를 고친 뒤 `npm run retag`. 매핑 안 된 Steam 장르/태그는 `data/unmapped-tags.json` 에 모인다(태그 추가 시 참고).
- **직접 넣은 태그가 항상 우선**: `data/games.json` 의 `tags` 는 재수집·retag 해도 덮어쓰지 않는다. 사이트에는 `tags` + `autoTags` 가 중복 없이 합쳐져 보인다. 태그가 하나도 없으면 태그줄과 추천 섹션이 숨겨진다.
- 주인장 코멘트: `src/config.js` 의 `OWNER_COMMENT_DEFAULT` 한 곳(임시). 게임별 `ownerComment` 로 덮어쓰기.

## 배포: GitHub Pages + 자동 업데이트
`.github/workflows/update.yml` — 매일 04:00 KST 수집 → 변경 시 `data/` 커밋 → 빌드 → 배포. Actions 탭에서 수동 실행(`workflow_dispatch`)도 가능, `main` push 시에는 수집 없이 빌드·배포만.

1. 저장소 Settings > Pages > Source: **GitHub Actions**
2. 첫 전체 수집 결과(`data/`)를 push (위 절차)
3. Actions 탭에서 `update-and-deploy` 를 수동 실행해 한 번 확인

## 도메인 없이 배포 (구매 전)
워크플로가 배포 경로를 자동으로 정한다(`BASE_PATH`). 라우팅·이미지·링크는 하위경로에서도 동작하는 것을 확인했다.
- **root 경로** `https://gonggamejoa.github.io/` : GitHub 계정/조직 이름이 `gonggamejoa` 이고 저장소 이름을 **`gonggamejoa.github.io`** 로 만들면 된다. (`BASE_PATH` 비어 있음, 자동)
- **하위경로** `https://<계정>.github.io/<저장소명>/` : 그 외 모든 경우. 워크플로가 `BASE_PATH=/<저장소명>` 을 자동 지정. 로컬 확인: `BASE_PATH=/<저장소명> npm run build` 후 `BASE_PATH=/<저장소명> npm run preview`.
- 어느 경우든 canonical/og:url 은 `SITE_URL` 변수가 없으면 github.io 주소로 들어간다.

## 도메인 연결 (구매 후, 예: gonggamejoa.com)
1. 저장소 Settings > Secrets and variables > Actions > **Variables** 에 `CUSTOM_DOMAIN` = `gonggamejoa.com`, `SITE_URL` = `https://gonggamejoa.com`
2. DNS: 루트 도메인은 A 레코드 `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`, `www` 는 CNAME `<계정>.github.io`
3. Settings > Pages 에서 Custom domain 확인 + **Enforce HTTPS** 체크, 워크플로 재실행(`CNAME` 파일·canonical 반영, root 경로 배포)
