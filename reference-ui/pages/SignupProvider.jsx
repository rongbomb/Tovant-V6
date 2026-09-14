import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import StepBar from '../components/StepBar.jsx';
import { Card, Meta, Pill, Field, Chip, Toggle, PageCard } from '../components/primitives.jsx';
import { OWNER_ISSUES } from '../data/directory.js';
import { useStore } from '../lib/store.jsx';

const STEPS = ['Account', 'Shop and trades', 'Credentials', 'Payouts'];
const HOW = [
  'Mobile van, I come to the customer',
  'Drop off at the shop',
  'Both, depending on the job',
];

export default function SignupProvider() {
  const nav = useNavigate();
  const { registerProvider } = useStore();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [shop, setShop] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [zip, setZip] = React.useState('55407');
  const [how, setHow] = React.useState(HOW[0]);
  const [radius, setRadius] = React.useState('12 miles from 55407');
  const [trades, setTrades] = React.useState(['Oil and filters']);
  const [fcra, setFcra] = React.useState(false);
  const [idOn, setIdOn] = React.useState(false);
  const [gl, setGl] = React.useState('');
  const [bank, setBank] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [err, setErr] = React.useState('');

  const toggleTrade = (t) => {
    if (t === 'Not sure yet') return setTrades(['Not sure yet']);
    setTrades((s) => {
      const next = s.filter((x) => x !== 'Not sure yet');
      return next.includes(t) ? (next.length > 1 ? next.filter((x) => x !== t) : next) : [...next, t];
    });
  };

  const next = () => {
    if (step === 0) {
      if (!name.trim()) return setErr('Enter the owner name on the account.');
      if (!shop.trim()) return setErr('Enter the shop or van name customers will see.');
      if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
      if (pw.length < 8) return setErr('Passwords are at least 8 characters.');
      if (!/^\d{5}$/.test(zip)) return setErr('Enter a five-digit Twin Cities zip.');
    }
    if (step === 2) {
      if (!idOn) return setErr('Government ID is required before staff can review the file.');
      if (!fcra) return setErr('Background checks need FCRA consent on file.');
    }
    setErr('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    if (!bank.trim()) return setErr('Enter the bank last four so Friday payouts have a destination.');
    if (!terms) return setErr('Agree to the Terms and Privacy Policy to submit the application.');
    const result = await registerProvider({
      name, shop, email, password: pw, phone, zip, how, radius, trades, gl, bank,
    });
    if (!result.ok) return setErr(result.error);
    nav('/dashboard');
  };

  return (
    <PageCard>
      <NotchNav active="profile" />
      <div style={{ padding: '72px 56px 64px' }}>
        <Meta>APPLY AS A PROVIDER</Meta>
        <h1 className="tv-h1" style={{ margin: '16px 0 0', maxWidth: 720 }}>
          One account. Credentials per trade. Live on the first clear.
        </h1>
        <p className="tv-body" style={{ marginTop: 16, maxWidth: 620 }}>
          Staff review credentials. You cannot mark yourself verified. The listing goes live as soon as the first trade credential clears.
        </p>
        <div style={{ marginTop: 32 }}><StepBar step={step} labels={STEPS} onStep={(i) => i <= step && setStep(i)} /></div>

        <div style={{ display: 'flex', gap: 24, marginTop: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {step === 0 && (
              <Card>
                <Meta>ACCOUNT</Meta>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                  <Field label="YOUR NAME" value={name} onChange={setName} placeholder="Marcus Harlan" />
                  <Field label="SHOP OR VAN NAME" value={shop} onChange={setShop} placeholder="Harlan Mobile Service" />
                  <Field label="EMAIL" value={email} onChange={setEmail} type="email" placeholder="book@shop.com" />
                  <Field label="PASSWORD" value={pw} onChange={setPw} type="password" placeholder="At least 8 characters" />
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ flex: 1 }}><Field label="PHONE" value={phone} onChange={setPhone} placeholder="(612) 555 0100" /></div>
                    <div style={{ flex: 1 }}><Field label="HOME SHOP ZIP" value={zip} onChange={setZip} /></div>
                  </div>
                </div>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <Meta>SHOP AND TRADES</Meta>
                <p className="tv-small" style={{ marginTop: 12 }}>Pick the work you actually do. Each trade has its own credential checklist.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                  {OWNER_ISSUES.map((t) => (
                    <Chip key={t} on={trades.includes(t)} onClick={() => toggleTrade(t)}>{t}</Chip>
                  ))}
                </div>
                <Meta style={{ marginTop: 24 }}>HOW YOU WORK</Meta>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {HOW.map((h) => <Chip key={h} on={how === h} onClick={() => setHow(h)}>{h}</Chip>)}
                </div>
                <div style={{ marginTop: 20 }}>
                  <Field label="SERVICE RADIUS" value={radius} onChange={setRadius} />
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <Meta>CREDENTIALS</Meta>
                <p className="tv-small" style={{ marginTop: 12 }}>
                  Government ID and a background check sit on every account. General liability and trade-specific proof sit on each specialty.
                </p>
                <Toggle
                  label="Government photo ID is ready to upload"
                  sub="Minnesota DL or passport, plus a selfie match. Staff compare both."
                  on={idOn}
                  onChange={setIdOn}
                />
                <Toggle
                  label="I consent to an FCRA background check"
                  sub="Required before you can quote. Only staff can mark this verified."
                  on={fcra}
                  onChange={setFcra}
                />
                <div style={{ marginTop: 16 }}>
                  <Field label="GENERAL LIABILITY, OPTIONAL NOW" value={gl} onChange={setGl} placeholder="$1M · carrier and expiry" />
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <Meta>FRIDAY PAYOUTS</Meta>
                <p className="tv-small" style={{ marginTop: 12 }}>
                  Owners pay the shop directly unless you turn on Tovant payouts later. This account still needs a bank last four for the books.
                </p>
                <div style={{ marginTop: 16 }}>
                  <Field label="BANK ACCOUNT LAST FOUR" value={bank} onChange={setBank} placeholder="4417" />
                </div>
                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 18, cursor: 'pointer' }}>
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18 }} />
                  <span className="tv-small">
                    I am 18 or older and I agree to the <Link to="/legal" style={{ color: 'var(--tv-accent-link)' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--tv-accent-link)' }}>Privacy Policy</Link>. Staff will review credentials before the shop lists.
                  </span>
                </label>
              </Card>
            )}

            {err && <div style={{ marginTop: 16, font: '600 12.5px/1.4 var(--tv-font)', color: '#8A2C1B' }}>{err}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 22, alignItems: 'center' }}>
              {step < 3
                ? <Pill variant="accent" onClick={next}>Continue</Pill>
                : <Pill variant="accent" onClick={submit}>Submit application</Pill>}
              {step > 0 && <Pill variant="surface" onClick={() => { setErr(''); setStep((s) => s - 1); }}>Back</Pill>}
              <span className="tv-small">You list as soon as the first credential clears.</span>
            </div>
          </div>

          <div style={{ width: 372, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Meta>WHAT HAPPENS NEXT</Meta>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                {[
                  ['Staff read the file', 'ID, background, and the first trade packet land in the verify queue.'],
                  ['First credential clears', 'Your shop appears in Find a Pro for that trade only.'],
                  ['You quote from the dashboard', 'Written prices are held for 48 hours. Work beyond the quote needs approval first.'],
                ].map(([t, b], i) => (
                  <div key={t} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, flex: 'none', background: step >= i ? 'var(--tv-ink)' : '#E1E1E5', color: step >= i ? '#fff' : 'var(--tv-ink)', font: '600 10.5px/24px var(--tv-mono)', textAlign: 'center' }}>{i + 1}</span>
                    <div>
                      <div style={{ font: '600 13.5px/1.25 var(--tv-font)' }}>{t}</div>
                      <div style={{ font: '400 12.5px/1.5 var(--tv-font)', color: 'var(--tv-muted)', marginTop: 6 }}>{b}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <Meta>ALREADY A MEMBER</Meta>
              <p className="tv-small" style={{ marginTop: 12 }}>Owners can apply from profile settings without making a second login.</p>
              <Link to="/login" style={{ display: 'inline-block', marginTop: 14, font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Sign in instead →</Link>
            </Card>
          </div>
        </div>
      </div>
    </PageCard>
  );
}
