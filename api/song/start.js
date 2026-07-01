import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js'
import { buildLyricsString, buildStyle, voiceToGender, startGeneration } from '../_lib/suno.js'
import { getSupabase, saveTask } from '../_lib/songStore.js'

export const maxDuration = 60

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `https://${host}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(ip, { windowMinutes: 60, maxRequests: 3 })
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' })
    return
  }

  const { fullSong, vibe, genre, voice, name, email } = req.body || {}

  const lyrics = buildLyricsString(fullSong)
  if (!lyrics) {
    res.status(400).json({ error: 'Missing lyrics to generate the song' })
    return
  }

  try {
    const taskId = await startGeneration({
      lyrics,
      style: buildStyle({ vibe, genre }),
      title: name ? `A Song for ${name}` : 'Your Custom Song',
      vocalGender: voiceToGender(voice),
      callBackUrl: `${siteUrl(req)}/api/song/callback`,
    })

    const supabase = getSupabase()
    if (supabase) await saveTask(supabase, { taskId, email }).catch(() => {})

    res.status(200).json({ taskId })
  } catch (err) {
    res.status(502).json({ error: 'Failed to start song generation', details: err.message })
  }
}
