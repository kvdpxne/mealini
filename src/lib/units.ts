export const UNITS = ['szt', 'kg', 'g', 'l', 'ml', 'opak'] as const
export type Unit = (typeof UNITS)[number]