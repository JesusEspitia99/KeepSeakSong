import { sendCapiEvent } from './_lib/capi.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { eventName, eventId, eventSourceUrl, email, value, currency, customData, fbp, fbc } = req.body || {}

  if (!eventName || !eventId) {
    res.status(400).json({ error: 'Missing eventName or eventId' })
    return
  }

  try {
    await sendCapiEvent(req, { eventName, eventId, eventSourceUrl, email, value, currency, customData, fbp, fbc })
    res.status(200).json({ ok: true })
  } catch (err) {
    // Tracking must never break the user's experience — log and respond 200.
    res.status(200).json({ ok: false, error: err.message })
  }
}
