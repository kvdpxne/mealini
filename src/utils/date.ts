export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) {
    throw new Error(`Nieprawidłowy format daty: ${dateStr}`)
  }
  return new Date(y, m - 1, d)
}

export function todayLocalMidnight(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 86_400_000
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

export function formatRelativeExpiry(dateStr: string | null): string {
  if (!dateStr) return 'bez terminu'

  let target: Date
  try {
    target = parseLocalDate(dateStr)
  } catch {
    return 'nieprawidłowa data'
  }

  const diff = daysBetween(todayLocalMidnight(), target)

  if (diff < 0) {
    const n = Math.abs(diff)
    if (n === 1) return 'przeterminowane 1 dzień'
    return `przeterminowane ${n} dni`
  }
  if (diff === 0) return 'ważne dziś'
  if (diff === 1) return 'ważne jutro'
  if (diff <= 7) return `ważne za ${diff} dni`
  return `ważne do ${target.toLocaleDateString('pl-PL')}`
}