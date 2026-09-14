import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import { Card, Meta, Pill, Field, Placeholder, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function RequestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, session, passRequest, sendQuote, markNotificationsRead } = useStore();
  const shopId = session?.shopId;
  const row = (state.dashboard.queue || []).find((r) => String(r.id) === String(id))
    || (state.ownerRequests || []).find((r) => String(r.id) === String(id) && (!shopId || r.shopId === shopId));
  const templates = state.dashboard.quoteTemplates || [];
  const [price, setPrice] = React.useState('');
  const [cover, setCover] = React.useState('Labor, listed parts, and a written note if anything beyond this needs approval first.');
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    markNotificationsRead(shopId);
  }, [shopId]);

  if (!row) {
    return (
      <PageCard>
        <NotchNav active="dash" />
        <div style={{ padding: '72px 56px 52px' }}>
          <Meta>REQUEST</Meta>
          <h1 className="tv-title" style={{ margin: '16px 0 0' }}>This request is no longer in the queue</h1>
          <p className="tv-body" style={{ marginTop: 14, maxWidth: 520 }}>
            It may already be quoted, passed, or booked. Open requests live on the dashboard.
          </p>
          <Link to="/dashboard?view=requests"><Pill variant="ink" style={{ marginTop: 24 }}>Back to requests</Pill></Link>
        </div>
      </PageCard>
    );
  }

  const approve = async () => {
    if (!price) return;
    if(!await sendQuote(row.id, price))return;
    setNote(`Written price $${price} sent. Held for 48 hours.`);
    setTimeout(() => nav('/dashboard?view=requests'), 600);
  };

  const deny = async () => {
    if(!await passRequest(row.id, reason))return;
    nav('/dashboard?view=requests');
  };

  return (
    <PageCard>
      <NotchNav active="dash" />
      <div style={{ padding: '72px 56px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div>
            <Meta>INCOMING REQUEST</Meta><Link to={`/work/jobs/${row.id}`}><Pill variant="surface" style={{marginTop:18}}>Itemized estimate, photos & workflow</Pill></Link>
            <h1 className="tv-title" style={{ margin: '16px 0 0' }}>{row.job}</h1>
            <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
              Read the job before you send a written price or pass. Other shops' quotes are not shown here.
            </p>
          </div>
          <Link to="/dashboard?view=requests"><Pill variant="surface">Back to the queue</Pill></Link>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Meta>VEHICLE AND JOB</Meta>
              <div style={{ font: '600 22px/1.2 var(--tv-font)', marginTop: 14 }}>{row.car}</div>
              <div className="tv-data" style={{ marginTop: 10 }}>
                {(row.mode || 'mobile').toUpperCase()} · {row.when || 'WINDOW OPEN'} · {row.zip || '55407'} · {row.distance}
              </div>
              <p className="tv-body" style={{ marginTop: 16 }}>{row.note || 'No extra note from the owner.'}</p>
            </Card>

            <Card>
              <Meta>OWNER AND WHERE</Meta>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 14 }}>
                <div>
                  <div style={{ font: '600 15px/1.3 var(--tv-font)' }}>{row.ownerName || 'Owner'}</div>
                  <div className="tv-data" style={{ marginTop: 8 }}>{row.phone || 'TEXT ONLY'}</div>
                </div>
                <div>
                  <div style={{ font: '600 15px/1.3 var(--tv-font)' }}>{row.address || 'Address lands after you send a price'}</div>
                  <div className="tv-data" style={{ marginTop: 8 }}>{row.zip || ''}</div>
                </div>
              </div>
            </Card>

            <Card>
              <Meta>PHOTOS FROM THE OWNER</Meta>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {(row.photos || []).length
                  ? row.photos.map((src, i) => (
                    String(src).startsWith('data:video')
                      ? <video key={i} src={src} style={{ width: 120, height: 96, objectFit: 'cover', borderRadius: 16 }} />
                      : <img key={i} src={src} alt="" style={{ width: 120, height: 96, objectFit: 'cover', borderRadius: 16 }} />
                  ))
                  : [0, 1, 2].map((i) => (
                    <Placeholder key={i} label="NO PHOTO" style={{ width: 120, height: 96, borderRadius: 16 }} />
                  ))}
              </div>
            </Card>
          </div>

          <div style={{ width: 372, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Meta>APPROVE WITH A WRITTEN PRICE</Meta>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
                <div className="tv-price">{price ? `$${price}` : '—'}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ font: '600 13px/1 var(--tv-font)' }}>${row.median || '—'}</div>
                  <Meta style={{ marginTop: 6 }}>AREA MEDIAN</Meta>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Field label="WRITTEN PRICE" value={price} onChange={setPrice} type="number" placeholder="94" />
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="WHAT THIS COVERS" value={cover} onChange={setCover} multiline />
              </div>
              {templates.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {templates.map((t) => (
                    <button key={t.name} onClick={() => setPrice(String(t.price))} style={{
                      border: 0, cursor: 'pointer', padding: '8px 12px', borderRadius: 13,
                      background: 'var(--tv-inset)', font: '600 11.5px/1 var(--tv-font)', color: 'var(--tv-ink)',
                    }}>{t.name} · ${t.price}</button>
                  ))}
                </div>
              )}
              <Pill variant="accent" onClick={approve} style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}>
                Approve and send
              </Pill>
              <p className="tv-small" style={{ marginTop: 12 }}>Held for 48 hours. Work beyond the quote needs the owner's approval first.</p>
              {note && <p className="tv-small" style={{ marginTop: 8, color: 'var(--tv-accent-ink)' }}>{note}</p>}
            </Card>

            <Card>
              <Meta>DENY THIS REQUEST</Meta>
              <div style={{ marginTop: 14 }}>
                <Field label="REASON, OPTIONAL" value={reason} onChange={setReason} placeholder="Out of radius this window" />
              </div>
              <Pill variant="surface" onClick={deny} style={{ marginTop: 16 }}>Deny and pass</Pill>
              <p className="tv-small" style={{ marginTop: 12 }}>The owner keeps the request live with the other matched shops.</p>
            </Card>
          </div>
        </div>
      </div>
    </PageCard>
  );
}
