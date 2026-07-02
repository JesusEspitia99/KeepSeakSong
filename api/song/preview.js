import { getSupabase, getSong, downloadFromBucket } from '../_lib/songStore.js'

export const maxDuration = 60

// Suno tracks usually open with a few seconds of instrumental intro before the vocals
// start, so 45s of raw audio often cuts off mid-chorus. 55s gives enough headroom for the
// intro + Verse 1 + Chorus to actually finish playing within the preview clip.
const PREVIEW_SECONDS = 55

export default async function handler(req, res) {
  const taskId = req.query.taskId
  if (!taskId) {
    res.status(400).json({ error: 'Missing taskId' })
    return
  }

  const supabase = getSupabase()
  if (!supabase) {
    res.status(500).json({ error: 'Storage not configured' })
    return
  }

  const song = await getSong(supabase, taskId).catch(() => null)
  if (!song?.storage_path) {
    res.status(425).json({ error: 'Preview not ready yet' })
    return
  }

  try {
    const full = await downloadFromBucket(supabase, song.storage_path)

    // Serve only the first ~55s worth of bytes. The remaining bytes of the song never leave
    // the server, so the full track cannot be recovered from the preview response.
    let previewBytes = full.length
    if (song.duration && song.duration > PREVIEW_SECONDS) {
      const bytesPerSecond = full.length / song.duration
      previewBytes = Math.min(full.length, Math.ceil(bytesPerSecond * PREVIEW_SECONDS))
    }
    const clip = full.subarray(0, previewBytes)

    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('content-length', clip.length)
    res.setHeader('cache-control', 'private, max-age=3600')
    res.setHeader('accept-ranges', 'none')
    res.status(200).send(clip)
  } catch (err) {
    res.status(500).json({ error: 'Failed to build preview', details: err.message })
  }
}
