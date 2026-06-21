import { useEffect, useState } from 'react'
import { HOTMART_CHECKOUT_URL, SONG_PRICE } from '../config'
import { trackEvent } from '../lib/pixel'
import AudioTestimonial from './AudioTestimonial'
import { TESTIMONIALS } from '../data/testimonials'

function buildLyricSnippet(data) {
  const name = data.nickname?.trim() || data.name || 'you'
  const trait = data.special?.trim().split(/[.,/]/)[0]?.trim()
  const vibe = (data.vibe || 'this').toLowerCase()

  const line1 = `${name}, they say your name like a quiet prayer,`
  const line2 = trait
    ? `${trait.charAt(0).toUpperCase() + trait.slice(1)} — that's the line we couldn't leave out.`
    : `Every little thing about you, written down with care.`
  const article = /^[aeiou]/i.test(vibe) ? 'an' : 'a'
  const line3 = `This is ${article} ${vibe} song, just for ${name},`
  const line4 = `built from the moments only we would understand.`

  return [line1, line2, line3, line4]
}

export default function PreCheckout({ data }) {
  const [generating, setGenerating] = useState(true)
  const [lyricLines, setLyricLines] = useState([])

  useEffect(() => {
    let cancelled = false

    async function generate() {
      try {
        const response = await fetch('/api/generate-lyrics', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('API failed')
        const result = await response.json()
        if (!cancelled && result.lines?.length) {
          setLyricLines(result.lines)
          setGenerating(false)
          return
        }
        throw new Error('Empty response')
      } catch {
        if (!cancelled) {
          setLyricLines(buildLyricSnippet(data))
          setGenerating(false)
        }
      }
    }

    generate()
    return () => {
      cancelled = true
    }
  }, [data])

  useEffect(() => {
    fetch('/api/submit-quiz', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Saving is best-effort — never block the user's experience on it.
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCheckout() {
    trackEvent('InitiateCheckout', { value: SONG_PRICE, currency: 'USD', content_name: 'keepsakesong_quiz' })
    window.location.href = HOTMART_CHECKOUT_URL
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10 text-center">
      <h2 className="text-2xl font-medium text-navy-900">
        Almost there! Here's a first look at {data.name ? `${data.name}'s` : "your person's"} song
      </h2>

      <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50 p-6">
        {generating ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="h-3 w-3 animate-bounce rounded-full bg-gold-500" />
            <p className="text-sm font-medium text-gold-700">Writing the first lines…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2 text-left">
            <span className="mb-1 text-2xl">📝</span>
            <p className="mx-auto mb-2 text-center text-xs font-medium uppercase tracking-wide text-gold-600">
              Draft lyric preview
            </p>
            {lyricLines.map((line, i) => (
              <p key={i} className="font-serif text-base italic text-navy-800">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-navy-300">
        A draft of the lyrics, based on your story. The finished song — fully composed, sung, and
        produced — arrives in your inbox.
      </p>

      <div className="mt-8 text-left">
        <h3 className="text-center text-sm font-medium text-navy-400">Stories that already became a song</h3>
        <div className="mt-3 space-y-2">
          {TESTIMONIALS.map((t) => (
            <AudioTestimonial key={t.title} title={t.title} name={t.name} src={t.src} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-navy-400">
        <span>🔒 7-day money-back guarantee</span>
        <span>❤️ Love it, or your money back</span>
      </div>

      <p className="mt-6 text-2xl font-semibold text-navy-900">${SONG_PRICE}</p>
      <p className="text-xs text-navy-300">One-time payment, paid securely at checkout</p>

      <button
        onClick={handleCheckout}
        disabled={generating}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 py-4 text-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        I want the full song — ${SONG_PRICE}
      </button>
      <p className="mt-2 text-xs text-navy-300">Only a few spots left today</p>
    </div>
  )
}
