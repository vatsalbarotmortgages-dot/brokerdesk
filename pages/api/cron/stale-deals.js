import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'
import { staleDealEmail } from '../../../lib/emails'

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

  const staleConfig = {
    'Info Only / No Deal': { intervalDays: 4, maxEmails: 7 },
    'Pre-Approval': { intervalDays: 4, maxEmails: 7 }
  }

  const now = new Date()
  let sent = 0

  for (const [stage, config] of Object.entries(staleConfig)) {
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('stage', stage)

    if (!deals?.length) continue

    for (const deal of deals) {
      const { data: logs } = await supabase
        .from('email_log')
        .select('sent_at')
        .eq('deal_id', deal.id)
        .eq('email_type', 'stale_deal')
        .order('sent_at', { ascending: false })

      if (logs && logs.length >= config.maxEmails) continue

      const lastLog = logs?.[0]?.sent_at ? new Date(logs[0].sent_at) : null
      const dealDate = new Date(deal.updated_at || deal.created_at)
      const daysSinceUpdate = Math.floor((now - dealDate) / 86400000)
      const daysSinceLastEmail = lastLog
        ? Math.floor((now - lastLog) / 86400000)
        : daysSinceUpdate

      if (daysSinceLastEmail >= config.intervalDays && daysSinceUpdate >= config.intervalDays) {
        const emailContent = staleDealEmail({
          dealName: deal.name,
          stage: deal.stage,
          daysSinceUpdate,
          sig
        })

        await resend.emails.send({
          from: `BrokerDesk <${sig.email}>`,
          to: [sig.email],
          subject: emailContent.subject,
          html: emailContent.html
        })

        await supabase.from('email_log').insert({
          deal_id: deal.id,
          email_type: 'stale_deal',
          recipient: sig.email
        })
        sent++
      }
    }
  }

  return res.status(200).json({ success: true, sent })
}
