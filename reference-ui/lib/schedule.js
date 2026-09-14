export const WEEK_WINDOWS = [
  { id: 'morning', label: 'Morning', hint: '8 to 10 AM' },
  { id: 'midday', label: 'Mid-day', hint: '11 AM to 1 PM' },
  { id: 'afternoon', label: 'Afternoon', hint: '2 to 4 PM' },
]

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const toISODate = (d) => {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export const mondayOf = (iso) => {
  const d = new Date(`${(iso || toISODate(new Date()))}T12:00:00`)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return toISODate(d)
}

export const weekDays = (mondayIso) => DAY_LABELS.map((label, i) => {
  const iso = addDays(mondayIso, i)
  const d = new Date(`${iso}T12:00:00`)
  return { iso, label, date: d.getDate() }
})

export const windowFromSlot = (slot) => {
  const s = String(slot || '').toLowerCase()
  if (/morning/.test(s)) return 'morning'
  if (/mid-day|midday/.test(s)) return 'midday'
  if (/afternoon/.test(s)) return 'afternoon'
  if (/8\s*am|9\s*am|10\s*am|^8:|^9:|^10:/.test(s)) return 'morning'
  if (/11\s*am|12\s*pm|1\s*pm|^11:|^12:|^1:/.test(s)) return 'midday'
  if (/2\s*pm|3\s*pm|4\s*pm|^2:|^3:|^4:/.test(s)) return 'afternoon'
  return 'morning'
}

export const jobWindow = (job) => job.window || windowFromSlot(job.time || job.slot)

export const jobDate = (job, fallback) => job.date || fallback
