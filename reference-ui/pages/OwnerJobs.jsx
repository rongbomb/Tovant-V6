import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function OwnerJobs() {
  const nav = useNavigate();
  const { ownerRequests, requestDraft, shops, bookRequest, drafts } = useStore();
  const sentTo = requestDraft?.sentTo || [];

  const book = async (r) => {
    if(!await bookRequest(r.id))return;
    nav('/booked');
  };

  return (
    <PageCard>
      <NotchNav active="mid" />
      <div style={{ padding: '72px 56px 52px' }}>
        <Meta>MY JOBS</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>Requests you have sent</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          A request stays saved. When a shop answers, the written price lands here, held for 48 hours.
        </p>

        {(drafts.length > 0 || requestDraft) && (
          <Card style={{ marginTop: 28 }}>
            <Meta>DRAFTS</Meta>
            <div style={{ font: '600 20px/1.2 var(--tv-font)', marginTop: 12 }}>
              {drafts.length ? `${drafts.length} saved draft${drafts.length === 1 ? '' : 's'}` : (requestDraft.issues || []).join(', ') || 'Working request'}
            </div>
            <p className="tv-small" style={{ marginTop: 10 }}>
              Unsent jobs live on Drafts. Sent requests stay on this page.
              {requestDraft?.when ? ` Last window: ${requestDraft.when}.` : ''}
              {sentTo.length ? ` Sent to ${sentTo.length} shop${sentTo.length === 1 ? '' : 's'}.` : ''}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Link to="/drafts"><Pill variant="ink">Open drafts</Pill></Link>
              <Link to="/match"><Pill variant="surface">Edit the request</Pill></Link>
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          {ownerRequests.length === 0 && (
            <Card pad={28}>
              <div style={{ font: '600 16px/1.3 var(--tv-font)' }}>Nothing sent yet</div>
              <p className="tv-small" style={{ marginTop: 10 }}>Start from Find a Pro or describe the job once on Match.</p>
              <Link to="/match"><Pill variant="accent" style={{ marginTop: 18 }}>Describe a job</Pill></Link>
            </Card>
          )}
          {ownerRequests.map((r) => {
            const shop = shops.find((s) => s.id === r.shopId);
            const quoted = r.status === 'quoted' && r.price;
            const booked = r.status === 'booked';
            return (
              <Card key={r.id} pad={22}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ font: '600 17px/1.2 var(--tv-font)' }}>{r.shop || shop?.name || 'A vetted pro'}</div>
                    <div className="tv-data" style={{ marginTop: 8 }}>{r.job} · {r.car}</div>
                    <p className="tv-small" style={{ marginTop: 10 }}>{r.when || 'Window open'} · {r.ago}</p>
                    {quoted && (
                      <p className="tv-small" style={{ marginTop: 8, color: 'var(--tv-accent-ink)' }}>
                        Written price ${r.price}, held for 48 hours.
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span className="tv-data">{(r.status || 'open').toUpperCase()}</span>
                    {quoted && <div className="tv-price">${r.price}</div>}
                    {r.shopId && <Link to={`/provider/${r.shopId}`} style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>View shop →</Link>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <Link to={`/work/jobs/${r.id}`}><Pill variant="surface">Open job</Pill></Link>{r.shopId && <Pill variant="surface" onClick={() => nav(`/messages?shop=${r.shopId}`)}>Message</Pill>}
                  {quoted && !booked && <Pill variant="accent" onClick={() => book(r)}>Book this price</Pill>}
                  {booked && <Link to="/booked"><Pill variant="ink">See the booking</Pill></Link>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
