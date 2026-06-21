import { BRAND_NAME, CONTACT_EMAIL } from '../../config'
import LegalLayout from './LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updatedDate="June 21, 2026">
      <p>
        This Privacy Policy explains what information {BRAND_NAME} collects, how we use it, and
        your rights regarding that information.
      </p>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">1. Information we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Details you provide in the quiz: names, relationship, preferences, stories, memories, and messages.</li>
          <li>Your email address, to send you your song preview and updates.</li>
          <li>Voice recordings, only if you choose to use the microphone feature, which are converted to text in your browser.</li>
          <li>Basic technical data (such as browser type and pages visited) via the Meta Pixel, used for advertising and analytics.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">2. How we use your information</h2>
        <p>
          We use the information you provide to generate your lyric preview, produce your finished
          song, communicate with you about your order, and improve our Service. We do not sell your
          personal information.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">3. Third-party services we use</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Anthropic (Claude API) — to generate your draft lyric preview from your quiz answers.</li>
          <li>Supabase — to securely store your quiz responses.</li>
          <li>Meta (Facebook) Pixel — for advertising and measuring ad performance.</li>
          <li>Hotmart — to process payments. We do not store your payment card details.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">4. Data retention</h2>
        <p>
          We retain your quiz responses and order information for as long as needed to deliver your
          song and provide support, or as required by law.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">5. Your rights</h2>
        <p>
          You can ask us to access, correct, or delete your personal information at any time by
          emailing{' '}
          <a className="text-gold-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">6. Children's privacy</h2>
        <p>The Service is not directed at children under 13, and we do not knowingly collect information from them.</p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">7. Changes to this policy</h2>
        <p>We may update this Privacy Policy from time to time. We'll post the updated version on this page.</p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">8. Contact</h2>
        <p>
          Questions about this policy? Reach us at{' '}
          <a className="text-gold-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}
