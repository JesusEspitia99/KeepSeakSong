import { sendCapiEvent } from './_lib/capi.js'

// Configure in Hotmart: Tools > Webhook > add this endpoint's URL, subscribed to
// "Purchase complete" / "Purchase approved". Hotmart sends the Hottok either in
// the X-HOTMART-HOTTOK header or in the JSON body, depending on the webhook version.
const COMPLETED_EVENTS = new Set(['PURCHASE_COMPLETE', 'PURCHASE_APPROVED'])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const expectedHottok = process.env.HOTMART_HOTTOK
  const receivedHottok = req.headers['x-hotmart-hottok'] || req.body?.hottok

  if (expectedHottok && receivedHottok !== expectedHottok) {
    res.status(401).json({ error: 'Invalid Hottok' })
    return
  }

  const body = req.body || {}
  const eventName = body.event

  if (!COMPLETED_EVENTS.has(eventName)) {
    // Acknowledge everything else (cancellations, refunds, etc.) so Hotmart stops retrying.
    res.status(200).json({ ok: true, ignored: eventName })
    return
  }

  const transactionId = body.data?.purchase?.transaction
  const email = body.data?.buyer?.email
  const value = body.data?.purchase?.price?.value
  const currency = body.data?.purchase?.price?.currency_value

  try {
    await sendCapiEvent(req, {
      eventName: 'Purchase',
      // Keyed by the Hotmart transaction id so Hotmart's webhook retries don't double-count.
      eventId: transactionId ? `hotmart-${transactionId}` : `hotmart-${Date.now()}`,
      eventSourceUrl: 'https://keepsakesong.online/',
      email,
      value,
      currency,
      customData: { content_name: 'keepsakesong_purchase', transaction_id: transactionId },
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message })
  }
}
