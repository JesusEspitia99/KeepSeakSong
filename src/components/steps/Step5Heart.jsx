import { useState } from 'react'
import { trackEvent } from '../../lib/pixel'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Step5Heart({ data, update, onNext }) {
  const [agreed, setAgreed] = useState(false)
  const canContinue = data.heartMessage.trim().length > 0 && isValidEmail(data.email) && agreed

  function handleSubmit() {
    trackEvent('Lead', { content_name: 'quiz_completed', recipient: data.recipient })
    onNext()
  }

  return (
    <div className="mx-auto max-w-xl text-left">
      <h2 className="text-center text-2xl font-medium text-navy-900">A message from your heart</h2>
      <p className="mt-1 text-center text-navy-400">
        How do you want {data.name || 'them'} to feel when they hear this?
      </p>

      <textarea
        value={data.heartMessage}
        onChange={(e) => update({ heartMessage: e.target.value })}
        placeholder="What you've never said enough, what you want to thank them for..."
        rows={4}
        className="mt-4 w-full rounded-2xl border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200 resize-none"
      />

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-navy-500">Your email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@email.com"
          className="w-full rounded-2xl border border-navy-200 px-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
        />
        <p className="mt-1 text-xs text-navy-300">We'll send your song preview here when it's ready.</p>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-navy-400">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        I agree to the Terms and Privacy Policy.
      </label>

      <button
        disabled={!canContinue}
        onClick={handleSubmit}
        className="mt-8 w-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 py-4 text-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Create {data.name || 'Their'}'s Song
      </button>
    </div>
  )
}
