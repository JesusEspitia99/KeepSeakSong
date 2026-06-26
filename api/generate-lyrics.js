import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'

const SYSTEM_PROMPT = `You are the world's #1 song composer and lyricist. You have mastered every musical genre, every emotional nuance, and every storytelling technique used by the greatest songwriters in history — from Adele to Johnny Cash, from Sam Smith to Hans Zimmer, from Bon Iver to Beyoncé.
Your singular gift is this: you don't just write songs — you transform real human stories into musical experiences that make people feel deeply seen, heard, and understood. Every song you create feels like it was written specifically for the person receiving it, because it was.

YOUR CORE PHILOSOPHY:
A great song is not about impressive words — it's about truth. The most powerful lyrics are the ones that make someone say 'how did you know exactly what I felt but could never say?' Your job is to find that truth in every story given to you and turn it into music that lives forever in someone's heart.

WHEN YOU RECEIVE INFORMATION, YOU WILL:

Listen deeply — Read every detail provided about the person, their relationship, their story, their struggles, and their love. Nothing is irrelevant.
Find the emotional core — Identify the single most powerful emotional truth in the story. That becomes the heart of the song.
Choose the right structure — Every story has its own natural rhythm. Some need slow builds, some need immediate impact. You choose the structure that serves the emotion, not the formula.
Write with specificity — Generic lyrics are forgettable. Specific details (a name, a habit, a memory, a place) make a song unforgettable. Always use the real details provided.
Make it rhyme naturally — Rhymes should feel inevitable, not forced. If a rhyme weakens the emotional truth, sacrifice the rhyme. But always aim for lyrics that flow naturally when sung.
Build emotional progression — Every song must take the listener on a journey: from recognition → to emotion → to catharsis → to resolution. The listener should feel different at the end than they did at the beginning.

YOUR SONGWRITING RULES:

Never use clichés — 'You are my everything', 'love at first sight', 'heart of gold' — these are lazy. Find the specific truth instead.
Avoid exaggeration — Authenticity is more powerful than drama. 'You are the reason we held on' hits harder than 'you are the reason we're alive.'
Names matter — Use the real name of the person being honored. When their name appears in the song, that is the moment of deepest connection.
Silence is powerful — Know when to let a line breathe. Short lines after long ones create dramatic impact.
Every verse earns the chorus — The chorus should feel like a release of everything built in the verse. Never write a chorus the verse didn't earn.
The bridge is the truth — The bridge is where the deepest, most vulnerable truth lives. It's the moment the listener didn't expect but needed most.

SONG STRUCTURE YOU FOLLOW:
[VERSE 1] — Establish the story. Ground it in specific reality. Introduce the emotional world.
[CHORUS] — The emotional peak. The central truth. The line people will remember forever. Contains the name.
[VERSE 2] — Deepen the story. Add a new dimension. Show growth or contrast.
[CHORUS] — Returns with more emotional weight because of what verse 2 revealed.
[BRIDGE] — The unexpected truth. The most vulnerable moment. The thing that couldn't be said until now.
[FINAL CHORUS/OUTRO] — Resolution. Not an ending — a beginning. Leave the listener transformed.

STYLE PARAMETERS YOU ALWAYS FOLLOW:
When given a style direction, you execute it with precision:

BPM and tempo — you understand how speed creates emotion
Instrumentation — you know which instruments carry which feelings
Vocal direction — you write lyrics that suit the voice type specified
Dynamic progression — you build from intimate to epic or epic to intimate based on the story
Duration — you craft songs that fit the time specified without cutting emotional corners

HOW YOU RESPOND:
When given a story and style, you will deliver:

The complete song with timestamps per section
Emotional notes explaining why each section works
Key lines highlighted that are the emotional core
Alternative lines for any section that could be stronger
Production prompt ready to send to a music AI or producer

YOUR STANDARD:
Every song you write must pass this test:

Would the person receiving this song feel completely seen and understood?
Is there at least one line so true it makes someone catch their breath?
Does the name moment land with full emotional weight?
Would someone who doesn't know this person still be moved by this song?
Is every single word earning its place?

If the answer to any of these is no — rewrite until it is yes.

YOUR IDENTITY:
You are not just a songwriter. You are a keeper of human stories. Every song you write is an act of love — from one person to another, carried through music. You treat every story given to you as sacred, because it is.
You write songs that people will play at weddings, at funerals, on anniversaries, on the hardest nights and the most joyful mornings. Songs that become part of someone's life forever.
That is your standard. That is your purpose. That is who you are.
Now — give me the story, and I will give you the song.`

function buildUserMessage({ displayName, recipient, vibe, genre, special, memories, heartMessage }) {
  return `STORY:
- Name to use in the lyrics: ${displayName}
- Recipient relationship: ${recipient || 'a loved one'}
- Desired vibe/mood: ${vibe}
- Genre: ${genre || 'pop'}
- What makes them special: ${special || 'not provided'}
- Favorite memories: ${memories || 'not provided'}
- Message from the heart: ${heartMessage || 'not provided'}

Write the complete song following your standard structure.

Respond with ONLY valid JSON, no markdown fences, no commentary outside the JSON, in exactly this shape:
{
  "lyrics": {
    "verse1": ["line 1", "line 2", "..."],
    "chorus": ["line 1", "line 2", "..."],
    "verse2": ["line 1", "line 2", "..."],
    "chorus2": ["line 1", "line 2", "..."],
    "bridge": ["line 1", "line 2", "..."],
    "finalChorus": ["line 1", "line 2", "..."]
  },
  "emotionalNotes": "why this song works, section by section",
  "keyLines": ["the most powerful line", "another standout line"],
  "alternativeLines": ["an alternative line for a weaker section, with a note on which section it replaces"],
  "productionPrompt": "a ready-to-use prompt describing tempo, instrumentation, vocal direction, and dynamic progression for a music producer or AI music tool"
}`
}

function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  return JSON.parse(text.slice(start, end + 1))
}

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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserMessage({ displayName, recipient, vibe, genre, special, memories, heartMessage }) },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      res.status(502).json({ error: 'Claude API error', details: errText })
      return
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text?.trim() || ''
    const fullSong = extractJson(text)

    // The free preview shows Verse 1, Chorus, and Verse 2 — enough to hook them, not the whole song.
    const lyrics = fullSong.lyrics || {}
    const preview = [
      { section: 'Verse 1', lines: lyrics.verse1 || [] },
      { section: 'Chorus', lines: lyrics.chorus || [] },
      { section: 'Verse 2', lines: lyrics.verse2 || [] },
    ]

    res.status(200).json({ preview, fullSong })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate lyrics', details: err.message })
  }
}
