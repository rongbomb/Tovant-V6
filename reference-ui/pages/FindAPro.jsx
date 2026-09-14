import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import AreaMap from '../components/AreaMap.jsx';
import FilterRail from '../components/FilterRail.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, Placeholder, PageCard } from '../components/primitives.jsx';
import { HOME_TRADE_TO_FILTER, HOME_POINT, JOB_TO_TRADES, shopsFor, FILTER_TRADES, slotMatchesWhen, TIME_WINDOWS } from '../data/directory.js';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

function keysFromQuery(job, trade) {
  if (job && JOB_TO_TRADES[job]) return JOB_TO_TRADES[job];
  if (trade) return [HOME_TRADE_TO_FILTER[trade] || trade];
  return [];
}

export default function FindAPro() {
  const nav = useNavigate();
  const { shops, compareIds, toggleCompare, site } = useStore();
  const copy = pageCopy(site, 'find');
  const [params, setParams] = useSearchParams();
  const job = params.get('job') || '';
  const trade = params.get('trade') || '';
  const [tradeKeys, setTradeKeys] = React.useState(() => keysFromQuery(job, trade));
  const [qTrade, setQTrade] = React.useState(job || trade || 'All trades');
  const [qZip, setQZip] = React.useState(HOME_POINT.zip);
  const [qWhen, setQWhen] = React.useState('Any day');
  const [qVehicle, setQVehicle] = React.useState('2021 Audi Q5');
  const [active, setActive] = React.useState(null);
  const [sort, setSort] = React.useState('distance');
  const [filters, setFilters] = React.useState(null);
  const cardsRef = React.useRef({});

  React.useEffect(() => {
    setTradeKeys(keysFromQuery(job, trade));
    setQTrade(job || trade || 'All trades');
  }, [job, trade]);

  const applySearch = () => {
    if (qTrade === 'All trades') setParams({});
    else if (JOB_TO_TRADES[qTrade]) setParams({ job: qTrade });
    else setParams({ trade: qTrade });
    setTradeKeys(qTrade === 'All trades' ? [] : keysFromQuery(
      JOB_TO_TRADES[qTrade] ? qTrade : '',
      JOB_TO_TRADES[qTrade] ? '' : qTrade,
    ));
  };

  const results = React.useMemo(() => {
    let list = shopsFor({ job: job || undefined, trade: trade || undefined, list: shops });
    const keys = filters?.trades?.length ? filters.trades : tradeKeys;
    if (keys.length) {
      list = list.filter((p) => p.trades.some((t) => keys.includes(t)) || (p.jobTypes || []).includes(job));
    }
    const how = filters?.how || [];
    if (how.length && how.length < 2) {
      list = list.filter((p) => how.includes(p.mode) || p.both);
    }
    if (filters?.rating) list = list.filter((p) => p.rating >= filters.rating);
    if (filters?.miles) list = list.filter((p) => p.distance <= filters.miles);
    const when = filters?.when || qWhen;
    if (when && when !== 'Any day') list = list.filter((p) => slotMatchesWhen(p.slot, when));
    return [...list].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'jobs') return b.jobCount - a.jobCount;
      return a.distance - b.distance;
    });
  }, [shops, job, trade, tradeKeys, sort, filters, qWhen]);

  React.useEffect(() => {
    if (results[0] && !results.find((p) => p.id === active)) setActive(results[0].id);
  }, [results, active]);

  const pick = (id) => {
    setActive(id);
    cardsRef.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const pins = results.filter((p) => p.lat != null).map((p) => ({
    id: p.id, label: p.name.split(' ')[0], lat: p.lat, lng: p.lng,
  }));
  const headline = job || trade || qTrade || 'All trades';
  const field = {
    width: '100%', marginTop: 9, border: 0, background: 'transparent', outline: 'none',
    font: '600 14px/1 var(--tv-font)', color: 'var(--tv-ink)',
  };

  return (
    <PageCard>
      <NotchNav active="find" />

      <div style={{ padding: '72px 44px 24px' }}>
        <Card pad={12} style={{ display: 'flex', gap: 12, borderRadius: 24, alignItems: 'stretch' }}>
          <label style={{ flex: 1, padding: '13px 16px', borderRadius: 'var(--tv-r-input)', background: 'var(--tv-inset)' }}>
            <Meta>TRADE</Meta>
            <select value={qTrade} onChange={(e) => setQTrade(e.target.value)} style={field} aria-label="TRADE">
              <option>All trades</option>
              {FILTER_TRADES.map((t) => <option key={t}>{t}</option>)}
              {Object.keys(JOB_TO_TRADES).map((j) => <option key={j}>{j}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, padding: '13px 16px', borderRadius: 'var(--tv-r-input)', background: 'var(--tv-inset)' }}>
            <Meta>VEHICLE</Meta>
            <input value={qVehicle} onChange={(e) => setQVehicle(e.target.value)} aria-label="VEHICLE" style={field} />
          </label>
          <label style={{ flex: 1, padding: '13px 16px', borderRadius: 'var(--tv-r-input)', background: 'var(--tv-inset)' }}>
            <Meta>WHERE</Meta>
            <input value={qZip} onChange={(e) => setQZip(e.target.value)} aria-label="WHERE" placeholder="55407" style={field} />
          </label>
          <label style={{ flex: 1, padding: '13px 16px', borderRadius: 'var(--tv-r-input)', background: 'var(--tv-inset)' }}>
            <Meta>WHEN</Meta>
            <select value={qWhen} onChange={(e) => setQWhen(e.target.value)} style={field} aria-label="WHEN">
              {['Any day', ...TIME_WINDOWS.map((w) => w.label)].map((w) => <option key={w}>{w}</option>)}
            </select>
          </label>
          <Pill variant="accent" onClick={applySearch} style={{ padding: '0 28px', borderRadius: 'var(--tv-r-input)' }}>Find a Pro</Pill>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 24, padding: '32px 44px 48px', alignItems: 'flex-start' }}>
        <FilterRail
          onMatch={() => nav('/match')}
          selectedTrades={tradeKeys}
          onTradesChange={setTradeKeys}
          onFiltersChange={setFilters}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
            <div>
              <div style={{ font: '600 24px/1.1 var(--tv-font)', letterSpacing: '-.025em' }}>
                {results.length} pro{results.length === 1 ? '' : 's'} near {qZip}
              </div>
              <div className="tv-data" style={{ marginTop: 9 }}>
                {String(headline).toUpperCase()} · WITHIN {filters?.miles || 12} MILES · TWIN CITIES
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {compareIds.length >= 2 && (
                <Link to={`/compare?ids=${compareIds.join(',')}`}>
                  <Pill variant="ink" style={{ padding: '11px 16px', borderRadius: 18, fontSize: 12.5 }}>Compare {compareIds.length}</Pill>
                </Link>
              )}
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort shops" style={{
                padding: '11px 16px', borderRadius: 18, border: 0, background: 'var(--tv-surface)',
                boxShadow: 'var(--tv-shadow)', font: '600 12.5px/1 var(--tv-font)', cursor: 'pointer',
              }}>
                <option value="distance">Closest first</option>
                <option value="rating">Highest rated</option>
                <option value="jobs">Most jobs</option>
              </select>
            </div>
          </div>

          {results.length === 0 && (
            <Card pad={28}>
              <div style={{ font: '600 16px/1.3 var(--tv-font)' }}>{copy.emptyTitle}</div>
              <p className="tv-small" style={{ marginTop: 10 }}>{copy.emptyBody}</p>
              <Link to="/match"><Pill variant="accent" style={{ marginTop: 18 }}>Match me with pros</Pill></Link>
            </Card>
          )}

          {results.map((p) => (
            <div key={p.id} ref={(el) => { cardsRef.current[p.id] = el; }}>
              <Card
                interactive
                pad={20}
                onMouseEnter={() => setActive(p.id)}
                onClick={(e) => {
                  if (e.target.closest('button, a')) return;
                  nav(`/provider/${p.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.target.closest('button, a, select, input')) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    nav(`/provider/${p.id}`);
                  }
                }}
                role="link"
                tabIndex={0}
                aria-label={`${p.name} profile`}
                style={{ display: 'flex', gap: 20, outline: active === p.id ? '1.5px solid var(--tv-ink)' : 'none' }}
              >
                <Placeholder label="SHOP PHOTO" style={{ width: 150, height: 112, flex: 'none', borderRadius: 'var(--tv-r-input)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                    <Link to={`/provider/${p.id}`} className="tv-cardtitle" style={{ font: '600 20px/1.15 var(--tv-font)', color: 'inherit', textDecoration: 'none' }}>{p.name}</Link>
                    <div className="tv-data">{p.area?.toUpperCase()}</div>
                  </div>
                  <div className="tv-data" style={{ marginTop: 10 }}>
                    ★ {p.rating} · {p.jobCount} REVIEWS · {p.distance} MI · {p.mode.toUpperCase()}
                  </div>
                  <p className="tv-small" style={{ marginTop: 14 }}>{p.short}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 18, flexWrap: 'wrap' }}>
                    <Pill variant="surface" onClick={(e) => { e.stopPropagation(); toggleCompare(p.id); }}
                      style={{ padding: '11px 18px', borderRadius: 20, fontSize: 12.5, background: compareIds.includes(p.id) ? 'var(--tv-ink)' : undefined, color: compareIds.includes(p.id) ? '#fff' : undefined }}>
                      {compareIds.includes(p.id) ? 'In compare' : 'Compare'}
                    </Pill>
                    <Pill variant="ink" onClick={(e) => { e.stopPropagation(); nav(`/match?provider=${p.id}`); }} style={{ padding: '11px 18px', borderRadius: 20, fontSize: 12.5, boxShadow: 'none' }}>Request quote</Pill>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div style={{ width: 372, flex: 'none', position: 'sticky', top: 24 }}>
          <AreaMap pins={pins} activeId={active} onPin={pick} count={results.length} />
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
