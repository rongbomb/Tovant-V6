import React from 'react';
import { shopGallery } from '../data/media.js';

export default function MediaGallery() {
  const items = shopGallery();
  const [open, setOpen] = React.useState(null);
  const cur = open == null ? null : items[open];

  const go = (d) => setOpen((i) => (i == null ? i : (i + d + items.length) % items.length));

  React.useEffect(() => {
    if (open == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const Tile = ({ item, i, style, children }) => (
    <button onClick={() => setOpen(i)} style={{
      position: 'relative', border: 0, padding: 0, cursor: 'pointer', overflow: 'hidden',
      borderRadius: 16, background: 'var(--tv-placeholder)', ...style,
    }}>
      {item.type === 'image'
        ? <img src={item.src} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : (
          <video src={item.src} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      {children}
    </button>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="tv-cardtitle" style={{ margin: 0 }}>Photos and video from the shop</h2>
        <button onClick={() => setOpen(0)} style={{ border: 0, background: 'none', cursor: 'pointer', font: '600 12px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>
          See all {items.length}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gridTemplateRows: '130px 130px', gap: 12, marginTop: 16 }}>
        <Tile item={items[0]} i={0} style={{ gridRow: 'span 2' }}>
          <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 46, height: 46, borderRadius: 23, background: 'rgba(16,17,19,.72)', display: 'grid', placeItems: 'center', font: '600 14px/1 var(--tv-font)', color: '#fff' }}>▶</span>
          <span style={{ position: 'absolute', left: 14, bottom: 14, font: '600 10px/1 var(--tv-mono)', color: '#fff' }}>SHOP WALKTHROUGH</span>
        </Tile>
        {items.slice(1, 4).map((item, i) => <Tile key={item.caption} item={item} i={i + 1} />)}
        <Tile item={items[4]} i={4}>
          <span style={{ position: 'absolute', inset: 0, background: 'rgba(16,17,19,.35)', display: 'grid', placeItems: 'center', font: '600 11px/1 var(--tv-mono)', color: '#fff' }}>+{Math.max(0, items.length - 5)} MORE</span>
        </Tile>
      </div>

      {cur && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(16,17,19,.72)', display: 'grid', placeItems: 'center', padding: 40 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(920px, 100%)', background: 'var(--tv-surface)', borderRadius: 22, boxShadow: 'var(--tv-shadow-menu)', overflow: 'hidden' }}>
            <div style={{ height: 480, background: '#111' }}>
              {cur.type === 'video'
                ? <video src={cur.src} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <img src={cur.src} alt={cur.caption} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
              <div>
                <div style={{ font: '600 15px/1.2 var(--tv-font)' }}>{cur.caption}</div>
                <div className="tv-data" style={{ marginTop: 6 }}>{open + 1} OF {items.length}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => go(-1)} style={navBtn}>Prev</button>
                <button onClick={() => go(1)} style={navBtn}>Next</button>
                <button onClick={() => setOpen(null)} style={{ ...navBtn, background: 'var(--tv-inverse)', color: 'var(--tv-inverse-text)' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const navBtn = {
  border: 0, cursor: 'pointer', padding: '10px 14px', borderRadius: 16,
  background: 'var(--tv-inset)', font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-ink)',
};
