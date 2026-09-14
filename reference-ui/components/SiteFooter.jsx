import React from 'react';
import { Link } from 'react-router-dom';
import { Meta } from './primitives.jsx';
import { useStore } from '../lib/store.jsx';

export default function SiteFooter() {
  const { site } = useStore();
  const lines = String(site?.footer || '').replace(' · ', '\n').split('\n');
  return (
    <footer style={{ marginTop: 60, padding: '40px 56px', background: 'var(--tv-inverse)', display: 'flex', justifyContent: 'space-between', borderRadius: '0 0 20px 20px' }}>
      <div>
        <div style={{ font: '600 19px/1 var(--tv-font)', color: '#fff', letterSpacing: '-.02em' }}>Tovant</div>
        <p style={{ font: '400 12.5px/1.6 var(--tv-font)', color: 'rgba(255,255,255,.45)', marginTop: 14 }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i ? <br /> : null}{l}</React.Fragment>)}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 64, font: '400 12.5px/2 var(--tv-font)', color: 'rgba(255,255,255,.55)' }}>
        <div>
          <Meta style={{ color: 'rgba(255,255,255,.35)', marginBottom: 12 }}>TRADES</Meta>
          <Link to="/find" style={{ color: 'inherit' }}>Mechanics</Link><br />
          <Link to="/find" style={{ color: 'inherit' }}>Detail</Link><br />
          <Link to="/find" style={{ color: 'inherit' }}>Tint and wraps</Link><br />
          <Link to="/find" style={{ color: 'inherit' }}>Body and paint</Link>
        </div>
        <div>
          <Meta style={{ color: 'rgba(255,255,255,.35)', marginBottom: 12 }}>COMPANY</Meta>
          <Link to="/vetting" style={{ color: 'inherit' }}>Vetting</Link><br />
          <Link to="/careers" style={{ color: 'inherit' }}>Careers</Link><br />
          <Link to="/press" style={{ color: 'inherit' }}>Press</Link><br />
          <Link to="/legal" style={{ color: 'inherit' }}>Terms</Link><br />
          <Link to="/privacy" style={{ color: 'inherit' }}>Privacy</Link><br />
          <Link to="/cookies" style={{ color: 'inherit' }}>Cookies</Link><br />
          <Link to="/legal?tab=GDPR" style={{ color: 'inherit' }}>Your data rights</Link>
        </div>
        <div>
          <Meta style={{ color: 'rgba(255,255,255,.35)', marginBottom: 12 }}>PROS</Meta>
          <Link to="/signup/provider" style={{ color: 'inherit' }}>Join Tovant</Link><br />
          <Link to="/dashboard" style={{ color: 'inherit' }}>Provider dashboard</Link><br />
          <Link to="/payouts" style={{ color: 'inherit' }}>Payouts</Link><br />
          <Link to="/support" style={{ color: 'inherit' }}>Support</Link>
        </div>
      </div>
    </footer>
  );
}
