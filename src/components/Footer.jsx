import { BRAND_NAME, CONTACT_EMAIL } from '../config'

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 px-6 py-8 text-center text-xs text-navy-300">
      <p>
        © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <a href="/terms" className="hover:text-navy-500 hover:underline">
          Terms of Service
        </a>
        <a href="/privacy" className="hover:text-navy-500 hover:underline">
          Privacy Policy
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-navy-500 hover:underline">
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  )
}
