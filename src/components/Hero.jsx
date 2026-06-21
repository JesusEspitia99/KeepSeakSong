import { BRAND_NAME } from '../config'
import AudioTestimonial from './AudioTestimonial'
import { TESTIMONIALS } from '../data/testimonials'

export default function Hero({ onStart }) {
  const example = TESTIMONIALS[0]

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-16 pb-10 text-center">
      <span className="mb-5 rounded-full bg-gold-50 px-4 py-1 text-sm font-medium text-gold-600">
        {BRAND_NAME} · The #1 Story-to-Song Platform
      </span>

      <h1 className="font-serif text-4xl font-medium leading-tight text-navy-900 md:text-5xl">
        "I never thought hearing my own story, sung back to me, would make me cry like that."
      </h1>

      <p className="mt-5 max-w-xl text-lg text-navy-500">
        Tell us their story — written or in your own voice — and we'll turn it into a one-of-a-kind
        song made just for them.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={onStart}
          className="rounded-full bg-gradient-to-r from-navy-700 to-gold-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-navy-200 transition hover:scale-[1.02] hover:shadow-xl"
        >
          Create My Song — Free Preview
        </button>
        <p className="text-sm text-navy-400">Takes 2 minutes · You can tell it by voice</p>
      </div>

      <div className="mt-10 w-full max-w-sm text-left">
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-navy-300">
          🎧 Listen to an example
        </p>
        <AudioTestimonial title={example.title} name={example.name} src={example.src} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-navy-400">
        <span>⭐ Loved by happy customers</span>
        <span>🎙️ Tell it in your own voice</span>
        <span>🔒 Satisfaction guaranteed</span>
      </div>
    </section>
  )
}
