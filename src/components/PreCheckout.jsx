import { useEffect, useRef, useState } from 'react'
import { DISCOUNT_PERCENT, HOTMART_CHECKOUT_URL, ORIGINAL_PRICE, SONG_PRICE } from '../config'
import { trackEvent } from '../lib/pixel'
import AudioTestimonial from './AudioTestimonial'
import { TESTIMONIALS } from '../data/testimonials'

// Generic, template-only teaser shown if the server couldn't produce the song at all.
// Contains no real generated lyrics, so nothing sensitive is ever exposed.
function templatePreview(data) {
  const name = data.nickname?.trim() || data.name || 'you'
  const vibe = (data.vibe || 'this').toLowerCase()
  const article = /^[aeiou]/i.test(vibe) ? 'an' : 'a'
  return [
    { section: 'Verse 1', lines: [`${name}, this is where your story starts,`, `every little detail, written from the heart.`] },
    { section: 'Chorus', lines: [`And this is ${article} ${vibe} song, just for ${name}…`], partial: true },
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
  const [previewLyrics, setPreviewLyrics] = useState([])
  const [activeLine, setActiveLine] = useState(-1)
  const audioRef = useRef(null)
  const cancelledRef = useRef(false)

  // Flat, ordered list of the visible lines — used for the karaoke-style highlight.
  const flatLines = previewLyrics.flatMap((s) => s.lines)

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
      // Ask the server to write + generate the song. It returns ONLY the 45s preview
      // lyrics — the full song is written and stored server-side and never sent here.
      let taskId = null
      try {
        const res = await fetch('/api/song/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const result = await res.json()
          if (result.previewLyrics?.length) setPreviewLyrics(result.previewLyrics)
          else setPreviewLyrics(templatePreview(data))
          taskId = result.taskId || null
        } else {
          setPreviewLyrics(templatePreview(data))
        }
      } catch {
        setPreviewLyrics(templatePreview(data))
      }

      if (!taskId) return finishFallback()

      // Poll until the audio preview is ready (long songs can take a few minutes to render).
      const deadline = Date.now() + 7 * 60 * 1000
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

  // Karaoke-style highlight: advance through the visible lines as the 45s preview plays.
  function handleTimeUpdate() {
    const el = audioRef.current
    if (!el || !flatLines.length) return
    const total = el.duration && isFinite(el.duration) ? el.duration : 45
    const idx = Math.min(flatLines.length - 1, Math.floor((el.currentTime / total) * flatLines.length))
    setActiveLine(idx)
  }

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

  // Renders the visible lyric lines with the active line highlighted during playback.
  function LyricLines() {
    let running = -1
    return (
      <div className="w-full space-y-3">
        {previewLyrics.map((section) => (
          <div key={section.section}>
            <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-navy-300">
              {section.section}
            </p>
            {section.lines.map((line, i) => {
              running += 1
              const isActive = running === activeLine
              return (
                <p
                  key={i}
                  className={`text-center font-serif text-base transition-colors duration-300 ${
                    isActive ? 'font-medium text-gold-600' : 'text-navy-800'
                  } ${section.partial ? 'italic' : ''}`}
                >
                  {line}
                  {section.partial ? ' …' : ''}
                </p>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const LockMessage = () => (
    <p className="mx-auto mt-4 max-w-sm rounded-xl bg-navy-50 px-4 py-3 text-center text-sm text-navy-500">
      🔒 Unlock the full song to hear how it ends — including the chorus, the bridge, and the
      final message.
    </p>
  )

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
              This takes about a minute — we're recording a real, original song, not a template.
            </p>
          </div>
        )}

        {phase === 'ready' && previewUrl && (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="text-2xl">🎧</span>
            <p className="text-xs font-medium uppercase tracking-wide text-gold-600">
              45-second preview
            </p>
            <audio
              ref={audioRef}
              controls
              autoPlay
              src={previewUrl}
              onTimeUpdate={handleTimeUpdate}
              className="w-full"
              controlsList="nodownload noplaybackrate"
            >
              Your browser doesn't support audio playback.
            </audio>
            <LyricLines />
            <LockMessage />
          </div>
        )}

        {phase === 'fallback' && (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="text-2xl">📝</span>
            <p className="text-xs font-medium uppercase tracking-wide text-gold-600">
              A first look at the lyrics
            </p>
            <LyricLines />
            <LockMessage />
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
