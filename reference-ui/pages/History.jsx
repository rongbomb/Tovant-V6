import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function History() {
  const [params] = useSearchParams();
  const car = params.get('vehicle') || '';
  const { bookings, state } = useStore();
  const vehicles = state.owner?.vehicles || [];
  const rows = car
    ? bookings.filter((b) => (b.vehicle || '').includes(car))
    : bookings;

  return (
    <PageCard>
      <NotchNav active="mid" />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>SERVICE HISTORY</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>
          {car ? `${car} on Tovant` : 'Every invoice stays with the vehicle'}
        </h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          Mileage notes, written prices, and the shop that did the work. Hand this to a buyer with the title.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
          <Link to="/history"><Pill variant={!car ? 'ink' : 'surface'}>All vehicles</Pill></Link>
          {vehicles.map(([name]) => (
            <Link key={name} to={`/history?vehicle=${encodeURIComponent(name)}`}>
              <Pill variant={car === name ? 'ink' : 'surface'}>{name}</Pill>
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28, maxWidth: 760 }}>
          {rows.length === 0 && (
            <Card pad={28}>
              <div style={{ font: '600 16px/1.3 var(--tv-font)' }}>No jobs on file yet</div>
              <p className="tv-small" style={{ marginTop: 10 }}>Book from a written price and the record lands here.</p>
              <Link to="/match"><Pill variant="accent" style={{ marginTop: 18 }}>Describe a job</Pill></Link>
            </Card>
          )}
          {rows.map((b) => (
            <Card key={b.id} pad={22}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ font: '600 17px/1.2 var(--tv-font)' }}>{b.job}</div>
                  <div className="tv-data" style={{ marginTop: 8 }}>{b.shop} · {b.vehicle} · {b.slot} · {b.mode}</div>
                </div>
                {b.price ? <div className="tv-price">${b.price}</div> : null}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <Link to={`/invoice/${b.id}`}><Pill variant="surface" style={{ minHeight: 44 }}>Open invoice</Pill></Link>
                {b.shopId && (
                  <Link to={`/provider/${b.shopId}`}>
                    <Pill variant="surface" style={{ minHeight: 44 }}>Read reviews</Pill>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
