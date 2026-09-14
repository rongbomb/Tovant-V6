import React from 'react';

/** Inset track, white knob sliding on `left` over .38s, labels crossfading over .3s. */
export default function SegmentedControl({ options, value, onChange }) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  const pct = 100 / options.length;
  return (
    <div style={{
      position: 'relative', display: 'flex', padding: 5, width: '100%', height: 48, boxSizing: 'border-box',
      background: 'var(--tv-inset-2)', borderRadius: 18,
      boxShadow: 'inset 0 1px 3px rgba(16,17,19,.09)',
    }}>
      <div style={{
        position: 'absolute', top: 5, bottom: 5,
        left: i === 0 ? 5 : `${pct * i}%`, width: `calc(${pct}% - 5px)`,
        background: 'var(--tv-surface)', borderRadius: 14, boxShadow: '0 2px 5px rgba(16,17,19,.14)',
        transition: 'left .38s var(--tv-ease)',
      }} />
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          position: 'relative', flex: 1, padding: 11, border: 0, background: 'none', cursor: 'pointer',
          font: '600 12.5px/1 var(--tv-font)', color: o.value === value ? 'var(--tv-ink)' : '#7A7D84',
          transition: 'color var(--tv-dur) ease',
        }}>{o.label}</button>
      ))}
    </div>
  );
}
