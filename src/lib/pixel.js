function generateEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getCookie(name) {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return match ? match.split('=')[1] : undefined
}

// Fires the same event on both sides of the pipe, joined by eventId so Meta
// deduplicates the browser pixel hit and the server-side CAPI hit into one event.
function fire(method, eventName, { email, value, currency, content_name, ...rest } = {}) {
  if (typeof window === 'undefined') return

  const eventId = generateEventId()
  const browserParams = { value, currency, content_name, ...rest }

  if (typeof window.fbq === 'function') {
    window.fbq(method, eventName, browserParams, { eventID: eventId })
  }

  fetch('/api/track-event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      email,
      value,
      currency,
      customData: { content_name, ...rest },
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }),
  }).catch(() => {
    // Server-side tracking is best-effort — never block the user's experience on it.
  })
}

export function trackEvent(eventName, params) {
  fire('track', eventName, params)
}

export function trackCustomEvent(eventName, params) {
  fire('trackCustom', eventName, params)
}
