import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'
import { birthdayEmail, anniversaryEmail } from '../../../lib/emails_v2'

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

  const { data: deals } = await supabase.from('deals').select('*')
  if (!deals?.length) return res.status(200).json({ sent: 0 })

  const now = new Date()
  const today = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  let sent = 0

  for (const deal of deals) {
    if (deal.no_client_email) continue
    if (!deal.b1_email) continue

    // Birthday check
    if (deal.b1_dob) {
      const dob = deal.b1_dob.slice(5) // MM-DD
      if (dob === today) {
        const { data: log } = await supabase.from('email_log').select('id')
          .eq('deal_id', deal.id).eq('email_type', `birthday_${now.getFullYear()}`).limit(1)
        if (!log?.length) {
          const clientName = deal.b1_first || deal.name
          const emailContent = birthdayEmail({ clientName, sig })
          await resend.emails.send({ from: `${sig.name} <${sig.email}>`, to: [deal.b1_email], subject: emailContent.subject, html: emailContent.html })
          await supabase.from('email_log').insert({ deal_id: deal.id, email_type: `birthday_${now.getFullYear()}`, recipient: deal.b1_email })
          sent++
        }
      }
    }

    // 1-year closing anniversary
    if (deal.closing) {
      const closingMMDD = deal.closing.slice(5)
      if (closingMMDD === today) {
        const closingYear = parseInt(deal.closing.slice(0,4))
        const yearsAgo = now.getFullYear() - closingYear
        if (yearsAgo >= 1) {
          const { data: log } = await supabase.from('email_log').select('id')
            .eq('deal_id', deal.id).eq('email_type', `anniversary_${now.getFullYear()}`).limit(1)
          if (!log?.length) {
            const clientName = deal.b1_first || deal.name
            const emailContent = anniversaryEmail({ clientName, sig })
            await resend.emails.send({ from: `${sig.name} <${sig.email}>`, to: [deal.b1_email], subject: emailContent.subject, html: emailContent.html })
            await supabase.from('email_log').insert({ deal_id: deal.id, email_type: `anniversary_${now.getFullYear()}`, recipient: deal.b1_email })
            sent++
          }
        }
      }
    }
  }

  return res.status(200).json({ success: true, sent })
}
