import { useTitle } from '../router.jsx';
import { css } from '../lib/css.js';
import Layout from '../components/Layout.jsx';
import { ErrorCard, MaintenanceCard, NotFoundCard } from '../components/States.jsx';

const wrap = css('width: 100%; max-width: 560px; margin: 0 auto; padding: 72px 24px; flex: 1; display: flex; flex-direction: column;');

export function NotFound() {
  useTitle('페이지를 찾을 수 없어요');
  return <Layout back="홈으로"><main style={wrap}><NotFoundCard /></main></Layout>;
}
export function Maintenance({ until }) {
  useTitle('점검 중');
  return <Layout><main style={wrap}><MaintenanceCard until={until} /></main></Layout>;
}
export function ErrorPage({ onRetry }) {
  useTitle('오류');
  return <Layout back="홈으로"><main style={wrap}><ErrorCard onRetry={onRetry} /></main></Layout>;
}
