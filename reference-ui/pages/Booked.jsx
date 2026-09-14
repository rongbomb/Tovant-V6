import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function Booked() {
  const { lastBooking, bookings } = useStore();
  const b = lastBooking || bookings[0];

  return (
    <PageCard>
      <NotchNav active="mid" />
      <div style={{ padding: '72px 56px 28px', maxWidth: 760 }}>
        <Meta>BOOKED</Meta>
        <h1 className="tv-h1" style={{ margin: '16px 0 0' }}>
          {b ? `You are on the board with ${b.shop}.` : 'No booking on this device yet.'}
        </h1>
        <p className="tv-body" style={{ marginTop: 16 }}>
          {b
            ? 'Nothing is charged until the work is done. Work beyond the written price needs your approval first. The shop already has this window.'
            : 'Book from a quote on My jobs after a shop answers.'}
        </p>
        {b && (
          <Card style={{ marginTop: 28 }}>
            <div style={{ font: '600 22px/1.2 var(--tv-font)' }}>{b.job}</div>
            <div className="tv-data" style={{ marginTop: 12 }}>{b.slot} · {b.mode} · {b.vehicle}</div>
            {b.price ? <div className="tv-price" style={{ marginTop: 16 }}>${b.price}</div> : null}
            <p className="tv-small" style={{ marginTop: 14 }}>Held for 48 hours from the written price.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <Link to="/jobs"><Pill variant="ink">Open my jobs</Pill></Link>
              {b.shopId && <Link to={`/provider/${b.shopId}`}><Pill variant="surface">Shop profile</Pill></Link>}
            </div>
          </Card>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link to="/jobs"><Pill variant="accent" style={{ minHeight: 48 }}>See my jobs</Pill></Link>
          <Link to="/messages"><Pill variant="surface" style={{ minHeight: 48 }}>Message the shop</Pill></Link>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
