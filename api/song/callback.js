// Suno requires a callBackUrl on every generation request. We rely on polling
// /api/song/status as the source of truth, so this endpoint just acknowledges the
// callback so Suno stops retrying. Returning 200 is all that's needed.
export default function handler(req, res) {
  res.status(200).json({ ok: true })
}
