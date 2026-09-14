import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function Payouts() {
  const { site } = useStore();
  const copy = pageCopy(site, 'payouts');
  return (
    <PageCard>
      <NotchNav />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>PAYOUTS</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>{copy.title}</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 620 }}>
          {copy.lead}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32, maxWidth: 760 }}>
          {[
            ['Direct pay', 'The owner pays the shop. The written price and the invoice still live on Tovant so both sides have the record.'],
            ['Tovant payouts', 'Optional. Turn it on in shop settings. Cleared jobs batch on Friday. Bank last four sits on the account.'],
            ['Subscription', 'Shops pay Tovant to list and to run the board. Rank is never for sale.'],
          ].map(([t, b]) => (
            <Card key={t}>
              <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{t}</div>
              <p className="tv-small" style={{ marginTop: 10 }}>{b}</p>
            </Card>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link to="/signup/provider"><Pill variant="accent">Apply as a provider</Pill></Link>
          <Link to="/dashboard"><Pill variant="surface">Open the dashboard</Pill></Link>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
