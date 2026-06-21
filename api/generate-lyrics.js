import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' })
    return
  }

  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(ip, { windowMinutes: 60, maxRequests: 6 })
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' })
    return
  }

  const { name, nickname, recipient, vibe, genre, special, memories, heartMessage } = req.body || {}

  if (!name || !vibe) {
    res.status(400).json({ error: 'Missing required quiz data' })
    return
  }

  const displayName = (nickname || name || '').trim()

  const prompt = `You are a professional songwriter. Write a short 4-line draft lyric preview (not the full song) for a personalized song. This is just a teaser shown to the customer before they buy the full song.

Details:
- Name to use in the lyrics: ${displayName}
- Recipient relationship: ${recipient || 'a loved one'}
- Desired vibe/mood: ${vibe}
- Genre: ${genre || 'pop'}
- What makes them special: ${special || 'not provided'}
- Favorite memories: ${memories || 'not provided'}
- Message from the heart: ${heartMessage || 'not provided'}

Write exactly 4 lines, no more, no less. Make it feel personal, warm, and specific to the details given — avoid generic greeting-card phrases. Do not include a title, headers, or any explanation. Output only the 4 lines, one per line.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      res.status(502).json({ error: 'Claude API error', details: errText })
      return
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text?.trim() || ''
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

    res.status(200).json({ lines })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate lyrics', details: err.message })
  }
}
