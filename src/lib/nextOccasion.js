function nthSundayOfMonth(year, month, n) {
  const date = new Date(year, month, 1)
  const dayOfWeek = date.getDay()
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  return new Date(year, month, firstSunday + (n - 1) * 7)
}

function occasionsForYear(year) {
  return [
    { name: "Valentine's Day", date: new Date(year, 1, 14) },
    { name: "Mother's Day", date: nthSundayOfMonth(year, 4, 2) },
    { name: "Father's Day", date: nthSundayOfMonth(year, 5, 3) },
    { name: 'Christmas', date: new Date(year, 11, 25) },
  ]
}

const MAX_DAYS_OUT = 45

export function getNextOccasion(now = new Date()) {
  const candidates = [...occasionsForYear(now.getFullYear()), ...occasionsForYear(now.getFullYear() + 1)]
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const upcoming = candidates
    .filter((o) => o.date >= today)
    .sort((a, b) => a.date - b.date)[0]

  if (!upcoming) return null

  const daysUntil = Math.round((upcoming.date - today) / (1000 * 60 * 60 * 24))
  if (daysUntil > MAX_DAYS_OUT) return null

  return { ...upcoming, daysUntil }
}
