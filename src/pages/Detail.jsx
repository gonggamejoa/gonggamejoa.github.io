import { useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import { InfoAside, RecSection, ReviewsSoon, Stage } from '../components/GameParts.jsx';
import { recommendGames, steamHeader } from '../lib/games.js';
import { MIN_SHARED_GAME } from '../config.js';

export default function Detail({ game }) {
  useTitle(game.title);
  return (
    <Layout back="목록으로">
      <main style={css('width: 100%; max-width: 1200px; margin: 0 auto; padding: 24px 24px 72px; display: flex; flex-direction: column; gap: 72px;')}>
        <section style={css('display: flex; flex-wrap: wrap; gap: 40px;')}>
          <Stage title={game.title} videoUrl={game.videoUrl} screenshots={game.screenshots} steamImg={steamHeader(game)} playLabel="게임 영상 재생" />
          <InfoAside game={game} />
        </section>
        <ReviewsSoon />
        {game.tags.length > 0 && <RecSection title="내 취향 공겜 추천" sub={`이 게임과 해시태그가 ${MIN_SHARED_GAME}개 이상 겹치는 공포게임이에요`} recs={recommendGames(game)} emptyText={`해시태그가 ${MIN_SHARED_GAME}개 이상 겹치는 게임이 아직 없어요.`} />}
      </main>
    </Layout>
  );
}
