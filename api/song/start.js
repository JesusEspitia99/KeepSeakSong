import { checkRateLimit, getClientIp } from '../_lib/rateLimit.js'
import { buildLyricsString, buildStyle, voiceToGender, startGeneration } from '../_lib/suno.js'
import { generateFullSong, buildPreviewLyrics } from '../_lib/lyrics.js'
import { getSupabase } from '../_lib/songStore.js'

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

  const data = req.body || {}
  const { name, vibe, genre, voice, email } = data
  if (!name || !vibe) {
    res.status(400).json({ error: 'Missing required quiz data' })
    return
  }

  // 1) Generate the full song server-side. The complete lyrics NEVER leave the server.
  let fullSong
  try {
    fullSong = await generateFullSong(data)
  } catch (err) {
    res.status(502).json({ error: 'Failed to write the song', details: err.message })
    return
  }

  const previewLyrics = buildPreviewLyrics(fullSong)
  const supabase = getSupabase()

  // 2) Submit the (full) lyrics to Suno for audio.
  let taskId = null
  try {
    taskId = await startGeneration({
      lyrics: buildLyricsString(fullSong),
      style: buildStyle({ vibe, genre }),
      title: name ? `A Song for ${name}` : 'Your Custom Song',
      vocalGender: voiceToGender(voice),
      callBackUrl: `${siteUrl(req)}/api/song/callback`,
    })
  } catch {
    // Audio generation failed — the browser still gets the text preview + lock message below.
  }

  // 3) Persist the full song server-side (keyed by taskId when we have one), for the
  //    audio pipeline and for post-purchase email delivery. Best-effort.
  if (supabase) {
    try {
      if (taskId) {
        await supabase
          .from('songs')
          .upsert({ task_id: taskId, email, full_song: fullSong, preview_lyrics: previewLyrics }, { onConflict: 'task_id' })
      }
      await supabase.from('quiz_responses').insert({
        recipient: data.recipient,
        name: data.name,
        pronunciation: data.pronunciation,
        nickname: data.nickname,
        vibe: data.vibe,
        genre: data.genre,
        voice: data.voice,
        special: data.special,
        memories: data.memories,
        heart_message: data.heartMessage,
        email,
        full_song: fullSong,
      })
    } catch {
      // never block the funnel on persistence
    }
  }

  // 4) Return ONLY the 45s preview lyrics (+ taskId for audio polling) to the browser.
  res.status(200).json({ taskId, previewLyrics })
}
