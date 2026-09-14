import React from 'react';

/** Card: the base surface. Interactive cards lift on hover, settle on press. */
export function Card({ interactive = false, dark = false, pad = 24, style, children, onMouseEnter, onMouseLeave, onPointerDown, onPointerUp, ...rest }) {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  const lift = interactive && p ? 'translateY(-1px) scale(.994)' : interactive && h ? 'translateY(-5px)' : 'none';
  const shadow = interactive && p ? 'var(--tv-shadow-press)' : interactive && h ? 'var(--tv-shadow-hover)' : 'var(--tv-shadow)';
  return (
    <div
      {...rest}
      onMouseEnter={(e) => { setH(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setH(false); setP(false); onMouseLeave?.(e); }}
      onPointerDown={(e) => { setP(true); onPointerDown?.(e); }}
      onPointerUp={(e) => { setP(false); onPointerUp?.(e); }}
      style={{
        padding: pad, borderRadius: 'var(--tv-r-card)',
        background: dark ? 'var(--tv-inverse)' : 'var(--tv-surface)',
        boxShadow: shadow, transform: lift,
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform var(--tv-dur) var(--tv-ease), box-shadow var(--tv-dur) ease',
        ...style,
      }}
    >{children}</div>
  );
}

/** Pill. 'accent' is the single committing action per screen. */
export function Pill({ variant = 'ink', style, children, ...rest }) {
  const v = {
    accent: { background: 'var(--tv-accent)', color: 'var(--tv-inverse)', boxShadow: 'var(--tv-shadow-accent)' },
    ink: { background: 'var(--tv-inverse)', color: 'var(--tv-inverse-text)', boxShadow: 'var(--tv-shadow-ink)' },
    surface: { background: 'var(--tv-surface)', color: 'var(--tv-ink)', boxShadow: 'var(--tv-shadow)' },
    ghost: { background: 'rgba(255,255,255,.14)', color: '#fff', boxShadow: 'none' },
  }[variant];
  return (
    <button type="button" {...rest} style={{
      padding: '15px 22px', border: 0, borderRadius: 'var(--tv-r-pill)', whiteSpace: 'nowrap',
      font: '600 14px/1 var(--tv-font)', cursor: 'pointer', ...v, ...style,
    }}>{children}</button>
  );
}

export function Meta({ children, style }) {
  return <div className="tv-meta" style={style}>{children}</div>;
}

export function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
      <div className="tv-sectitle">{children}</div>
      {right && <span className="tv-data" style={{ whiteSpace: 'nowrap' }}>{right}</span>}
    </div>
  );
}

/** Labelled inset field. Read-only in the design; pass onChange to make it live. */
export function Field({ label, value, onChange, type = 'text', placeholder, multiline }) {
  const id = React.useId();
  const shared = {
    width: '100%', marginTop: 10, padding: '15px 16px', border: 0,
    borderRadius: 'var(--tv-r-input)', background: 'var(--tv-inset)',
    color: 'var(--tv-ink)', outline: 'none', fontFamily: 'var(--tv-font)',
  };
  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      <Meta>{label}</Meta>
      {multiline
        ? <textarea id={id} rows={3} value={value} placeholder={placeholder} aria-label={label} onChange={(e) => onChange?.(e.target.value)}
            style={{ ...shared, font: '400 13.5px/1.5 var(--tv-font)', resize: 'none', minHeight: 74 }} />
        : <input id={id} type={type} value={value} placeholder={placeholder} aria-label={label} onChange={(e) => onChange?.(e.target.value)}
            style={{ ...shared, height: 48, padding: '0 16px', font: '600 14px/1 var(--tv-font)' }} />}
    </label>
  );
}

export function Chip({ on, children, style, type = 'button', ...rest }) {
  return (
    <button type={type} {...rest} style={{
      padding: '11px 15px', border: 0, borderRadius: 'var(--tv-r-input)', cursor: 'pointer',
      background: on ? 'var(--tv-inverse)' : 'var(--tv-surface)',
      color: on ? 'var(--tv-inverse-text)' : 'var(--tv-body)',
      boxShadow: on ? 'none' : 'var(--tv-shadow)',
      font: '600 12.5px/1 var(--tv-font)',
      transition: 'background var(--tv-dur) ease, color var(--tv-dur) ease',
      ...style,
    }}>{children}</button>
  );
}

export function Toggle({ label, sub, on, onChange, small }) {
  const w = small ? 38 : 44, h = small ? 22 : 26, k = small ? 16 : 20;
  const knob = (
    <button type="button" onClick={(e) => { e.stopPropagation(); onChange?.(!on); }} aria-label={label || 'Toggle'} style={{
      width: w, height: h, borderRadius: h / 2, flex: 'none', border: 0, cursor: 'pointer',
      background: on ? 'var(--tv-accent)' : 'var(--tv-inset-2)', padding: 3,
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background var(--tv-dur) ease',
    }}>
      <span style={{ width: k, height: k, borderRadius: k / 2, background: '#fff', boxShadow: small ? 'none' : '0 2px 4px rgba(16,17,19,.2)' }} />
    </button>
  );
  if (!label) return knob;
  return (
    <div onClick={() => onChange?.(!on)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, padding: '15px 0', borderBottom: '1px solid var(--tv-hairline)', cursor: 'pointer' }}>
      <div>
        <div style={{ font: '600 13.5px/1.25 var(--tv-font)' }}>{label}</div>
        {sub && <div style={{ font: '400 12px/1.45 var(--tv-font)', color: 'var(--tv-muted)', marginTop: 6 }}>{sub}</div>}
      </div>
      {knob}
    </div>
  );
}

/** Settings / admin left-rail item. */
export function RailItem({ on, children, ...rest }) {
  return (
    <button {...rest} style={{
      padding: '12px 15px', minHeight: 44, borderRadius: 'var(--tv-r-input)', border: 0, cursor: 'pointer', textAlign: 'left',
      background: on ? 'var(--tv-inverse)' : 'transparent', color: on ? 'var(--tv-inverse-text)' : 'var(--tv-body)',
      font: '600 12.5px/1 var(--tv-font)', transition: 'background .2s ease',
    }}>{children}</button>
  );
}

/** Accent-track slider (distance, max price). */
export function Slider({ label, value, pct, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Meta>{label}</Meta>
        <span style={{ font: '600 11px/1 var(--tv-mono)', color: 'var(--tv-ink)' }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: 26, marginTop: 12 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 11, height: 4, borderRadius: 2, background: '#E1E1E5' }} />
        <div style={{ position: 'absolute', left: 0, width: pct + '%', top: 11, height: 4, borderRadius: 2, background: 'var(--tv-accent)' }} />
        <input type="range" min={0} max={100} value={pct} onChange={(e) => onChange?.(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'grab' }} />
        <div style={{ position: 'absolute', left: `calc(${pct}% - 9px)`, top: 4, width: 18, height: 18, borderRadius: 9, background: 'var(--tv-inverse)', boxShadow: '0 2px 6px rgba(16,17,19,.35)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

/** Flat honest placeholder. Never illustrated, never gradient-filled. */
export function Placeholder({ label = '', style }) {
  return (
    <div style={{
      background: 'var(--tv-placeholder)', display: 'grid', placeItems: 'center',
      font: '400 9.5px/1 var(--tv-mono)', letterSpacing: '.1em', color: '#9A9DA4', ...style,
    }}>{label}</div>
  );
}

export function PageCard({ children, flex = false, clip = false, style }) {
  return (
    <div style={{
      width: 1280, background: 'var(--tv-field)', position: 'relative',
      borderRadius: '0 0 var(--tv-r-page) var(--tv-r-page)',
      ...(clip ? { overflow: 'hidden' } : { isolation: 'isolate' }),
      ...(flex ? { display: 'flex' } : null), ...style,
    }}>{children}</div>
  );
}
