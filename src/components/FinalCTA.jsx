import { DISCOUNT_PERCENT, ORIGINAL_PRICE, SONG_PRICE } from '../config'

export default function FinalCTA({ onStart }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="text-2xl font-medium text-navy-900 md:text-3xl">
        Some things are worth saying in a song.
      </h2>
      <p className="mt-3 text-navy-400">
        Tell us their story today — your song is just a few minutes away.
      </p>
      <p className="mt-2 text-sm font-medium text-gold-600">
        {DISCOUNT_PERCENT}% off today: <span className="line-through">${ORIGINAL_PRICE}</span>{' '}
        <span className="text-base font-semibold text-navy-800">${SONG_PRICE}</span>
      </p>

      <button
        onClick={onStart}
        className="mt-6 rounded-full bg-gradient-to-r from-navy-700 to-gold-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-navy-200 transition hover:scale-[1.02] hover:shadow-xl"
      >
        Create My Song — Free Preview
      </button>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-navy-400">
        <span>🔒 7-day money-back guarantee</span>
        <span>🎙️ Tell it in your own voice</span>
        <span>⏳ Limited spots available today</span>
      </div>
    </section>
  )
}
