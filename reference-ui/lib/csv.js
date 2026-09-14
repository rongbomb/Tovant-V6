export function downloadCsv(filename, rows) {
  const body = (rows || []).map((row) => row.map((cell) => {
    const raw = cell == null ? '' : String(cell)
    return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw
  }).join(',')).join('\n')
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
