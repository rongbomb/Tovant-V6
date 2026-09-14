import React from 'react';
import { Link, useParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function Invoice() {
  const { id } = useParams();
  const { bookings, lastBooking } = useStore();
  const b = bookings.find((x) => x.id === id);

  return (
    <PageCard>
      <NotchNav active="mid" />
      <div style={{ padding: '72px 56px 28px', maxWidth: 720 }}>
        <Meta>INVOICE</Meta>
        <h1 className="tv-h1" style={{ margin: '16px 0 0' }}>
          {b ? `${b.job} · ${b.shop}` : 'Invoice not found'}
        </h1>
        {b ? (
          <Card style={{ marginTop: 28 }}>
            <div className="tv-data">{b.slot} · {b.mode} · {b.vehicle}</div>
            {b.price ? <div className="tv-price" style={{ marginTop: 18 }}>${b.price}</div> : (
              <p className="tv-small" style={{ marginTop: 16 }}>Written price lands here when the shop sends it.</p>
            )}
            <p className="tv-small" style={{ marginTop: 16 }}>
              Nothing is charged until the work is done. Work beyond this quote needs your approval first.
            </p>
          </Card>
        ) : (
          <Card style={{ marginTop: 28 }}>
            <p className="tv-small">Open this from service history after a booking.</p>
          </Card>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link to="/history"><Pill variant="accent">Service history</Pill></Link>
          <Link to="/jobs"><Pill variant="surface">My jobs</Pill></Link>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
