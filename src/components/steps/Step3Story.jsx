import VoiceTextarea from '../VoiceTextarea'

export default function Step3Story({ data, update, onNext }) {
  const canContinue = data.special.trim().length > 0

  return (
    <div className="mx-auto max-w-xl text-left">
      <h2 className="text-center text-2xl font-medium text-navy-900">
        Tell us about {data.name || 'them'}
      </h2>
      <p className="mt-1 text-center text-navy-400">
        The details you share become the lyrics of the song
      </p>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-navy-600">
          What makes {data.name || 'them'} special?
        </label>
        <VoiceTextarea
          value={data.special}
          onChange={(special) => update({ special })}
          placeholder="Their infectious laugh / how they always know the right thing to say..."
          rows={4}
        />
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium text-navy-600">
          A favorite memory together <span className="text-navy-300">(optional)</span>
        </label>
        <VoiceTextarea
          value={data.memories}
          onChange={(memories) => update({ memories })}
          placeholder="That trip where we got lost / the time when..."
          rows={4}
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
