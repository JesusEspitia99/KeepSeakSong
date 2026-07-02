// Temporary diagnostic — reports only shape/prefix, never full secret values.
export default function handler(req, res) {
  const pixelId = process.env.META_PIXEL_ID || ''
  const token = process.env.META_CAPI_ACCESS_TOKEN || ''
  res.status(200).json({
    pixelId: {
      length: pixelId.length,
      looksNumeric: /^\d+$/.test(pixelId),
      startsWithEAA: pixelId.startsWith('EAA'),
    },
    capiToken: {
      length: token.length,
      looksNumeric: /^\d+$/.test(token),
      startsWithEAA: token.startsWith('EAA'),
    },
  })
}
