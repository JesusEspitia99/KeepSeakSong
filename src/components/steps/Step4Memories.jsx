import VoiceTextarea from '../VoiceTextarea'

export default function Step4Memories({ data, update, onNext }) {
  return (
    <div className="mx-auto max-w-xl text-left">
      <h2 className="text-center text-2xl font-medium text-navy-900">Share your favorite memories</h2>
      <p className="mt-1 text-center text-navy-400">(Optional) Add specific moments to make the song even more personal</p>

      <div className="mt-6 rounded-xl bg-gold-50 p-3 text-sm text-gold-700">
        💡 Great memories to include: first dates or special occasions, inside jokes only you understand.
      </div>

      <div className="mt-4">
        <VoiceTextarea
          value={data.memories}
          onChange={(memories) => update({ memories })}
          placeholder="That trip where we got lost / the time when..."
          rows={5}
        />
      </div>

      <p className="mt-2 text-center text-sm text-navy-300">Skip if you're not sure what to write.</p>

      <button
        onClick={onNext}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 py-4 text-lg font-semibold text-white transition"
      >
        Continue
      </button>
    </div>
  )
}
