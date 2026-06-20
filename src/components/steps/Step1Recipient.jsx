const OPTIONS = [
  { id: 'partner', label: 'Partner', icon: '💜' },
  { id: 'child', label: 'Child', icon: '👶' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
  { id: 'friend', label: 'Friend', icon: '🤝' },
  { id: 'myself', label: 'Myself', icon: '✨' },
  { id: 'other', label: 'Someone else', icon: '🎁' },
]

export default function Step1Recipient({ data, update, onNext }) {
  const canContinue = data.recipient && data.name.trim().length > 0

  return (
    <div className="mx-auto max-w-xl text-left">
      <h2 className="text-center text-2xl font-medium text-navy-900">Who is this song for?</h2>
      <p className="mt-1 text-center text-navy-400">This will be used in the song lyrics</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => update({ recipient: opt.id })}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition ${
              data.recipient === opt.id
                ? 'border-gold-400 bg-gold-50 ring-2 ring-gold-200'
                : 'border-navy-100 bg-white hover:border-gold-200'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-sm font-medium text-navy-700">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-navy-500">What's their name?</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Enter their first name"
          className="w-full rounded-2xl border border-navy-200 px-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
        />
        <input
          type="text"
          value={data.pronunciation}
          onChange={(e) => update({ pronunciation: e.target.value })}
          placeholder="Tip: add pronunciation for clarity (e.g. Alicia: ah-lee-sha)"
          className="mt-2 w-full rounded-2xl border border-navy-100 px-4 py-2.5 text-sm text-navy-600 placeholder-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
        />
        <input
          type="text"
          value={data.nickname}
          onChange={(e) => update({ nickname: e.target.value })}
          placeholder="Do you have a nickname for them? (optional)"
          className="mt-2 w-full rounded-2xl border border-navy-100 px-4 py-2.5 text-sm text-navy-600 placeholder-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
        />
      </div>

      <button
        disabled={!canContinue}
        onClick={onNext}
        className="mt-8 w-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 py-4 text-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  )
}
