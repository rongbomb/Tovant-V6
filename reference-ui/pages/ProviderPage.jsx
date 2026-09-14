import React from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import AreaMap from '../components/AreaMap.jsx';
import MediaGallery from '../components/MediaGallery.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import BleedFade from '../components/BleedFade.jsx';
import LeaveDraftGuard from '../components/LeaveDraftGuard.jsx';
import JobRequestForm from '../components/JobRequestForm.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { HOME_POINT, TIME_WINDOWS, issuesForShop, modeOptionsFor, defaultJobNote } from '../data/directory.js';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function ProviderPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { shops, requestDraft, saveDraft, sendToShop, session, site, state } = useStore();
  const copy = pageCopy(site, 'provider');
  const p = shops.find((x) => x.id === id) || shops[0];
  const already = (requestDraft?.sentTo || []).includes(p.id);
  const offered = issuesForShop(p);
  const howOptions = modeOptionsFor(p);
  const owner = state.owner;
  const primary = (owner?.vehicles || []).find((v) => v[3]) || owner?.vehicles?.[0];
  const [open, setOpen] = React.useState(() => params.get('quote') === '1' && !already);
  const [issues, setIssues] = React.useState(offered.slice(0, 1));
  const [describe, setDescribe] = React.useState(requestDraft?.describe || defaultJobNote(offered));
  const [vehicle, setVehicle] = React.useState(requestDraft?.vehicle || (primary ? `${primary[0]} · ${primary[2]}` : '2021 Audi Q5 · 41,208 mi'));
  const [zip, setZip] = React.useState(requestDraft?.zip || HOME_POINT.zip);
  const [photos, setPhotos] = React.useState(requestDraft?.photos || []);
  const [mode, setMode] = React.useState(howOptions[0]?.value || 'mobile');
  const [windowId, setWindowId] = React.useState(requestDraft?.windowId || 'morning');
  const windowRow = TIME_WINDOWS.find((w) => w.id === windowId) || TIME_WINDOWS[0];
  const [slot, setSlot] = React.useState(requestDraft?.slot || windowRow.slots[0]);
  const [sent, setSent] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    const next = issuesForShop(p);
    setIssues((s) => {
      const keep = s.filter((i) => next.includes(i));
      return keep.length ? keep : next.slice(0, 1);
    });
    const opts = modeOptionsFor(p);
    if (opts.length === 1) setMode(opts[0].value);
  }, [p.id]);

  const skipWindowSlot = React.useRef(true);
  React.useEffect(() => {
    if (skipWindowSlot.current) {
      skipWindowSlot.current = false;
      return;
    }
    setSlot(windowRow.slots[0]);
  }, [windowId]);

  const toggle = (t) => {
    setDirty(true);
    setIssues((s) => (s.includes(t) ? (s.length > 1 ? s.filter((x) => x !== t) : s) : [...s, t]));
  };

  const persist = (extra = {}) => ({ issues, describe, vehicle, zip, photos, mode, windowId, when: `${windowRow.label} · ${slot}`, slot, ...extra });

  const send = async () => {
    setDirty(false);
    const payload = persist(session?.role === 'guest' ? { pendingSend: true } : {});
    saveDraft(payload);
    if ((session?.role || 'guest') === 'guest') {
      nav(`/signup/owner?next=${encodeURIComponent(`/provider/${p.id}?quote=1`)}`);
      return;
    }
    if (!await sendToShop(p, payload)) return;
    setSent(true);
    setOpen(false);
    nav('/match?view=quotes');
  };

  const openQuote = () => {
    if (already) return nav('/jobs');
    if ((session?.role || 'guest') === 'guest') {
      saveDraft(persist({ pendingSend: true }));
      nav(`/signup/owner?next=${encodeURIComponent(`/provider/${p.id}?quote=1`)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <PageCard>
      <NotchNav active="find" onDark />

      <header style={{ position: 'relative', height: 420, overflow: 'hidden', background: 'linear-gradient(155deg,#3A3B40,#17181B)', borderRadius: 0 }}>
        <div style={{ position: 'absolute', left: 56, bottom: 40, zIndex: 2 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ padding: '7px 12px', borderRadius: 14, background: 'var(--tv-accent)', font: '600 10.5px/1 var(--tv-mono)' }}>{p.pending ? 'IN REVIEW' : 'VETTED PROVIDER'}</span>
            <span style={{ padding: '7px 12px', borderRadius: 14, background: 'rgba(255,255,255,.14)', font: '600 10.5px/1 var(--tv-mono)', color: '#fff' }}>{p.mode.toUpperCase()}</span>
          </div>
          <h1 style={{ font: '600 62px/1 var(--tv-font)', letterSpacing: '-.04em', color: '#fff', margin: '20px 0 0' }}>{p.name}</h1>
          <div style={{ font: '400 15px/1 var(--tv-font)', color: 'rgba(255,255,255,.65)', marginTop: 16 }}>
            ★ {p.rating} · {p.jobCount} reviews · {p.area}
          </div>
        </div>
        <div style={{ position: 'absolute', right: 56, bottom: 40, display: 'flex', gap: 10, zIndex: 2 }}>
          <Pill variant="accent" onClick={openQuote}>
            {already ? 'Request sent' : copy.quoteBtn}
          </Pill>
          <Pill variant="ghost" onClick={() => nav(`/messages?shop=${p.id}`)}>{copy.messageBtn}</Pill>
        </div>
        <BleedFade dark />
      </header>

      <div style={{ display: 'flex', gap: 24, padding: '40px 56px 120px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <h2 className="tv-cardtitle" style={{ margin: 0 }}>{copy.aboutTitle}</h2>
            <p className="tv-body" style={{ marginTop: 14 }}>
              {p.note} Published labor rates, written prices held for 48 hours.
              {p.mode === 'Comes to you' ? ' This shop comes to you.' : ' Drop off at the shop; a loaner is offered where noted.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {offered.map((t) => (
                <span key={t} style={{
                  padding: '11px 15px', borderRadius: 'var(--tv-r-input)',
                  background: 'var(--tv-inverse)', color: 'var(--tv-inverse-text)',
                  font: '600 12.5px/1 var(--tv-font)',
                }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 34, marginTop: 24 }}>
              {[[p.rating, 'STAR RATING'], [p.jobCount, 'REVIEWS'], ['11 min', 'MEDIAN REPLY'], [p.zips?.length || 12, 'ZIP CODES']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ font: '600 24px/1 var(--tv-font)', letterSpacing: '-.02em' }}>{v}</div>
                  <Meta style={{ marginTop: 9 }}>{l}</Meta>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="tv-cardtitle" style={{ margin: 0 }}>Labor rates</h2>
              <span className="tv-data">WHAT THE SHOP CHARGES FOR TIME</span>
            </div>
            <div style={{ marginTop: 10 }}>
              {[
                ['Labor, standard', p.laborRate, 'BILLED IN 15 MINUTE INCREMENTS'],
                ['Diagnostic labor', '$120 flat', 'CREDITED BACK IF YOU BOOK THE REPAIR'],
                ['Trip charge inside the ring', 'None', 'TWIN CITIES ZIP CODES, NO TRIP FEE'],
              ].map(([n, v, m]) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                  <div>
                    <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{n}</div>
                    <div style={{ font: '400 10.5px/1 var(--tv-mono)', color: 'var(--tv-muted)', marginTop: 7 }}>{m}</div>
                  </div>
                  <div style={{ font: '600 16px/1 var(--tv-font)' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <MediaGallery />
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="tv-cardtitle" style={{ margin: 0 }}>What owners say</h2>
              <span className="tv-data">RATED ON THE FINAL INVOICE</span>
            </div>
            <div style={{ marginTop: 8 }}>
              {[
                ['Dana W. · Audi Q5', '★★★★★ · 3 WEEKS AGO', 'Showed up with the filter already on the van and sent photos of the old one.'],
                ['Theo R. · Ford F-150', '★★★★★ · LAST MONTH', 'Found a cracked serpentine belt, sent a photo and a price, waited for me to say yes.'],
                ['Priya S. · Tesla Model 3', '★★★★☆ · LAST MONTH', 'Ten minutes late but texted ahead. Cabin filter and rotation done in the garage.'],
              ].map(([n, m, b]) => (
                <div key={n} style={{ padding: '18px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                  <div style={{ font: '600 13px/1 var(--tv-font)' }}>{n}</div>
                  <div style={{ font: '400 10.5px/1 var(--tv-mono)', color: 'var(--tv-muted)', marginTop: 6 }}>{m}</div>
                  <p style={{ font: '400 14px/1.55 var(--tv-font)', color: 'var(--tv-body)', marginTop: 12 }}>{b}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ width: 372, flex: 'none', position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <Meta>YOUR JOB</Meta>
            <div style={{ font: '600 26px/1.1 var(--tv-font)', letterSpacing: '-.03em', marginTop: 14 }}>
              {(requestDraft?.issues || issues).join(', ')}
            </div>
            <p className="tv-small" style={{ marginTop: 12 }}>{vehicle} · {p.mode} · {p.area}</p>
            {sent || already ? (
              <>
                <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 10 }}>
                  Sent to {p.name}. The request is saved if you want another shop to see it.
                </p>
                <Link to="/find"><Pill variant="accent" style={{ width: '100%', marginTop: 18, padding: 16 }}>Send to another shop</Pill></Link>
                <Link to="/jobs" style={{ display: 'block', textAlign: 'center', marginTop: 12, font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>See my requests →</Link>
              </>
            ) : (
              <>
                <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 10 }}>
                  This goes only to {p.name.split(' ')[0]}. Nothing is charged until the work is done.
                </p>
                <Pill variant="ink" onClick={() => setOpen(true)} style={{ width: '100%', marginTop: 18, padding: 16 }}>Request this quote</Pill>
              </>
            )}
          </Card>
          <Card>
            <Meta>VETTED ON</Meta>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 14 }}>
              {['License and insurance verified', 'ASE-certified technicians', '$1M liability, OEM-grade parts', `${p.jobCount} invoices reviewed`].map((t) => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: 'var(--tv-inverse)', color: 'var(--tv-inverse-text)', font: '600 10px/18px var(--tv-font)', textAlign: 'center' }}>✓</span>
                  <span style={{ font: '400 13px/1 var(--tv-font)' }}>{t}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <Meta>SERVICE AREA</Meta>
            <div style={{ marginTop: 14 }}>
              <AreaMap height={180} radiusRing zoom={12} center={{ lat: p.lat, lng: p.lng }}
                pins={[{ id: p.id, label: p.name.split(' ')[0], lat: p.lat, lng: p.lng }]} activeId={p.id} />
            </div>
            <p className="tv-small" style={{ marginTop: 14 }}>{p.zips?.length || 12} zip codes around {p.area}. No trip fee inside the Twin Cities ring.</p>
          </Card>
        </div>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(16,17,19,.45)', display: 'grid', placeItems: 'center', padding: 32 }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: 720, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto',
            background: 'var(--tv-field)', borderRadius: 22, boxShadow: 'var(--tv-shadow-menu)', padding: 28,
          }}>
            <Meta>REQUEST FOR {p.name.toUpperCase()}</Meta>
            <div style={{ font: '600 22px/1.2 var(--tv-font)', marginTop: 12, letterSpacing: '-.02em' }}>Only this shop sees it.</div>
            <p className="tv-small" style={{ marginTop: 10 }}>
              Same details as Match with providers. Photos, time window, and only the work {p.name.split(' ')[0]} actually does.
            </p>
            <div style={{ marginTop: 18 }}>
              <JobRequestForm
                framed={false}
                issueOptions={offered}
                issues={issues}
                onToggleIssue={toggle}
                vehicle={vehicle}
                onVehicle={(v) => { setDirty(true); setVehicle(v); }}
                zip={zip}
                onZip={(v) => { setDirty(true); setZip(v); }}
                describe={describe}
                onDescribe={(v) => { setDirty(true); setDescribe(v); }}
                photos={photos}
                onAddPhoto={(src) => { setDirty(true); setPhotos((s) => [...s, src].slice(0, 3)); }}
                onRemovePhoto={(i) => setPhotos((s) => s.filter((_, n) => n !== i))}
                mode={mode}
                onMode={setMode}
                modeOptions={howOptions}
                windowId={windowId}
                onWindow={setWindowId}
                slot={slot}
                onSlot={setSlot}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <Pill variant="accent" onClick={send}>Send to {p.name.split(' ')[0]}</Pill>
              <Pill variant="surface" onClick={() => setOpen(false)}>Cancel</Pill>
            </div>
          </div>
        </div>
      )}
      <LeaveDraftGuard
        dirty={open && dirty}
        payload={() => persist()}
        allow={(path) => path.startsWith('/signup') || path.includes('view=quotes') || path.startsWith('/login')}
      />
      <SiteFooter />
    </PageCard>
  );
}
