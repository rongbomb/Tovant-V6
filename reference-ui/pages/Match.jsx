import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import StepBar from '../components/StepBar.jsx';
import LeaveDraftGuard from '../components/LeaveDraftGuard.jsx';
import JobRequestForm from '../components/JobRequestForm.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, Chip, PageCard } from '../components/primitives.jsx';
import { matchSteps } from '../data/mock.js';
import {
  HOME_POINT, pickMatches, TIME_WINDOWS, issuesForShop, modeOptionsFor,
  MATCH_CATEGORIES, categoryForService, servicesForCategory, defaultJobNote,
} from '../data/directory.js';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function Match() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const onlyId = params.get('provider') || '';
  const {
    shops, saveDraft, saveNamedDraft, sendToShops, requestDraft, session, ownerRequests, bookRequest, state, site, matchLoad,
  } = useStore();
  const copy = pageCopy(site, 'match');
  const only = shops.find((p) => p.id === onlyId);
  const owner = state.owner;
  const primary = (owner?.vehicles || []).find((v) => v[3]) || owner?.vehicles?.[0];
  const categories = only ? [] : MATCH_CATEGORIES;
  const howOptions = modeOptionsFor(only);
  const [step, setStep] = React.useState(params.get('view') === 'quotes' ? 2 : 0);
  const [categoryId, setCategoryId] = React.useState(() => {
    if (only) return '';
    const fromDraft = requestDraft?.categoryId;
    if (fromDraft) return fromDraft;
    const inferred = categoryForService(requestDraft?.issues?.[0]);
    return inferred?.id || 'repairs';
  });
  const issueOptions = only
    ? issuesForShop(only)
    : categoryId === 'unsure'
      ? []
      : servicesForCategory(categoryId);
  const [issues, setIssues] = React.useState(() => {
    if (only) return issuesForShop(only).slice(0, 1);
    if (categoryId === 'unsure') return ['Not sure yet'];
    const offered = servicesForCategory(categoryId);
    const keep = (requestDraft?.issues || []).filter((i) => offered.includes(i));
    return keep.length ? keep : offered.slice(0, 1);
  });
  const [mode, setMode] = React.useState(() => howOptions[0]?.value || 'mobile');
  const [windowId, setWindowId] = React.useState('morning');
  const windowRow = TIME_WINDOWS.find((w) => w.id === windowId) || TIME_WINDOWS[0];
  const [slot, setSlot] = React.useState(windowRow.slots[0]);
  const [describe, setDescribe] = React.useState(() => defaultJobNote(issues));
  const [count, setCount] = React.useState('3 pros');
  const [draftNote, setDraftNote] = React.useState('');
  const [vehicle, setVehicle] = React.useState(primary ? `${primary[0]} · ${primary[2]}` : '2021 Audi Q5 · 41,208 mi');
  const [zip, setZip] = React.useState(HOME_POINT.zip);
  const [photos, setPhotos] = React.useState([]);
  const [dirty, setDirty] = React.useState(false);
  const issueLine = issues.join(', ');
  const cap = count === 'Everyone in range' ? 99 : count === '5 pros' ? 5 : 3;
  const slate = only ? [only] : pickMatches(issues, shops, { mode, cap, load: matchLoad });

  const skipWindowSlot = React.useRef(true);
  React.useEffect(() => {
    if (skipWindowSlot.current) {
      skipWindowSlot.current = false;
      return;
    }
    setSlot(windowRow.slots[0]);
  }, [windowId]);

  React.useEffect(() => {
    if (!requestDraft) return;
    if (requestDraft.categoryId) setCategoryId(requestDraft.categoryId);
    else if (requestDraft.issues?.length) {
      const inferred = categoryForService(requestDraft.issues[0]);
      if (inferred) setCategoryId(inferred.id);
    }
    if (requestDraft.issues) {
      const offered = only ? issuesForShop(only) : (
        requestDraft.categoryId === 'unsure' || requestDraft.issues.includes('Not sure yet')
          ? ['Not sure yet']
          : servicesForCategory(requestDraft.categoryId || categoryForService(requestDraft.issues[0])?.id)
      );
      const keep = requestDraft.issues.filter((i) => offered.includes(i) || i === 'Not sure yet');
      setIssues(keep.length ? keep : offered.slice(0, 1));
    }
    if (requestDraft.mode) setMode(requestDraft.mode);
    if (requestDraft.describe) setDescribe(requestDraft.describe);
    if (requestDraft.windowId) setWindowId(requestDraft.windowId);
    if (requestDraft.slot) setSlot(requestDraft.slot);
    if (requestDraft.vehicle) setVehicle(requestDraft.vehicle);
    if (requestDraft.zip) setZip(requestDraft.zip);
    if (requestDraft.photos) setPhotos(requestDraft.photos);
    if (requestDraft.sentTo?.length && params.get('view') !== 'edit') setStep(2);
  }, []);

  React.useEffect(() => {
    if (only) {
      const offered = issuesForShop(only);
      setIssues((s) => {
        const keep = s.filter((i) => offered.includes(i));
        return keep.length ? keep : offered.slice(0, 1);
      });
    }
    const opts = modeOptionsFor(only);
    if (opts.length === 1) setMode(opts[0].value);
  }, [only?.id]);

  const selectCategory = (id) => {
    setDirty(true);
    setCategoryId(id);
    if (id === 'unsure') {
      setIssues(['Not sure yet']);
      setDescribe(defaultJobNote(['Not sure yet']));
      return;
    }
    const offered = servicesForCategory(id);
    setIssues(offered.slice(0, 1));
    setDescribe(defaultJobNote(offered.slice(0, 1)));
  };

  const persist = (extra = {}) => ({
    issues, categoryId, mode, describe, windowId,
    when: `${windowRow.label} · ${slot}`, slot, count, vehicle, zip, photos, ...extra,
  });

  const send = async () => {
    if (!only && !categoryId) return;
    if (!only && categoryId !== 'unsure' && !issues.length) return;
    setDirty(false);
    const payload = persist(session?.role === 'guest' ? { pendingSend: true } : {});
    saveDraft(payload);
    if ((session?.role || 'guest') === 'guest') {
      nav(`/signup/owner?next=${encodeURIComponent(only ? `/match?provider=${only.id}` : '/match')}`);
      return;
    }
    if (!await sendToShops(slate, payload)) return;
    setStep(2);
    nav('/match?view=quotes');
  };

  const toggleIssue = (t) => {
    setDirty(true);
    if (t === 'Not sure yet') return setIssues(['Not sure yet']);
    setIssues((s) => {
      const next = s.filter((x) => x !== 'Not sure yet');
      return next.includes(t) ? (next.length > 1 ? next.filter((x) => x !== t) : next) : [...next, t];
    });
  };

  const mine = ownerRequests.filter((r) => (requestDraft?.sentTo || []).includes(r.shopId) || slate.some((p) => p.id === r.shopId));
  const quoted = mine.filter((r) => r.status === 'quoted');
  const waiting = mine.filter((r) => r.status === 'open');
  const passed = mine.filter((r) => r.status === 'passed');

  if (step >= 2) {
    return (
      <PageCard>
        <NotchNav active="find" />
        <div style={{ padding: '72px 56px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40 }}>
            <div>
              <Meta>MATCH WITH PROVIDERS</Meta>
              <h1 className="tv-title" style={{ margin: '16px 0 0' }}>
                {quoted.length
                  ? `${quoted.length} written price${quoted.length === 1 ? '' : 's'} in. You pick from the price.`
                  : waiting.length
                    ? `Sent. ${waiting.length === 1 ? 'That shop is' : `${waiting.length} shops are`} reading the job now.`
                    : 'Request sent. Nothing is charged until the work is done.'}
              </h1>
              <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
                {issueLine} on {vehicle}, {mode === 'mobile' ? 'mobile' : 'drop off'}, {windowRow.label.toLowerCase()}.
                A shop answers with a written price and what it covers. Held for 48 hours. You book from the price, not from the listing.
              </p>
            </div>
            <div style={{ flex: 'none', display: 'flex', gap: 10 }}>
              <Pill variant="surface" onClick={() => { setStep(0); nav('/match?view=edit'); }}>Edit the request</Pill>
              <Link to="/find"><Pill variant="ink">Ask another shop</Pill></Link>
            </div>
          </div>
          <div style={{ marginTop: 32 }}><StepBar step={2} labels={matchSteps} onStep={(i) => i < 2 && setStep(i)} /></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32, maxWidth: 760 }}>
            {quoted.map((r) => {
              const p = shops.find((s) => s.id === r.shopId);
              return (
                <Card key={r.id} pad={22}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ font: '600 19px/1.15 var(--tv-font)' }}>{r.shop || p?.name}</div>
                      <div className="tv-data" style={{ marginTop: 10 }}>
                        ★ {p?.rating || '—'} · {p?.distance} MI · {p?.area?.toUpperCase()} · HELD 48 HOURS
                      </div>
                      <p className="tv-small" style={{ marginTop: 12 }}>{r.note || p?.note}</p>
                    </div>
                    <div className="tv-price">${r.price}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {r.shopId && <Pill variant="surface" onClick={() => nav(`/messages?shop=${r.shopId}`)}>Message</Pill>}
                    <Pill variant="accent" onClick={async() => { if(await bookRequest(r.id, { slot }))nav('/booked'); }}>Book this price</Pill>
                  </div>
                </Card>
              );
            })}
            {waiting.map((r) => {
              const p = shops.find((s) => s.id === r.shopId);
              return (
                <Card key={r.id} pad={22}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ font: '600 17px/1.2 var(--tv-font)' }}>{r.shop || p?.name}</div>
                      <p className="tv-small" style={{ marginTop: 10 }}>Reading the request. A written price lands here when they send it.</p>
                    </div>
                    <span className="tv-data">STILL READING</span>
                  </div>
                  {r.shopId && (
                    <Pill variant="surface" onClick={() => nav(`/messages?shop=${r.shopId}`)} style={{ marginTop: 14 }}>Message</Pill>
                  )}
                </Card>
              );
            })}
            {passed.map((r) => (
              <Card key={r.id} pad={22}>
                <div style={{ font: '600 17px/1.2 var(--tv-font)' }}>{r.shop}</div>
                <p className="tv-small" style={{ marginTop: 10 }}>This shop passed. The request is still live with the others.</p>
              </Card>
            ))}
            {mine.length === 0 && (
              <Card pad={28}>
                <div style={{ font: '600 16px/1.3 var(--tv-font)' }}>Nothing sent yet</div>
                <p className="tv-small" style={{ marginTop: 10 }}>Describe the job and match. Shops only appear here after they receive the request.</p>
                <Pill variant="accent" onClick={() => setStep(0)} style={{ marginTop: 18 }}>Describe the job</Pill>
              </Card>
            )}
          </div>
        </div>
        <SiteFooter />
      </PageCard>
    );
  }

  return (
    <PageCard>
      <NotchNav active="find" />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>MATCH WITH PROVIDERS</Meta>
        <h1 className="tv-h1" style={{ margin: '16px 0 0', maxWidth: 720 }}>
          {only ? `Send this job to ${only.name}.` : copy.headline}
        </h1>
        <p style={{ font: '400 16px/1.55 var(--tv-font)', color: 'var(--tv-body)', marginTop: 18, maxWidth: 620 }}>
          {only
            ? 'This request goes only to this shop. They send a written price. You book from that price.'
            : copy.lead}
        </p>

        <div style={{ marginTop: 34 }}><StepBar step={0} labels={matchSteps} onStep={setStep} /></div>

        <div style={{ display: 'flex', gap: 24, marginTop: 34, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <JobRequestForm
              categories={categories}
              categoryId={categoryId}
              onCategory={selectCategory}
              issueOptions={issueOptions}
              issues={issues}
              onToggleIssue={toggleIssue}
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
              onMode={(v) => { setDirty(true); setMode(v); }}
              modeOptions={howOptions}
              windowId={windowId}
              onWindow={(v) => { setDirty(true); setWindowId(v); }}
              slot={slot}
              onSlot={(v) => { setDirty(true); setSlot(v); }}
            />

            {!only && (
              <Card>
                <Meta>HOW MANY PROS SHOULD ANSWER</Meta>
                <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
                  {['3 pros', '5 pros', 'Everyone in range'].map((c) => <Chip key={c} on={count === c} onClick={() => { setDirty(true); setCount(c); }}>{c}</Chip>)}
                </div>
              </Card>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Pill variant="accent" onClick={send}>{only ? `Send to ${only.name.split(' ')[0]}` : 'Match me with pros'}</Pill>
              <Pill variant="surface" onClick={() => { setDirty(false); saveNamedDraft(persist()); setDraftNote('Saved to Drafts'); }}>Save as a draft</Pill>
              <span className="tv-small" style={{ color: 'var(--tv-muted)' }}>
                {draftNote || 'Free to ask. Nothing is charged until the work is done.'}
              </span>
            </div>
          </div>

          <div style={{ width: 372, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Meta>WHO WILL SEE THIS</Meta>
              <div style={{ font: '600 26px/1.1 var(--tv-font)', letterSpacing: '-.03em', marginTop: 14 }}>
                {only ? only.name : `${slate.length} pro${slate.length === 1 ? '' : 's'} in range`}
              </div>
              <p className="tv-small" style={{ marginTop: 12 }}>
                {only
                  ? 'Only this shop. After you send, you can reuse the request for someone else.'
                  : `A fair slate for ${issueLine.toLowerCase()} within 12 miles of ${zip}: closest, highest rated, and a rising shop that has not had the last few jobs.`}
              </p>
              {!only && slate.map((p) => (
                <div key={p.id} className="tv-data" style={{ marginTop: 8 }}>{p.name.toUpperCase()} · {p.distance} MI · {(p.matchRole || p.mode).toUpperCase()}</div>
              ))}
            </Card>
            <Card>
              <Meta>WHAT HAPPENS NEXT</Meta>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                {[
                  [copy.next1Title, copy.next1Body],
                  [copy.next2Title, copy.next2Body],
                  [copy.next3Title, copy.next3Body],
                ].map(([t, b], i) => (
                  <div key={t} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, flex: 'none', background: 'var(--tv-inverse)', color: 'var(--tv-inverse-text)', font: '600 10.5px/24px var(--tv-mono)', textAlign: 'center' }}>{i + 1}</span>
                    <div>
                      <div style={{ font: '600 13.5px/1.25 var(--tv-font)' }}>{t}</div>
                      <div style={{ font: '400 12.5px/1.5 var(--tv-font)', color: 'var(--tv-muted)', marginTop: 6 }}>{b}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <LeaveDraftGuard
        dirty={dirty && step === 0}
        payload={() => persist()}
        allow={(path) => path.startsWith('/signup') || path.includes('view=quotes') || path.startsWith('/login')}
      />
      <SiteFooter />
    </PageCard>
  );
}
