import { getSupabase, getSong, storeFullSong } from '../_lib/songStore.js'

export const maxDuration = 60

// Suno POSTs here when generation reaches each stage. We store the finished audio
// server-side as soon as a complete track is available ("first" = first of the two
// variants done, "complete" = all done), so storage no longer depends on the browser
// still polling. This is the primary, reliable path; /api/song/status just reads the
// resulting row.
export default async function handler(req, res) {
  try {
    const d = req.body?.data || {}
    const taskId = d.task_id || d.taskId
    const type = d.callbackType
    const track = Array.isArray(d.data) ? d.data[0] : null
    const audioUrl = track?.audio_url || track?.source_audio_url

    if (taskId && audioUrl && (type === 'complete' || type === 'first')) {
      const supabase = getSupabase()
      if (supabase) {
        const existing = await getSong(supabase, taskId).catch(() => null)
        if (!existing?.ready) {
          await storeFullSong(supabase, { taskId, audioUrl, duration: track.duration }).catch(() => {})
        }
      }
    }
  } catch {
    // Never fail the callback — Suno would just retry.
  }
  res.status(200).json({ ok: true })
}
