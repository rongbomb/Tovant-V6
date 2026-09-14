import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Meta, Pill, Toggle, SectionTitle, Placeholder, PageCard } from '../components/primitives.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { PAGE_KEYS, PAGE_FIELDS, pageCopy } from '../data/siteCopy.js';
import { marketCounts, tradeCount } from '../data/directory.js';
import { useStore } from '../lib/store.jsx';

const RAIL = [
  ['content', '▤', 'Content'],
  ['verify', '◎', 'Verify'],
  ['catalog', '▦', 'Catalog'],
  ['log', '◔', 'Publish log'],
];

function Kpi({ label, value, sub }) {
  return (
    <Card pad={22} style={{ flex: 1 }}>
      <Meta>{label}</Meta>
      <div style={{ font: '600 28px/1 var(--tv-font)', letterSpacing: '-.03em', marginTop: 16 }}>{value}</div>
      <div style={{ font: '400 12px/1 var(--tv-font)', color: 'var(--tv-muted)', marginTop: 12 }}>{sub}</div>
    </Card>
  );
}

function TextBlock({ label, value, note, big, onChange }) {
  return (
    <div style={{ padding: 18, borderRadius: 18, background: 'var(--tv-field)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Meta>{label}</Meta>
        <span style={{ font: '400 9.5px/1 var(--tv-mono)', color: 'var(--tv-faint)' }}>{note}</span>
      </div>
      <textarea value={value} rows={big ? 2 : 3} onChange={(e) => onChange?.(e.target.value)} style={{
        width: '100%', marginTop: 11, padding: '14px 15px', borderRadius: 14, border: 0, resize: 'none',
        background: 'var(--tv-surface)', boxShadow: 'inset 0 0 0 1px rgba(16,17,19,.07)',
        font: big ? '600 19px/1.25 var(--tv-font)' : '400 13.5px/1.5 var(--tv-font)',
        color: 'var(--tv-ink)', outline: 'none',
      }} />
    </div>
  );
}

function ImageSlot({ label, dims, src, onReplace }) {
  const ref = React.useRef(null);
  return (
    <div style={{ padding: 14, borderRadius: 18, background: 'var(--tv-field)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Meta>{label}</Meta>
        <span style={{ font: '400 9.5px/1 var(--tv-mono)', color: 'var(--tv-faint)' }}>{dims}</span>
      </div>
      {src
        ? <img src={src} alt="" style={{ height: 104, width: '100%', objectFit: 'cover', borderRadius: 14, marginTop: 11 }} />
        : <Placeholder label="DROP AN IMAGE" style={{ height: 104, borderRadius: 14, marginTop: 11 }} />}
      <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onReplace(reader.result);
          reader.readAsDataURL(file);
        }} />
        <Pill variant="ink" onClick={() => ref.current?.click()} style={{ padding: '9px 13px', borderRadius: 14, fontSize: 11.5, boxShadow: 'none' }}>Replace</Pill>
        {src && <Pill variant="surface" onClick={() => onReplace('')} style={{ padding: '9px 13px', borderRadius: 14, fontSize: 11.5, background: 'var(--tv-rail)', boxShadow: 'none', color: 'var(--tv-body)' }}>Clear</Pill>}
      </div>
    </div>
  );
}

export default function Admin() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') || 'content';
  const setView = (v) => setParams(v === 'content' ? {} : { view: v });
  const {
    state, draft, shops, unpublishedCount, setDraft, setPageCopy, publish, discardDraft, setPreview,
    decideCredential, addTrade, setTradeOnHome, revertPublish,
  } = useStore();
  const [page, setPage] = React.useState('Home');
  const pageId = PAGE_KEYS.find(([t]) => t === page)?.[1] || 'home';
  const pageFields = PAGE_FIELDS[pageId] || [];
  const pageVals = pageCopy(draft, pageId);
  const [newTrade, setNewTrade] = React.useState('');
  const counts = marketCounts(shops);
  const dirty = unpublishedCount();
  const pending = state.verifyQueue.filter((v) => v.state === 'submitted' || v.state === 'in_review');

  return (
    <PageCard flex clip>
      <nav style={{ width: 76, flex: 'none', background: 'var(--tv-rail)', padding: '26px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: 'inset -1px 0 0 rgba(16,17,19,.06)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--tv-inverse)', display: 'grid', placeItems: 'center', font: '600 15px/1 var(--tv-font)', color: 'var(--tv-accent)', marginBottom: 14 }}>T</div>
        {RAIL.map(([id, g, label]) => (
          <button key={id} title={label} aria-label={label} aria-pressed={view === id} onClick={() => setView(id)} style={{
            width: 44, height: 44, borderRadius: 14, border: 0, cursor: 'pointer',
            background: view === id ? 'var(--tv-inverse)' : 'transparent',
            color: view === id ? 'var(--tv-inverse-text)' : '#9A9DA4', font: '400 16px/1 var(--tv-font)',
          }}>{g}</button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: '30px 34px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Meta>SITE ADMIN</Meta>
            <h1 className="tv-dashtitle" style={{ margin: '14px 0 0' }}>
              {view === 'verify' ? 'Verification queue' : view === 'catalog' ? 'Trade catalog' : view === 'log' ? 'Publish log' : 'Content and images'}
            </h1>
            <p className="tv-small" style={{ color: 'var(--tv-muted)', marginTop: 10 }}>
              {dirty ? `${dirty} unpublished change${dirty === 1 ? '' : 's'}` : 'Live site matches the last publish'}
            </p>
          </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <ThemeToggle />
            <Pill variant="surface" onClick={() => { setPreview(false); nav('/'); }}>View live site</Pill>
            <Pill variant="accent" onClick={publish}>Publish changes</Pill>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
          <Kpi label="PAGES" value={String(PAGE_KEYS.length)} sub="Every public page is editable" />
          <Kpi label="DRAFT EDITS" value={String(dirty)} sub={dirty ? 'Waiting on publish' : 'Nothing pending'} />
          <Kpi label="TRADE CATEGORIES" value={String(Object.keys(draft.tradesOnHome || {}).length)} sub={`${counts.pros} pros mapped`} />
          <Kpi label="VERIFY QUEUE" value={String(pending.length)} sub="Manual review only" />
        </div>

        {view === 'content' && (
          <div style={{ display: 'flex', gap: 20, marginTop: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 236, flex: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Meta>PAGES</Meta>
              {PAGE_KEYS.map(([t, , meta]) => {
                const on = page === t;
                return (
                  <Card key={t} interactive pad="13px 15px" onClick={() => setPage(t)}
                    style={{ borderRadius: 'var(--tv-r-input)', background: on ? 'var(--tv-inverse)' : 'var(--tv-surface)', boxShadow: on ? 'none' : 'var(--tv-shadow)' }}>
                    <div style={{ font: '600 13px/1.2 var(--tv-font)', color: on ? 'var(--tv-inverse-text)' : 'var(--tv-ink)' }}>{t}</div>
                    <div style={{ font: '400 9.5px/1 var(--tv-mono)', letterSpacing: '.1em', color: on ? 'rgba(255,255,255,.5)' : 'var(--tv-faint)', marginTop: 8 }}>{meta}</div>
                  </Card>
                );
              })}
              <Card dark pad={18}>
                <div style={{ font: '600 13px/1.3 var(--tv-font)', color: '#fff' }}>Careful with the hero</div>
                <p style={{ font: '400 12px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.6)', margin: '9px 0 0' }}>
                  This copy is the first thing every visitor reads. Changes go through review before publish.
                </p>
              </Card>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card>
                <SectionTitle right={dirty ? 'UNPUBLISHED' : 'IN SYNC'}>{page} · copy</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  {pageFields.map(([key, label, big]) => (
                    <TextBlock key={key} label={label} note="DRAFT" big={!!big}
                      value={pageVals[key] || ''} onChange={(v) => setPageCopy(pageId, key, v)} />
                  ))}
                  {pageId === 'home' && (
                    <TextBlock label="HERO BADGE" note="LIVE COUNT" value={`${counts.pros} vetted pros, ${counts.zips} zip codes`} />
                  )}
                </div>
              </Card>

              {pageId === 'home' && (
                <Card>
                  <SectionTitle right="2 SLOTS">Home · images</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
                    <ImageSlot label="HERO IMAGE" dims="2560 × 1320" src={draft.images?.hero}
                      onReplace={(src) => setDraft({ images: { ...draft.images, hero: src } })} />
                    <ImageSlot label="COMMUNITY ROW · TILE 1" dims="520 × 340" src={draft.images?.community}
                      onReplace={(src) => setDraft({ images: { ...draft.images, community: src } })} />
                  </div>
                </Card>
              )}

              <Card>
                <SectionTitle>Global text</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <TextBlock label="FOOTER TAGLINE" note="DRAFT" value={draft.footer} onChange={(v) => setDraft({ footer: v })} />
                  <TextBlock label="QUOTE DISCLAIMER" note="DRAFT" value={draft.quoteDisclaimer} onChange={(v) => setDraft({ quoteDisclaimer: v })} />
                  <TextBlock label="PAYMENT NOTE" note="DRAFT" value={draft.paymentNote} onChange={(v) => setDraft({ paymentNote: v })} />
                </div>
              </Card>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Pill variant="accent" onClick={publish}>Publish {dirty || 0} changes</Pill>
                <Pill variant="surface" onClick={() => { setPreview(true); nav('/'); }}>Preview as a visitor</Pill>
                <Pill variant="surface" onClick={discardDraft}>Discard draft</Pill>
                <span className="tv-small" style={{ color: 'var(--tv-muted)', marginLeft: 6 }}>Publishing is logged and reversible for 30 days</span>
              </div>
            </div>
          </div>
        )}

        {view === 'catalog' && (
          <Card style={{ marginTop: 20 }}>
            <SectionTitle right="SHOWN ON THE HOME PAGE AND IN FILTERS">Trade categories</SectionTitle>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                {['TRADE', 'PROS', 'ON HOME'].map((h, i) => (
                  <div key={h} style={{ ...(i === 0 ? { flex: 1 } : { width: 88, flex: 'none' }), font: '600 9.5px/1 var(--tv-mono)', letterSpacing: '.1em', color: 'var(--tv-faint)' }}>{h}</div>
                ))}
              </div>
              {Object.keys(draft.tradesOnHome || {}).map((t) => (
                <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                  <div style={{ flex: 1, font: '600 13.5px/1 var(--tv-font)' }}>{t}</div>
                  <div style={{ width: 88, flex: 'none', font: '400 12px/1 var(--tv-mono)', color: 'var(--tv-muted)' }}>{tradeCount(t, shops)}</div>
                  <div style={{ width: 88, flex: 'none' }}>
                    <Toggle small on={!!draft.tradesOnHome[t]} onChange={(v) => setTradeOnHome(t, v)} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
              <input value={newTrade} onChange={(e) => setNewTrade(e.target.value)} placeholder="New trade name"
                style={{ padding: '12px 14px', border: 0, borderRadius: 13, background: 'var(--tv-inset)', font: '600 13.5px/1 var(--tv-font)', outline: 'none', width: 240 }} />
              <Pill variant="ink" onClick={() => { if (newTrade.trim()) { addTrade(newTrade.trim()); setNewTrade(''); } }}>Add a trade</Pill>
            </div>
          </Card>
        )}

        {view === 'verify' && (
          <Card style={{ marginTop: 20 }} pad={0}>
            <div style={{ padding: '20px 20px 8px' }}>
              <SectionTitle right="MANUAL REVIEW">Credentials</SectionTitle>
              <p className="tv-small" style={{ marginTop: 10 }}>Only staff can mark verified or rejected. Providers cannot write those states.</p>
            </div>
            {state.verifyQueue.map((v) => (
              <div key={v.id} style={{ padding: '16px 20px', borderTop: '1px solid var(--tv-hairline)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '600 14.5px/1.2 var(--tv-font)' }}>{v.shop}</div>
                    <div className="tv-data" style={{ marginTop: 6 }}>{v.credential.replaceAll('_', ' ').toUpperCase()} · {v.detail}</div>
                    <div className="tv-small" style={{ marginTop: 8 }}>Submitted {v.submitted}{v.reason ? ` · ${v.reason}` : ''}</div>
                  </div>
                  <span style={{ padding: '6px 10px', borderRadius: 12, background: 'var(--tv-inset)', font: '600 10px/1 var(--tv-mono)' }}>{v.state.replaceAll('_', ' ').toUpperCase()}</span>
                  {(v.state === 'submitted' || v.state === 'in_review') && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Pill variant="surface" onClick={() => decideCredential(v.id, 'rejected', 'Does not meet the requirement')} style={{ padding: '10px 14px', borderRadius: 16, fontSize: 12, boxShadow: 'none' }}>Reject</Pill>
                      <Pill variant="ink" onClick={() => decideCredential(v.id, 'verified')} style={{ padding: '10px 14px', borderRadius: 16, fontSize: 12, boxShadow: 'none' }}>Verify</Pill>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}

        {view === 'log' && (
          <Card style={{ marginTop: 20 }}>
            <SectionTitle>Publishes</SectionTitle>
            {state.publishLog.map((row, i) => (
              <div key={row.at} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                <div>
                  <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{row.note}</div>
                  <div className="tv-data" style={{ marginTop: 6 }}>{row.by} · {new Date(row.at).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {i === 0 && <span className="tv-data">CURRENT</span>}
                  {i > 0 && row.snapshot && (
                    <Pill variant="surface" onClick={() => revertPublish(row.at)} style={{ padding: '9px 13px', borderRadius: 14, fontSize: 11.5 }}>Revert</Pill>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </main>
    </PageCard>
  );
}
