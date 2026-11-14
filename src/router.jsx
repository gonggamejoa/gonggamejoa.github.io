// 아주 작은 History API 라우터 (정적 호스팅 + SPA 폴백 전제). 상태는 URL(경로+쿼리)에 둔다.
import { createElement, useCallback, useEffect, useSyncExternalStore } from 'react';

const BASE = typeof __BASE__ === 'string' ? __BASE__ : '';
const EVT = 'gj:navigate';

const strip = (p) => (BASE && p.startsWith(BASE) ? p.slice(BASE.length) || '/' : p);
export const href = (to) => (to.startsWith('/') ? BASE + to : to);
const snapshot = () => strip(window.location.pathname) + window.location.search;
const subscribe = (cb) => {
  window.addEventListener('popstate', cb);
  window.addEventListener(EVT, cb);
  return () => { window.removeEventListener('popstate', cb); window.removeEventListener(EVT, cb); };
};

export function navigate(to, { replace = false } = {}) {
  const url = href(to);
  if (url === window.location.pathname + window.location.search) return;
  const pathChanged = strip(window.location.pathname) !== strip(url.split(/[?#]/)[0]);
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  window.dispatchEvent(new Event(EVT));
  if (pathChanged && !replace) window.scrollTo(0, 0);
}

export function useLocation() {
  const full = useSyncExternalStore(subscribe, snapshot, () => '/');
  const i = full.indexOf('?');
  const pathname = (i < 0 ? full : full.slice(0, i)).replace(/(.)\/+$/, '$1');
  const search = i < 0 ? '' : full.slice(i);
  return { pathname, search, params: new URLSearchParams(search) };
}

// 쿼리만 바꾸고 싶을 때 (히스토리 쌓지 않음)
export function useSetQuery() {
  return useCallback((obj) => {
    const p = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(obj)) { if (v == null || v === '') p.delete(k); else p.set(k, v); }
    const s = p.toString();
    navigate(strip(window.location.pathname) + (s ? '?' + s : ''), { replace: true });
  }, []);
}

export function Link({ to, onClick, target, children, ...rest }) {
  const external = /^https?:|^#|^mailto:/.test(to);
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || external || target === '_blank' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return createElement('a', { href: external ? to : href(to), onClick: handle, target, ...rest }, children);
}

export function useTitle(title) {
  useEffect(() => { document.title = title ? `${title} · 공겜조아단` : '공겜조아단'; }, [title]);
}

export function matchRoute(pathname, pattern) {
  const a = pathname.split('/').filter(Boolean);
  const b = pattern.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < b.length; i++) {
    if (b[i].startsWith(':')) params[b[i].slice(1)] = decodeURIComponent(a[i]);
    else if (b[i] !== a[i]) return null;
  }
  return params;
}
