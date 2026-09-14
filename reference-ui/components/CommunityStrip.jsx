import React from 'react';
import { Link } from 'react-router-dom';
import { communityRowA, communityRowB } from '../data/mock.js';
import { useStore } from '../lib/store.jsx';

/**
 * Two rows of community photos scrolling in opposite directions (58s and 66s,
 * linear, infinite). Each row renders its tiles TWICE and animates to -50%, so
 * the loop is seamless. The wrapper is masked at both edges.
 * Tiles are 230px tall, widths vary per tile, caption sits in a bottom scrim.
 */
function Tile({ caption, width, src }) {
  return (
    <div style={{ flex: 'none', width }}>
      <div style={{ position: 'relative', height: 230, borderRadius: 20, overflow: 'hidden', background: 'var(--tv-placeholder)', boxShadow: 'var(--tv-shadow)' }}>
        {src
          ? <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', font: '400 9.5px/1 var(--tv-mono)', letterSpacing: '.1em', color: '#9A9DA4' }}>
          COMMUNITY PHOTO
        </div>
          )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(180deg,rgba(16,17,19,0),rgba(16,17,19,.72))' }}>
          <div style={{ font: '600 11.5px/1 var(--tv-font)', color: '#fff' }}>{caption}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ items, duration, reverse, heroSrc }) {
  return (
    <div style={{
      display: 'flex', gap: 16, width: 'max-content',
      animation: `${reverse ? 'tv-marq-r' : 'tv-marq'} ${duration}s linear infinite`,
    }}>
      {[...items, ...items].map(([caption, width], i) => (
        <Tile key={i} caption={caption} width={width} src={i === 0 ? heroSrc : undefined} />
      ))}
    </div>
  );
}

export default function CommunityStrip() {
  const { site } = useStore();
  const mask = 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)';
  return (
    <section style={{ padding: '60px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 56px 26px' }}>
        <h2 className="tv-section" style={{ margin: 0 }}>From the Tovant community</h2>
        <span style={{ font: '400 13.5px/1 var(--tv-font)', color: 'var(--tv-muted)' }}>Real jobs posted by owners and pros this month</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden', WebkitMaskImage: mask, maskImage: mask }}>
        <Row items={communityRowA} duration={120} heroSrc={site.images?.community} />
        <Row items={communityRowB} duration={140} reverse />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '26px 56px 0' }}>
        <p className="tv-small" style={{ maxWidth: 520, margin: 0 }}>
          Owners rate the invoice, not the vibe. Photos come straight off finished jobs, and every pro in these shots
          passed licence, insurance and invoice review.
        </p>
        <Link to="/vetting" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>See how vetting works →</Link>
      </div>
    </section>
  );
}
