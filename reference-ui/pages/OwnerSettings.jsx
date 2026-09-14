import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import { Card, Meta, Pill, Field, Toggle, RailItem, SectionTitle, Placeholder, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';
import { getConsent, setConsent } from '../lib/consent.js';

const NAV = ['Account', 'Vehicles', 'Addresses', 'Payment methods', 'Notifications', 'Privacy and data'];

export default function OwnerSettings() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'Account';
  const setTab = (t) => setParams(t === 'Account' ? {} : { tab: t });
  const nav = useNavigate();
  const { state, session, setOwner, deleteAccount, blocked, unblockUser, shops } = useStore();
  const o = state.owner;
  const [consent, setLocalConsent] = React.useState(() => getConsent());
  React.useEffect(() => {
    const sync = () => setLocalConsent(getConsent());
    window.addEventListener('tovant-consent', sync);
    return () => window.removeEventListener('tovant-consent', sync);
  }, []);
  const [draft, setDraft] = React.useState(o);
  const [savedAt, setSavedAt] = React.useState(null);
  const [newCar, setNewCar] = React.useState({ name: '', plate: '', miles: '' });
  const [adding, setAdding] = React.useState(false);
  const [deleteAsk, setDeleteAsk] = React.useState(false);

  React.useEffect(() => { setDraft(o); }, [session?.email]);

  const patch = (partial) => setDraft((s) => ({ ...s, ...partial }));
  const save = async () => { if(await setOwner(draft)) setSavedAt(Date.now()); };
  const discard = () => setDraft(o);

  return (
    <PageCard>
      <NotchNav active="profile" />
      <div style={{ padding: '72px 56px 52px' }}>
        <Meta>CAR OWNER</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>Profile settings</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 600 }}>
          Your vehicles, addresses and payment methods carry into every request, so you never type them twice.
        </p>

        <div style={{ display: 'flex', gap: 24, marginTop: 34, alignItems: 'flex-start' }}>
          <div style={{ width: 236, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card pad={10}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV.map((t) => <RailItem key={t} on={tab === t} onClick={() => setTab(t)}>{t}</RailItem>)}
              </div>
            </Card>
            <Card pad={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                {draft.photo
                  ? <img src={draft.photo} alt="" style={{ width: 46, height: 46, borderRadius: 23, objectFit: 'cover', flex: 'none' }} />
                  : <Placeholder style={{ width: 46, height: 46, borderRadius: 23, flex: 'none' }} />}
                <div>
                  <div style={{ font: '600 13.5px/1.2 var(--tv-font)' }}>{draft.name}</div>
                  <Meta style={{ marginTop: 7 }}>MEMBER SINCE 2023</Meta>
                </div>
              </div>
              <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 14 }}>
                14 jobs booked · {draft.vehicles?.length || 0} vehicles · $2,840 spent through Tovant
              </p>
            </Card>
            <Card dark pad={20}>
              <div style={{ font: '600 13.5px/1.3 var(--tv-font)', color: '#fff' }}>Run a shop or a van?</div>
              <p style={{ font: '400 12.5px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.6)', margin: '9px 0 0' }}>
                Apply as a provider and answer requests in your trades.
              </p>
              <Link to="/signup/provider" style={{ display: 'inline-block', font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent)', marginTop: 14 }}>Apply as a provider →</Link>
            </Card>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tab === 'Account' && (
              <Card>
                <SectionTitle>Account</SectionTitle>
                <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginTop: 20 }}>
                  <div style={{ flex: 'none', textAlign: 'center' }}>
                    {draft.photo
                      ? <img src={draft.photo} alt="" style={{ width: 104, height: 104, borderRadius: 52, objectFit: 'cover' }} />
                      : <Placeholder label="PHOTO" style={{ width: 104, height: 104, borderRadius: 52 }} />}
                    <label style={{ display: 'block', cursor: 'pointer', font: '600 11.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)', marginTop: 12 }}>
                      Change
                      <input type="file" accept="image/*" hidden onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => patch({ photo: reader.result });
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <Field label="FULL NAME" value={draft.name} onChange={(name) => patch({ name })} />
                    <Field label="EMAIL" value={draft.email} onChange={(email) => patch({ email })} />
                    <Field label="PHONE" value={draft.phone} onChange={(phone) => patch({ phone })} />
                    <Field label="PASSWORD" value={draft.password || ''} onChange={(password) => patch({ password })} type="password" placeholder="Leave blank to keep" />
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <Toggle label="Text me instead of calling" on={draft.textOnly} onChange={(textOnly) => patch({ textOnly })}
                    sub="Pros reach you through Tovant. Your number stays hidden until you book." />
                </div>
              </Card>
            )}

            {tab === 'Vehicles' && (
              <Card>
                <SectionTitle right={`${draft.vehicles.length} IN YOUR GARAGE`}>Vehicles</SectionTitle>
                <div style={{ marginTop: 8 }}>
                  {draft.vehicles.map(([car, plate, miles, primary], i) => (
                    <div key={car} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                      <Placeholder label="CAR" style={{ width: 64, height: 52, borderRadius: 14, flex: 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>
                          {car}
                          {primary && <span style={{ padding: '4px 8px', borderRadius: 9, background: 'var(--tv-accent-wash)', font: '600 9px/1 var(--tv-mono)', color: 'var(--tv-accent-ink)', marginLeft: 6 }}>PRIMARY</span>}
                        </div>
                        <div style={{ font: '400 10.5px/1 var(--tv-mono)', color: 'var(--tv-muted)', marginTop: 8 }}>{plate} · {miles}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
                        <Link to={`/history?vehicle=${encodeURIComponent(car)}`}>
                          <Pill variant="surface" style={{ padding: '10px 14px', borderRadius: 15, fontSize: 12, background: 'var(--tv-inset)', boxShadow: 'none', color: 'var(--tv-body)' }}>History</Pill>
                        </Link>
                        <Pill variant="surface" onClick={() => patch({ vehicles: draft.vehicles.map((v, j) => [v[0], v[1], v[2], j === i]) })}
                          style={{ padding: '10px 14px', borderRadius: 15, fontSize: 12, background: 'var(--tv-inset)', boxShadow: 'none', color: 'var(--tv-body)' }}>
                          {primary ? 'Primary' : 'Make primary'}
                        </Pill>
                        <Pill variant="surface" onClick={() => patch({ vehicles: draft.vehicles.filter((_, j) => j !== i) })}
                          style={{ padding: '10px 14px', borderRadius: 15, fontSize: 12, background: 'var(--tv-inset)', boxShadow: 'none', color: 'var(--tv-body)' }}>Remove</Pill>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  {adding ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <Field label="YEAR MAKE MODEL" value={newCar.name} onChange={(name) => setNewCar((s) => ({ ...s, name }))} placeholder="2020 Honda CR-V" />
                        <Field label="PLATE" value={newCar.plate} onChange={(plate) => setNewCar((s) => ({ ...s, plate }))} placeholder="MN · ABC 1234" />
                        <Field label="MILES" value={newCar.miles} onChange={(miles) => setNewCar((s) => ({ ...s, miles }))} placeholder="12,400 mi" />
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <Pill variant="ink" onClick={() => {
                          if (!newCar.name.trim()) return;
                          patch({ vehicles: [...draft.vehicles, [newCar.name.trim(), newCar.plate || 'MN · NEW', newCar.miles || 'Mileage later', false]] });
                          setNewCar({ name: '', plate: '', miles: '' });
                          setAdding(false);
                        }}>Save vehicle</Pill>
                        <Pill variant="surface" onClick={() => setAdding(false)}>Cancel</Pill>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Pill variant="ink" onClick={() => setAdding(true)}>Add a vehicle</Pill>
                      <span className="tv-small" style={{ color: 'var(--tv-muted)' }}>Add by plate or VIN and we fill in the trim and factory intervals.</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {tab === 'Addresses' && (
              <Card>
                <SectionTitle right="WHERE MOBILE PROS MEET YOU">Addresses</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
                  <Field label="HOME" value={draft.home} onChange={(home) => patch({ home })} />
                  <Field label="WORK" value={draft.work} onChange={(work) => patch({ work })} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Field label="GATE OR PARKING NOTES" multiline value={draft.notes} onChange={(notes) => patch({ notes })} />
                </div>
              </Card>
            )}

            {tab === 'Payment methods' && (
              <Card>
                <SectionTitle>Payment methods</SectionTitle>
                <div style={{ marginTop: 8 }}>
                  {draft.cards.map(([label, meta, def], i) => (
                    <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                      <div style={{ width: 44, height: 30, borderRadius: 8, background: 'var(--tv-placeholder)', flex: 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ font: '600 13.5px/1 var(--tv-font)' }}>{label}</div>
                        <div style={{ font: '400 10.5px/1 var(--tv-mono)', color: 'var(--tv-muted)', marginTop: 7 }}>{meta}</div>
                      </div>
                      {def
                        ? <span style={{ padding: '6px 11px', borderRadius: 12, background: 'var(--tv-inset)', font: '600 10px/1 var(--tv-mono)', color: 'var(--tv-body)' }}>DEFAULT</span>
                        : <button onClick={() => patch({ cards: draft.cards.map((c, j) => [c[0], c[1], j === i]) })} style={{ border: 0, background: 'none', cursor: 'pointer', font: '600 12px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Make default</button>}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
                  <Pill variant="surface" onClick={() => patch({ cards: [...draft.cards, ['Mastercard ending 2201', 'EXPIRES 03/29', false]] })}>Add a card</Pill>
                  <span className="tv-small" style={{ color: 'var(--tv-muted)' }}>Cards are authorized when you book and charged after the work is done.</span>
                </div>
              </Card>
            )}

            {tab === 'Notifications' && (
              <Card>
                <SectionTitle>Notifications</SectionTitle>
                <div style={{ marginTop: 8 }}>
                  {[['New quotes', 'Text and push when a matched pro sends a price.'],
                    ['Arrival updates', 'When a mobile tech leaves the shop and when they arrive.'],
                    ['Extra work approvals', 'Photo, price and a yes or no before anything proceeds.'],
                    ['Maintenance reminders', 'Based on mileage and the factory interval for each vehicle.'],
                    ['Deals and offers from pros', 'Occasional offers from shops you have used.']].map(([label, sub], i) => (
                    <Toggle key={label} label={label} sub={sub} on={!!draft.notif[i]}
                      onChange={(v) => patch({ notif: draft.notif.map((x, j) => (j === i ? v : x)) })} />
                  ))}
                </div>
              </Card>
            )}

            {tab === 'Privacy and data' && (
              <Card>
                <SectionTitle>Privacy and data</SectionTitle>
                <p className="tv-small" style={{ marginTop: 14 }}>
                  Download a copy, change cookie choices, block a shop, or delete this account. Deletion signs you out and removes the live profile from this device.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
                  <Pill variant="ink" onClick={() => {
                    const blob = new Blob([JSON.stringify({
                      exportedAt: new Date().toISOString(),
                      owner: state.owner,
                      bookings: state.bookings,
                      drafts: state.drafts,
                      messages: state.messages,
                      blocked: state.blocked,
                      cookies: getConsent(),
                    }, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'tovant-account.json';
                    a.click();
                  }}>Download my data</Pill>
                  <Pill variant="surface" onClick={() => setDeleteAsk(true)}>Delete my account</Pill>
                </div>
                {deleteAsk && (
                  <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: 'var(--tv-inset)' }}>
                    <p className="tv-small">This removes your login, drafts, and live profile from this device. Open invoices may stay in a locked file for tax rules. You cannot undo this from the site.</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <Pill variant="ink" onClick={() => { deleteAccount(); nav('/'); }}>Delete my account now</Pill>
                      <Pill variant="surface" onClick={() => setDeleteAsk(false)}>Keep the account</Pill>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 28 }}>
                  <Meta>COOKIES</Meta>
                  <p className="tv-small" style={{ marginTop: 10 }}>
                    Needed cookies stay on so you can sign in. Analytics and marketing stay off unless you allow them.
                    {consent ? ` Analytics ${consent.analytics ? 'on' : 'off'}. Marketing ${consent.marketing ? 'on' : 'off'}.` : ' You have not chosen yet.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                    <Pill variant="surface" onClick={() => setConsent({ analytics: false, marketing: false })}>Use needed cookies</Pill>
                    <Pill variant="surface" onClick={() => setConsent({ analytics: true, marketing: true })}>Allow all cookies</Pill>
                    <Link to="/cookies" style={{ font: '600 13px/44px var(--tv-font)', color: 'var(--tv-accent-link)' }}>Cookie policy</Link>
                  </div>
                </div>
                <div style={{ marginTop: 22 }}>
                  <Toggle
                    label="Do not sell or share my personal information"
                    on={!(consent?.marketing)}
                    onChange={(off) => {
                      setConsent({ marketing: !off, analytics: !!consent?.analytics });
                      patch({ notif: (draft.notif || []).map((x, i) => (i === 4 ? !off : x)) });
                    }}
                    sub="Turns off marketing cookies and shop offers. Tovant does not sell personal information."
                  />
                </div>
                <div style={{ marginTop: 22 }}>
                  <Meta>BLOCKED SHOPS</Meta>
                  {(blocked || []).length === 0 && (
                    <p className="tv-small" style={{ marginTop: 10 }}>No blocked threads. Block from Messages if you need to stop a conversation.</p>
                  )}
                  {(blocked || []).map((id) => {
                    const shop = shops.find((s) => s.id === id);
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <span className="tv-small">{shop?.name || id}</span>
                        <Pill variant="surface" onClick={() => unblockUser(id)}>Unblock</Pill>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Pill variant="accent" onClick={save}>Save changes</Pill>
              <Pill variant="surface" onClick={discard}>Discard</Pill>
              <span className="tv-small" style={{ color: 'var(--tv-muted)', marginLeft: 6 }}>
                {savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Unpublished edits stay on this device'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageCard>
  );
}
