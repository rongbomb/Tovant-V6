import React from 'react';
import { Link } from 'react-router-dom';
import { Meta } from './primitives.jsx';

export default function AuthFrame({ kicker = 'TWIN CITIES PILOT', title, lead, children, asideTitle, asideBody, asideStats }) {
  return (
    <div style={{ width: 1180, minHeight: 720, background: 'var(--tv-field)', borderRadius: 'var(--tv-r-page)', overflow: 'hidden', display: 'flex' }}>
      <div style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Link to="/" style={{ font: '600 20px/1 var(--tv-font)', letterSpacing: '-.02em' }}>Tovant</Link>
        <div style={{ margin: 'auto 0', maxWidth: 440, width: '100%', padding: '28px 0' }}>
          {title && <h1 className="tv-title" style={{ margin: 0 }}>{title}</h1>}
          {lead && <p className="tv-small" style={{ marginTop: 14 }}>{lead}</p>}
          {children}
        </div>
      </div>
      <aside style={{ width: 520, flex: 'none', background: 'linear-gradient(155deg,#2E2F34,#141518)', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Meta style={{ color: 'var(--tv-accent)' }}>{kicker}</Meta>
        <div>
          <div style={{ font: '600 42px/1.08 var(--tv-font)', letterSpacing: '-.035em', color: '#fff', textWrap: 'balance' }}>
            {asideTitle}
          </div>
          {asideBody && (
            <p style={{ font: '400 15px/1.6 var(--tv-font)', color: 'rgba(255,255,255,.6)', marginTop: 20, maxWidth: 380 }}>
              {asideBody}
            </p>
          )}
        </div>
        {asideStats && (
          <div style={{ display: 'flex', gap: 36 }}>
            {asideStats.map(([v, l]) => (
              <div key={l}>
                <div style={{ font: '600 24px/1 var(--tv-font)', letterSpacing: '-.02em', color: '#fff' }}>{v}</div>
                <div style={{ font: '400 9.5px/1 var(--tv-mono)', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginTop: 9 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
