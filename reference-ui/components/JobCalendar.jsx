import React from 'react'
import { Link } from 'react-router-dom'
import { Card, Meta, Pill } from './primitives.jsx'
import WeekCalendar from './WeekCalendar.jsx'
import { jobDate, toISODate, addDays } from '../lib/schedule.js'
import {
  CALENDAR_PROVIDERS,
  MONTH_NAMES,
  connectCalendar,
  disconnectCalendar,
  downloadJobsIcs,
  ensureFeedToken,
  feedUrlFor,
  loadCalendarConnections,
  monthCells,
  webcalUrlFor,
} from '../lib/calendarSync.js'

const STATUS_TONE = {
  scheduled: 'var(--tv-accent)',
  in_progress: 'var(--tv-ink)',
  ready: 'var(--tv-accent-ink)',
  completed: 'var(--tv-muted)',
}

const MonthGrid = ({ jobs, cursor, onPickDay, selectedDay, onSelectJob, selectedId }) => {
  const today = toISODate(new Date())
  const cells = monthCells(cursor.getFullYear(), cursor.getMonth())
  const byDay = React.useMemo(() => {
    const map = {}
    ;(jobs || []).forEach((j) => {
      const iso = jobDate(j, today)
      if (!iso) return
      ;(map[iso] ||= []).push(j)
    })
    return map
  }, [jobs, today])

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 6,
        marginBottom: 8,
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="tv-data" style={{ textAlign: 'center', padding: '6px 0' }}>{d.toUpperCase()}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
        {cells.map((c) => {
          const list = byDay[c.iso] || []
          const on = c.iso === today
          const picked = c.iso === selectedDay
          return (
            <button
              key={c.iso}
              type="button"
              aria-label={`${c.iso}, ${list.length} jobs`}
              aria-pressed={picked}
              onClick={() => onPickDay?.(c.iso)}
              style={{
                minHeight: 112,
                padding: 8,
                border: 0,
                borderRadius: 16,
                cursor: 'pointer',
                textAlign: 'left',
                background: picked ? 'var(--tv-accent-wash)' : on ? 'var(--tv-inset-2)' : 'var(--tv-inset)',
                opacity: c.inMonth ? 1 : 0.45,
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 10,
                font: '600 12px/1 var(--tv-font)',
                background: on ? 'var(--tv-ink)' : 'transparent',
                color: on ? '#fff' : 'var(--tv-ink)',
              }}>
                {c.date}
              </div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {list.slice(0, 3).map((j) => (
                  <div
                    key={j.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onSelectJob?.(j) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onSelectJob?.(j) } }}
                    style={{
                      padding: '5px 7px',
                      borderRadius: 9,
                      background: selectedId === j.id ? 'var(--tv-ink)' : 'var(--tv-surface)',
                      boxShadow: 'var(--tv-shadow)',
                      borderLeft: `3px solid ${STATUS_TONE[j.status] || 'var(--tv-muted)'}`,
                    }}
                  >
                    <div style={{
                      font: '600 10.5px/1.2 var(--tv-font)',
                      color: selectedId === j.id ? '#fff' : 'var(--tv-ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {j.time} {j.car}
                    </div>
                  </div>
                ))}
                {list.length > 3 && (
                  <div className="tv-data" style={{ paddingLeft: 2 }}>+{list.length - 3} more</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const DayAgenda = ({ day, jobs, selectedId, onSelectJob, onAdvance }) => {
  const today = toISODate(new Date())
  const list = (jobs || [])
    .filter((j) => jobDate(j, today) === day)
    .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))

  if (!day) {
    return (
      <Card style={{ marginTop: 16 }} pad={20}>
        <Meta>DAY</Meta>
        <p className="tv-small" style={{ marginTop: 10, color: 'var(--tv-muted)' }}>
          Pick a day on the month grid to see that day’s jobs.
        </p>
      </Card>
    )
  }

  return (
    <Card style={{ marginTop: 16 }} pad={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <Meta>DAY AGENDA</Meta>
          <h3 className="tv-sectitle" style={{ margin: '10px 0 0', fontSize: 16 }}>{day}</h3>
        </div>
        <div className="tv-data">{list.length} JOB{list.length === 1 ? '' : 'S'}</div>
      </div>
      {!list.length && (
        <p className="tv-small" style={{ marginTop: 14, color: 'var(--tv-muted)' }}>No jobs on this day.</p>
      )}
      {list.map((j) => (
        <div
          key={j.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 0',
            borderTop: '1px solid var(--tv-hairline)',
            marginTop: 4,
          }}
        >
          <div style={{ width: 56, font: '600 12px/1 var(--tv-mono)' }}>{j.time}</div>
          <button
            type="button"
            onClick={() => onSelectJob?.(j)}
            style={{
              flex: 1, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0,
            }}
          >
            <div style={{ font: '600 14px/1.25 var(--tv-font)', color: selectedId === j.id ? 'var(--tv-accent-ink)' : 'var(--tv-ink)' }}>
              {j.car}
            </div>
            <div className="tv-data" style={{ marginTop: 5 }}>{j.job} · {(j.mode || 'SHOP').toString().toUpperCase()} · {(j.status || '').toUpperCase()}</div>
          </button>
          <Link to={`/work/jobs/${j.id}`}>
            <Pill variant="surface" style={{ padding: '9px 12px', fontSize: 11.5 }}>Open</Pill>
          </Link>
          {j.status !== 'completed' && (
            <Pill variant="ink" onClick={() => onAdvance?.(j.id)} style={{ padding: '9px 12px', fontSize: 11.5, boxShadow: 'none' }}>
              Advance
            </Pill>
          )}
        </div>
      ))}
    </Card>
  )
}

const CalendarConnect = ({ shopName, jobs, connections, onChange }) => {
  const [busy, setBusy] = React.useState(null)
  const [copied, setCopied] = React.useState(false)
  const today = toISODate(new Date())
  const connectedCount = CALENDAR_PROVIDERS.filter((p) => connections[p.id]?.connected).length
  const feed = feedUrlFor(connections.feedToken)
  const webcal = webcalUrlFor(connections.feedToken)

  const handleConnect = async (id) => {
    setBusy(id)
    await new Promise((r) => setTimeout(r, 650))
    const next = connectCalendar(id, {
      email: id === 'google' ? 'shop@gmail.com'
        : id === 'apple' ? 'iCloud'
          : id === 'outlook' ? 'shop@outlook.com'
            : 'ICS feed',
    })
    onChange?.(next)
    setBusy(null)
  }

  const handleDisconnect = (id) => {
    onChange?.(disconnectCalendar(id))
  }

  const handleCopyFeed = async () => {
    try {
      await navigator.clipboard.writeText(feed)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* ignore */ }
  }

  return (
    <Card style={{ marginTop: 16 }} pad={22}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 420 }}>
          <Meta>EXTERNAL CALENDARS</Meta>
          <h2 className="tv-sectitle" style={{ margin: '10px 0 0', fontSize: 17 }}>Connect your calendar</h2>
          <p className="tv-small" style={{ marginTop: 10, color: 'var(--tv-muted)' }}>
            Push booked jobs into Google, Apple, Outlook, or any calendar that reads ICS.
            {connectedCount ? ` ${connectedCount} connected.` : ' None connected yet.'}
          </p>
        </div>
        <Pill
          variant="surface"
          onClick={() => downloadJobsIcs({ shopName, jobs, today })}
          style={{ padding: '11px 14px', borderRadius: 16, fontSize: 12 }}
        >
          Download .ics
        </Pill>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 18 }}>
        {CALENDAR_PROVIDERS.map((p) => {
          const row = connections[p.id] || {}
          const on = !!row.connected
          return (
            <div
              key={p.id}
              style={{
                padding: 16,
                borderRadius: 18,
                background: 'var(--tv-inset)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 5,
                  background: on ? 'var(--tv-accent)' : p.accent,
                  boxShadow: on ? '0 0 0 4px rgba(229,190,60,.25)' : 'none',
                }} />
                <div style={{ font: '600 14px/1.2 var(--tv-font)' }}>{p.name}</div>
              </div>
              <p className="tv-small" style={{ margin: 0, color: 'var(--tv-muted)', flex: 1 }}>{p.hint}</p>
              {on && (
                <div className="tv-data">
                  CONNECTED{row.email ? ` · ${String(row.email).toUpperCase()}` : ''}
                  {row.connectedAt ? ` · ${new Date(row.connectedAt).toLocaleDateString()}` : ''}
                </div>
              )}
              {on ? (
                <Pill
                  variant="surface"
                  onClick={() => handleDisconnect(p.id)}
                  style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12, alignSelf: 'flex-start' }}
                >
                  Disconnect
                </Pill>
              ) : (
                <Pill
                  variant="ink"
                  onClick={() => handleConnect(p.id)}
                  style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12, boxShadow: 'none', alignSelf: 'flex-start', opacity: busy === p.id ? 0.7 : 1 }}
                >
                  {busy === p.id ? 'Connecting…' : 'Connect'}
                </Pill>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, padding: 16, borderRadius: 18, background: 'var(--tv-surface)', boxShadow: 'var(--tv-shadow)' }}>
        <Meta>SUBSCRIBE URL</Meta>
        <p className="tv-small" style={{ marginTop: 8, color: 'var(--tv-muted)' }}>
          Apple Calendar → File → New Calendar Subscription. Outlook and Google can import the same feed or the .ics file.
        </p>
        <div style={{
          marginTop: 12,
          padding: '12px 14px',
          borderRadius: 14,
          background: 'var(--tv-inset)',
          font: '400 12px/1.4 var(--tv-mono)',
          wordBreak: 'break-all',
          color: 'var(--tv-ink-2)',
        }}>
          {webcal || feed || 'Connect any calendar to mint a private feed token.'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Pill variant="ink" onClick={handleCopyFeed} style={{ padding: '10px 14px', borderRadius: 14, fontSize: 12, boxShadow: 'none' }}>
            {copied ? 'Copied' : 'Copy HTTPS feed'}
          </Pill>
          <a href={webcal || '#'} onClick={(e) => { if (!webcal) e.preventDefault() }}>
            <Pill variant="surface" style={{ padding: '10px 14px', borderRadius: 14, fontSize: 12 }}>Open in Apple Calendar</Pill>
          </a>
        </div>
        <p className="tv-data" style={{ marginTop: 12 }}>
          DEMO NOTE · CONNECT SIMULATES OAUTH. PRODUCTION WIRES GOOGLE AND MICROSOFT SIGN-IN AND SERVES A LIVE ICS FEED.
        </p>
      </div>
    </Card>
  )
}

/**
 * Provider job calendar: month + week views, day agenda, external calendar connect.
 */
export default function JobCalendar({
  jobs,
  holds,
  jobsPerDay,
  shopName,
  selectedId,
  onSelectJob,
  onHold,
  onAdvance,
}) {
  const [mode, setMode] = React.useState('month')
  const [cursor, setCursor] = React.useState(() => new Date())
  const [selectedDay, setSelectedDay] = React.useState(() => toISODate(new Date()))
  const [connections, setConnections] = React.useState(() => ensureFeedToken(loadCalendarConnections()))
  const [showConnect, setShowConnect] = React.useState(false)

  const connectedCount = CALENDAR_PROVIDERS.filter((p) => connections[p.id]?.connected).length

  const shiftMonth = (delta) => {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  return (
    <div>
      <Card style={{ marginTop: 20 }} pad={20}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Meta>JOB CALENDAR</Meta>
            <h2 className="tv-sectitle" style={{ margin: '10px 0 0', fontSize: 18 }}>
              {mode === 'month'
                ? `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
                : 'Week schedule'}
            </h2>
            <p className="tv-small" style={{ marginTop: 8, color: 'var(--tv-muted)' }}>
              Track booked jobs. Sync them to Google, Apple, Outlook, or download an ICS file.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', padding: 4, borderRadius: 16, background: 'var(--tv-inset-2)' }}>
              {[['month', 'Month'], ['week', 'Week']].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={mode === id}
                  onClick={() => setMode(id)}
                  style={{
                    border: 0,
                    cursor: 'pointer',
                    padding: '9px 14px',
                    borderRadius: 12,
                    background: mode === id ? 'var(--tv-surface)' : 'transparent',
                    boxShadow: mode === id ? 'var(--tv-shadow)' : 'none',
                    font: '600 12px/1 var(--tv-font)',
                    color: 'var(--tv-ink)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {mode === 'month' && (
              <>
                <Pill variant="surface" onClick={() => shiftMonth(-1)} style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12 }}>Previous</Pill>
                <Pill variant="ink" onClick={() => { setCursor(new Date()); setSelectedDay(toISODate(new Date())) }} style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12, boxShadow: 'none' }}>Today</Pill>
                <Pill variant="surface" onClick={() => shiftMonth(1)} style={{ padding: '10px 12px', borderRadius: 14, fontSize: 12 }}>Next</Pill>
              </>
            )}
            <Pill
              variant={showConnect ? 'ink' : 'accent'}
              onClick={() => setShowConnect((v) => !v)}
              style={{ padding: '10px 14px', borderRadius: 14, fontSize: 12, boxShadow: showConnect ? 'none' : undefined }}
            >
              {showConnect ? 'Hide sync' : connectedCount ? `${connectedCount} calendar${connectedCount === 1 ? '' : 's'} synced` : 'Connect calendars'}
            </Pill>
          </div>
        </div>

        {mode === 'month' && (
          <div style={{ marginTop: 18 }}>
            <MonthGrid
              jobs={jobs}
              cursor={cursor}
              selectedDay={selectedDay}
              selectedId={selectedId}
              onPickDay={setSelectedDay}
              onSelectJob={onSelectJob}
            />
          </div>
        )}
      </Card>

      {mode === 'week' && (
        <WeekCalendar
          jobs={jobs}
          holds={holds}
          jobsPerDay={jobsPerDay}
          selectedId={selectedId}
          onSelectJob={onSelectJob}
          onHold={onHold}
          onAdvance={onAdvance}
        />
      )}

      {mode === 'month' && (
        <DayAgenda
          day={selectedDay}
          jobs={jobs}
          selectedId={selectedId}
          onSelectJob={onSelectJob}
          onAdvance={onAdvance}
        />
      )}

      {showConnect && (
        <CalendarConnect
          shopName={shopName}
          jobs={jobs}
          connections={connections}
          onChange={setConnections}
        />
      )}

      {!showConnect && (
        <p className="tv-small" style={{ marginTop: 14, color: 'var(--tv-muted)' }}>
          Tip: hold capacity windows in Week view. Upcoming range {toISODate(new Date())} to {addDays(toISODate(new Date()), 28)}.
        </p>
      )}
    </div>
  )
}
