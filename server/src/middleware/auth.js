import { supabaseAdmin } from '../supabase.js'

/** Verifies the Supabase JWT and loads the role from the DB, never from the client. */
export async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing token' })

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single()
  if (!profile) return res.status(403).json({ error: 'No profile' })

  req.user = data.user
  req.profile = profile
  next()
}

export const requireRole = (role) => (req, res, next) =>
  req.profile?.role === role ? next() : res.status(403).json({ error: `${role} access only` })
