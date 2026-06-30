import { createHash } from 'node:crypto'

const GRAPH_VERSION = 'v21.0'

function sha256(value) {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || undefined
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return undefined
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : undefined
}

// Sends a single event to Meta's Conversions API, mirroring a browser-side fbq() call.
// eventId must match the eventID passed to fbq() on the client for Meta to deduplicate the pair.
export async function sendCapiEvent(req, { eventName, eventId, eventSourceUrl, email, value, currency, customData, fbp, fbc }) {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    // CAPI isn't configured — skip silently rather than breaking the caller.
    return { skipped: true }
  }

  const userData = {
    client_ip_address: getClientIp(req),
    client_user_agent: req.headers['user-agent'],
    fbp: fbp || getCookie(req, '_fbp'),
    fbc: fbc || getCookie(req, '_fbc'),
  }
  if (email) userData.em = [sha256(email)]

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          ...(value != null ? { value } : {}),
          ...(currency ? { currency } : {}),
          ...customData,
        },
      },
    ],
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Meta CAPI error: ${details}`)
  }

  return response.json()
}
