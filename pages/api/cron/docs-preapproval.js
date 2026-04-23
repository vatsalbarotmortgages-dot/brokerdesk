import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'
import { docsFollowupEmail } from '../../../lib/emails_v2'

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
    tagline: settings.sig_tagline || '',
    photoUrl: settings.sig_photo_url || ''
  }

  const stages = ['Documents Received', 'Pre-Approval']
  const now = new Date()
  let sent = 0

  for (const stage of stages) {
    const { data: deals } = await supabase.from('deals').select('*').eq('stage', stage)
    if (!deals?.length) continue

    for (const deal of deals) {
      if (deal.no_client_email) continue
      if (!deal.b1_email) continue

      const dealDate = new Date(deal.updated_at || deal.created_at)
      const daysInStage = Math.floor((now - dealDate) / 86400000)

      for (const [targetDays, emailNum] of [[7, 1],[21, 2]]) {
        if (daysInStage < targetDays || daysInStage > targetDays + 2) continue
        const emailType = `docs_followup_${emailNum}_${stage.replace(/ /g,'_')}`
        const { data: log } = await supabase.from('email_log').select('id').eq('deal_id', deal.id).eq('email_type', emailType).limit(1)
        if (log?.length) continue

        const clientName = deal.b1_first || deal.name
        const emailContent = docsFollowupEmail({ clientName, emailNumber: emailNum, stage, sig })
        await resend.emails.send({ from: `${sig.name} <${sig.email}>`, to: [deal.b1_email], subject: emailContent.subject, html: emailContent.html })
        await supabase.from('email_log').insert({ deal_id: deal.id, email_type: emailType, recipient: deal.b1_email })
        sent++
      }
    }
  }

  return res.status(200).json({ success: true, sent })
}
