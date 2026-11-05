export function formatRelativeExpiry(dateStr: string | null): string {
  if (!dateStr) return 'bez terminu'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)

  if (diff < 0) {
    const n = Math.abs(diff)
    return n === 1 ? 'przeterminowane 1 dzień' : `przeterminowane ${n} dni`
  }
  if (diff === 0) return 'ważne dziś'
  if (diff === 1) return 'ważne jutro'
  if (diff <= 7) return `ważne za ${diff} dni`
  return `ważne do ${d.toLocaleDateString('pl-PL')}`
}