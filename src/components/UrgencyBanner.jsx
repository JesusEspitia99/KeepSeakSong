import { useEffect, useMemo, useState } from 'react'
import { DISCOUNT_PERCENT } from '../config'
import { getNextOccasion } from '../lib/nextOccasion'

function msUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight - now
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function UrgencyBanner() {
  const [remaining, setRemaining] = useState(msUntilMidnight())
  const occasion = useMemo(() => getNextOccasion(), [])

  useEffect(() => {
    const interval = setInterval(() => setRemaining(msUntilMidnight()), 1000)
    return () => clearInterval(interval)
  }, [])

  const occasionLabel = occasion
    ? occasion.daysUntil === 0
      ? `${occasion.name} is today`
      : `Order now for ${occasion.name} — ${occasion.daysUntil} day${occasion.daysUntil === 1 ? '' : 's'} left`
    : null

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-navy-900 px-4 py-2.5 text-center text-sm font-medium text-white">
      <span>🔥 {DISCOUNT_PERCENT}% OFF{occasionLabel ? ` · ${occasionLabel}` : ' today only'}</span>
      <span className="text-navy-300">·</span>
      <span>
        Ends in <span className="font-mono text-gold-400">{formatDuration(remaining)}</span>
      </span>
    </div>
  )
}
