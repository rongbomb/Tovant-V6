import React from 'react'
import {Link} from 'react-router-dom'
import { Card, Meta, Pill } from './primitives.jsx'
import { WEEK_WINDOWS, mondayOf, weekDays, addDays, toISODate, jobWindow, jobDate } from '../lib/schedule.js'

export default function WeekCalendar({ jobs, holds, jobsPerDay, onHold, onSelectJob, selectedId, onAdvance }) {
  const today = toISODate(new Date())
  const [monday, setMonday] = React.useState(() => mondayOf(today))
  const days = weekDays(monday)
  const end = days[6].iso

  const jobsOn = (iso, windowId) => jobs.filter((j) => jobDate(j, today) === iso && jobWindow(j) === windowId)
  const held = (iso, windowId) => (holds || []).some((h) => h.date === iso && h.window === windowId)
  const dayCount = (iso) => jobs.filter((j) => jobDate(j, today) === iso && j.status !== 'completed').length

  return (
    <Card style={{ marginTop: 20 }} pad={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h2 className="tv-sectitle" style={{ margin: 0, fontSize: 16 }}>Week</h2>
          <div className="tv-data" style={{ marginTop: 8 }}>
            {days[0].label} {days[0].date} to {days[6].label} {days[6].date} · {jobsPerDay} JOBS A DAY
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill variant="surface" onClick={() => setMonday((m) => addDays(m, -7))} style={{ padding: '10px 14px', borderRadius: 16, fontSize: 12 }}>Previous</Pill>
          <Pill variant="ink" onClick={() => setMonday(mondayOf(today))} style={{ padding: '10px 14px', borderRadius: 16, fontSize: 12, boxShadow: 'none' }}>This week</Pill>
          <Pill variant="surface" onClick={() => setMonday((m) => addDays(m, 7))} style={{ padding: '10px 14px', borderRadius: 16, fontSize: 12 }}>Next</Pill>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '92px repeat(7, minmax(0, 1fr))',
        gap: 8,
        marginTop: 20,
      }}>
        <div />
        {days.map((d) => {
          const on = d.iso === today
          const n = dayCount(d.iso)
          return (
            <div key={d.iso} style={{
              textAlign: 'center', padding: '10px 4px 8px', borderRadius: 14,
              background: on ? 'var(--tv-ink)' : 'transparent',
            }}>
              <div style={{ font: '600 10px/1 var(--tv-mono)', letterSpacing: '.1em', color: on ? 'rgba(255,255,255,.5)' : 'var(--tv-faint)' }}>{d.label}</div>
              <div style={{ font: '600 18px/1 var(--tv-font)', marginTop: 6, color: on ? '#fff' : 'var(--tv-ink)' }}>{d.date}</div>
              <div className="tv-data" style={{ marginTop: 6, color: on ? 'rgba(255,255,255,.45)' : undefined }}>{n}/{jobsPerDay}</div>
            </div>
          )
        })}

        {WEEK_WINDOWS.map((w) => (
          <React.Fragment key={w.id}>
            <div style={{ paddingTop: 14 }}>
              <div style={{ font: '600 12.5px/1.2 var(--tv-font)' }}>{w.label}</div>
              <div className="tv-data" style={{ marginTop: 6 }}>{w.hint}</div>
            </div>
            {days.map((d) => {
              const list = jobsOn(d.iso, w.id)
              const isHeld = held(d.iso, w.id)
              const past = d.iso < today
              const full = dayCount(d.iso) >= jobsPerDay
              return (
                <button
                  key={`${d.iso}-${w.id}`}
                  type="button"
                  aria-label={`${w.label} ${d.label} ${d.date}`}
                  onClick={() => {
                    if (list.length) return
                    if (past) return
                    onHold?.(d.iso, w.id)
                  }}
                  style={{
                    minHeight: 118, padding: 8, border: 0, borderRadius: 16, cursor: past ? 'default' : 'pointer',
                    textAlign: 'left',
                    background: isHeld ? 'var(--tv-inset-2)' : d.iso === today ? 'var(--tv-accent-wash)' : 'var(--tv-inset)',
                    opacity: past ? 0.55 : 1,
                    transition: 'transform .3s var(--tv-ease), box-shadow .3s var(--tv-ease)',
                  }}
                >
                  {list.map((j) => (
                    <div
                      key={j.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onSelectJob?.(j) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onSelectJob?.(j) } }}
                      style={{
                        padding: '8px 9px', borderRadius: 12, marginBottom: 6,
                        background: selectedId === j.id ? 'var(--tv-ink)' : 'var(--tv-surface)',
                        boxShadow: 'var(--tv-shadow)',
                      }}
                    >
                      <div style={{ font: '600 11.5px/1.25 var(--tv-font)', color: selectedId === j.id ? '#fff' : 'var(--tv-ink)' }}>{j.car}</div>
                      <div className="tv-data" style={{ marginTop: 5, color: selectedId === j.id ? 'rgba(255,255,255,.5)' : undefined }}>
                        {j.time} · {(j.mode || 'SHOP').toString().toUpperCase()}
                      </div>
                      {selectedId === j.id && <Link to={'/work/jobs/'+j.id} onClick={e=>e.stopPropagation()} style={{display:'block',marginTop:8,color:'var(--tv-accent)',fontSize:11}}>Open job details</Link>}
                      {selectedId === j.id && j.status !== 'completed' && (
                        <div
                          onClick={(e) => { e.stopPropagation(); onAdvance?.(j.id) }}
                          style={{ marginTop: 8, font: '600 10.5px/1 var(--tv-font)', color: 'var(--tv-accent)' }}
                        >
                          {j.domainStatus === 'en_route' ? 'Mark arrived' : j.domainStatus === 'arrived' ? 'Start / complete' : j.status === 'scheduled' ? 'Start' : 'Complete'}
                        </div>
                      )}
                    </div>
                  ))}
                  {!list.length && (
                    <div style={{ padding: '10px 6px' }}>
                      <Meta>{isHeld ? 'HELD' : past ? 'CLOSED' : full ? 'DAY FULL' : 'OPEN'}</Meta>
                      <div style={{ font: '400 11.5px/1.35 var(--tv-font)', color: 'var(--tv-muted)', marginTop: 8 }}>
                        {isHeld
                          ? 'Held. Click to take work here again.'
                          : past
                            ? 'This window has passed.'
                            : 'Click to hold this window.'}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <p className="tv-small" style={{ marginTop: 16, color: 'var(--tv-muted)' }}>
        Open windows take owner bookings. Hold a window when the van is out or the bay is full. Jobs you book land in the matching Morning, Mid-day, or Afternoon cell.
      </p>
      <div className="tv-data" style={{ marginTop: 4 }}>{monday} to {end}</div>
    </Card>
  )
}
