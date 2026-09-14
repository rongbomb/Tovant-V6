import React from 'react'
import { Link } from 'react-router-dom'
import { Pill } from './primitives.jsx'
import { getConsent, setConsent } from '../lib/consent.js'

export default function CookieBanner() {
  const [consent, setLocal] = React.useState(() => getConsent())
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setLocal(getConsent())
    window.addEventListener('tovant-consent', sync)
    return () => window.removeEventListener('tovant-consent', sync)
  }, [])

  if (consent) return null

  const needed = () => setConsent({ analytics: false, marketing: false })
  const all = () => setConsent({ analytics: true, marketing: true })

  return (
    <div role="dialog" aria-label="Cookie choices" style={{
      position: 'fixed', left: 24, right: 24, bottom: 24, zIndex: 80,
      maxWidth: 720, margin: '0 auto', padding: 22, borderRadius: 22,
      background: 'var(--tv-surface)', boxShadow: 'var(--tv-shadow-menu)',
    }}>
      <div style={{ font: '600 16px/1.25 var(--tv-font)' }}>Cookies on Tovant</div>
      <p className="tv-small" style={{ marginTop: 10 }}>
        Needed cookies keep you signed in and remember this choice. Analytics and marketing stay off until you turn them on.
        Read the <Link to="/legal?tab=Cookies" style={{ font: '600 13px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>cookie policy</Link>.
      </p>
      {open && (
        <div style={{ marginTop: 14, font: '400 13px/1.5 var(--tv-font)', color: 'var(--tv-body)' }}>
          Needed: always on. Analytics: how people move through Find and Match. Marketing: optional notes from shops you already used.
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <Pill variant="ink" onClick={needed} style={{ minHeight: 48, padding: '16px 22px' }}>Use needed cookies</Pill>
        <Pill variant="surface" onClick={all} style={{ minHeight: 48, padding: '16px 22px' }}>Allow all cookies</Pill>
        <button type="button" onClick={() => setOpen((s) => !s)} style={{
          border: 0, background: 'none', cursor: 'pointer', minHeight: 44,
          font: '600 13px/1 var(--tv-font)', color: 'var(--tv-accent-link)',
        }}>{open ? 'Hide details' : 'What this covers'}</button>
      </div>
    </div>
  )
}
