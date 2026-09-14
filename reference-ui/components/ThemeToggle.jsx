import React from 'react'
import { getTheme, toggleTheme } from '../lib/theme.js'

export default function ThemeToggle({ compact = false }) {
  const [theme, setThemeState] = React.useState(getTheme)
  React.useEffect(() => {
    const sync = () => setThemeState(getTheme())
    window.addEventListener('tovant-theme', sync)
    return () => window.removeEventListener('tovant-theme', sync)
  }, [])
  const dark = theme === 'dark'
  const size = compact ? 40 : 44
  return (
    <button
      type="button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => { toggleTheme(); setThemeState(getTheme()) }}
      style={{
        width: size, height: size, border: 0, borderRadius: size / 2, flex: 'none',
        background: compact ? 'rgba(255,255,255,.12)' : 'var(--tv-inset)',
        color: compact ? '#fff' : 'var(--tv-ink)',
        cursor: 'pointer', display: 'grid', placeItems: 'center',
        transition: 'background .3s var(--tv-ease)',
      }}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M16 12a6 6 0 1 1-6-6 7.5 7.5 0 0 0 6 6z" />
        </svg>
      )}
    </button>
  )
}
