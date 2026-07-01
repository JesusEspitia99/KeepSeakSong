import { createClient } from '@supabase/supabase-js'

const BUCKET = 'songs'

export function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function saveTask(supabase, { taskId, email }) {
  await supabase.from('songs').upsert({ task_id: taskId, email }, { onConflict: 'task_id' })
}

export async function getSong(supabase, taskId) {
  const { data } = await supabase.from('songs').select('*').eq('task_id', taskId).single()
  return data || null
}

// Downloads the finished song from Suno and stores it in a private bucket, so the full
// audio never depends on Suno's (expiring, public) CDN URL and is never exposed to the client.
export async function storeFullSong(supabase, { taskId, audioUrl, duration }) {
  // Ensure the private bucket exists (idempotent).
  await supabase.storage.createBucket(BUCKET, { public: false }).catch(() => {})

  const audioRes = await fetch(audioUrl)
  if (!audioRes.ok) throw new Error(`Failed to download song: ${audioRes.status}`)
  const buffer = Buffer.from(await audioRes.arrayBuffer())

  const path = `${taskId}.mp3`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'audio/mpeg', upsert: true })
  if (error) throw new Error(`Failed to store song: ${error.message}`)

  await supabase
    .from('songs')
    .update({ storage_path: path, file_size: buffer.length, duration, ready: true })
    .eq('task_id', taskId)

  return { path, fileSize: buffer.length }
}

export async function downloadFromBucket(supabase, path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error) throw new Error(`Failed to read song: ${error.message}`)
  return Buffer.from(await data.arrayBuffer())
}

// Time-limited signed URL for delivering the FULL song after purchase.
export async function createSignedFullUrl(supabase, path, expiresInSeconds = 60 * 60 * 24 * 7) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds)
  if (error) throw new Error(`Failed to sign song URL: ${error.message}`)
  return data.signedUrl
}
