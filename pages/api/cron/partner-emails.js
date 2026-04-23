import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'
import { partnerStatusEmail, coffeeInviteEmail } from '../../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Get signature settings
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
    tagline: settings.sig_tagline || 'Personalized. Simplified. Trusted.'
  }

  // Get all deals with referral partners
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .not('ref_name', 'is', null)
    .not('ref_name', 'eq', '')

  if (!deals || !deals.length) return res.status(200).json({ sent: 0 })

  // Group deals by referral partner email
  const partnerMap = {}
  deals.forEach(d => {
    const key = d.ref_email || d.ref_name
    if (!key) return
    if (!partnerMap[key]) {
      partnerMap[key] = {
        name: d.ref_name,
        email: d.ref_email,
        deals: [],
        latestEntry: d.entry_date
      }
    }
    partnerMap[key].deals.push(d)
    if (d.entry_date > partnerMap[key].latestEntry) {
      partnerMap[key].latestEntry = d.entry_date
    }
  })

  let sent = 0
  const now = new Date()

  for (const [key, partner] of Object.entries(partnerMap)) {
    if (!partner.email) continue

    // Check if we already sent bi-weekly email in last 13 days
    const { data: recentLog } = await supabase
      .from('email_log')
      .select('sent_at')
      .eq('recipient', partner.email)
      .eq('email_type', 'partner_biweekly')
      .order('sent_at', { ascending: false })
      .limit(1)

    const lastSent = recentLog?.[0]?.sent_at ? new Date(recentLog[0].sent_at) : null
    const daysSinceLastEmail = lastSent ? Math.floor((now - lastSent) / 86400000) : 999

    // Active deals (not funded, not info only)
    const activeDeals = partner.deals.filter(d =>
      d.stage !== 'Funded' && d.stage !== 'Info Only / No Deal' && d.stage !== 'Cancelled'
    )

    // Send bi-weekly status if active deals exist and 14+ days since last
    if (activeDeals.length > 0 && daysSinceLastEmail >= 14) {
      // Get last notes for each deal
      const dealsWithNotes = await Promise.all(activeDeals.map(async d => {
        const { data: notes } = await supabase
          .from('notes')
          .select('note_text, note_date')
          .eq('deal_id', d.id)
          .order('created_at', { ascending: false })
          .limit(1)
        return {
          ...d,
          name: d.name,
          b2_name: d.b2_name,
          property: d.property,
          stage: d.stage,
          last_note: notes?.[0] ? `${notes[0].note_date}: ${notes[0].note_text}` : 'No recent updates'
        }
      }))

      const emailContent = partnerStatusEmail({ partnerName: partner.name, deals: dealsWithNotes, sig })
      await resend.emails.send({
        from: `${sig.name} <${sig.email}>`,
        to: [partner.email],
        subject: emailContent.subject,
        html: emailContent.html
      })
      await supabase.from('email_log').insert({
        email_type: 'partner_biweekly',
        recipient: partner.email,
        deal_id: null
      })
      sent++
    }

    // Check for coffee invite — no referrals in 60 days
    const lastReferralDate = partner.deals
      .map(d => d.entry_date)
      .filter(Boolean)
      .sort()
      .reverse()[0]

    if (lastReferralDate) {
      const daysSinceLastReferral = Math.floor((now - new Date(lastReferralDate)) / 86400000)
      if (daysSinceLastReferral >= 60) {
        const { data: coffeeLog } = await supabase
          .from('email_log')
          .select('sent_at')
          .eq('recipient', partner.email)
          .eq('email_type', 'coffee_invite')
          .order('sent_at', { ascending: false })
          .limit(1)

        const lastCoffee = coffeeLog?.[0]?.sent_at ? new Date(coffeeLog[0].sent_at) : null
        const daysSinceCoffee = lastCoffee ? Math.floor((now - lastCoffee) / 86400000) : 999

        if (daysSinceCoffee >= 60) {
          const emailContent = coffeeInviteEmail({ partnerName: partner.name, sig })
          await resend.emails.send({
            from: `${sig.name} <${sig.email}>`,
            to: [partner.email],
            subject: emailContent.subject,
            html: emailContent.html
          })
          await supabase.from('email_log').insert({
            email_type: 'coffee_invite',
            recipient: partner.email,
            deal_id: null
          })
          sent++
        }
      }
    }
  }

  return res.status(200).json({ success: true, sent })
}
