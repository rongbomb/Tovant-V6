import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { useStore } from '../lib/store.jsx';
import { ago, rateOk } from '../lib/consent.js';

export default function Messages() {
  const [params] = useSearchParams();
  const {
    shops, messages, sendMessage, session, blocked, blockUser, unblockUser, markThreadRead,
  } = useStore();
  const role = session?.role || 'guest';
  const fromQuery = params.get('shop') || '';
  const mine = (messages || []).filter((t) => {
    if ((blocked || []).includes(t.id)) return true;
    if (role === 'provider') return t.shopId === session.shopId;
    return true;
  });
  const [active, setActive] = React.useState(fromQuery || mine[0]?.id || '');
  const [draft, setDraft] = React.useState('');
  const [err, setErr] = React.useState('');
  const [askBlock, setAskBlock] = React.useState(false);
  const shop = shops.find((s) => s.id === active);
  const thread = mine.find((t) => t.id === active);
  const isBlocked = (blocked || []).includes(active);
  const lines = thread?.lines || [];
  const title = role === 'provider' ? (thread?.peer || 'Owner') : (shop?.name || thread?.shop || 'Shop');
  const end = React.useRef(null);

  React.useEffect(() => {
    if (fromQuery) setActive(mine.find(t=>t.id===fromQuery||t.shopId===fromQuery)?.id||fromQuery);
  }, [fromQuery]);

  React.useEffect(() => {
    setDraft('');setErr('');if (active) markThreadRead(active);
  }, [active]);

  React.useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [lines.length, active]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    if (!rateOk(`msg:${session.email || 'anon'}`, 8, 60000)) {
      return setErr('Wait a minute before sending more notes. This keeps shops from getting flooded.');
    }
    const result = await sendMessage(
      active,
      shop?.name || thread?.shop || 'Shop',
      draft.trim(),
      role === 'provider' ? 'shop' : 'owner',
      role === 'provider' ? thread?.peer : session.name,
    );
    if (!result.ok) return setErr(result.error);
    setDraft('');
    setErr('');
  };

  return (
    <PageCard>
      <NotchNav active="mid" />
      <div style={{ padding: '72px 56px 52px' }}>
        <Meta>MESSAGES</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>Notes stay on the job</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          Quotes and approvals live with the request. Use this thread for windows, photos, and gate notes.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 32, alignItems: 'stretch', minHeight: 520 }}>
          <Card pad={12} style={{ width: 280, flex: 'none' }}>
            <Meta style={{ padding: '10px 12px 6px' }}>{role === 'provider' ? 'OWNERS' : 'SHOPS'}</Meta>
            {mine.length === 0 && (
              <p className="tv-small" style={{ padding: '12px' }}>No threads yet. Message a shop from their page.</p>
            )}
            {mine.map((t) => {
              const last = t.lines?.[t.lines.length - 1];
              const on = active === t.id;
              const unread = role === 'provider' ? t.unread === 'shop' : t.unread === 'owner';
              return (
                <button key={t.id} type="button" onClick={() => setActive(t.id)} style={{
                  width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', minHeight: 64,
                  padding: '12px', borderRadius: 14, marginBottom: 4,
                  background: on ? 'var(--tv-inverse)' : 'transparent',
                  color: on ? 'var(--tv-inverse-text)' : 'var(--tv-ink)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ font: '600 13px/1.3 var(--tv-font)' }}>
                      {role === 'provider' ? t.peer || 'Owner' : t.shop}
                    </div>
                    {unread && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#C83A2A', flex: 'none', marginTop: 4 }} />}
                  </div>
                  <div style={{ font: '400 12px/1.35 var(--tv-font)', opacity: .7, marginTop: 6 }}>
                    {(last?.body || 'No notes yet').slice(0, 48)}
                  </div>
                </button>
              );
            })}
          </Card>

          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {!active && (
              <p className="tv-small">Pick a thread, or open Message the shop on a profile.</p>
            )}
            {active && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{title}</div>
                    <div className="tv-data" style={{ marginTop: 8 }}>
                      {shop?.area?.toUpperCase() || 'TWIN CITIES'} · {isBlocked ? 'BLOCKED' : 'OPEN THREAD'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flex: 'none' }}>
                    {shop && role !== 'provider' && (
                      <Link to={`/provider/${shop.id}`} style={{ font: '600 12.5px/44px var(--tv-font)', color: 'var(--tv-accent-link)' }}>View shop</Link>
                    )}
                    {isBlocked
                      ? <Pill variant="surface" onClick={() => unblockUser(active)}>Unblock</Pill>
                      : <Pill variant="surface" onClick={() => setAskBlock(true)}>Block</Pill>}
                  </div>
                </div>
                {askBlock && !isBlocked && (
                  <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: 'var(--tv-inset)' }}>
                    <p className="tv-small">They will not see new notes from you. You can unblock later. This is not a police report.</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <Pill variant="ink" onClick={() => { blockUser(active); setAskBlock(false); }}>Block this thread</Pill>
                      <Pill variant="surface" onClick={() => setAskBlock(false)}>Keep the thread</Pill>
                    </div>
                  </div>
                )}
                <div style={{ flex: 1, marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto', maxHeight: 340 }}>
                  {lines.length === 0 && (
                    <p className="tv-small">No notes yet. Ask about the window, the bay, or send a photo caption.</p>
                  )}
                  {lines.map((l, i) => {
                    const mineLine = (role === 'provider' && l.from === 'shop') || (role !== 'provider' && l.from === 'owner');
                    return (
                      <div key={`${l.at}-${i}`} style={{
                        alignSelf: mineLine ? 'flex-end' : 'flex-start',
                        maxWidth: '78%', padding: '12px 14px', borderRadius: 16,
                        background: mineLine ? 'var(--tv-inverse)' : 'var(--tv-inset)',
                        color: mineLine ? 'var(--tv-inverse-text)' : 'var(--tv-ink)',
                        font: '400 13.5px/1.45 var(--tv-font)',
                      }}>
                        <div>{l.body}</div>
                        <div className="tv-data" style={{ marginTop: 8, color: mineLine ? 'rgba(255,255,255,.45)' : undefined }}>{ago(l.at)}</div>
                      </div>
                    );
                  })}
                  <div ref={end} />
                </div>
                {isBlocked ? (
                  <p className="tv-small" style={{ marginTop: 18 }}>This thread is blocked. Unblock to write again.</p>
                ) : (
                  <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'flex-end' }}>
                    <label style={{ flex: 1 }}>
                      <Meta>WRITE A NOTE</Meta>
                      <textarea
                        aria-label="WRITE A NOTE"
                        value={draft}
                        rows={2}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Ask about the window or send a photo note"
                        style={{
                          width: '100%', marginTop: 10, padding: '14px 16px', border: 0, minHeight: 48,
                          borderRadius: 16, background: 'var(--tv-inset)', color: 'var(--tv-ink)',
                          font: '400 14px/1.45 var(--tv-font)', resize: 'none', outline: 'none',
                        }}
                      />
                    </label>
                    <Pill variant="accent" onClick={send} style={{ minHeight: 48, padding: '16px 22px' }}>Send message</Pill>
                  </div>
                )}
                {err && <p className="tv-small" style={{ marginTop: 10 }}>{err}</p>}
              </>
            )}
          </Card>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
