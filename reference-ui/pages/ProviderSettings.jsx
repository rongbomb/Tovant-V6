import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import { Card, Meta, Pill, Chip, Field, Toggle, RailItem, SectionTitle, Placeholder, PageCard } from '../components/primitives.jsx';
import { week } from '../data/mock.js';
import { OWNER_ISSUES } from '../data/directory.js';
import { useStore } from '../lib/store.jsx';
import { getConsent, setConsent } from '../lib/consent.js';
import {
  CALENDAR_PROVIDERS,
  connectCalendar,
  disconnectCalendar,
  downloadJobsIcs,
  ensureFeedToken,
  feedUrlFor,
  loadCalendarConnections,
  webcalUrlFor,
} from '../lib/calendarSync.js';
import { toISODate } from '../lib/schedule.js';

const NAV = ['Shop profile', 'Trades and radius', 'Labor rates', 'Availability', 'Calendar sync', 'Team', 'Payouts', 'Notifications', 'Privacy'];

export default function ProviderSettings() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'Shop profile';
  const setTab = (t) => setParams(t === 'Shop profile' ? {} : { tab: t });
  const { state, setProvider, setRates, setCapacity, setAutoQuote, session, deleteAccount } = useStore();
  const [deleteAsk, setDeleteAsk] = React.useState(false);
  const p = state.provider;
  const shop = (state.shops || []).find((s) => s.id === session?.shopId);
  const [draft, setDraft] = React.useState(p);
  const [rates, setLocalRates] = React.useState(state.dashboard.rates);
  const [savedAt, setSavedAt] = React.useState(null);
  const [newTech, setNewTech] = React.useState({ name: '', role: '' });
  const [addingTech, setAddingTech] = React.useState(false);
  const [calConnections, setCalConnections] = React.useState(() => ensureFeedToken(loadCalendarConnections()));
  const [calBusy, setCalBusy] = React.useState(null);
  const [feedCopied, setFeedCopied] = React.useState(false);

  React.useEffect(() => { setDraft(p); setLocalRates(state.dashboard.rates); }, [session?.shopId]);

  const patch = (partial) => setDraft((s) => ({ ...s, ...partial }));
  const toggleTrade = (t) => {
    const on = draft.trades.includes(t);
    if (on && draft.trades.length === 1) return;
    patch({ trades: on ? draft.trades.filter((x) => x !== t) : [...draft.trades, t] });
  };
  const save = async () => {
    if (!await setProvider(draft)) return;
    setRates(rates);
    setCapacity({ jobsPerDay: Number(draft.jobsPerDay) || state.dashboard.capacity.jobsPerDay });
    setAutoQuote(!!draft.autoQuote);
    setSavedAt(Date.now());
  };

  return (
    <PageCard>
      <NotchNav active="profile" />
      <div style={{ padding: '72px 56px 52px' }}>
        <Meta>PROVIDER</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>Shop settings</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 620 }}>
          What you set here decides which requests reach you. Trades, radius, rates and open capacity are the whole filter.
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
                  ? <img src={draft.photo} alt="" style={{ width: 46, height: 46, borderRadius: 14, objectFit: 'cover', flex: 'none' }} />
                  : <Placeholder style={{ width: 46, height: 46, borderRadius: 14, flex: 'none' }} />}
                <div>
                  <div style={{ font: '600 13.5px/1.2 var(--tv-font)' }}>{draft.name}</div>
                  <Meta style={{ marginTop: 7 }}>VETTED · SINCE 2016</Meta>
                </div>
              </div>
              <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 14 }}>
                ★ {shop?.rating || p.rating || '—'} · {shop?.jobCount || 0} reviews
              </p>
            </Card>
            <Card dark pad={20}>
              <Meta style={{ color: 'rgba(255,255,255,.45)' }}>PROFILE STRENGTH</Meta>
              <div className="tv-stat" style={{ color: '#fff', marginTop: 14 }}>{Math.min(100, 60 + draft.trades.length * 5)}%</div>
              <p style={{ font: '400 12.5px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.6)', marginTop: 12 }}>
                Add a shop video and two more photos to finish. Complete profiles win about a third more work.
              </p>
            </Card>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tab === 'Shop profile' && (
              <Card>
                <SectionTitle>Shop profile</SectionTitle>
                <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginTop: 20 }}>
                  <div style={{ flex: 'none', textAlign: 'center' }}>
                    {draft.photo
                      ? <img src={draft.photo} alt="" style={{ width: 104, height: 104, borderRadius: 22, objectFit: 'cover' }} />
                      : <Placeholder label="PHOTO" style={{ width: 104, height: 104, borderRadius: 22 }} />}
                    <label style={{ display: 'block', cursor: 'pointer', font: '600 11.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)', marginTop: 12 }}>
                      Change photo
                      <input type="file" accept="image/*" hidden onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => patch({ photo: reader.result });
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
                  <Field label="SHOP NAME" value={draft.name} onChange={(name) => patch({ name })} />
                  <Field label="OWNER" value={draft.owner} onChange={(owner) => patch({ owner })} />
                  <Field label="PHONE" value={draft.phone} onChange={(phone) => patch({ phone })} />
                  <Field label="EMAIL" value={draft.email} onChange={(email) => patch({ email })} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Field label="ABOUT THIS SHOP" multiline value={draft.about} onChange={(about) => patch({ about })} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Meta>PHOTOS AND VIDEO</Meta>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <Placeholder label="WALKTHROUGH · 0:42" style={{ width: 150, height: 96, borderRadius: 'var(--tv-r-input)', flex: 'none' }} />
                    <Placeholder style={{ width: 110, height: 96, borderRadius: 'var(--tv-r-input)', flex: 'none' }} />
                    <Placeholder style={{ width: 110, height: 96, borderRadius: 'var(--tv-r-input)', flex: 'none' }} />
                    <label style={{ width: 110, height: 96, borderRadius: 'var(--tv-r-input)', background: 'var(--tv-inset)', display: 'grid', placeItems: 'center', font: '600 22px/1 var(--tv-font)', color: 'var(--tv-faint)', cursor: 'pointer' }}>
                      +
                      <input type="file" accept="image/*,video/*" hidden onChange={() => patch({ mediaNote: 'Media attached on this device' })} />
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {tab === 'Trades and radius' && (
              <Card>
                <SectionTitle right="WHAT OWNERS CAN ASK YOU FOR">Trades and radius</SectionTitle>
                <p className="tv-small" style={{ marginTop: 12 }}>
                  These are the services on your public page and on the request form. They start selected from signup. Turn off anything you do not do.
                </p>
                <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 18 }}>
                  {OWNER_ISSUES.map((t) => <Chip key={t} on={draft.trades.includes(t)} onClick={() => toggleTrade(t)}>{t}</Chip>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 24 }}>
                  <Field label="HOW YOU WORK" value={draft.how} onChange={(how) => patch({ how })} />
                  <Field label="SERVICE RADIUS" value={draft.radius} onChange={(radius) => patch({ radius })} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Toggle label="Take jobs outside the radius with a trip fee" on={draft.tripFee} onChange={(tripFee) => patch({ tripFee })}
                    sub="Up to 20 miles for $35. Owners see the fee before they book." />
                </div>
              </Card>
            )}

            {tab === 'Labor rates' && (
              <Card>
                <SectionTitle right="PUBLISHED RATES, NOT RANGES">Labor rates</SectionTitle>
                <div style={{ marginTop: 12 }}>
                  {rates.map((r, i) => (
                    <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ font: '600 13.5px/1.2 var(--tv-font)' }}>{r.name}</div>
                        <div style={{ font: '400 10.5px/1 var(--tv-mono)', color: 'var(--tv-muted)', marginTop: 7 }}>{r.sub}</div>
                      </div>
                      <input value={r.value} onChange={(e) => setLocalRates((s) => s.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                        style={{ width: 120, padding: '12px 14px', border: 0, borderRadius: 13, background: 'var(--tv-inset)', font: '600 13.5px/1 var(--tv-font)', textAlign: 'right', outline: 'none' }} />
                    </div>
                  ))}
                </div>
                <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 18 }}>
                  Owners see how your rate sits against the median. Shops within 10% of it win the most work.
                </p>
              </Card>
            )}

            {tab === 'Availability' && (
              <Card>
                <SectionTitle right="THIS WEEK">Availability</SectionTitle>
                <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                  {[week.slice(0, 4), week.slice(4)].map((half, col) => (
                    <div key={col} style={{ flex: 1 }}>
                      {half.map(([day, hours], i) => {
                        const idx = col === 0 ? i : i + 4;
                        const on = draft.days[idx];
                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                            <div style={{ width: 44, flex: 'none', font: '600 11.5px/1 var(--tv-mono)', color: on ? 'var(--tv-ink)' : 'var(--tv-faint)' }}>{day}</div>
                            <div style={{ flex: 1, font: `${on ? 600 : 400} 13px/1 var(--tv-font)`, color: on ? 'var(--tv-ink)' : 'var(--tv-faint)' }}>{hours}</div>
                            <Toggle small on={on} onChange={(v) => patch({ days: draft.days.map((x, j) => (j === idx ? v : x)) })} />
                          </div>
                        );
                      })}
                      {col === 1 && (
                        <div style={{ marginTop: 14 }}>
                          <Field label="JOBS PER DAY" value={String(draft.jobsPerDay || state.dashboard.capacity.jobsPerDay)}
                            onChange={(jobsPerDay) => patch({ jobsPerDay })} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link to="/dashboard?view=schedule" style={{ display: 'inline-block', font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)', marginTop: 16 }}>Open job calendar →</Link>
              </Card>
            )}

            {tab === 'Calendar sync' && (
              <Card>
                <SectionTitle right="GOOGLE · APPLE · OUTLOOK · ICS">Calendar sync</SectionTitle>
                <p className="tv-small" style={{ marginTop: 12, color: 'var(--tv-muted)' }}>
                  Keep your phone and shop calendars in step with booked jobs. Connect a provider below, or download an ICS file for any calendar app.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
                  {CALENDAR_PROVIDERS.map((p) => {
                    const row = calConnections[p.id] || {};
                    const on = !!row.connected;
                    return (
                      <div key={p.id} style={{ padding: 16, borderRadius: 18, background: 'var(--tv-inset)' }}>
                        <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{p.name}</div>
                        <p className="tv-small" style={{ margin: '8px 0 0', color: 'var(--tv-muted)' }}>{p.hint}</p>
                        {on && <div className="tv-data" style={{ marginTop: 10 }}>CONNECTED · {String(row.email || '').toUpperCase()}</div>}
                        <div style={{ marginTop: 12 }}>
                          {on ? (
                            <Pill variant="surface" onClick={() => setCalConnections(disconnectCalendar(p.id))} style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12 }}>Disconnect</Pill>
                          ) : (
                            <Pill
                              variant="ink"
                              onClick={async () => {
                                setCalBusy(p.id);
                                await new Promise((r) => setTimeout(r, 500));
                                setCalConnections(connectCalendar(p.id, {
                                  email: p.id === 'google' ? 'shop@gmail.com' : p.id === 'apple' ? 'iCloud' : p.id === 'outlook' ? 'shop@outlook.com' : 'ICS feed',
                                }));
                                setCalBusy(null);
                              }}
                              style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12, boxShadow: 'none', opacity: calBusy === p.id ? 0.7 : 1 }}
                            >
                              {calBusy === p.id ? 'Connecting…' : 'Connect'}
                            </Pill>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 20, padding: 16, borderRadius: 18, background: 'var(--tv-inset)' }}>
                  <Meta>PRIVATE FEED</Meta>
                  <div style={{ marginTop: 10, font: '400 12px/1.4 var(--tv-mono)', wordBreak: 'break-all' }}>
                    {webcalUrlFor(calConnections.feedToken) || feedUrlFor(calConnections.feedToken)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <Pill
                      variant="ink"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(feedUrlFor(calConnections.feedToken));
                          setFeedCopied(true);
                          setTimeout(() => setFeedCopied(false), 1500);
                        } catch { /* ignore */ }
                      }}
                      style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12, boxShadow: 'none' }}
                    >
                      {feedCopied ? 'Copied' : 'Copy feed URL'}
                    </Pill>
                    <Pill
                      variant="surface"
                      onClick={() => downloadJobsIcs({
                        shopName: draft.name || session?.shop,
                        jobs: state.dashboard.jobs,
                        today: toISODate(new Date()),
                      })}
                      style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12 }}
                    >
                      Download .ics
                    </Pill>
                    <Link to="/dashboard?view=schedule">
                      <Pill variant="surface" style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12 }}>Open calendar</Pill>
                    </Link>
                  </div>
                  <p className="tv-data" style={{ marginTop: 12 }}>
                    DEMO · CONNECT SIMULATES OAUTH. PRODUCTION USES GOOGLE AND MICROSOFT SIGN-IN PLUS A LIVE ICS ENDPOINT.
                  </p>
                </div>
              </Card>
            )}

            {tab === 'Team' && (
              <Card>
                <SectionTitle right="WHO SHOWS UP ON THE JOB">Team</SectionTitle>
                <div style={{ marginTop: 8 }}>
                  {draft.team.map(([name, role], i) => (
                    <div key={name} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                      <Placeholder style={{ width: 44, height: 44, borderRadius: 14, flex: 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{name}</div>
                        <div className="tv-data" style={{ marginTop: 6 }}>{role}</div>
                      </div>
                      <Pill variant="surface" onClick={() => patch({ team: draft.team.filter((_, j) => j !== i) })}
                        style={{ padding: '10px 14px', borderRadius: 15, fontSize: 12, background: 'var(--tv-inset)', boxShadow: 'none', color: 'var(--tv-body)' }}>Remove</Pill>
                    </div>
                  ))}
                </div>
                <Pill variant="ink" onClick={() => setAddingTech(true)} style={{ marginTop: 18 }}>Add a tech</Pill>
                {addingTech && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginTop: 16, alignItems: 'end' }}>
                    <Field label="NAME" value={newTech.name} onChange={(name) => setNewTech((s) => ({ ...s, name }))} />
                    <Field label="ROLE" value={newTech.role} onChange={(role) => setNewTech((s) => ({ ...s, role }))} />
                    <Pill variant="ink" onClick={() => {
                      if (!newTech.name.trim()) return;
                      patch({ team: [...draft.team, [newTech.name.trim(), newTech.role.trim() || 'Mobile tech']] });
                      setNewTech({ name: '', role: '' });
                      setAddingTech(false);
                    }}>Save</Pill>
                  </div>
                )}
              </Card>
            )}

            {tab === 'Payouts' && (
              <Card>
                <SectionTitle>Payouts</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
                  <Field label="BANK ACCOUNT" value={draft.bank || 'Frost Bank ending 8820'} onChange={(bank) => patch({ bank })} />
                  <Field label="SCHEDULE" value="Weekly, every Friday" />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Toggle label="Send a payout summary each Friday" on={draft.payoutMail} onChange={(payoutMail) => patch({ payoutMail })}
                    sub="One email listing cleared jobs, the platform percentage and the deposit." />
                </div>
                <Link to="/dashboard?view=money" style={{ display: 'inline-block', font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)', marginTop: 8 }}>Open payout history →</Link>
              </Card>
            )}

            {tab === 'Notifications' && (
              <Card>
                <SectionTitle>Notifications</SectionTitle>
                <Toggle label="Auto quote repeat customers" on={!!draft.autoQuote} onChange={(autoQuote) => patch({ autoQuote })}
                  sub="Send your standard rate automatically to owners you have served before." />
                <Toggle label="Text new requests immediately" on={draft.payoutMail} onChange={(payoutMail) => patch({ payoutMail })}
                  sub="A text lands when an owner in your trades and radius sends a job." />
              </Card>
            )}

            {tab === 'Privacy' && (
              <Card>
                <SectionTitle>Privacy and data</SectionTitle>
                <p className="tv-small" style={{ marginTop: 14 }}>
                  Download shop data, change cookies, or delete this shop account. Deletion removes the listing from Find a Pro on this device.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
                  <Pill variant="ink" onClick={() => {
                    const blob = new Blob([JSON.stringify({
                      exportedAt: new Date().toISOString(),
                      provider: { ...state.provider, bank: 'redacted' },
                      messages: state.messages,
                      cookies: getConsent(),
                    }, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'tovant-shop.json';
                    a.click();
                  }}>Download my data</Pill>
                  <Pill variant="surface" onClick={() => setDeleteAsk(true)}>Delete shop account</Pill>
                </div>
                {deleteAsk && (
                  <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: 'var(--tv-inset)' }}>
                    <p className="tv-small">This signs you out and removes the shop listing from this device. Invoices may stay in a locked file for tax rules.</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <Pill variant="ink" onClick={() => { deleteAccount(); nav('/'); }}>Delete shop account now</Pill>
                      <Pill variant="surface" onClick={() => setDeleteAsk(false)}>Keep the shop</Pill>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
                  <Pill variant="surface" onClick={() => setConsent({ analytics: false, marketing: false })}>Use needed cookies</Pill>
                  <Pill variant="surface" onClick={() => setConsent({ analytics: true, marketing: true })}>Allow all cookies</Pill>
                  <Link to="/privacy" style={{ font: '600 13px/44px var(--tv-font)', color: 'var(--tv-accent-link)' }}>Privacy policy</Link>
                </div>
              </Card>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Pill variant="accent" onClick={save}>Save changes</Pill>
              <Pill variant="surface" onClick={() => nav(`/provider/${session?.shopId || 'harlan'}`)}>Preview my public page</Pill>
              <span className="tv-small" style={{ color: 'var(--tv-muted)', marginLeft: 6 }}>
                {savedAt ? `Live since ${new Date(savedAt).toLocaleTimeString()}` : 'Changes go live within a minute'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageCard>
  );
}
