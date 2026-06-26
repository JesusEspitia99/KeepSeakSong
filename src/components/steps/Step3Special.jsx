import VoiceTextarea from '../VoiceTextarea'

const MIN_LENGTH = 20

export default function Step3Special({ data, update, onNext }) {
  const remaining = MIN_LENGTH - data.special.trim().length
  const canContinue = remaining <= 0

  return (
    <div className="mx-auto max-w-xl text-left">
      <h2 className="text-center text-2xl font-medium text-navy-900">
        What makes {data.name || 'them'} special?
      </h2>
      <p className="mt-1 text-center text-navy-400">Their best qualities, quirks, and what you love about them</p>

      <div className="mt-6 rounded-xl bg-gold-50 p-3 text-sm text-gold-700">
        💡 Consider including: personality traits, habits or quirks that make you smile, what makes them unique.
      </div>

      <div className="mt-4">
        <VoiceTextarea
          value={data.special}
          onChange={(special) => update({ special })}
          placeholder="Their infectious laugh / how they always know the right thing to say..."
          rows={5}
        />
        {remaining > 0 && (
          <p className="mt-1 text-right text-xs text-navy-300">
            Add {remaining} more character{remaining === 1 ? '' : 's'} to continue
          </p>
        )}
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
