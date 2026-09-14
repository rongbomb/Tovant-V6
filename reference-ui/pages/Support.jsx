import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, Field, PageCard } from '../components/primitives.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';
import { useDemo } from '../../components/tovant/context';
import { rateOk } from '../lib/consent.js';

export default function Support() {
  const { site } = useStore();
  const demo = useDemo();
  const copy = pageCopy(site, 'support');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [body, setBody] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [consent, setConsentOn] = React.useState(false);
  const [err, setErr] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || !body.trim()) {
      return setErr('Name, a valid email, and a note are required.');
    }
    if (!consent) return setErr('Agree that this note stays in your demo session.');
    if (!rateOk('support', 3, 10 * 60 * 1000)) {
      return setErr('Wait a few minutes before sending another note. This keeps the inbox usable.');
    }
    setErr('');
    demo.setRole('customer');
    const subject = `${name.trim()} · ${email.trim()}`.slice(0, 150);
    const ok = await demo.act('ticket', { subject, text: body.trim().slice(0, 2000) });
    if (ok) setSent(true);
  };

  const mine = demo.state.tickets.filter((t) => t.customerId === demo.customerId);

  return (
    <PageCard>
      <NotchNav />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>SUPPORT</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>{copy.title}</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          {copy.lead} Notes here become demo tickets only. No support team is emailed.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 32, alignItems: 'flex-start' }}>
          <Card style={{ flex: 1 }}>
            {sent ? (
              <>
                <div style={{ font: '600 20px/1.2 var(--tv-font)' }}>Saved in this demo session.</div>
                <p className="tv-small" style={{ marginTop: 12 }}>
                  No staff email was sent to {email}. Open the admin workspace to reply to demo tickets, or keep exploring jobs.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
                  <Link to="/admin"><Pill variant="accent">Open admin</Pill></Link>
                  <Link to="/find"><Pill variant="ink">Back to Find a Pro</Pill></Link>
                </div>
              </>
            ) : (
              <form onSubmit={submit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Field label="NAME" value={name} onChange={setName} />
                  <Field label="EMAIL" value={email} onChange={setEmail} type="email" />
                  <Field label="WHAT HAPPENED" value={body} onChange={setBody} multiline />
                </div>
                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 16, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    aria-label="Agree to save this as a demo ticket"
                    onChange={(e) => setConsentOn(e.target.checked)}
                    style={{ marginTop: 3, width: 18, height: 18 }}
                  />
                  <span className="tv-small">Save this note as a demo ticket in my session. It will not message staff or add me to a marketing list.</span>
                </label>
                {err && <div style={{ marginTop: 14, font: '600 12.5px/1.4 var(--tv-font)', color: '#8A2C1B' }}>{err}</div>}
                <Pill variant="accent" type="submit" disabled={demo.busy} style={{ marginTop: 22, minHeight: 48 }}>
                  {demo.busy ? 'Saving…' : 'Save demo ticket'}
                </Pill>
              </form>
            )}
            {mine.length > 0 && (
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Meta>YOUR DEMO TICKETS</Meta>
                {mine.map((t) => (
                  <div key={t.id} style={{ padding: 16, borderRadius: 16, background: 'var(--tv-inset)' }}>
                    <div style={{ font: '600 14px/1.3 var(--tv-font)' }}>{t.subject}</div>
                    <p className="tv-small" style={{ marginTop: 8 }}>{t.text}</p>
                    <p className="tv-data" style={{ marginTop: 8 }}>{t.status}{t.reply ? ` · ${t.reply}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div style={{ width: 372, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Meta>FASTER PATHS</Meta>
              <p className="tv-small" style={{ marginTop: 12 }}>A live request is faster from My jobs. A shop file is faster from the dashboard.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <Link to="/jobs" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Owner jobs →</Link>
                <Link to="/dashboard" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Provider dashboard →</Link>
                <Link to="/vetting" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>How vetting works →</Link>
              </div>
            </Card>
            <Card dark>
              <div style={{ font: '600 16px/1.3 var(--tv-font)', color: '#fff' }}>Safety</div>
              <p style={{ font: '400 13px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.62)', marginTop: 10 }}>
                If a job feels unsafe, leave the site and call local emergency services. Then write us so the shop file can be reviewed.
              </p>
            </Card>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
