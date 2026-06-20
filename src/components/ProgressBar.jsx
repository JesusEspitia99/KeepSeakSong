export default function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="mx-auto mb-8 w-full max-w-md">
      <div className="mb-2 flex justify-between text-xs font-medium text-navy-400">
        <span>Step {step} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy-700 to-gold-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-navy-300">Your progress is autosaved</p>
    </div>
  )
}
