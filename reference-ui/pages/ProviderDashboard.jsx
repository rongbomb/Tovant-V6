import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import { Card, Meta, Pill, Field, Toggle, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';
import { downloadCsv } from '../lib/csv.js';
import JobCalendar from '../components/JobCalendar.jsx';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const RAIL = [
  ['today', '◔', 'Calendar'],
  ['requests', '◎', 'Requests'],
  ['jobs', '▤', 'Jobs'],
  ['schedule', '▦', 'Week'],
  ['money', '$', 'Money'],
];
const JOB_LABEL = { scheduled: 'Scheduled', in_progress: 'In progress', ready: 'Ready for pickup', completed: 'Completed' };

function Kpi({ label, value, sub, accent, onClick }) {
  return (
    <Card interactive pad={22} onClick={onClick} style={{ flex: 1, borderRadius: 20 }}>
      <Meta>{label}</Meta>
      <div className="tv-stat" style={{ marginTop: 16 }}>{value}</div>
      <div style={{ font: '400 12px/1 var(--tv-font)', color: accent ? 'var(--tv-accent-ink)' : 'var(--tv-muted)', marginTop: 12 }}>{sub}</div>
    </Card>
  );
}

export default function ProviderDashboard() {
  const [params, setParams] = useSearchParams();
  const requestedView=params.get('view')||'today';
  const view=RAIL.some(r=>r[0]===requestedView)?requestedView:(requestedView==='calendar'?'schedule':'today');
  const setView = (v) => setParams(v === 'today' ? {} : { view: v });
  const {
    state, session, setCapacity, setRates, setAutoQuote, advanceJob, shops,
    markNotificationsRead, bookings, toggleHold,
  } = useStore();
  const [pickedJob, setPickedJob] = React.useState(null);
  const d = state.dashboard;
  const shopId = session?.shopId;
  const [panel, setPanel] = React.useState(null);
  const [cap, setCap] = React.useState(d.capacity);
  const [rates, setLocalRates] = React.useState(d.rates);
  const [jobFilter, setJobFilter] = React.useState('all');

  React.useEffect(() => { setCap(d.capacity); setLocalRates(d.rates); }, [d.capacity, d.rates]);
  React.useEffect(() => {
    if (view === 'requests') markNotificationsRead(shopId);
  }, [view, shopId]);

  const exportPayouts = () => {
    downloadCsv('tovant-payouts.csv', [
      ['Week', 'Jobs', 'Amount', 'Status'],
      ...d.payouts.map((p) => [p.week, p.jobs, p.amount, p.status]),
    ]);
  };
  const exportJobs = () => {
    downloadCsv('tovant-jobs.csv', [
      ['Time', 'Vehicle', 'Job', 'Status', 'Mode'],
      ...d.jobs.map((j) => [j.time, j.car, j.job, j.status, j.mode]),
    ]);
  };
  const exportQuotes = () => {
    downloadCsv('tovant-quotes.csv', [
      ['Vehicle', 'Job', 'Price', 'Sent'],
      ...d.sentQuotes.map((q) => [q.car, q.job, q.price, q.sentAt ? new Date(q.sentAt).toISOString() : '']),
    ]);
  };
  const bookedForShop = (bookings || []).filter((b) => !shopId || b.shopId === shopId).length;
  const winRate = d.sentQuotes.length
    ? `${Math.round((bookedForShop / d.sentQuotes.length) * 100)}%`
    : '38%';
  const remaining = Math.max(0, (d.capacity.jobsPerDay || 0) - d.jobs.filter((j) => j.status !== 'completed').length);

  const open = d.queue.filter((r) => r.status === 'open' && (!shopId || r.shopId === shopId));
  const weekJobs = d.jobs.filter((j) => j.status !== 'completed');
  const payout = d.payouts[0];

  return (
    <PageCard>
      <NotchNav active="dash" />
      <div style={{ display: 'flex', paddingTop: 64, minHeight: 820 }}>
        <nav style={{ width: 76, flex: 'none', background: 'var(--tv-rail)', padding: '18px 0 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: 'inset -1px 0 0 rgba(16,17,19,.06)' }}>
          {RAIL.map(([id, g, label]) => (
            <button key={id} title={label} aria-label={label} aria-pressed={view===id} onClick={() => setView(id)} style={{
              width: 44, height: 44, borderRadius: 14, border: 0, cursor: 'pointer',
              background: view === id ? 'var(--tv-inverse)' : 'transparent',
              color: view === id ? 'var(--tv-inverse-text)' : '#9A9DA4', font: '400 16px/1 var(--tv-font)',
            }}>{g}</button>
          ))}
        </nav>

        <main style={{ flex: 1, minWidth:0, padding: '24px 34px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Meta>PROVIDER DASHBOARD · {RAIL.find((r) => r[0] === view)?.[2].toUpperCase()}</Meta>
              <h1 className="tv-dashtitle" style={{ margin: '14px 0 0' }}>{session?.shop || d.shop}</h1>
              <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 10 }}>
                {d.capacity.accepting ? 'Accepting work' : 'Paused'} · {d.capacity.jobsPerDay} jobs a day · {d.capacity.mobileSlots} mobile slots
              </p>
              {shops.find((s) => s.id === shopId)?.pending && (
                <p className="tv-small" style={{ marginTop: 8, color: 'var(--tv-accent-ink)' }}>
                  In review. You list on Find a Pro as soon as staff verify your credentials.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Pill variant="surface" onClick={exportPayouts} style={{ padding: '12px 18px', borderRadius: 22, fontSize: 12.5 }}>Download reports</Pill>
              <Pill variant="surface" onClick={() => setPanel('capacity')} style={{ padding: '12px 18px', borderRadius: 22, fontSize: 12.5 }}>Set capacity</Pill>
              <Pill variant="accent" onClick={() => setPanel('rates')} style={{ padding: '12px 18px', borderRadius: 22, fontSize: 12.5 }}>Update rates</Pill>
            </div>
          </div>

          <div style={{display:'flex',gap:10,marginTop:20,flexWrap:'wrap'}}><Link to="/work/calendar"><Pill variant="surface" style={{padding:'10px 16px',fontSize:12}}>New booking & exact times</Pill></Link><Link to="/work/customers"><Pill variant="surface" style={{padding:'10px 16px',fontSize:12}}>Customers</Pill></Link><Link to="/work/services"><Pill variant="surface" style={{padding:'10px 16px',fontSize:12}}>Services & team</Pill></Link></div>
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <Kpi label="OPEN REQUESTS" value={open.length} sub={open.length ? `${open.length} waiting on a written price` : 'Queue is clear'} accent onClick={() => setView('requests')} />
            <Kpi label="QUOTE WIN RATE" value={winRate} sub={`${d.sentQuotes.length} sent this session`} onClick={() => setView('requests')} />
            <Kpi label="OPEN SLOTS TODAY" value={remaining} sub={`${d.capacity.jobsPerDay} jobs a day · ${weekJobs.filter((j) => j.status === 'in_progress').length} in progress`} onClick={() => setView('jobs')} />
            <Kpi label="RECORDED PAYMENTS" value={`$${payout.amount.toLocaleString()}`} sub={payout.status === 'cleared' ? 'Direct payment records' : 'Pending'} onClick={() => setView('money')} />
          </div>

          {panel === 'capacity' && (
            <Card style={{ marginTop: 20 }}>
              <Meta>CAPACITY</Meta>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 16 }}>
                <Field label="JOBS PER DAY" value={String(cap.jobsPerDay)} onChange={(v) => setCap({ ...cap, jobsPerDay: Number(v) || 0 })} />
                <Field label="MOBILE SLOTS" value={String(cap.mobileSlots)} onChange={(v) => setCap({ ...cap, mobileSlots: Number(v) || 0 })} />
                <div style={{ paddingTop: 8 }}>
                  <Toggle label="Accepting new requests" on={cap.accepting} onChange={(v) => setCap({ ...cap, accepting: v })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Pill variant="accent" onClick={async () => { if (await setCapacity(cap)) setPanel(null); }}>Save capacity</Pill>
                <Pill variant="surface" onClick={() => setPanel(null)}>Cancel</Pill>
              </div>
            </Card>
          )}

          {panel === 'rates' && (
            <Card style={{ marginTop: 20 }}>
              <Meta>LABOR RATES</Meta>
              <div style={{ marginTop: 12 }}>
                {rates.map((r, i) => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ font: '600 13.5px/1.2 var(--tv-font)' }}>{r.name}</div>
                      <div className="tv-data" style={{ marginTop: 6 }}>{r.sub}</div>
                    </div>
                    <input value={r.value} onChange={(e) => setLocalRates((s) => s.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                      style={{ width: 120, padding: '12px 14px', border: 0, borderRadius: 13, background: 'var(--tv-inset)', font: '600 13.5px/1 var(--tv-font)', textAlign: 'right', outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Pill variant="accent" onClick={() => { setRates(rates); setPanel(null); }}>Save rates</Pill>
                <Pill variant="surface" onClick={() => setPanel(null)}>Cancel</Pill>
              </div>
            </Card>
          )}

          {view === 'today' && (
            <div>
              {open.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <RequestQueue open={open} autoQuote={d.autoQuote} setAutoQuote={setAutoQuote} />
                </div>
              )}
              <JobCalendar
                jobs={d.jobs}
                holds={d.holds || []}
                jobsPerDay={d.capacity.jobsPerDay}
                shopName={session?.shop || d.shop}
                selectedId={pickedJob}
                onSelectJob={(j) => setPickedJob((id) => (id === j.id ? null : j.id))}
                onHold={toggleHold}
                onAdvance={advanceJob}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <Pill variant="surface" onClick={() => setPanel('capacity')}>Edit capacity</Pill>
                <Pill variant="surface" onClick={() => setView('jobs')}>All jobs</Pill>
                {!open.length && (
                  <Pill variant="surface" onClick={() => setView('requests')}>Request queue</Pill>
                )}
              </div>
            </div>
          )}

          {view === 'requests' && (
            <div style={{ marginTop: 20 }}>
              <RequestQueue open={open} autoQuote={d.autoQuote} setAutoQuote={setAutoQuote} wide />
              {d.sentQuotes.length > 0 && (
                <Card style={{ marginTop: 16 }}>
                  <Meta>SENT · HELD 48 HOURS</Meta>
                  {d.sentQuotes.map((q) => (
                    <div key={q.id + q.sentAt} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                      <div>
                        <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{q.car}</div>
                        <div className="tv-data" style={{ marginTop: 6 }}>{q.job}</div>
                      </div>
                      <div style={{ font: '600 16px/1 var(--tv-font)' }}>${q.price}</div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {view === 'jobs' && (
            <Card style={{ marginTop: 20 }} pad={0}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 8px' }}>
                <h2 className="tv-sectitle" style={{ margin: 0, fontSize: 16 }}>Jobs</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['all', 'scheduled', 'in_progress', 'ready', 'completed'].map((f) => (
                    <button key={f} onClick={() => setJobFilter(f)} style={{
                      border: 0, cursor: 'pointer', padding: '8px 12px', borderRadius: 14,
                      background: jobFilter === f ? 'var(--tv-inverse)' : 'var(--tv-inset)',
                      color: jobFilter === f ? 'var(--tv-inverse-text)' : 'var(--tv-body)', font: '600 11.5px/1 var(--tv-font)',
                    }}>{f === 'all' ? 'All' : JOB_LABEL[f]}</button>
                  ))}
                </div>
              </div>
              {d.jobs.filter((j) => jobFilter === 'all' || j.status === jobFilter).map((j) => (
                <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderTop: '1px solid var(--tv-hairline)' }}>
                  <div style={{ width: 64, font: '600 12px/1 var(--tv-mono)' }}>{j.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '600 14.5px/1.2 var(--tv-font)' }}>{j.car}</div>
                    <div className="tv-data" style={{ marginTop: 6 }}>{j.job} · {j.mode}</div>
                  </div>
                  <Link to={`/work/jobs/${j.id}`}><Pill variant="surface" style={{padding:'10px 14px',fontSize:12}}>Open job</Pill></Link><span style={{ padding: '6px 10px', borderRadius: 12, background: 'var(--tv-inset)', font: '600 10px/1 var(--tv-mono)' }}>{JOB_LABEL[j.status].toUpperCase()}</span>
                  {j.status !== 'completed' && (
                    <Pill variant="ink" onClick={() => advanceJob(j.id)} style={{ padding: '10px 14px', borderRadius: 16, fontSize: 12, boxShadow: 'none' }}>
                      {j.domainStatus==='scheduled'?'Start':j.domainStatus==='en_route'?'On site':j.domainStatus==='arrived'?'Start service':'Complete'}
                    </Pill>
                  )}
                </div>
              ))}
            </Card>
          )}

          {view === 'schedule' && (
            <div>
              <JobCalendar
                jobs={d.jobs}
                holds={d.holds || []}
                jobsPerDay={d.capacity.jobsPerDay}
                shopName={session?.shop || d.shop}
                selectedId={pickedJob}
                onSelectJob={(j) => setPickedJob((id) => (id === j.id ? null : j.id))}
                onHold={toggleHold}
                onAdvance={advanceJob}
              />
              <Pill variant="surface" onClick={() => setPanel('capacity')} style={{ marginTop: 12 }}>Edit capacity</Pill>
            </div>
          )}

          {view === 'money' && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h2 className="tv-sectitle" style={{ margin: 0, fontSize: 16 }}>Payouts</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Pill variant="surface" onClick={exportPayouts} style={{ padding: '9px 13px', borderRadius: 14, fontSize: 11.5 }}>Download payouts</Pill>
                    <Pill variant="surface" onClick={exportJobs} style={{ padding: '9px 13px', borderRadius: 14, fontSize: 11.5 }}>Download jobs</Pill>
                    <Pill variant="surface" onClick={exportQuotes} style={{ padding: '9px 13px', borderRadius: 14, fontSize: 11.5 }}>Download quotes</Pill>
                  </div>
                </div>
                {d.payouts.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                    <div>
                      <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{p.week}</div>
                      <div className="tv-data" style={{ marginTop: 6 }}>{p.jobs} JOBS · {p.status.toUpperCase()}</div>
                    </div>
                    <div style={{ font: '600 16px/1 var(--tv-font)' }}>${p.amount.toLocaleString()}</div>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h2 className="tv-sectitle" style={{ margin: 0, fontSize: 16 }}>Revenue through Tovant</h2>
                  <span className="tv-data">NOVEMBER $18,940 · UP 14% ON OCTOBER</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 22, height: 180 }}>
                  {d.revenue.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: '100%', height: h * 1.6, borderRadius: '8px 8px 4px 4px', background: i === 10 ? 'var(--tv-accent)' : '#E4E4E7' }} />
                      <div style={{ font: '400 9.5px/1 var(--tv-mono)', color: 'var(--tv-muted)' }}>{MONTHS[i]}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <Meta>PUBLISHED RATES</Meta>
                {d.rates.map((r) => (
                  <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                    <div>
                      <div style={{ font: '600 13.5px/1.2 var(--tv-font)' }}>{r.name}</div>
                      <div className="tv-data" style={{ marginTop: 6 }}>{r.sub}</div>
                    </div>
                    <div style={{ font: '600 15px/1 var(--tv-font)' }}>{r.value}</div>
                  </div>
                ))}
                <Pill variant="ink" onClick={() => setPanel('rates')} style={{ marginTop: 16 }}>Update rates</Pill>
              </Card>
            </div>
          )}
        </main>
      </div>
    </PageCard>
  );
}

function RequestQueue({ open, autoQuote, setAutoQuote, wide }) {
  return (
    <Card pad={0} style={{ flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px' }}>
        <h2 className="tv-sectitle" style={{ margin: 0, fontSize: 16 }}>Requests waiting on you</h2>
        <button onClick={() => setAutoQuote(!autoQuote)} style={{ border: 0, background: 'none', cursor: 'pointer', font: '600 11.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>
          Auto quote {autoQuote ? 'on' : 'off'}
        </button>
      </div>
      {open.length === 0 && (
        <div style={{ padding: '28px 20px', font: '400 13px/1.5 var(--tv-font)', color: 'var(--tv-muted)' }}>
          Nothing waiting. New requests land here as owners send them.
        </div>
      )}
      {open.map((r) => (
        <div key={r.id} style={{ padding: '18px 20px', borderBottom: '1px solid var(--tv-hairline)' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: 'var(--tv-placeholder)', flex: 'none' }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 14.5px/1.2 var(--tv-font)' }}>{r.car}</div>
              <div className="tv-data" style={{ marginTop: 7 }}>{r.job} · {r.distance} · {r.ago} · {(r.when || '').toUpperCase()}</div>
              <p className="tv-small" style={{ marginTop: 8 }}>{r.note ? `${String(r.note).slice(0, 72)}${r.note.length > 72 ? '...' : ''}` : 'Open the request to read the full note.'}</p>
            </div>
            <Link to={`/dashboard/request/${r.id}`}>
              <Pill variant="ink" style={{ padding: '10px 16px', borderRadius: 16, fontSize: 12, boxShadow: 'none' }}>Open request</Pill>
            </Link>
          </div>
        </div>
      ))}
      <div style={{ padding: '16px 20px', font: '400 12.5px/1.5 var(--tv-font)', color: 'var(--tv-muted)' }}>
        Open a request to read the vehicle, photos, and window. Approve with a written price or deny from that page.
        {wide ? ' Quotes you send are held for 48 hours.' : ''}
      </div>
    </Card>
  );
}
