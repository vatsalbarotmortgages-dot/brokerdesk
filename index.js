import { Resend } from 'resend'
import { partnerStatusEmail } from '../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { type, to, sig, data } = req.body

  try {
    let emailContent
    if (type === 'partner_status') {
      emailContent = partnerStatusEmail({ partnerName: data.partnerName, deals: data.deals, sig })
    }

    const result = await resend.emails.send({
      from: `${sig.name} <${sig.email}>`,
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html
    })

    return res.status(200).json({ success: true, id: result.data?.id })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
