import { Component, useEffect } from 'react';
import { matchRoute, useLocation } from './router.jsx';
import { MAINTENANCE } from './config.js';
import { getGame } from './lib/games.js';
import Home from './pages/Home.jsx';
import Detail from './pages/Detail.jsx';
import Series from './pages/Series.jsx';
import Tags from './pages/Tags.jsx';
import Collection from './pages/Collection.jsx';
import About from './pages/About.jsx';
import Legal from './pages/Legal.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import { ErrorPage, Maintenance, NotFound } from './pages/NotFound.jsx';

class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  componentDidUpdate(prev) { if (prev.k !== this.props.k && this.state.err) this.setState({ err: null }); }
  render() { return this.state.err ? <ErrorPage onRetry={() => window.location.reload()} /> : this.props.children; }
}

function Routes() {
  const { pathname } = useLocation();
  if (MAINTENANCE.on) return <Maintenance until={MAINTENANCE.until} />;
  if (pathname === '/') return <Home />;
  let p;
  if ((p = matchRoute(pathname, '/game/:id'))) { const g = getGame(p.id); return g ? (g.series ? <Series game={g} /> : <Detail game={g} />) : <NotFound />; }
  if ((p = matchRoute(pathname, '/series/:id'))) { const g = getGame(p.id); return g ? (g.series ? <Series game={g} /> : <Detail game={g} />) : <NotFound />; }
  if (pathname === '/tags') return <Tags />;
  if (pathname === '/collection') return <Collection />;
  if (pathname === '/about') return <About />;
  if (pathname === '/legal') return <Legal />;
  if ((p = matchRoute(pathname, '/soon/:feature'))) return <ComingSoon feature={p.feature} />;
  return <NotFound />;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { if (window.location.hash === '#list') document.getElementById('list')?.scrollIntoView(); }, [pathname]);
  return <Boundary k={pathname}><Routes /></Boundary>;
}
