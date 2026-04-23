import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data, error } = await supabase
    .from('deals')
    .update({ stage: 'Old Files — Funded', updated_at: new Date().toISOString() })
    .eq('stage', 'Funded')

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true, archived: data?.length || 0 })
}
