export function getSignature(sig) {
  return `
    <table style="margin-top:24px;border-top:2px solid #1e40af;padding-top:16px;font-family:Arial,sans-serif">
      <tr><td style="font-size:15px;font-weight:700;color:#0f172a">${sig.name}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280">${sig.title}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280">Mortgage Intelligence</td></tr>
      <tr><td style="font-size:12px;color:#9ca3af;margin-top:4px">Broker License: ${sig.brokerLicense} | Brokerage License: ${sig.brokerageLicense}</td></tr>
      <tr><td style="font-size:13px;color:#1e40af;margin-top:4px">📧 ${sig.email}${sig.phone ? ' | 📞 '+sig.phone : ''}</td></tr>
      ${sig.tagline ? `<tr><td style="font-size:12px;color:#9ca3af;font-style:italic;margin-top:4px">${sig.tagline}</td></tr>` : ''}
    </table>
  `
}

export function partnerStatusEmail({ partnerName, deals, sig }) {
  const dealRows = deals.map(d => {
    const stageColors = {
      'Lead': '#6b7280', 'Pre-Approval': '#3b82f6', 'Documents Received': '#8b5cf6',
      'Application Submitted': '#10b981', 'Approved': '#22c55e',
      'Conditions Cleared': '#ec4899', 'Funded': '#16a34a', 'Check In': '#f59e0b'
    }
    const color = stageColors[d.stage] || '#6b7280'
    const lastNote = d.last_note || 'No recent updates'
    return `
      <tr>
        <td style="padding:14px;border-bottom:1px solid #f1f5f9">
          <div style="font-size:14px;font-weight:700;color:#0f172a">${d.name}${d.b2_name ? ' & ' + d.b2_name : ''}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px">${d.property || 'Property TBD'}</div>
          <div style="margin-top:8px">
            <span style="background:${color}22;color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px">${d.stage}</span>
          </div>
          <div style="font-size:12px;color:#6b7280;margin-top:8px;padding:8px;background:#f8fafc;border-radius:6px;border-left:3px solid ${color}">
            <strong>Last update:</strong> ${lastNote}
          </div>
        </td>
      </tr>`
  }).join('')

  return {
    subject: `File Update — ${deals.length} Active Deal${deals.length !== 1 ? 's' : ''} | Vatsal Barot`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
        <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 32px;border-radius:12px 12px 0 0">
          <div style="font-size:22px;font-weight:800;color:#ffffff">BrokerDesk</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px">Mortgage Intelligence · Vatsal Barot</div>
        </div>
        <div style="padding:28px 32px;background:#f8fafc;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
          <p style="font-size:15px;color:#0f172a;margin:0">Hi ${partnerName},</p>
          <p style="font-size:14px;color:#475569;line-height:1.7;margin-top:12px">
            Here's a quick update on the file${deals.length !== 1 ? 's' : ''} you've sent my way.
          </p>
        </div>
        <div style="border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
          <table style="width:100%;border-collapse:collapse">${dealRows}</table>
        </div>
        <div style="padding:24px 32px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
          ${getSignature(sig)}
        </div>
      </div>`
  }
}

export function coffeeInviteEmail({ partnerName, sig }) {
  return {
    subject: `Let's grab a coffee ☕ — Vatsal Barot`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
        <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 32px;border-radius:12px 12px 0 0">
          <div style="font-size:22px;font-weight:800;color:#ffffff">BrokerDesk</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px">Mortgage Intelligence · Vatsal Barot</div>
        </div>
        <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:15px;color:#0f172a;margin:0">Hi ${partnerName},</p>
          <p style="font-size:14px;color:#475569;line-height:1.8;margin-top:16px">
            It's been a little while since we've connected and I just wanted to reach out personally. I've really valued our relationship and the clients you've sent my way — and I'd love to catch up over a coffee.
          </p>
          <p style="font-size:14px;color:#475569;line-height:1.8">
            Would you be open to meeting sometime in the next couple of weeks? I'm completely flexible on timing.
          </p>
          <p style="font-size:14px;color:#475569;line-height:1.8">Looking forward to connecting!</p>
          ${getSignature(sig)}
        </div>
      </div>`
  }
}

export function staleDealEmail({ dealName, stage, daysSinceUpdate, sig }) {
  const urgency = daysSinceUpdate > 20 ? 'high' : 'medium'
  const color = urgency === 'high' ? '#dc2626' : '#d97706'
  return {
    subject: `⚠️ Follow-up needed: ${dealName} — ${stage}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:${urgency === 'high' ? '#fef2f2' : '#fffbeb'};border:1px solid ${urgency === 'high' ? '#fecaca' : '#fde68a'};border-radius:12px;padding:20px 28px">
          <div style="font-size:13px;font-weight:700;color:${color};text-transform:uppercase">Action Needed</div>
          <div style="font-size:20px;font-weight:800;color:#0f172a;margin-top:6px">${dealName}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:4px">Has been in <strong>${stage}</strong> for <strong>${daysSinceUpdate} days</strong></div>
        </div>
        <div style="padding:24px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:14px;color:#475569;line-height:1.7">Consider reaching out to the client or updating the file status.</p>
          <a href="https://brokerdesk.vercel.app" style="display:inline-block;background:#1e40af;color:#ffffff;font-size:13px;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;margin-top:8px">Open BrokerDesk →</a>
          ${getSignature(sig)}
        </div>
      </div>`
  }
}

export function fundedFollowupEmail({ clientName, followupNumber, sig }) {
  const messages = {
    1: { subject: `Checking in — ${clientName}`, intro: `It's been about a month since your mortgage funded and I just wanted to check in to see how everything is going with your new home!`, body: `If you have any questions about your mortgage or payments, please don't hesitate to reach out.` },
    2: { subject: `Thinking of you — ${clientName}`, intro: `I hope you're enjoying your home! It's been a couple of months since your mortgage funded and I wanted to touch base.`, body: `If you know anyone looking to buy a home or renew their mortgage, I'd be grateful for the referral.` },
    3: { subject: `Your mortgage — 3 month check-in | ${clientName}`, intro: `It's been 3 months since your mortgage funded — congratulations again on your home!`, body: `As time goes on, it's worth keeping an eye on your renewal date. I'll be in touch well before your term expires.` }
  }
  const msg = messages[followupNumber] || messages[1]
  return {
    subject: msg.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
        <div style="background:linear-gradient(135deg,#065f46,#059669);padding:28px 32px;border-radius:12px 12px 0 0">
          <div style="font-size:22px;font-weight:800;color:#ffffff">Mortgage Intelligence</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:2px">Vatsal Barot · Associate Mortgage Broker</div>
        </div>
        <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:15px;color:#0f172a;margin:0">Hi ${clientName},</p>
          <p style="font-size:14px;color:#475569;line-height:1.8;margin-top:16px">${msg.intro}</p>
          <p style="font-size:14px;color:#475569;line-height:1.8">${msg.body}</p>
          ${getSignature(sig)}
        </div>
      </div>`
  }
}
