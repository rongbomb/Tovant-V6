import React from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, RailItem, PageCard, Pill } from '../components/primitives.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';
import { getConsent, setConsent } from '../lib/consent.js';

const SECTIONS = {
  Terms: [
    ['What Tovant is', 'Tovant is a Twin Cities marketplace and shop operating system. Owners request work. Vetted shops send a written price and what it covers. Nothing is charged on Tovant until the work is done unless a shop turns on payouts.'],
    ['Accounts', 'An owner account and a provider account can share an email only after the owner applies as a provider. You are responsible for the password and for the people you add to a shop.'],
    ['Quotes', 'A written price is held for 48 hours. Work beyond the quote needs the owner\'s approval first. Prices can move for parts, discovery, and conditions nobody controls.'],
    ['Conduct', 'Shops and owners stay on the request thread. Harassment, fake credentials, or pay-to-rank schemes end the account. You can block a thread from Messages.'],
    ['Limitation of liability', 'Tovant introduces owners and shops. The shop performs the work. Tovant is not a party to the repair contract unless a shop turns on Tovant payouts. Minnesota law governs this agreement.'],
  ],
  Privacy: [
    ['Who we are', 'Tovant is the controller of personal data collected on this site for the Twin Cities pilot. Contact support@tovant.com for access, correction, or deletion.'],
    ['What we keep', 'Name, email, zip, vehicles, request notes, photos you attach, messages, cookie choices, and shop credentials. The demo build stores this on this device. Production stores it on Tovant servers in the United States.'],
    ['Legal bases', 'We process account data to perform the contract you start by creating an account. We process cookie analytics only with consent. We process safety reports as a legitimate interest in keeping the marketplace usable.'],
    ['What shops see', 'A shop sees the job, vehicle, zip, and notes you send them. They do not see other shops\' quotes. They do not see your full street address until you book.'],
    ['Retention', 'You can delete an owner account from Privacy and data. Shop files stay as long as invoices or disputes remain open, then follow a 24 month retention schedule unless law requires longer.'],
    ['Your rights', 'You may access, correct, export, or delete your data, withdraw cookie consent, and object to marketing. GDPR and CCPA-style rights are honored for every account, including Twin Cities residents.'],
    ['Do not sell', 'Tovant does not sell personal information. Marketing cookies, if you allow them, only support notes from shops you already used.'],
    ['Transfers', 'If production hosting leaves the US, we will use a standard contractual clause and say so on this page before the move.'],
  ],
  Cookies: [
    ['Needed', 'Sign-in, draft prompts, theme, and this cookie choice. The site does not work without them.'],
    ['Analytics', 'How people move through Find and Match. Off until you allow it. No third-party ad network in the pilot.'],
    ['Marketing', 'Optional notes from shops you already booked. Off until you allow it.'],
    ['Change your mind', 'Use Needed only or Allow all below. You can also open Privacy and data in settings.'],
  ],
  GDPR: [
    ['Access', 'Download my data in settings returns a JSON file of the account on this device.'],
    ['Erasure', 'Delete my account removes the live profile, drafts, and login from this device. Open invoices may be kept in a locked file for tax and dispute rules.'],
    ['Portability', 'The same download is machine-readable. You can hand it to another shop or keep it with the title.'],
    ['Restriction and objection', 'Turn off marketing cookies. Block a thread. Text-only toggle hides your number until you book.'],
    ['Complaint', 'You can write Tovant support, and you can also complain to a data protection authority in your country of residence.'],
    ['Children', 'Tovant is not for people under 18. We do not knowingly keep accounts for minors.'],
    ['California and similar laws', 'You can request access, deletion, correction, and to opt out of sale or sharing. Tovant does not sell personal information. The Do not sell toggle in Privacy and data turns marketing cookies off.'],
    ['Accessibility', 'Pages are meant to meet WCAG 2.1 AA: labeled fields, keyboard paths, and contrast on buttons. If a control is hard to use, write support and we will give you another path.'],
    ['Messages and texts', 'We only text a number you gave us for job updates. The text-instead-of-calling toggle hides your number until you book. You can stop marketing notes from Privacy and data.'],
    ['Rate limits', 'Support notes and message sends are limited so one account cannot flood another. If you hit a limit, wait and try again. The work is not lost.'],
    ['This is not legal advice', 'These pages describe how this product treats data. They do not replace a lawyer, a privacy counsel, or a filed DPA.'],
  ],
};

const TAB_FROM_PATH = { '/privacy': 'Privacy', '/cookies': 'Cookies' };

export default function Legal() {
  const { site } = useStore();
  const copy = pageCopy(site, 'legal');
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const start = TAB_FROM_PATH[pathname] || params.get('tab') || 'Terms';
  const [tab, setTab] = React.useState(start);
  const current = SECTIONS[tab] || SECTIONS.Terms;
  const consent = getConsent();

  React.useEffect(() => {
    setTab(TAB_FROM_PATH[pathname] || params.get('tab') || 'Terms');
  }, [pathname, params]);

  const pick = (n) => {
    setTab(n);
    setParams(n === 'Terms' ? {} : { tab: n });
  };

  return (
    <PageCard>
      <NotchNav />
      <div style={{ padding: '72px 56px 28px' }}>
        <Meta>LEGAL</Meta>
        <h1 className="tv-title" style={{ margin: '16px 0 0' }}>{copy.title}</h1>
        <p className="tv-body" style={{ marginTop: 14, maxWidth: 560 }}>
          {copy.lead} This is not a substitute for advice from a lawyer. It is the rule set this product follows.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 32, alignItems: 'flex-start' }}>
          <Card pad={10} style={{ width: 220, flex: 'none' }}>
            {Object.keys(SECTIONS).map((n) => <RailItem key={n} on={tab === n} onClick={() => pick(n)}>{n}</RailItem>)}
          </Card>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {current.map(([t, b]) => (
              <Card key={t}>
                <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>{t}</div>
                <p className="tv-body" style={{ marginTop: 12 }}>{b}</p>
              </Card>
            ))}
            {tab === 'Cookies' && (
              <Card>
                <div style={{ font: '600 18px/1.2 var(--tv-font)' }}>Your current choice</div>
                <p className="tv-small" style={{ marginTop: 12 }}>
                  {consent
                    ? `Needed on. Analytics ${consent.analytics ? 'on' : 'off'}. Marketing ${consent.marketing ? 'on' : 'off'}.`
                    : 'You have not chosen yet. The banner at the bottom of the site waits for a choice.'}
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <Pill variant="ink" onClick={() => setConsent({ analytics: false, marketing: false })}>Use needed cookies</Pill>
                  <Pill variant="surface" onClick={() => setConsent({ analytics: true, marketing: true })}>Allow all cookies</Pill>
                </div>
                <p className="tv-small" style={{ marginTop: 14 }}>
                  <Link to="/support" style={{ font: '600 13px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Write support</Link> if you want a human to confirm deletion.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}
