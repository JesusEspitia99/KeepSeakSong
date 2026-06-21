const STEPS = [
  {
    icon: '💬',
    title: 'Tell their story',
    description: 'Answer a few quick questions — write it out or just tell it in your own voice.',
  },
  {
    icon: '✍️',
    title: 'We write the lyrics',
    description: "We turn your story into real lyrics, built around the moments only you two would understand.",
  },
  {
    icon: '🎧',
    title: 'Get your song',
    description: 'Your finished song — fully composed, sung, and produced — lands in your inbox.',
  },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="text-center text-2xl font-medium text-navy-900 md:text-3xl">How it works</h2>
      <p className="mt-2 text-center text-navy-400">From their story to their song, in three steps</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-navy-100 bg-white p-6 text-center">
            <span className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <span className="text-3xl">{step.icon}</span>
            <h3 className="mt-3 text-base font-semibold text-navy-800">{step.title}</h3>
            <p className="mt-2 text-sm text-navy-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
