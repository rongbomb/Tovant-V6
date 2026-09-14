import React from 'react';

/** Match-flow stepper: numbered dots (done = ink ✓, current = accent, later = grey) + accent progress bar. */
export default function StepBar({ step, labels, onStep }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
        {labels.map((t, i) => (
          <button key={t} onClick={() => i <= step && onStep?.(i)} style={{
            display: 'flex', alignItems: 'center', gap: 11, border: 0, background: 'none', padding: 0,
            cursor: i <= step ? 'pointer' : 'default',
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: 13, display: 'grid', placeItems: 'center',
              background: i < step ? 'var(--tv-ink)' : i === step ? 'var(--tv-accent)' : '#E1E1E5',
              color: i < step ? '#fff' : 'var(--tv-ink)', font: '600 11px/1 var(--tv-mono)',
            }}>{i < step ? '✓' : i + 1}</span>
            <span style={{ font: '600 12.5px/1 var(--tv-font)', color: i > step ? 'var(--tv-faint)' : 'var(--tv-ink)' }}>{t}</span>
          </button>
        ))}
      </div>
      <div style={{ height: 4, borderRadius: 2, background: '#E1E1E5', marginTop: 22 }}>
        <div style={{ width: `${((step + 1) / labels.length) * 100}%`, height: 4, borderRadius: 2, background: 'var(--tv-accent)', transition: 'width var(--tv-dur-slow) var(--tv-ease)' }} />
      </div>
    </div>
  );
}
