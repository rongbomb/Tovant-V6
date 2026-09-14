import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function Compare() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { shops, compareIds, toggleCompare, clearCompare } = useStore();
  const ids = (params.get('ids') || compareIds.join(',')).split(',').filter(Boolean);
  const list = ids.map((id) => shops.find((s) => s.id === id)).filter(Boolean);

  return (
    <PageCard>
      <NotchNav active="find" />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>COMPARE</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>Side by side, then send the request</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          Labor rates and how they work. A written price still comes from the shop after you send the job.
        </p>
        {list.length < 2 && (
          <Card style={{ marginTop: 28 }}>
            <div style={{ font: '600 16px/1.3 var(--tv-font)' }}>Pick at least two shops on Find a Pro</div>
            <p className="tv-small" style={{ marginTop: 10 }}>Use Compare on a result card. Up to three shops at a time.</p>
            <Link to="/find"><Pill variant="accent" style={{ marginTop: 18 }}>Back to Find a Pro</Pill></Link>
          </Card>
        )}
        {list.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${list.length}, 1fr)`, gap: 16, marginTop: 32 }}>
            {list.map((p) => (
              <Card key={p.id}>
                <Link to={`/provider/${p.id}`} className="tv-cardtitle" style={{ font: '600 20px/1.15 var(--tv-font)' }}>{p.name}</Link>
                <div className="tv-data" style={{ marginTop: 10 }}>★ {p.rating} · {p.jobCount} JOBS · {p.distance} MI</div>
                <p className="tv-small" style={{ marginTop: 12 }}>{p.short}</p>
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--tv-hairline)' }}>
                  {[['Mode', p.mode], ['Labor', p.laborRate], ['Area', p.area], ['Loaner', p.loaner ? 'Yes' : 'No']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span className="tv-data">{k.toUpperCase()}</span>
                      <span style={{ font: '600 13px/1 var(--tv-font)' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
                  <Link to={`/provider/${p.id}`}><Pill variant="surface" style={{ width: '100%' }}>View shop</Pill></Link>
                  <Pill variant="ink" onClick={() => nav(`/match?provider=${p.id}`)} style={{ width: '100%' }}>Request quote</Pill>
                  <button onClick={() => toggleCompare(p.id)} style={{ border: 0, background: 'none', cursor: 'pointer', font: '600 12px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Remove</button>
                </div>
              </Card>
            ))}
          </div>
        )}
        {list.length >= 2 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link to="/match"><Pill variant="accent">Describe the job once</Pill></Link>
            <Pill variant="surface" onClick={clearCompare}>Clear compare</Pill>
          </div>
        )}
      </div>
      <SiteFooter />
    </PageCard>
  );
}
