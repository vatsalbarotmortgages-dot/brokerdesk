import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'
import { fundedFollowupEmail } from '../../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: settingsData } = await supabase.from('settings').select('*')
  const settings = {}
  settingsData.forEach(r => { settings[r.key] = r.value })
  const sig = {
    name: settings.sig_name || 'Vatsal Barot',
    title: settings.sig_title || 'Associate Mortgage Broker',
    email: settings.sig_email || 'vatsal@vatsalbarotmortgages.ca',
    phone: settings.sig_phone || '',
    brokerLicense: settings.sig_broker_license || '#30005730',
    brokerageLicense: settings.sig_brokerage_license || '#3000168',
    tagline: settings.sig_tagline || ''
  }

  const { data: fundedDeals } = await supabase
    .from('deals')
    .select('*')
    .eq('stage', 'Funded')
    .not('closing', 'is', null)
    .not('closing', 'eq', '')

  if (!fundedDeals?.length) return res.status(200).json({ sent: 0 })

  const now = new Date()
  let sent = 0
  const followupDays = [30, 60, 90]
  const followupTypes = ['funded_30', 'funded_60', 'funded_90']

  for (const deal of fundedDeals) {
    if (!deal.b1_email) continue
    const closingDate = new Date(deal.closing)
    const daysSinceFunding = Math.floor((now - closingDate) / 86400000)

    for (let i = 0; i < followupDays.length; i++) {
      const targetDays = followupDays[i]
      const emailType = followupTypes[i]

      if (daysSinceFunding < targetDays || daysSinceFunding > targetDays + 2) continue

      const { data: log } = await supabase
        .from('email_log')
        .select('id')
        .eq('deal_id', deal.id)
        .eq('email_type', emailType)
        .limit(1)

      if (log?.length) continue

      const clientName = deal.b1_first || deal.name
      const emailContent = fundedFollowupEmail({
        clientName,
        followupNumber: i + 1,
        sig
      })

      await resend.emails.send({
        from: `${sig.name} <${sig.email}>`,
        to: [deal.b1_email],
        subject: emailContent.subject,
        html: emailContent.html
      })

      await supabase.from('email_log').insert({
        deal_id: deal.id,
        email_type: emailType,
        recipient: deal.b1_email
      })

      const taskId = 'T' + Date.now() + Math.random().toString(36).slice(2, 5)
      const dueDate = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10)
      await supabase.from('tasks').insert({
        id: taskId,
        deal_id: deal.id,
        client_name: deal.name,
        client_email: deal.b1_email,
        client_phone: deal.b1_cell || '',
        transaction_type: 'Follow-Up Call',
        notes: `Auto-task: ${targetDays}-day follow-up email sent to ${clientName}. Please call to check in.`,
        due_date: dueDate,
        status: 'To Do'
      })
      sent++
    }
  }

  return res.status(200).json({ success: true, sent })
}
