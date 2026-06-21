import { useEffect, useState } from 'react'
import { ORIGINAL_PRICE, SONG_PRICE } from '../config'

export default function StickyCTA({ onStart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p className="text-sm text-navy-600">
          <span className="font-semibold text-navy-900">${SONG_PRICE}</span>{' '}
          <span className="text-navy-300 line-through">${ORIGINAL_PRICE}</span>{' '}
          <span className="hidden sm:inline">today · Free preview</span>
        </p>
        <button
          onClick={onStart}
          className="shrink-0 rounded-full bg-gradient-to-r from-navy-700 to-gold-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Create My Song
        </button>
      </div>
    </div>
  )
}
