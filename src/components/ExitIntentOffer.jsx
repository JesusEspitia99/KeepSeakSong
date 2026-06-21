import { useEffect, useState } from 'react'
import { DISCOUNT_PERCENT, ORIGINAL_PRICE, SONG_PRICE } from '../config'
import { trackEvent } from '../lib/pixel'

export default function ExitIntentOffer({ onStart }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('exitIntentShown')) return

    function onMouseOut(e) {
      if (e.clientY <= 0 && !e.relatedTarget) {
        setShow(true)
        sessionStorage.setItem('exitIntentShown', '1')
        trackEvent('ViewContent', { content_name: 'exit_intent_offer' })
      }
    }

    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  }, [])

  if (!show) return null

  function handleStart() {
    setShow(false)
    onStart()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 px-6">
      <div className="relative max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={() => setShow(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-navy-300 hover:text-navy-500"
        >
          ✕
        </button>
        <span className="text-3xl">🎵</span>
        <h2 className="mt-3 text-xl font-medium text-navy-900">Wait — don't leave empty-handed</h2>
        <p className="mt-2 text-sm text-navy-500">
          Your {DISCOUNT_PERCENT}% off is still here:{' '}
          <span className="font-semibold text-navy-800">${SONG_PRICE}</span>{' '}
          <span className="text-navy-300 line-through">${ORIGINAL_PRICE}</span>. Start your free
          preview now — it only takes 2 minutes.
        </p>
        <button
          onClick={handleStart}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Claim My Discount
        </button>
      </div>
    </div>
  )
}
