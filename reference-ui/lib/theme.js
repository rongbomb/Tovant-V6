export function getTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function setTheme(next) {
  const theme = next === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem('tovant.theme', theme) } catch { /* ignore */ }
  window.dispatchEvent(new Event('tovant-theme'))
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark')
}
