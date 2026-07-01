import { useEffect, useRef, useState } from 'react'
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
  ]
}

const PREP_MESSAGES = [
  'Reading your story…',
  'Writing the lyrics…',
  'Finding the melody…',
  'Recording the vocals…',
  'Mixing your song…',
]

export default function PreCheckout({ data }) {
  const [phase, setPhase] = useState('preparing') // preparing | ready | fallback
  const [progress, setProgress] = useState(6)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fallbackLyrics, setFallbackLyrics] = useState([])
  const cancelledRef = useRef(false)

  // Preparation-bar ticker: eases toward 92% while we wait on Suno, then jumps to 100 on ready.
  useEffect(() => {
    if (phase !== 'preparing') return
    const id = setInterval(() => {
      setProgress((p) => (p < 92 ? p + Math.max(1, Math.round((92 - p) / 12)) : p))
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    cancelledRef.current = false

    async function run() {
      // 1) Lyrics (Claude) — also our text fallback if the audio path fails.
      let fullSong = null
      let textPreview = buildLyricSnippet(data)
      try {
        const res = await fetch('/api/generate-lyrics', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const result = await res.json()
          if (result.preview?.length) textPreview = result.preview
          fullSong = result.fullSong || null
        }
      } catch {
        // keep template fallback
      }
      setFallbackLyrics(textPreview)

      // Persist the quiz + full song (best-effort, never blocks the experience).
      fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, generatedLyrics: textPreview, fullSong }),
      }).catch(() => {})

      // 2) Kick off the real Suno generation.
      if (!fullSong) return finishFallback()
      let taskId
      try {
        const res = await fetch('/api/song/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            fullSong,
            vibe: data.vibe,
            genre: data.genre,
            voice: data.voice,
            name: data.name,
            email: data.email,
          }),
        })
        if (!res.ok) return finishFallback()
        taskId = (await res.json()).taskId
      } catch {
        return finishFallback()
      }
      if (!taskId) return finishFallback()

      // 3) Poll until the preview is ready.
      const deadline = Date.now() + 4 * 60 * 1000 // give Suno up to 4 minutes
      while (!cancelledRef.current && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 4000))
        if (cancelledRef.current) return
        try {
          const res = await fetch(`/api/song/status?taskId=${encodeURIComponent(taskId)}`)
          const s = await res.json()
          if (s.state === 'ready' && s.previewUrl) {
            if (cancelledRef.current) return
            setPreviewUrl(s.previewUrl)
            setProgress(100)
            setPhase('ready')
            return
          }
          if (s.state === 'failed') return finishFallback()
          if (typeof s.progress === 'number') setProgress((p) => Math.max(p, s.progress))
        } catch {
          // transient — keep polling
        }
      }
      finishFallback()
    }

    function finishFallback() {
      if (cancelledRef.current) return
      setProgress(100)
      setPhase('fallback')
    }

    run()
    return () => {
      cancelledRef.current = true
    }
  }, [data])

  function handleCheckout() {
    trackEvent('InitiateCheckout', {
      value: SONG_PRICE,
      currency: 'USD',
      content_name: 'keepsakesong_quiz',
      email: data.email,
    })
    const checkoutUrl = new URL(HOTMART_CHECKOUT_URL)
    if (data.email) checkoutUrl.searchParams.set('email', data.email)
    window.location.href = checkoutUrl.toString()
  }

  const prepMessage = PREP_MESSAGES[Math.min(PREP_MESSAGES.length - 1, Math.floor((progress / 100) * PREP_MESSAGES.length))]

  return (
    <div className="mx-auto max-w-xl px-6 py-10 text-center">
      <h2 className="text-2xl font-medium text-navy-900">
        {phase === 'ready'
          ? `Here's a first listen to ${data.name ? `${data.name}'s` : "your person's"} song`
          : `We're composing ${data.name ? `${data.name}'s` : 'your'} song right now`}
      </h2>

      <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50 p-6">
        {phase === 'preparing' && (
          <div className="py-2">
            <p className="mb-3 text-sm font-medium text-gold-700">{prepMessage}</p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-navy-400">
              This usually takes under a minute — we're recording a real, original song, not a template.
            </p>
          </div>
        )}

        {phase === 'ready' && previewUrl && (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="text-2xl">🎧</span>
            <p className="text-xs font-medium uppercase tracking-wide text-gold-600">
              45-second preview
            </p>
            <audio controls autoPlay src={previewUrl} className="w-full" controlsList="nodownload noplaybackrate">
              Your browser doesn't support audio playback.
            </audio>
            <p className="text-xs text-navy-400">
              This is the opening of the song. Unlock the full track below.
            </p>
          </div>
        )}

        {phase === 'fallback' && (
          <div className="flex flex-col items-center gap-3 py-2 text-left">
            <span className="text-2xl">📝</span>
            <p className="mx-auto text-center text-xs font-medium uppercase tracking-wide text-gold-600">
              Draft lyric preview
            </p>
            {fallbackLyrics.map((section) => (
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
            <p className="mx-auto mt-1 text-center text-xs text-navy-400">
              Your full song is being produced and will arrive in your inbox.
            </p>
          </div>
        )}
      </div>

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
        className="mt-4 w-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 py-4 text-lg font-semibold text-white transition hover:scale-[1.01]"
      >
        Unlock the Full Song — ${SONG_PRICE}
      </button>
      <p className="mt-2 text-xs text-navy-300">Only a few spots left today</p>
    </div>
  )
}
