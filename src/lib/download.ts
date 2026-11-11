/**
 * Pobiera dane jako plik JSON przez Blob + URL.createObjectURL.
 * Bez zależności, działa we wszystkich nowoczesnych przeglądarkach.
 */
export function downloadJson(payload: unknown, filename: string): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], {type: 'application/json;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  // Zwolnienie URL po chwili – Safari potrzebuje czasu na rozpoczęcie pobierania
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}