export function trackEvent(eventName, params) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: eventName, ...params })
  }
}

export function trackCustomEvent(eventName, params) {
  trackEvent(eventName, params)
}
