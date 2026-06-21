import { createClient } from '@supabase/supabase-js'

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

export async function checkRateLimit(ip, { windowMinutes = 60, maxRequests = 6 } = {}) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    // If Supabase isn't configured, fail open rather than blocking everyone.
    return { allowed: true }
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('lyric_requests')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if (error) {
    // Fail open on infra errors — don't block real users over a logging issue.
    return { allowed: true }
  }

  if (count >= maxRequests) {
    return { allowed: false }
  }

  await supabase.from('lyric_requests').insert({ ip })
  return { allowed: true }
}
