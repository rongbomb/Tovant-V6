import { jobDate, toISODate } from './schedule.js'

const STORAGE_KEY = 'tovant.calendarConnections'

export const CALENDAR_PROVIDERS = [
  {
    id: 'google',
    name: 'Google Calendar',
    hint: 'Two-way sync for jobs and holds. Opens Google sign-in in production.',
    accent: '#4285F4',
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    hint: 'Subscribe with a private ICS feed, or import a downloaded calendar file.',
    accent: '#A2AAAD',
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    hint: 'Works with Outlook.com and Microsoft 365 calendars.',
    accent: '#0078D4',
  },
  {
    id: 'other',
    name: 'Other calendars',
    hint: 'Any app that reads ICS or CalDAV — Fantastical, Fastmail, Thunderbird, and more.',
    accent: '#E5BE3C',
  },
]

const emptyState = () => ({
  google: { connected: false, connectedAt: null, email: null },
  apple: { connected: false, connectedAt: null, email: null },
  outlook: { connected: false, connectedAt: null, email: null },
  other: { connected: false, connectedAt: null, email: null },
  feedToken: null,
})

export const loadCalendarConnections = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    return { ...emptyState(), ...JSON.parse(raw) }
  } catch {
    return emptyState()
  }
}

const saveCalendarConnections = (next) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* ignore */ }
  return next
}

export const ensureFeedToken = (state) => {
  if (state.feedToken) return state
  const feedToken = `tv-cal-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
  return saveCalendarConnections({ ...state, feedToken })
}

export const connectCalendar = (id, meta = {}) => {
  const cur = ensureFeedToken(loadCalendarConnections())
  return saveCalendarConnections({
    ...cur,
    [id]: {
      connected: true,
      connectedAt: new Date().toISOString(),
      email: meta.email || meta.label || `${id}@demo.tovant.com`,
    },
  })
}

export const disconnectCalendar = (id) => {
  const cur = loadCalendarConnections()
  return saveCalendarConnections({
    ...cur,
    [id]: { connected: false, connectedAt: null, email: null },
  })
}

const pad = (n) => String(n).padStart(2, '0')

const icsStamp = (isoDate, timeHHMM) => {
  const [y, m, d] = String(isoDate).split('-')
  const [hh, mm] = String(timeHHMM || '09:00').split(':')
  return `${y}${m}${d}T${pad(hh || '09')}${pad(mm || '00')}00`
}

const icsEnd = (isoDate, timeHHMM, durationMin = 90) => {
  const start = new Date(`${isoDate}T${String(timeHHMM || '09:00').padStart(5, '0')}:00`)
  start.setMinutes(start.getMinutes() + durationMin)
  return `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`
}

const escapeIcs = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\n/g, '\\n')

/**
 * Build a downloadable ICS of upcoming jobs for Apple / Outlook / Google import.
 */
const buildJobsIcs = ({ shopName, jobs, today }) => {
  const stamp = new Date()
  const dtstamp = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}${pad(stamp.getUTCSeconds())}Z`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tovant//Provider Jobs//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(shopName || 'Tovant jobs')}`,
  ]

  ;(jobs || [])
    .filter((j) => j.status !== 'cancelled')
    .forEach((j) => {
      const date = jobDate(j, today)
      if (!date) return
      const summary = `${j.job || 'Job'} · ${j.car || 'Vehicle'}`
      const desc = [
        j.mode ? `Mode: ${j.mode}` : null,
        j.status ? `Status: ${j.status}` : null,
        j.id ? `Job ID: ${j.id}` : null,
      ].filter(Boolean).join('\\n')
      lines.push(
        'BEGIN:VEVENT',
        `UID:${escapeIcs(j.id || summary)}@tovant.com`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${icsStamp(date, j.time)}`,
        `DTEND:${icsEnd(date, j.time, 90)}`,
        `SUMMARY:${escapeIcs(summary)}`,
        `DESCRIPTION:${escapeIcs(desc)}`,
        'END:VEVENT',
      )
    })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export const downloadJobsIcs = ({ shopName, jobs, today }) => {
  const body = buildJobsIcs({ shopName, jobs, today })
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(shopName || 'tovant-jobs').toLowerCase().replace(/\s+/g, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export const feedUrlFor = (token) => {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  return `${origin}/api/demo?calendar=${encodeURIComponent(token || 'demo')}`
}

export const webcalUrlFor = (token) => feedUrlFor(token).replace(/^https?:/, 'webcal:')

/** Month grid cells for a given year-month (Sun–Sat weeks). */
export const monthCells = (year, monthIndex) => {
  const first = new Date(year, monthIndex, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startPad; i += 1) {
    const d = new Date(year, monthIndex, 1 - (startPad - i))
    cells.push({ iso: toISODate(d), inMonth: false, date: d.getDate() })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, monthIndex, day)
    cells.push({ iso: toISODate(d), inMonth: true, date: day })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]
    const d = new Date(`${last.iso}T12:00:00`)
    d.setDate(d.getDate() + 1)
    cells.push({ iso: toISODate(d), inMonth: false, date: d.getDate() })
  }
  return cells
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
