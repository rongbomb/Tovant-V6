import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import CommunityStrip from '../components/CommunityStrip.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import BleedFade from '../components/BleedFade.jsx';
import { Card, Pill, PageCard, Placeholder } from '../components/primitives.jsx';
import { popularJobs } from '../data/mock.js';
import { marketCounts, tradeCount } from '../data/directory.js';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function Home() {
  const { site, shops, preview, setPreview, session } = useStore();
  const home = pageCopy(site, 'home');
  const counts = marketCounts(shops);
  const shownTrades = Object.entries(site.tradesOnHome || {}).filter(([, on]) => on);
  const tradeList = shownTrades.length
    ? shownTrades.map(([t]) => [t, tradeCount(t, shops)])
    : [];

  return (
    <PageCard>
      <NotchNav active="find" />
      {preview && (
        <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--tv-accent)', padding: '10px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: '600 12.5px/1 var(--tv-font)' }}>Previewing unpublished copy. This is not the live site.</span>
          <button onClick={() => setPreview(false)} style={{ border: 0, background: 'none', cursor: 'pointer', font: '600 12.5px/1 var(--tv-font)' }}>Exit preview</button>
        </div>
      )}

      <header style={{
        position: 'relative', height: 660,
        background: site.images.hero ? `center/cover url(${site.images.hero})` : 'linear-gradient(155deg,#DEDEE2,#BEBEC4)',
        overflow: 'hidden', borderRadius: 0,
      }}>
        {!site.images.hero && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', font: '400 11px/1 var(--tv-mono)', letterSpacing: '.14em', color: 'rgba(16,17,19,.28)' }}>
            HERO IMAGE PLACEHOLDER
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 430, background: 'linear-gradient(180deg,color-mix(in srgb, var(--tv-field) 90%) 0%,color-mix(in srgb, var(--tv-field) 55%) 55%,transparent 100%)' }} />
        <div style={{ position: 'absolute', left: 56, right: 56, top: 88, zIndex: 2 }}>
          <h1 className="tv-hero" style={{ margin: 0 }}>{(home.headline || site.headline).replace(', ', ',\n').split('\n').map((line, i) => (
            <React.Fragment key={i}>{i ? <br /> : null}{line}</React.Fragment>
          ))}</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 34, gap: 56 }}>
            <p className="tv-lead" style={{ maxWidth: 520, margin: 0 }}>{home.subhead || site.subhead}</p>
            <div style={{ display: 'flex', gap: 10, flex: 'none' }}>
              <Link to="/match"><Pill variant="accent" style={{ padding: '16px 24px' }}>{home.primaryBtn || site.primaryBtn}</Pill></Link>
              <Link to="/vetting"><Pill variant="surface" style={{ padding: '16px 24px' }}>{home.secondaryBtn || site.secondaryBtn}</Pill></Link>
            </div>
          </div>
        </div>
        <Link to="/find" className="tv-cardlink" style={{
          position: 'absolute', left: 56, bottom: 96, zIndex: 2,
          padding: '13px 18px', borderRadius: 22, background: 'var(--tv-inverse)',
          font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-inverse-text)',
        }}>
          {counts.pros} vetted pros, {counts.zips} zip codes
        </Link>
        <BleedFade />
      </header>

      <section style={{ padding: '54px 56px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 26 }}>
          <h2 className="tv-section" style={{ margin: 0 }}>{home.usualTitle}</h2>
          <span style={{ font: '400 13.5px/1 var(--tv-font)', color: 'var(--tv-muted)' }}>{home.usualSub}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
          {popularJobs.map(([name, meta]) => (
            <Link key={name} to={`/find?job=${encodeURIComponent(name)}`} className="tv-cardlink">
              <Card interactive pad={0} style={{ overflow: 'hidden' }}>
                <Placeholder style={{ height: 158, borderRadius: '0 0 22px 22px' }} />
                <div style={{ padding: '16px 18px 18px' }}>
                  <div style={{ font: '600 15px/1.2 var(--tv-font)' }}>{name}</div>
                  <div className="tv-data" style={{ marginTop: 8 }}>{meta}</div>
                </div>
              </Card>
            </Link>
          ))}
          <Link to="/match" className="tv-cardlink">
            <Card dark pad={20} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
              <div style={{ font: '600 17px/1.25 var(--tv-font)', color: '#fff' }}>{home.unsureTitle}</div>
              <div>
                <p style={{ font: '400 12.5px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.6)', margin: 0 }}>
                  {home.unsureBody}
                </p>
                <span style={{ display: 'inline-block', font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent)', marginTop: 14 }}>Describe it →</span>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <section style={{ padding: '0 56px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 26 }}>
          <h2 className="tv-section" style={{ margin: 0 }}>{home.tradesTitle}</h2>
          <span style={{ font: '400 13.5px/1 var(--tv-font)', color: 'var(--tv-muted)' }}>{home.tradesSub}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {tradeList.map(([t, n]) => (
            <Link key={t} to={`/find?trade=${encodeURIComponent(t)}`} className="tv-cardlink">
              <Card interactive pad="17px 19px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderRadius: 20 }}>
                <span style={{ font: '600 14px/1.2 var(--tv-font)' }}>{t}</span>
                <span className="tv-data" style={{ whiteSpace: 'nowrap' }}>{n} PROS</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <CommunityStrip />

      <section style={{ margin: '60px 56px 0' }}>
          <Card pad={46} style={{ borderRadius: 26, display: 'flex', alignItems: 'center', gap: 56 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ font: '600 36px/1.1 var(--tv-font)', letterSpacing: '-.035em', margin: 0, textWrap: 'balance' }}>{home.historyTitle}</h2>
            <p className="tv-body" style={{ marginTop: 18, maxWidth: 440 }}>
              {home.historyBody}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              {session?.role === 'owner' ? (
                <Link to="/history"><Pill variant="accent" style={{ boxShadow: 'none' }}>Open my history</Pill></Link>
              ) : (
                <Link to="/signup/owner"><Pill variant="accent" style={{ boxShadow: 'none' }}>Create an owner account</Pill></Link>
              )}
              <Link to="/jobs"><Pill variant="surface">My jobs</Pill></Link>
            </div>
          </div>
          <Placeholder label="SERVICE HISTORY" style={{ width: 300, height: 220, flex: 'none', borderRadius: 20 }} />
        </Card>
      </section>

      <SiteFooter />
    </PageCard>
  );
}
