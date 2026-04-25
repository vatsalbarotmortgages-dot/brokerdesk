import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

// Day 7 / Day 21 client emails for Documents Received and Pre-Approval
// DISABLED — broker handles client communication manually for these stages

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return res.status(200).json({ success: true, sent: 0, message: 'Client emails for these stages are handled manually' })
}
