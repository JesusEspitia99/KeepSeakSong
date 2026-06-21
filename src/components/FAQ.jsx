import { useState } from 'react'
import { ORIGINAL_PRICE, SONG_PRICE } from '../config'

const FAQS = [
  {
    q: "What if I don't like the song?",
    a: `Then we haven't done our job, and we'll fix it. You have 7 days to tell us it's not right — we'll revise it or refund you completely, no questions asked. We'd rather lose the sale than have you settle for a song that doesn't feel like them.`,
  },
  {
    q: 'How long does it take?',
    a: "You don't have to wait to feel something — your draft lyric preview shows up right after the quiz, built from the exact details you just shared. The finished, fully produced song lands in your inbox shortly after.",
  },
  {
    q: 'Do I have to record my voice?',
    a: "No. But some of the most moving lines in our songs came from someone just talking, no filter, no overthinking what to write. If typing feels easier, that works just as well — the story matters more than how you tell it.",
  },
  {
    q: 'How much does it cost?',
    a: `Today it's $${SONG_PRICE} instead of the usual $${ORIGINAL_PRICE} — one payment, nothing recurring, no hidden fees. For something they'll keep forever, most people tell us it felt like a steal.`,
  },
  {
    q: 'Can I give this as a gift?',
    a: "It's the best gift you'll give this year, and most of our songs are exactly that. You write the story, we keep it a surprise — just tell us when you need it by and we'll have it ready in time.",
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
