import { useState } from 'react'
import { ORIGINAL_PRICE, SONG_PRICE } from '../config'

const FAQS = [
  {
    q: 'What if I don\'t like the song?',
    a: `We offer a 7-day money-back guarantee. If you're not happy with it, we'll make it right or refund you — no questions asked.`,
  },
  {
    q: 'How long does it take?',
    a: 'Your draft lyric preview appears right after the quiz. The finished, fully produced song arrives by email shortly after.',
  },
  {
    q: 'Do I have to record my voice?',
    a: 'No — the microphone is just an easier way to tell your story if typing feels harder. Writing it out works exactly as well.',
  },
  {
    q: 'How much does it cost?',
    a: `It's a one-time payment of $${SONG_PRICE} (regularly $${ORIGINAL_PRICE} — today's discount applies automatically at checkout), paid securely. No subscriptions, no hidden fees.`,
  },
  {
    q: 'Can I give this as a gift?',
    a: "Absolutely — most of our songs are gifts. You can write the story yourself, and we'll deliver it in time to surprise them.",
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-navy-100 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-navy-800">{q}</span>
        <span className="ml-4 shrink-0 text-gold-500">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="mt-2 text-sm text-navy-400">{a}</p>}
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="text-center text-2xl font-medium text-navy-900 md:text-3xl">Questions? We've got you.</h2>
      <div className="mt-8">
        {FAQS.map((item) => (
          <FaqItem key={item.q} {...item} />
        ))}
      </div>
    </section>
  )
}
