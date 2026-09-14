import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { getTheme } from '../lib/theme.js'
import ThemeToggle from './ThemeToggle.jsx'

const DOCK_KEY = 'tovant.nav.dock'
const DOCKS = ['top', 'bottom', 'left', 'right']
const BAR_H = 56
const BAR_W = 200

const OWNER_JOBS = [
  ['My requests', 'Quotes you have sent', '/jobs'],
  ['Drafts', 'Requests you have not sent', '/drafts'],
  ['Messages', 'Notes on a live request', '/messages'],
  ['Service history', 'Invoices by vehicle', '/history'],
]
const OWNER_PROFILE = [
  ['My garage', 'Vehicles and service history', '/work/garage'],
  ['Profile settings', 'Name, photo, vehicles', '/settings'],
  ['Privacy and data', 'Export, delete, cookies', '/settings?tab=Privacy%20and%20data'],
  ['Sign out', 'Back to the public site', '/login?out=1'],
]
const ADMIN_PROFILE = [
  ['Site admin', 'Content, catalog and verify', '/admin'],
  ['Shop settings', 'Provider tools', '/provider-settings'],
  ['Owner settings', 'Member tools', '/settings'],
  ['Sign out', 'Back to the public site', '/login?out=1'],
]

const loadDock = () => {
  try {
    const v = localStorage.getItem(DOCK_KEY)
    if (DOCKS.includes(v)) return v
  } catch { /* ignore */ }
  return 'top'
}

const saveDock = (dock) => {
  try { localStorage.setItem(DOCK_KEY, dock) } catch { /* ignore */ }
}

const nearestDock = (x, y) => {
  const w = window.innerWidth
  const h = window.innerHeight
  const scores = [
    ['top', y],
    ['bottom', h - y],
    ['left', x],
    ['right', w - x],
  ]
  scores.sort((a, b) => a[1] - b[1])
  return scores[0][0]
}

const applyInsets = (dock) => {
  const root = document.documentElement
  root.style.setProperty('--tv-nav-inset-top', dock === 'top' ? `${BAR_H}px` : '0px')
  root.style.setProperty('--tv-nav-inset-bottom', dock === 'bottom' ? `${BAR_H}px` : '0px')
  root.style.setProperty('--tv-nav-inset-left', dock === 'left' ? `${BAR_W}px` : '0px')
  root.style.setProperty('--tv-nav-inset-right', dock === 'right' ? `${BAR_W}px` : '0px')
  root.dataset.navDock = dock
  window.dispatchEvent(new CustomEvent('tovant-nav-dock', { detail: dock }))
}

function CountBubble({ n }) {
  if (!n) return null
  return (
    <span style={{
      minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8,
      background: '#C83A2A', color: '#fff',
      font: '600 9px/16px var(--tv-mono)', textAlign: 'center', flex: 'none',
    }}>{n > 9 ? '9+' : n}</span>
  )
}

function MenuItem({ title, sub, to, onPick, badge }) {
  const [h, setH] = React.useState(false)
  return (
    <Link to={to} onClick={onPick} style={{ textDecoration: 'none' }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <div style={{
        padding: '11px 12px', borderRadius: 10, cursor: 'pointer', minHeight: 44,
        background: h ? 'var(--tv-inset)' : 'transparent',
        transition: 'background .25s var(--tv-ease)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ font: '600 13px/1.2 var(--tv-font)', color: 'var(--tv-ink)' }}>{title}</div>
          <CountBubble n={badge} />
        </div>
        <div style={{ font: '400 11px/1.35 var(--tv-font)', color: 'var(--tv-muted)', marginTop: 4 }}>{sub}</div>
      </div>
    </Link>
  )
}

function Panel({ open, items, onPick, dock }) {
  const panelStyle = (() => {
    if (dock === 'top') {
      return {
        left: 0, top: '100%', marginTop: 0,
        transform: open ? 'translateY(0)' : 'translateY(-6px)',
      }
    }
    if (dock === 'bottom') {
      return {
        left: 0, bottom: '100%', marginBottom: 0,
        transform: open ? 'translateY(0)' : 'translateY(6px)',
      }
    }
    if (dock === 'left') {
      return {
        left: '100%', top: 0, marginLeft: 0,
        transform: open ? 'translateX(0)' : 'translateX(-6px)',
      }
    }
    return {
      right: '100%', top: 0, marginRight: 0,
      transform: open ? 'translateX(0)' : 'translateX(6px)',
    }
  })()

  return (
    <div style={{
      visibility: open ? 'visible' : 'hidden',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      position: 'absolute',
      width: 260,
      zIndex: 50,
      transition: 'opacity .25s var(--tv-ease), transform .25s var(--tv-ease), visibility .25s var(--tv-ease)',
      ...panelStyle,
    }}>
      <div style={{
        padding: 8,
        background: 'var(--tv-surface)',
        boxShadow: 'var(--tv-shadow-menu)',
        border: '1px solid var(--tv-hairline)',
        borderRadius: dock === 'top' || dock === 'bottom' ? '0 0 12px 12px' : 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((row) => (
            <MenuItem key={row[0]} title={row[0]} sub={row[1]} to={row[2]} badge={row[3]} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DragHandle({ vertical, onPointerDown }) {
  return (
    <button
      type="button"
      aria-label="Drag navigation bar to another edge"
      title="Drag to top, bottom, left, or right"
      onPointerDown={onPointerDown}
      style={{
        border: 0,
        background: 'var(--tv-inset)',
        cursor: 'grab',
        touchAction: 'none',
        display: 'grid',
        placeItems: 'center',
        width: vertical ? '100%' : 32,
        height: vertical ? 32 : 32,
        minHeight: 32,
        padding: 0,
        flex: 'none',
        color: 'var(--tv-muted)',
        borderRadius: 8,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="currentColor">
        <circle cx="4" cy="3.5" r="1.15" />
        <circle cx="10" cy="3.5" r="1.15" />
        <circle cx="4" cy="7" r="1.15" />
        <circle cx="10" cy="7" r="1.15" />
        <circle cx="4" cy="10.5" r="1.15" />
        <circle cx="10" cy="10.5" r="1.15" />
      </svg>
    </button>
  )
}

/** Traditional full-edge nav bar. Drag the grip to dock on any of the four sides. */
export default function NotchNav({ active = 'find' }) {
  const [open, setOpen] = React.useState(null)
  const [dock, setDock] = React.useState(loadDock)
  const [drag, setDrag] = React.useState(null)
  const [previewDock, setPreviewDock] = React.useState(null)
  const timer = React.useRef(null)
  const navRef = React.useRef(null)
  const [theme, setTheme] = React.useState(getTheme)

  React.useEffect(() => {
    const sync = () => setTheme(getTheme())
    window.addEventListener('tovant-theme', sync)
    return () => window.removeEventListener('tovant-theme', sync)
  }, [])

  React.useEffect(() => {
    applyInsets(dock)
    return () => {
      const root = document.documentElement
      root.style.removeProperty('--tv-nav-inset-top')
      root.style.removeProperty('--tv-nav-inset-bottom')
      root.style.removeProperty('--tv-nav-inset-left')
      root.style.removeProperty('--tv-nav-inset-right')
      delete root.dataset.navDock
    }
  }, [dock])

  const { pathname } = useLocation()
  const { session, logout, unreadCount, messages } = useStore()
  const role = session?.role || 'guest'
  const shopId = session?.shopId || 'ridgeline'
  const unread = role === 'provider' || role === 'admin' ? unreadCount() : 0
  const msgUnread = (messages || []).filter((t) => (
    role === 'provider' ? t.unread === 'shop' && t.shopId === session?.shopId : t.unread === 'owner'
  )).length

  const act = active || (
    pathname.startsWith('/settings') || pathname.startsWith('/jobs') || pathname.startsWith('/history')
    || pathname.startsWith('/booked') || pathname.startsWith('/invoice') || pathname.startsWith('/messages')
    || pathname.startsWith('/drafts')
      ? 'mid'
      : pathname.startsWith('/dashboard') ? 'dash' : 'find'
  )

  const show = (id) => { clearTimeout(timer.current); setOpen(id) }
  const hide = () => { timer.current = setTimeout(() => setOpen(null), 160) }
  const closeNow = () => { clearTimeout(timer.current); setOpen(null) }

  const vertical = dock === 'left' || dock === 'right'

  const linkStyle = (on) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: vertical ? 'auto' : BAR_H,
    minHeight: vertical ? 40 : BAR_H,
    padding: vertical ? '10px 14px' : '0 14px',
    border: 0,
    borderBottom: !vertical && on ? '2px solid var(--tv-accent)' : !vertical ? '2px solid transparent' : undefined,
    borderLeft: vertical && on ? '3px solid var(--tv-accent)' : vertical ? '3px solid transparent' : undefined,
    background: on ? 'var(--tv-accent-wash)' : 'transparent',
    color: on ? 'var(--tv-ink)' : 'var(--tv-body)',
    font: `${on ? 600 : 500} 13.5px/1 var(--tv-font)`,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxSizing: 'border-box',
    position: 'relative',
    width: vertical ? '100%' : 'auto',
    transition: 'background .2s var(--tv-ease), color .2s var(--tv-ease)',
  })

  const caret = (
    <span aria-hidden style={{
      fontSize: 8,
      opacity: 0.55,
      display: 'inline-block',
      transform: dock === 'top' ? 'rotate(180deg)' : dock === 'bottom' ? 'none' : dock === 'left' ? 'rotate(-90deg)' : 'rotate(90deg)',
    }}>▲</span>
  )

  const proDash = [
    ['Provider dashboard', 'Job calendar, requests and jobs', '/dashboard'],
    ['Requests waiting', 'Read the job, then approve or deny', '/dashboard?view=requests', unread],
    ['Messages', 'Notes with owners', '/messages', msgUnread],
    ['Customers', 'Records and vehicle history', '/work/customers'],
    ['Services and team', 'Workflows, pricing and staff', '/work/services'],
    ['Schedule and capacity', 'Week windows and jobs per day', '/dashboard?view=schedule'],
    ['Money', 'Payouts, rates and invoices', '/dashboard?view=money'],
  ]
  const proProfile = [
    ['Shop settings', 'Trades, radius, photo', '/provider-settings'],
    ['Public shop page', 'What owners see', `/provider/${shopId}`],
    ['Privacy', 'Delete shop data', '/provider-settings?tab=Privacy'],
    ['Sign out', session?.email || 'Back to the public site', '/login?out=1'],
  ]

  const mid = role === 'provider' || role === 'admin'
    ? { id: 'dash', label: 'Dashboard', to: '/dashboard', items: proDash, active: act === 'dash', badge: unread }
    : role === 'owner'
      ? {
        id: 'jobs',
        label: 'My jobs',
        to: '/jobs',
        items: OWNER_JOBS.map((row) => row[0] === 'Messages' ? [...row, msgUnread] : row),
        active: act === 'mid' || pathname.startsWith('/jobs') || pathname.startsWith('/drafts'),
      }
      : null

  const profile = role === 'guest'
    ? null
    : {
      id: 'profile',
      label: 'Profile',
      items: role === 'admin' ? ADMIN_PROFILE : role === 'provider' ? proProfile : OWNER_PROFILE,
      active: act === 'profile' || pathname.startsWith('/settings') || pathname.startsWith('/provider-settings') || pathname.startsWith('/admin'),
    }

  const joinOn = pathname.startsWith('/signup')
  const loginOn = pathname === '/login' || pathname === '/reset'
  const findOn = act === 'find' || (!mid?.active && !profile?.active && !joinOn && !loginOn)

  const handleDragStart = (e) => {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    closeNow()
    setDrag({ x: e.clientX, y: e.clientY })
    setPreviewDock(dock)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  React.useEffect(() => {
    if (!drag) return undefined
    const onMove = (e) => {
      setDrag({ x: e.clientX, y: e.clientY })
      setPreviewDock(nearestDock(e.clientX, e.clientY))
    }
    const onUp = (e) => {
      const next = nearestDock(e.clientX, e.clientY)
      setDock(next)
      saveDock(next)
      setDrag(null)
      setPreviewDock(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [drag])

  const dockedFrame = (() => {
    if (dock === 'top') {
      return {
        top: 0, left: 0, right: 0, height: BAR_H,
        flexDirection: 'row', alignItems: 'center',
        borderBottom: '1px solid var(--tv-hairline)',
      }
    }
    if (dock === 'bottom') {
      return {
        bottom: 0, left: 0, right: 0, height: BAR_H,
        flexDirection: 'row', alignItems: 'center',
        borderTop: '1px solid var(--tv-hairline)',
      }
    }
    if (dock === 'left') {
      return {
        top: 0, left: 0, bottom: 0, width: BAR_W,
        flexDirection: 'column', alignItems: 'stretch',
        borderRight: '1px solid var(--tv-hairline)',
      }
    }
    return {
      top: 0, right: 0, bottom: 0, width: BAR_W,
      flexDirection: 'column', alignItems: 'stretch',
      borderLeft: '1px solid var(--tv-hairline)',
    }
  })()

  const hint = previewDock || dock

  return (
    <>
      {drag && (
        <div aria-hidden style={{
          position: 'fixed', inset: 0, zIndex: 55, pointerEvents: 'none',
          background: 'transparent',
        }}>
          {['top', 'bottom', 'left', 'right'].map((side) => {
            const on = hint === side
            const base = {
              position: 'absolute',
              background: on ? 'rgba(229,190,60,.28)' : 'rgba(16,17,19,.06)',
              outline: on ? '2px solid var(--tv-accent)' : '1px dashed var(--tv-muted)',
              transition: 'background .15s ease',
            }
            const box = side === 'top' ? { ...base, top: 0, left: 0, right: 0, height: BAR_H }
              : side === 'bottom' ? { ...base, bottom: 0, left: 0, right: 0, height: BAR_H }
              : side === 'left' ? { ...base, top: 0, left: 0, bottom: 0, width: BAR_W }
              : { ...base, top: 0, right: 0, bottom: 0, width: BAR_W }
            return <div key={side} style={box} />
          })}
        </div>
      )}

      <nav
        ref={navRef}
        aria-label="Primary"
        data-dock={dock}
        style={{
          position: 'fixed',
          zIndex: 40,
          display: 'flex',
          gap: vertical ? 4 : 8,
          padding: vertical ? '12px 10px' : '0 16px',
          background: 'var(--tv-surface)',
          color: 'var(--tv-ink)',
          boxSizing: 'border-box',
          boxShadow: 'var(--tv-shadow)',
          opacity: drag ? 0.88 : 1,
          cursor: drag ? 'grabbing' : undefined,
          userSelect: drag ? 'none' : undefined,
          transition: drag ? 'none' : 'box-shadow .25s var(--tv-ease)',
          ...dockedFrame,
        }}
      >
        <DragHandle vertical={vertical} onPointerDown={handleDragStart} />

        <Link to="/" style={{
          font: '600 18px/1 var(--tv-font)',
          letterSpacing: '-.02em',
          color: 'var(--tv-ink)',
          textDecoration: 'none',
          padding: vertical ? '10px 8px 14px' : '0 8px 0 4px',
          display: 'flex',
          alignItems: 'center',
          flex: 'none',
          height: vertical ? 'auto' : BAR_H,
        }}>
          Tovant
        </Link>

        <div style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'stretch' : 'stretch',
          flex: 1,
          minWidth: 0,
          overflow: vertical ? 'auto' : 'visible',
          gap: 0,
        }}>
          <Link to="/find" style={linkStyle(findOn)}>Find a Pro</Link>

          {mid && (
            <div
              onMouseEnter={() => show(mid.id)}
              onMouseLeave={hide}
              style={{ position: 'relative' }}
            >
              <Link to={mid.to} style={linkStyle(mid.active)}>
                {mid.label}{caret}
                {mid.badge > 0 && (
                  <span aria-hidden style={{
                    width: 8, height: 8, borderRadius: 4, background: '#C83A2A', flex: 'none',
                  }} />
                )}
              </Link>
              <Panel open={open === mid.id} items={mid.items} onPick={closeNow} dock={dock} />
            </div>
          )}

          {profile && (
            <div
              onMouseEnter={() => show('profile')}
              onMouseLeave={hide}
              style={{ position: 'relative' }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-haspopup="menu"
                aria-expanded={open === 'profile'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpen((v) => v === 'profile' ? null : 'profile')
                  }
                }}
                style={linkStyle(profile.active)}
              >
                {profile.label}{caret}
                <span style={{
                  width: 26, height: 26, borderRadius: 13, background: 'var(--tv-inset)',
                  overflow: 'hidden', display: 'grid', placeItems: 'center', flex: 'none', marginLeft: 2,
                }}>
                  {session?.photo
                    ? <img src={session.photo} alt="" style={{ width: 26, height: 26, objectFit: 'cover' }} />
                    : (
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--tv-ink)" strokeWidth="1.9" strokeLinecap="round">
                        <circle cx="12" cy="8.4" r="3.6" /><path d="M4.8 20c1.2-3.6 4-5.4 7.2-5.4s6 1.8 7.2 5.4" />
                      </svg>
                    )}
                </span>
              </div>
              <Panel
                open={open === 'profile'}
                items={profile.items.map(([t, s, to]) => (
                  t === 'Sign out' ? [t, session.email || s, to] : [t, s, to]
                ))}
                onPick={(e) => {
                  closeNow()
                  if (e?.currentTarget?.getAttribute('href')?.includes('/login')) logout()
                }}
                dock={dock}
              />
            </div>
          )}

          {role === 'guest' && (
            <>
              <Link to="/signup" style={linkStyle(joinOn)}>Join</Link>
              <Link to="/login" style={linkStyle(loginOn)}>Sign in</Link>
            </>
          )}
        </div>

        <div style={{
          marginLeft: vertical ? 0 : 'auto',
          marginTop: vertical ? 'auto' : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: vertical ? 'center' : 'flex-end',
          padding: vertical ? '8px 0 4px' : 0,
          flex: 'none',
        }}>
          <ThemeToggle compact={false} />
        </div>
      </nav>
    </>
  )
}
