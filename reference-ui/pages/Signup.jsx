import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/primitives.jsx';
import AuthFrame from '../components/AuthFrame.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

export default function Signup() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '';
  const q = next ? `?next=${encodeURIComponent(next)}` : '';
  const { site } = useStore();
  const copy = pageCopy(site, 'signup');

  return (
    <AuthFrame
      title={copy.title}
      lead={copy.lead}
      asideTitle="Fourteen trades. One request."
      asideBody="Car owners get written prices from vetted shops. Shops get a live listing once the first credential clears."
      asideStats={[['Owners', 'REQUESTS AND QUOTES'], ['Shops', 'LIVE ON FIRST CLEAR'], ['Staff', 'VERIFY CREDENTIALS']]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
        <Card interactive pad={22} onClick={() => nav(`/signup/owner${q}`)}>
          <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{copy.ownerTitle}</div>
          <p className="tv-small" style={{ marginTop: 10 }}>
            {copy.ownerBody}
          </p>
        </Card>
        <Card interactive pad={22} onClick={() => nav(`/signup/provider${q}`)}>
          <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{copy.providerTitle}</div>
          <p className="tv-small" style={{ marginTop: 10 }}>
            {copy.providerBody}
          </p>
        </Card>
      </div>
      <p className="tv-small" style={{ marginTop: 28 }}>
        Already have an account? <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Sign in</Link>
      </p>
    </AuthFrame>
  );
}
