import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function Press() {
  const { site } = useStore();
  const copy = pageCopy(site, 'press');
  return (
    <PageCard>
      <NotchNav />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>PRESS</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>{copy.title}</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 600 }}>
          {copy.lead}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
          {[
            ['Pilot area', 'Minneapolis–Saint Paul and the inner-ring zip codes we publish on Find a Pro.'],
            ['Money', 'Subscription for shops. No take-rate on jobs. Off-platform pay is the default.'],
            ['Vetting', 'Staff mark credentials. Providers cannot self-verify. Live on the first credential that clears.'],
            ['Match slate', 'Best, Rising, Highest rated, Closest. Never a paid pin.'],
          ].map(([t, b]) => (
            <Card key={t}>
              <div style={{ font: '600 16px/1.2 var(--tv-font)' }}>{t}</div>
              <p className="tv-small" style={{ marginTop: 10 }}>{b}</p>
            </Card>
          ))}
        </div>
        <Link to="/support" style={{ display: 'inline-block', marginTop: 28 }}><Pill variant="ink">Press desk via support</Pill></Link>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
