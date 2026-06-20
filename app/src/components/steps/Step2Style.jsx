const VIBES = ['Sweet', 'Emotional', 'Funny', 'Upbeat', 'Calm', 'Romantic']
const GENRES = ['Pop', 'Country', 'Rock', 'R&B', 'Ballad', 'Acoustic', 'Bachata']
const VOICES = ['Female', 'Male', 'No preference']

function PillGroup({ title, options, value, onSelect }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-medium text-navy-500">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              value === opt
                ? 'border-gold-400 bg-gold-50 text-gold-700 ring-2 ring-gold-200'
                : 'border-navy-100 bg-white text-navy-600 hover:border-gold-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Step2Style({ data, update, onNext }) {
  const canContinue = data.vibe && data.genre && data.voice

  return (
    <div className="mx-auto max-w-xl text-left">
      <h2 className="text-center text-2xl font-medium text-navy-900">Choose the vibe & genre</h2>
      <p className="mt-1 text-center text-navy-400">This guides the emotion and sound of the song</p>

      <PillGroup title="How should it feel?" options={VIBES} value={data.vibe} onSelect={(v) => update({ vibe: v })} />
      <PillGroup title="Genre" options={GENRES} value={data.genre} onSelect={(v) => update({ genre: v })} />
      <PillGroup title="Singer's voice" options={VOICES} value={data.voice} onSelect={(v) => update({ voice: v })} />

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
