// BrokerDesk Email Templates V2

export function getSignature(sig) {
  const photo = sig.photoUrl
    ? `<tr><td style="padding-bottom:12px"><img src="${sig.photoUrl}" alt="${sig.name}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid #1e40af"/></td></tr>`
    : ''
  return `
    <table style="margin-top:24px;border-top:2px solid #1e40af;padding-top:16px;font-family:Arial,sans-serif;border-collapse:collapse">
      ${photo}
      <tr><td style="font-size:16px;font-weight:700;color:#0f172a;padding-bottom:2px">${sig.name}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding-bottom:1px">${sig.title || 'Associate Mortgage Broker'}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;padding-bottom:4px">Mortgage Intelligence</td></tr>
      <tr><td style="font-size:11px;color:#9ca3af;padding-bottom:4px">Broker License: ${sig.brokerLicense || '#30005730'} | Brokerage License: ${sig.brokerageLicense || '#3000168'}</td></tr>
      <tr><td style="font-size:13px;color:#1e40af;padding-bottom:2px">📧 <a href="mailto:${sig.email}" style="color:#1e40af;text-decoration:none">${sig.email}</a>${sig.phone ? ` &nbsp;|&nbsp; 📞 ${sig.phone}` : ''}</td></tr>
      ${sig.tagline ? `<tr><td style="font-size:11px;color:#9ca3af;font-style:italic;padding-top:4px">${sig.tagline}</td></tr>` : ''}
    </table>`
}

function emailWrapper(headerBg, headerContent, bodyContent, sig) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">
    <div style="background:${headerBg};padding:32px 36px">
      ${headerContent}
    </div>
    <div style="padding:32px 36px">
      ${bodyContent}
      ${getSignature(sig)}
    </div>
    <div style="background:#f8fafc;padding:16px 36px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="font-size:11px;color:#9ca3af;margin:0">This email was sent by BrokerDesk CRM · Mortgage Intelligence</p>
    </div>
  </div></body></html>`
}

// ── PARTNER STATUS EMAIL ──
export function partnerStatusEmail({ partnerName, deals, sig }) {
  const stageColors = {
    'Lead':'#6b7280','Pre-Approval':'#3b82f6','Documents Received':'#8b5cf6',
    'Application Submitted':'#10b981','Approved':'#22c55e',
    'Conditions Cleared':'#ec4899','Funded':'#16a34a','Check In':'#f59e0b'
  }
  const dealRows = deals.map(d => {
    const color = stageColors[d.stage] || '#6b7280'
    return `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px">${d.name}${d.b2_name ? ' & ' + d.b2_name : ''}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:10px">📍 ${d.property || 'Property TBD'}</div>
      <div style="margin-bottom:10px"><span style="background:${color}22;color:${color};font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block">${d.stage}</span></div>
      <div style="font-size:12px;color:#475569;background:#f8fafc;padding:10px 12px;border-radius:8px;border-left:3px solid ${color}"><strong>Last update:</strong> ${d.last_note || 'No recent updates'}</div>
    </div>`
  }).join('')

  const header = `<div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em">BrokerDesk</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">Mortgage Intelligence · ${sig.name}</div>`

  const body = `
    <p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${partnerName},</p>
    <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 24px">Here's a quick update on the file${deals.length !== 1 ? 's' : ''} you've referred to me. I'll keep you in the loop as things progress — please reach out anytime if you have questions.</p>
    ${dealRows}
    <p style="font-size:14px;color:#475569;line-height:1.7;margin:24px 0 0">Thank you again for the referral — I truly value our partnership and look forward to keeping you updated.</p>`

  return {
    subject: `File Update — ${deals.length} Active Deal${deals.length !== 1 ? 's' : ''} | ${sig.name}`,
    html: emailWrapper('linear-gradient(135deg,#0f172a,#1e3a5f)', header, body, sig)
  }
}

// ── COFFEE INVITE EMAIL ──
export function coffeeInviteEmail({ partnerName, sig }) {
  const header = `<div style="font-size:24px;font-weight:800;color:#ffffff">Let's Connect ☕</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`
  const body = `
    <p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${partnerName},</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I hope things are going well! It's been a little while since we've had a chance to connect and I just wanted to reach out personally.</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I've genuinely valued our relationship and the clients you've trusted me with — and I'd love to catch up over a coffee, hear how business is going on your end, and explore how we can continue supporting each other.</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 24px">Would you be open to meeting sometime in the next couple of weeks? I'm completely flexible on timing — just let me know what works for you and I'll make it happen.</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Looking forward to connecting!</p>`

  return {
    subject: `Let's grab a coffee ☕ — ${sig.name}`,
    html: emailWrapper('linear-gradient(135deg,#0f172a,#1e3a5f)', header, body, sig)
  }
}

// ── STALE DEAL EMAIL (to Vatsal) ──
export function staleDealEmail({ dealName, stage, daysSinceUpdate, sig }) {
  const urgent = daysSinceUpdate > 20
  const color = urgent ? '#dc2626' : '#d97706'
  const bg = urgent ? '#fef2f2' : '#fffbeb'
  const border = urgent ? '#fecaca' : '#fde68a'
  const header = `<div style="font-size:22px;font-weight:800;color:${urgent?'#991b1b':'#92400e'}">⚠️ Follow-up Needed</div>
    <div style="font-size:13px;color:${urgent?'#dc2626':'#d97706'};margin-top:4px;font-weight:600">${daysSinceUpdate} days with no update</div>`
  const body = `
    <div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:16px 20px;margin-bottom:20px">
      <div style="font-size:18px;font-weight:800;color:#0f172a">${dealName}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">Currently in: <strong>${stage}</strong></div>
    </div>
    <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 20px">This deal has been sitting idle for <strong style="color:${color}">${daysSinceUpdate} days</strong>. Consider reaching out to the client or updating the file status to keep things moving forward.</p>
    <a href="https://brokerdesk.vercel.app" style="display:inline-block;background:#1e40af;color:#ffffff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none">Open BrokerDesk →</a>`

  return {
    subject: `⚠️ Follow-up needed: ${dealName} — ${stage} (${daysSinceUpdate} days)`,
    html: emailWrapper(`linear-gradient(135deg,${bg},${bg})`, header, body, sig)
  }
}

// ── FUNDED FOLLOW-UP EMAILS ──
export function fundedFollowupEmail({ clientName, followupNumber, sig }) {
  const msgs = {
    1: {
      subject: `Checking in — how are you settling in?`,
      header: `<div style="font-size:24px;font-weight:800;color:#ffffff">Checking In 🏠</div><div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I hope you're settling into your new home and that the move went smoothly! It's been about a month since everything finalized and I just wanted to check in to see how you're doing.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">If you have any questions about your mortgage, payments, or anything at all, please don't hesitate to reach out — I'm always here to help.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Wishing you all the best in your new home!</p>`
    },
    2: {
      subject: `Thinking of you — a quick hello`,
      header: `<div style="font-size:24px;font-weight:800;color:#ffffff">A Quick Hello 👋</div><div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I hope you're enjoying your home! I was thinking of you and wanted to touch base to see how things are going a couple of months in.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">If you know anyone — a friend, family member, or colleague — who is looking to buy a home, refinance, or renew their mortgage, I would truly appreciate the referral. A personal recommendation means the world to me.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">As always, I'm just a call or email away if you ever need anything!</p>`
    },
    3: {
      subject: `3 months in — your mortgage, your future`,
      header: `<div style="font-size:24px;font-weight:800;color:#ffffff">3 Month Check-In 🎉</div><div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">Congratulations — it's been 3 months since your mortgage finalized! I hope home ownership has been everything you hoped for and more.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">As your mortgage term progresses, it's always a good idea to stay informed about your options. When your renewal approaches, I'll be reaching out well in advance to make sure you get the best possible rate and terms — just like we did the first time.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">In the meantime, if you have any questions or know someone who could use my help, I'm always here for you.</p>`
    }
  }
  const m = msgs[followupNumber] || msgs[1]
  return {
    subject: m.subject,
    html: emailWrapper('linear-gradient(135deg,#065f46,#059669)', m.header, m.body, sig)
  }
}

// ── BIRTHDAY EMAIL ──
export function birthdayEmail({ clientName, sig }) {
  const header = `<div style="font-size:28px;font-weight:800;color:#ffffff">🎂 Happy Birthday!</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`
  const body = `
    <p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Happy Birthday, ${clientName}! 🎉</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I just wanted to take a moment to wish you a wonderful birthday! I hope your day is filled with joy, laughter, and everything that makes you happy.</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">It's been a pleasure working with you and I'm grateful for the trust you've placed in me. I hope this next year brings you exciting new adventures — maybe even another chapter in your real estate journey!</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Wishing you a truly special day and an incredible year ahead. Please don't hesitate to reach out if there's ever anything I can help you with.</p>`

  return {
    subject: `🎂 Happy Birthday, ${clientName}! — Vatsal Barot`,
    html: emailWrapper('linear-gradient(135deg,#7c3aed,#a855f7)', header, body, sig)
  }
}

// ── 1-YEAR ANNIVERSARY EMAIL ──
export function anniversaryEmail({ clientName, sig }) {
  const header = `<div style="font-size:26px;font-weight:800;color:#ffffff">🏠 One Year in Your Home!</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`
  const body = `
    <p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">Can you believe it's already been one year since you moved into your home? 🎉 It feels like just yesterday we were working through the details together, and now here you are — a full year in!</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">Homeownership is one of the most important decisions a person can make, and I'm truly proud to have been a part of your journey. Watching clients build their lives and memories in their homes is the reason I love what I do.</p>
    <div style="background:#eff6ff;border-left:4px solid #1e40af;border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0">
      <p style="font-size:13px;color:#1e40af;font-weight:600;margin:0 0 4px">A friendly reminder</p>
      <p style="font-size:13px;color:#475569;margin:0;line-height:1.7">As your mortgage term continues, it's always smart to stay ahead of your renewal. When the time comes, I'll make sure you're informed and have access to the best options available — that's a promise.</p>
    </div>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">If you know any friends or family who are thinking about buying a home, refinancing, or renewing their mortgage, I would be honoured if you kept me in mind. A referral from someone like you truly means the world to me.</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Here's to many more wonderful years in your home. Thank you for trusting me with such an important milestone. 🥂</p>`

  return {
    subject: `🏠 Happy 1-Year Home Anniversary, ${clientName}!`,
    html: emailWrapper('linear-gradient(135deg,#1e40af,#3b82f6)', header, body, sig)
  }
}

// ── DOCUMENTS RECEIVED / PRE-APPROVAL FOLLOW-UP ──
export function docsFollowupEmail({ clientName, emailNumber, stage, sig }) {
  const msgs = {
    1: {
      subject: `Checking in — how is the house hunting going?`,
      header: `<div style="font-size:22px;font-weight:800;color:#ffffff">House Hunting Update 🏡</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I just wanted to check in and see how the house hunting is going! Finding the right home takes time and I want to make sure you feel fully supported throughout the process.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">If you've found a property you love, or if you have any questions about your mortgage options, financing, or next steps — I'm just a call or email away and happy to help.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Wishing you the best of luck in your search — your perfect home is out there!</p>`
    },
    2: {
      subject: `Let's connect — when works for you?`,
      header: `<div style="font-size:22px;font-weight:800;color:#ffffff">Let's Talk 📅</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I hope your search is going well! I wanted to reach out and see if we could find some time to connect — even just for a quick call to make sure everything is lined up on the mortgage side so that when you find the right property, you're ready to move quickly.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">In today's market, being fully prepared can make all the difference. I want to make sure you're in the strongest possible position when the right home comes along.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px"><strong>Would you have some free time this week or next?</strong> Just reply to this email or give me a call and we'll find a time that works for you.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Looking forward to hearing from you!</p>`
    }
  }
  const m = msgs[emailNumber] || msgs[1]
  return {
    subject: m.subject,
    html: emailWrapper('linear-gradient(135deg,#0f172a,#1e3a5f)', m.header, m.body, sig)
  }
}

// ── RENEWAL REMINDER EMAILS ──
export function renewalReminderEmail({ clientName, daysOut, sig }) {
  const msgs = {
    90: {
      subject: `Important: Your mortgage renewal is approaching`,
      header: `<div style="font-size:22px;font-weight:800;color:#ffffff">Mortgage Renewal 📋</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I hope you're doing well! I'm reaching out because your mortgage renewal period is coming up, and I wanted to make sure you're aware of the importance of planning ahead.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">Many homeowners don't realize that the renewal letter their lender sends is often not the best offer available — and simply signing it without reviewing your options could mean leaving thousands of dollars on the table.</p>
        <div style="background:#eff6ff;border-left:4px solid #1e40af;border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0">
          <p style="font-size:13px;font-weight:700;color:#1e40af;margin:0 0 6px">Why work with me for your renewal?</p>
          <p style="font-size:13px;color:#475569;margin:0;line-height:1.8">✅ I shop multiple lenders on your behalf — not just one<br>✅ No cost to you — lenders pay my fee<br>✅ I negotiate to get you the best rate and terms<br>✅ I handle all the paperwork so renewal is seamless</p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I'd love to connect and walk you through your options before your renewal date arrives. Starting early gives us the most flexibility to find you the best deal.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0"><strong>Please reach out at your earliest convenience</strong> — I'm here to make this process as easy and beneficial as possible for you.</p>`
    },
    60: {
      subject: `Your mortgage renewal is coming — let's get ahead of it`,
      header: `<div style="font-size:22px;font-weight:800;color:#ffffff">Time to Act ⏰</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I wanted to follow up and make sure your mortgage renewal is on your radar. The best rates and options are typically secured well before the renewal date — and now is the ideal time to start that conversation.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">The mortgage market is always changing, and having someone in your corner who knows what's available across multiple lenders can make a significant difference in what you end up paying.</p>
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0">
          <p style="font-size:14px;font-weight:700;color:#92400e;margin:0 0 6px">Don't wait until the last minute</p>
          <p style="font-size:13px;color:#78350f;margin:0;line-height:1.7">Lenders often require several weeks to process renewals. Starting now gives us the best chance to secure the most competitive terms for you.</p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I'd love to set up a quick call or meeting at your convenience to review your situation and explore your options. There's absolutely no obligation — just a free, honest conversation about what's best for you.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">Please reach out when you're ready — I'm looking forward to helping you again!</p>`
    },
    30: {
      subject: `URGENT: Your mortgage renewal requires immediate attention`,
      header: `<div style="font-size:22px;font-weight:800;color:#ffffff">Action Required 🚨</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px">${sig.name} · Mortgage Intelligence</div>`,
      body: `<p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 8px">Hi ${clientName},</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I'm reaching out because your mortgage renewal is approaching very soon and I want to make absolutely sure you don't miss this critical window to secure the best possible terms.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin:20px 0">
          <p style="font-size:14px;font-weight:700;color:#991b1b;margin:0 0 6px">⚠️ Time is running out</p>
          <p style="font-size:13px;color:#7f1d1d;margin:0;line-height:1.7">If you simply accept your lender's renewal offer without reviewing your options, you could be locked into a rate that is not competitive for the next several years. A few minutes with me could save you thousands.</p>
        </div>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px">I work with multiple lenders and can quickly assess whether your current lender's offer is competitive or whether there's a better option available to you — at no cost to you whatsoever.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 16px"><strong>Please contact me as soon as possible</strong> so we can review your options and ensure you're making the most informed decision about your largest financial asset.</p>
        <p style="font-size:14px;color:#475569;line-height:1.8;margin:0">I'm here to help — let's talk soon.</p>`
    }
  }
  const m = msgs[daysOut] || msgs[90]
  const bgMap = { 90: 'linear-gradient(135deg,#1e40af,#3b82f6)', 60: 'linear-gradient(135deg,#92400e,#d97706)', 30: 'linear-gradient(135deg,#991b1b,#dc2626)' }
  return {
    subject: m.subject,
    html: emailWrapper(bgMap[daysOut] || bgMap[90], m.header, m.body, sig)
  }
}
