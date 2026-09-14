import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field, Pill } from '../components/primitives.jsx';
import AuthFrame from '../components/AuthFrame.jsx';
import { useStore } from '../lib/store.jsx';

export default function SignupOwner() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { registerOwner } = useStore();
  const via = params.get('via');
  const next = params.get('next') || '/find';
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [zip, setZip] = React.useState('55407');
  const [vehicle, setVehicle] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [err, setErr] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setErr('Enter the name we should put on requests.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 8) return setErr('Passwords are at least 8 characters.');
    if (!/^\d{5}$/.test(zip)) return setErr('Enter a five-digit Twin Cities zip.');
    if (!terms) return setErr('Agree to the Terms and Privacy Policy to create the account.');
    const result = await registerOwner({ name, email, password: pw, zip, vehicle });
    if (!result.ok) return setErr(result.error);
    nav(next);
  };

  return (
    <AuthFrame
      title="Create an owner account"
      lead={via
        ? `${via[0].toUpperCase() + via.slice(1)} sign-in is not on this build. Create the owner account with email and we keep you on Tovant.`
        : 'Create a sample profile in your saved demo. Use a test password and sample details.'}
      asideTitle="Describe the job once."
      asideBody="We take it to the shops who actually do that trade. Written prices come back here, held for 48 hours."
      asideStats={[['48 hr', 'PRICE HOLD'], ['No fee', 'TO ASK'], ['Twin Cities', 'PILOT AREA']]}
    >
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
          <Field label="FULL NAME" value={name} onChange={setName} placeholder="Mara Kessler" />
          <Field label="EMAIL" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <Field label="PASSWORD" value={pw} onChange={setPw} type="password" placeholder="At least 8 characters" />
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}><Field label="HOME ZIP" value={zip} onChange={setZip} placeholder="55407" /></div>
            <div style={{ flex: 1 }}><Field label="VEHICLE, OPTIONAL" value={vehicle} onChange={setVehicle} placeholder="2021 Audi Q5" /></div>
          </div>
        </div>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 18, cursor: 'pointer' }}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18 }} />
          <span className="tv-small">
            I am 18 or older and I agree to the <Link to="/legal" style={{ color: 'var(--tv-accent-link)' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--tv-accent-link)' }}>Privacy Policy</Link>. I can delete this account later from Settings.
          </span>
        </label>
        {err && <div style={{ marginTop: 14, font: '600 12.5px/1.4 var(--tv-font)', color: '#8A2C1B' }}>{err}</div>}
        <Pill variant="accent" type="submit" style={{ width: '100%', marginTop: 22, padding: 17, fontSize: 14.5 }}>Create owner account</Pill>
      </form>
      <p className="tv-small" style={{ marginTop: 22 }}>
        Run a shop instead? <Link to="/signup/provider" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Apply as a provider</Link>
        <span style={{ color: 'var(--tv-muted)' }}> · </span>
        <Link to="/login" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Sign in</Link>
      </p>
    </AuthFrame>
  );
}
