const KEY = 'tovant.cookie-consent'

const DEFAULT_CONSENT = {
  necessary: true,
  analytics: false,
  marketing: false,
  at: 0,
}

export function getConsent() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return { ...DEFAULT_CONSENT, ...JSON.parse(raw) }
  } catch {
    return null
  }
}

export function setConsent(partial) {
  const next = { ...DEFAULT_CONSENT, ...getConsent(), ...partial, necessary: true, at: Date.now() }
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('tovant-consent'))
  return next
}

const hits = {}

export function rateOk(key, max = 6, windowMs = 60000) {
  const now = Date.now()
  const list = (hits[key] || []).filter((t) => now - t < windowMs)
  if (list.length >= max) return false
  list.push(now)
  hits[key] = list
  return true
}

export function ago(at) {
  const ms = Date.now() - at
  if (ms < 45000) return 'JUST NOW'
  if (ms < 3600000) return `${Math.max(1, Math.round(ms / 60000))} MIN AGO`
  if (ms < 86400000) return `${Math.max(1, Math.round(ms / 3600000))} HR AGO`
  return `${Math.max(1, Math.round(ms / 86400000))} DAY AGO`
}
