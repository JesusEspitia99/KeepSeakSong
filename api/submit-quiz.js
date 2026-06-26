import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Server is missing Supabase configuration' })
    return
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const {
    recipient, name, pronunciation, nickname, vibe, genre, voice,
    special, memories, heartMessage, email, generatedLyrics, fullSong,
  } = req.body || {}

  if (!email) {
    res.status(400).json({ error: 'Missing email' })
    return
  }

  const { data, error } = await supabase
    .from('quiz_responses')
    .insert({
      recipient, name, pronunciation, nickname, vibe, genre, voice,
      special, memories, heart_message: heartMessage, email,
      generated_lyrics: generatedLyrics,
      full_song: fullSong,
    })
    .select('id')
    .single()

  if (error) {
    res.status(500).json({ error: 'Failed to save quiz response', details: error.message })
    return
  }

  res.status(200).json({ id: data.id })
}
