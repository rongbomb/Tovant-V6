import React from 'react'

export default function BleedFade({ dark = false }) {
  return (
    <div className={`tv-bleed-fade${dark ? ' is-dark' : ''}`} aria-hidden>
      <span className="tv-bleed-fade__mid" />
    </div>
  )
}
