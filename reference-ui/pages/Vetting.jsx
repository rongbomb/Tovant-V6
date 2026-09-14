import React from 'react';
import { Link } from 'react-router-dom';
import NotchNav from '../components/NotchNav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { Card, Meta, Pill, PageCard } from '../components/primitives.jsx';
import { pageCopy } from '../data/siteCopy.js';
import { useStore } from '../lib/store.jsx';

const ACCOUNT = [
  ['Government ID', 'Photo ID and a selfie. Staff match the face to the document. No one lists without this.'],
  ['Background check', 'Run after a standalone FCRA consent screen. Identity plus screening stay mandatory for every pro.'],
  ['General liability', 'Carrier, policy number, limit and expiry. A shop cannot quote if cover lapses.'],
];

const TIERS = [
  ['Open', 'Cosmetic and light work. Detailing, ceramic, wraps, oil, bulbs, jump starts. Proof of work or garagekeepers, depending on the job.'],
  ['Certified', 'Brakes, suspension, alignment, engine, transmission, electrical. ASE in the right area plus higher garagekeepers limits.'],
  ['Regulated', 'A/C, smog, ADAS, EV high-voltage, tint, collision, towing. State licences, EPA 609, ASE L-levels. Live only after those clear.'],
];

const STEPS = [
  ['01', 'One account', 'Identity and the business are verified once. Legal name, address, ID, insurance, payout account, and FCRA consent.'],
  ['02', 'Pick services', 'Each trade needs its own credentials. The tile shows those chips before anyone selects it. No surprises after signup.'],
  ['03', 'Merged checklist', 'Tovant unions the requirements for the trades they picked. They upload once. Staff review by hand in v1.'],
  ['04', 'Live on the first clear', 'A shop goes listable once the first trade credential passes. Slow credentials never block the ones already cleared.'],
];

export default function Vetting() {
  const { site } = useStore();
  const copy = pageCopy(site, 'vetting');
  return (
    <PageCard>
      <NotchNav active="find" />
      <div style={{ padding: '72px 56px 56px' }}>
        <Meta>HOW VETTING WORKS</Meta>
        <h1 className="tv-h1" style={{ margin: '16px 0 0', maxWidth: 760 }}>
          {copy.title}
        </h1>
        <p className="tv-lead" style={{ marginTop: 20, maxWidth: 640 }}>
          {copy.lead}
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {STEPS.map(([n, t, b]) => (
            <Card key={n} pad={24} style={{ flex: 1 }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: 'var(--tv-inverse)', color: 'var(--tv-inverse-text)', display: 'grid', placeItems: 'center', font: '600 12px/1 var(--tv-mono)' }}>{n}</div>
              <div style={{ font: '600 18px/1.25 var(--tv-font)', marginTop: 18 }}>{t}</div>
              <p className="tv-small" style={{ marginTop: 10 }}>{b}</p>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Sectionish title="Collected once, for every shop">
                Every pro supplies these at account setup. They are not repeated per trade.
              </Sectionish>
              <div style={{ marginTop: 8 }}>
                {ACCOUNT.map(([t, b]) => (
                  <div key={t} style={{ padding: '16px 0', borderBottom: '1px solid var(--tv-hairline)' }}>
                    <div style={{ font: '600 15px/1.25 var(--tv-font)' }}>{t}</div>
                    <p className="tv-small" style={{ marginTop: 8 }}>{b}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <Sectionish title="Then unlocked per trade">
                A shop that wants brakes sees ASE A5 and garagekeepers before they opt in. Detailing asks for a work portfolio. EV asks for ASE L3.
              </Sectionish>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                {TIERS.map(([t, b]) => (
                  <div key={t} style={{ padding: 18, borderRadius: 18, background: 'var(--tv-field)' }}>
                    <Meta>{t}</Meta>
                    <p className="tv-small" style={{ marginTop: 10 }}>{b}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ width: 372, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card dark>
              <Meta style={{ color: 'rgba(255,255,255,.45)' }}>WHAT OWNERS CAN TRUST</Meta>
              <div style={{ font: '600 26px/1.15 var(--tv-font)', color: '#fff', marginTop: 16, letterSpacing: '-.03em' }}>
                Licence, insurance and invoice review before anyone can quote.
              </div>
              <p style={{ font: '400 13.5px/1.5 var(--tv-font)', color: 'rgba(255,255,255,.6)', marginTop: 16 }}>
                Review is manual. Vendors sit behind interfaces so Checkr or an ID vendor can swap in later without a rewrite.
              </p>
            </Card>
            <Card>
              <Meta>STAFF QUEUE</Meta>
              <p className="tv-small" style={{ marginTop: 12 }}>
                Submitted credentials land with staff. Only staff can mark a credential verified or rejected. Providers cannot write those states.
              </p>
              <Link to="/admin?view=verify"><Pill variant="ink" style={{ marginTop: 18 }}>Open the verify queue</Pill></Link>
            </Card>
            <Card>
              <Meta>APPLY AS A PROVIDER</Meta>
              <p className="tv-small" style={{ marginTop: 12 }}>
                Start with the account. Pick trades. Upload the merged checklist. You list as soon as the first credential clears.
              </p>
              <Link to="/signup/provider"><Pill variant="accent" style={{ marginTop: 18 }}>Start the account</Pill></Link>
            </Card>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageCard>
  );
}

function Sectionish({ title, children }) {
  return (
    <div>
      <div className="tv-sectitle">{title}</div>
      <p className="tv-small" style={{ marginTop: 10 }}>{children}</p>
    </div>
  );
}
