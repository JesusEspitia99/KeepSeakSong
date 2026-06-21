import { BRAND_NAME } from '../../config'

export default function LegalLayout({ title, updatedDate, children }) {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-2xl text-left">
        <a href="/" className="text-sm font-medium text-gold-600 hover:underline">
          ← Back to {BRAND_NAME}
        </a>
        <h1 className="mt-6 text-3xl font-medium text-navy-900">{title}</h1>
        <p className="mt-1 text-sm text-navy-300">Last updated: {updatedDate}</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-navy-600">{children}</div>
      </div>
    </div>
  )
}
