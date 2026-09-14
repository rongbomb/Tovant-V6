import React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Field, Pill, Card, Meta } from '../components/primitives.jsx';
import AuthFrame from '../components/AuthFrame.jsx';
import { findAccount } from '../data/accounts.js';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

function afterLogin(account, next, nav) {
  if (next) return nav(next);
  if (account.role === 'provider') return nav('/dashboard');
  if (account.role === 'admin') return nav('/admin');
  return nav('/jobs');
}

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login, logout, accounts, site } = useStore();
  const copy = pageCopy(site, 'login');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [keep, setKeep] = React.useState(true);
  const [err, setErr] = React.useState('');
  const next = params.get('next') || '';

  React.useEffect(() => { if (params.get('out')) logout(); }, [params.get('out')]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 8) return setErr('Passwords are at least 8 characters.');
    const acc = await findAccount(email, pw, accounts);
    if (!acc) return setErr('No account matches that email and password.');
    setErr('');
    login(acc);
    afterLogin(acc, next, nav);
  };

  return (
    <AuthFrame
      title={copy.title}
      lead={copy.lead}
      asideTitle={copy.asideTitle}
      asideBody={copy.asideBody}
      asideStats={[['Owner', 'JOBS AND GARAGE'], ['Shop', 'QUEUE AND PAYOUTS'], ['Staff', 'PUBLISH AND VERIFY']]}
    >
      <p className="tv-small" style={{marginTop:20}}>Demo sign-in only. Use the page links above to explore each role. Do not enter a real password.</p><form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
          <Field label="EMAIL" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <Field label="PASSWORD" value={pw} onChange={setPw} type="password" placeholder="••••••••" />
        </div>
        {err && <div style={{ marginTop: 14, font: '600 12.5px/1.4 var(--tv-font)', color: '#8A2C1B' }}>{err}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button type="button" onClick={() => setKeep(!keep)} style={{ display: 'flex', alignItems: 'center', gap: 9, border: 0, background: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ width: 18, height: 18, borderRadius: 6, background: keep ? 'var(--tv-ink)' : 'var(--tv-inset-2)', display: 'grid', placeItems: 'center', font: '600 10px/1 var(--tv-font)', color: '#fff' }}>{keep ? '✓' : ''}</span>
            <span className="tv-small">Keep me signed in</span>
          </button>
          <Link to="/reset" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Forgot password</Link>
        </div>
        <Pill variant="ink" type="submit" style={{ width: '100%', marginTop: 22, padding: 17, fontSize: 14.5 }}>Sign in</Pill>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 22 }}>
        {['Apple', 'Google', 'Phone'].map((label) => (
          <Card key={label} interactive pad="16px 10px" onClick={() => nav(`/signup/owner?via=${label.toLowerCase()}`)}>
            <div style={{ textAlign: 'center', font: '600 12.5px/1 var(--tv-font)' }}>{label}</div>
          </Card>
        ))}
      </div>

      <p className="tv-small" style={{ marginTop: 28 }}>
        New here? <Link to={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Create an account</Link>
        <span style={{ color: 'var(--tv-muted)' }}> or </span>
        <Link to={next ? `/signup/provider?next=${encodeURIComponent(next)}` : '/signup/provider'} style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>apply as a provider</Link>.
      </p>
    </AuthFrame>
  );
}
