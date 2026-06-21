import { BRAND_NAME, CONTACT_EMAIL, SONG_PRICE } from '../../config'
import LegalLayout from './LegalLayout'

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updatedDate="June 21, 2026">
      <p>
        These Terms of Service ("Terms") govern your use of {BRAND_NAME} (the "Service"). By using
        the Service or placing an order, you agree to these Terms.
      </p>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">1. What we offer</h2>
        <p>
          {BRAND_NAME} creates a custom song based on the story, details, and preferences you
          provide through our quiz. A draft lyric preview is generated for free; the finished song
          — fully composed, sung, and produced — is delivered after payment.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">2. Pricing and payment</h2>
        <p>
          The current price for a custom song is ${SONG_PRICE} USD, charged as a one-time payment
          at checkout. Payments are processed by our third-party payment provider; we do not store
          your card details.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">3. Refund policy</h2>
        <p>
          We offer a 7-day money-back guarantee. If you're not happy with your song, contact us
          within 7 days of delivery at{' '}
          <a className="text-gold-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          and we'll make it right or refund you.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">4. Your content</h2>
        <p>
          You're responsible for the accuracy and appropriateness of the story, names, and details
          you submit. Please don't submit content that is unlawful, infringes on someone else's
          rights, or that you don't have permission to share.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">5. Ownership of your song</h2>
        <p>
          Once delivered and paid for, you may use your custom song for personal, non-commercial
          purposes (such as gifting, playing at events, or sharing with family). Commercial use or
          resale requires our written permission.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">6. Limitation of liability</h2>
        <p>
          The Service is provided "as is." To the maximum extent permitted by law, {BRAND_NAME} is
          not liable for indirect, incidental, or consequential damages arising from your use of the
          Service.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">7. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes
          means you accept the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-navy-800">8. Contact</h2>
        <p>
          Questions about these Terms? Reach us at{' '}
          <a className="text-gold-600 underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}
