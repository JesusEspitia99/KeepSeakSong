import { getStatus } from '../_lib/suno.js'
import { getSupabase, getSong, storeFullSong } from '../_lib/songStore.js'

export const maxDuration = 60

const FAILED = new Set(['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'])

export default async function handler(req, res) {
  const taskId = req.query.taskId || req.body?.taskId
  if (!taskId) {
    res.status(400).json({ error: 'Missing taskId' })
    return
  }

  const supabase = getSupabase()

  // If we've already stored the song on a previous poll, short-circuit.
  if (supabase) {
    const existing = await getSong(supabase, taskId).catch(() => null)
    if (existing?.ready && existing.storage_path) {
      res.status(200).json({ state: 'ready', previewUrl: `/api/song/preview?taskId=${encodeURIComponent(taskId)}` })
      return
    }
  }

  try {
    const { status, track, errorMessage } = await getStatus(taskId)

    if (FAILED.has(status)) {
      res.status(200).json({ state: 'failed', error: errorMessage || status })
      return
    }

    // audioUrl (the complete, downloadable file) is present at SUCCESS; slice a secure 45s preview from it.
    const audioUrl = track?.audioUrl
    if ((status === 'SUCCESS' || status === 'FIRST_SUCCESS') && audioUrl) {
      if (supabase) {
        try {
          await storeFullSong(supabase, { taskId, audioUrl, duration: track.duration })
        } catch {
          // Storing can occasionally exceed the function budget — the next poll will retry.
          res.status(200).json({ state: 'preparing', progress: 95 })
          return
        }
      }
      res.status(200).json({ state: 'ready', previewUrl: `/api/song/preview?taskId=${encodeURIComponent(taskId)}` })
      return
    }

    // Rough progress for the preparation bar based on Suno's staged status.
    const progress = status === 'TEXT_SUCCESS' ? 55 : status === 'FIRST_SUCCESS' ? 80 : 25
    res.status(200).json({ state: 'preparing', progress })
  } catch (err) {
    res.status(200).json({ state: 'preparing', progress: 20, note: err.message })
  }
}
