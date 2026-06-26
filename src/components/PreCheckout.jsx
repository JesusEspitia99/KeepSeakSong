import { useEffect, useState } from 'react'
import { DISCOUNT_PERCENT, HOTMART_CHECKOUT_URL, ORIGINAL_PRICE, SONG_PRICE } from '../config'
import { trackEvent } from '../lib/pixel'
import AudioTestimonial from './AudioTestimonial'
import { TESTIMONIALS } from '../data/testimonials'

function buildLyricSnippet(data) {
  const name = data.nickname?.trim() || data.name || 'you'
  const trait = data.special?.trim().split(/[.,/]/)[0]?.trim()
  const vibe = (data.vibe || 'this').toLowerCase()
  const article = /^[aeiou]/i.test(vibe) ? 'an' : 'a'

  return [
    {
      section: 'Verse 1',
      lines: [
        `${name}, they say your name like a quiet prayer,`,
        trait
          ? `${trait.charAt(0).toUpperCase() + trait.slice(1)} — that's the line we couldn't leave out.`
          : `Every little thing about you, written down with care.`,
      ],
    },
    {
      section: 'Chorus',
      lines: [
        `This is ${article} ${vibe} song, just for ${name},`,
        `built from the moments only we would understand.`,
      ],
    },
    {
      section: 'Verse 2',
      lines: [
        `${name}, every word here was chosen with you in mind,`,
        `a story worth keeping, set to a melody you'll find.`,
      ],
    },
  ]
}

export default function PreCheckout({ data }) {
  const [generating, setGenerating] = useState(true)
  const [preview, setPreview] = useState([])

  useEffect(() => {
    let cancelled = false

    async function generateAndSave() {
      let previewSections
      let fullSong = null

      try {
        const response = await fetch('/api/generate-lyrics', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('API failed')
        const result = await response.json()
        if (!result.preview?.length) throw new Error('Empty response')
        previewSections = result.preview
        fullSong = result.fullSong || null
      } catch {
        previewSections = buildLyricSnippet(data)
      }

      if (!cancelled) {
        setPreview(previewSections)
        setGenerating(false)
      }

      fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, generatedLyrics: previewSections, fullSong }),
      }).catch(() => {
        // Saving is best-effort — never block the user's experience on it.
      })
    }

    generateAndSave()
    return () => {
      cancelled = true
    }
  }, [data])

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
          <div className="flex flex-col items-center gap-4 py-2 text-left">
            <span className="text-2xl">📝</span>
            <p className="mx-auto -mt-2 text-center text-xs font-medium uppercase tracking-wide text-gold-600">
              Draft lyric preview
            </p>
            {preview.map((section) => (
              <div key={section.section} className="w-full">
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-navy-300">
                  {section.section}
                </p>
                {section.lines.map((line, i) => (
                  <p key={i} className="text-center font-serif text-base italic text-navy-800">
                    {line}
                  </p>
                ))}
              </div>
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

      <p className="mt-6 text-sm font-medium text-gold-600">{DISCOUNT_PERCENT}% off today only</p>
      <p className="text-2xl font-semibold text-navy-900">
        <span className="mr-2 text-base text-navy-300 line-through">${ORIGINAL_PRICE}</span>${SONG_PRICE}
      </p>
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
