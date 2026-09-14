import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function Careers() {
  const { site } = useStore();
  const copy = pageCopy(site, 'careers');
  return (
    <PageCard>
      <NotchNav />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>CAREERS</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>{copy.title}</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 600 }}>
          {copy.lead}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32, maxWidth: 760 }}>
          {[
            ['Vetting reviewer', 'Read ID, insurance, and trade packets. Mark verified or rejected. You never sell a listing.'],
            ['Owner support', 'Unblock requests, quotes, and disputed invoices for Twin Cities members.'],
            ['Shop success', 'Walk new providers through the first credential and Friday payouts.'],
          ].map(([t, b]) => (
            <Card key={t}>
              <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{t}</div>
              <p className="tv-small" style={{ marginTop: 10 }}>{b}</p>
            </Card>
          ))}
        </div>
        <Link to="/support" style={{ display: 'inline-block', marginTop: 28 }}><Pill variant="accent">Write support about a role</Pill></Link>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
