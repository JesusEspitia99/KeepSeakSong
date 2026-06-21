import { useEffect, useRef, useState } from 'react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioTestimonial({ title, name, src, story }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setProgress(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnd = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <div className="rounded-xl border border-navy-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600 transition hover:bg-gold-100"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-700">"{title}"</p>
          <p className="text-xs text-navy-300">{name}</p>
        </div>
        <span className="shrink-0 text-xs text-navy-300">{formatTime(duration)}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
        <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {story && <p className="mt-2 text-xs leading-relaxed text-navy-400">{story}</p>}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  )
}
