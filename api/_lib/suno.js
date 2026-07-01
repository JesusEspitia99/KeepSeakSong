const BASE_URL = 'https://api.sunoapi.org'
const DEFAULT_MODEL = 'V4_5'

// Builds the lyrics string Suno expects in the `prompt` field (customMode, non-instrumental),
// using [Section] tags so the model respects the song structure.
export function buildLyricsString(fullSong) {
  const lyrics = fullSong?.lyrics
  if (!lyrics) return ''

  const sections = [
    ['[Verse]', lyrics.verse1],
    ['[Chorus]', lyrics.chorus],
    ['[Verse 2]', lyrics.verse2],
    ['[Chorus]', lyrics.chorus2 || lyrics.chorus],
    ['[Bridge]', lyrics.bridge],
    ['[Outro]', lyrics.finalChorus],
  ]

  return sections
    .filter(([, lines]) => Array.isArray(lines) && lines.length)
    .map(([tag, lines]) => `${tag}\n${lines.join('\n')}`)
    .join('\n\n')
    .slice(0, 2900) // stay under V4/V4_5 prompt limit
}

// Builds the `style` string from quiz data. Never references a specific artist — the API
// rejects/derails generations that name real singers, and it's a legal risk regardless.
export function buildStyle({ vibe, genre }) {
  const parts = []
  if (vibe) parts.push(vibe.toLowerCase())
  if (genre) parts.push(genre.toLowerCase())
  parts.push('heartfelt', 'emotional vocals', 'clean production')
  return parts.join(', ').slice(0, 190)
}

export function voiceToGender(voice) {
  if (!voice) return undefined
  const v = voice.toLowerCase()
  if (v.startsWith('f')) return 'f'
  if (v.startsWith('m')) return 'm'
  return undefined
}

export async function startGeneration({ lyrics, style, title, vocalGender, callBackUrl }) {
  const apiKey = process.env.SUNO_API_KEY
  if (!apiKey) throw new Error('Server is missing SUNO_API_KEY')

  const body = {
    customMode: true,
    instrumental: false,
    prompt: lyrics,
    style,
    title: (title || 'Your Custom Song').slice(0, 78),
    model: process.env.SUNO_MODEL || DEFAULT_MODEL,
    callBackUrl,
  }
  if (vocalGender) body.vocalGender = vocalGender

  const res = await fetch(`${BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok || data.code !== 200 || !data.data?.taskId) {
    throw new Error(`Suno generate failed: ${JSON.stringify(data)}`)
  }
  return data.data.taskId
}

// Returns { status, track } where track is the first sunoData entry (audioUrl, streamAudioUrl, duration).
export async function getStatus(taskId) {
  const apiKey = process.env.SUNO_API_KEY
  if (!apiKey) throw new Error('Server is missing SUNO_API_KEY')

  const res = await fetch(`${BASE_URL}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`, {
    headers: { authorization: `Bearer ${apiKey}` },
  })

  const data = await res.json()
  if (!res.ok || data.code !== 200) {
    throw new Error(`Suno status failed: ${JSON.stringify(data)}`)
  }

  const status = data.data?.status
  const track = data.data?.response?.sunoData?.[0] || null
  return { status, track, errorMessage: data.data?.errorMessage }
}
