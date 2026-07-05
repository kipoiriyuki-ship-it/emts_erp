export function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

export function formatPercent(value: unknown, digits = 1): string {
  return `${safeNumber(value).toFixed(digits)}%`
}
