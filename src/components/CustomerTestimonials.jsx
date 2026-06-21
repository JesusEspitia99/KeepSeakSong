import { CUSTOMER_TESTIMONIALS } from '../data/customerTestimonials'

function Stars() {
  return (
    <div className="text-gold-500" aria-hidden="true">
      {'★★★★★'}
    </div>
  )
}

export default function CustomerTestimonials() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-2xl font-medium text-navy-900 md:text-3xl">Moments that matter</h2>
      <p className="mt-2 text-center text-navy-400">See what families are saying</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CUSTOMER_TESTIMONIALS.map((t) => (
          <div key={t.name} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-6">
            <Stars />
            <p className="mt-3 text-sm leading-relaxed text-navy-700">"{t.quote}"</p>
            <p className="mt-4 text-sm font-semibold text-navy-900">{t.name}</p>
            <p className="text-xs text-navy-400">{t.context}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
