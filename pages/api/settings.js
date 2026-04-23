import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('settings').select('*')
    if (error) return res.status(500).json({ error: error.message })
    const settings = {}
    data.forEach(row => { settings[row.key] = row.value })
    return res.status(200).json(settings)
  }

  if (req.method === 'POST') {
    const updates = req.body
    const upserts = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }))
    const { error } = await supabase.from('settings').upsert(upserts)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
