// BrokerDesk Email Templates — Modern Professional Design

export function getSignature(sig) {
  var photoHtml = sig.photoUrl
    ? '<td style="padding-right:16px;vertical-align:top"><img src="' + sig.photoUrl + '" alt="' + sig.name + '" width="64" height="64" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f0;display:block"/></td>'
    : ''
  return '<table cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:20px;width:100%"><tr>'
    + photoHtml
    + '<td style="vertical-align:top">'
    + '<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">' + sig.name + '</div>'
    + '<div style="font-size:13px;color:#64748b;margin-bottom:1px">' + (sig.title || 'Associate Mortgage Broker') + '</div>'
    + '<div style="font-size:13px;color:#64748b;margin-bottom:6px">Mortgage Intelligence</div>'
    + '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">Broker License: ' + (sig.brokerLicense || '#30005730') + ' &nbsp;|&nbsp; Brokerage License: ' + (sig.brokerageLicense || '#3000168') + '</div>'
    + '<div style="font-size:13px;margin-bottom:2px"><a href="mailto:' + sig.email + '" style="color:#2563eb;text-decoration:none">&#x1F4E7; ' + sig.email + '</a>' + (sig.phone ? '&nbsp;&nbsp;<span style="color:#64748b">&#x1F4DE; ' + sig.phone + '</span>' : '') + '</div>'
    + (sig.tagline ? '<div style="font-size:11px;color:#94a3b8;font-style:italic;margin-top:6px">' + sig.tagline + '</div>' : '')
    + '</td></tr></table>'
}

function modernWrapper(opts) {
  var accentColor = opts.accentColor, icon = opts.icon, tagline = opts.tagline || '', bodyHtml = opts.bodyHtml, sig = opts.sig
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;padding:32px 16px"><tr><td align="center">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">'
    + '<tr><td style="background:' + accentColor + ';height:5px;font-size:0">&nbsp;</td></tr>'
    + '<tr><td style="padding:28px 36px 20px;background:#ffffff;border-bottom:1px solid #f1f5f9">'
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
    + '<td><div style="font-size:26px;margin-bottom:4px">' + icon + '</div><div style="font-size:13px;color:#64748b;font-weight:500">Vatsal Barot &nbsp;&#183;&nbsp; Mortgage Intelligence</div></td>'
    + '<td align="right" style="vertical-align:middle"><div style="font-size:11px;color:#94a3b8;text-align:right">' + tagline + '</div></td>'
    + '</tr></table></td></tr>'
    + '<tr><td style="padding:32px 36px">' + bodyHtml + getSignature(sig) + '</td></tr>'
    + '<tr><td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #f1f5f9">'
    + '<div style="font-size:11px;color:#94a3b8;text-align:center">This message was sent by Vatsal Barot, Associate Mortgage Broker at Mortgage Intelligence.<br>Broker License #30005730 &nbsp;|&nbsp; Brokerage License #3000168</div>'
    + '</td></tr></table></td></tr></table></body></html>'
}

function P(text) {
  return '<p style="font-size:15px;color:#334155;line-height:1.8;margin:0 0 16px">' + text + '</p>'
}

function H2(title, subtitle) {
  return '<h2 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 6px">' + title + '</h2>'
    + '<p style="font-size:14px;color:#64748b;margin:0 0 24px">' + subtitle + '</p>'
}

function Box(title, body, color) {
  return '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0"><tr>'
    + '<td style="background:' + color + '11;border-left:4px solid ' + color + ';border-radius:0 8px 8px 0;padding:14px 18px">'
    + '<div style="font-size:13px;font-weight:700;color:' + color + ';margin-bottom:5px">' + title + '</div>'
    + '<div style="font-size:13px;color:#475569;line-height:1.7">' + body + '</div>'
    + '</td></tr></table>'
}

function DealCard(d, color) {
  return '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">'
    + '<tr><td style="background:' + color + '0d;padding:14px 18px;border-bottom:1px solid #f1f5f9">'
    + '<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px">' + d.name + (d.b2_name ? ' &amp; ' + d.b2_name : '') + '</div>'
    + '<div style="font-size:12px;color:#64748b">' + (d.property || 'Property TBD') + '</div>'
    + '</td></tr>'
    + '<tr><td style="padding:12px 18px">'
    + '<span style="display:inline-block;background:' + color + '18;color:' + color + ';font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;margin-bottom:10px">' + d.stage + '</span>'
    + '<div style="font-size:12px;color:#475569;background:#f8fafc;padding:10px 12px;border-radius:6px;border-left:3px solid ' + color + '"><strong>Last update:</strong> ' + (d.last_note || 'No recent updates') + '</div>'
    + '</td></tr></table>'
}

// ── PARTNER STATUS ──
export function partnerStatusEmail({ partnerName, deals, sig }) {
  var stageColors = { 'Lead':'#64748b','Pre-Approval':'#3b82f6','Documents Received':'#8b5cf6','Application Submitted':'#10b981','Approved':'#22c55e','Conditions Cleared':'#ec4899','Funded':'#16a34a','Check In':'#f59e0b' }
  var cards = deals.map(function(d){ return DealCard(d, stageColors[d.stage] || '#64748b') }).join('')
  var body = H2('File Update', 'For your referred client' + (deals.length !== 1 ? 's' : ''))
    + P('Hi ' + partnerName + ',')
    + P('Here\'s a quick update on the file' + (deals.length !== 1 ? 's' : '') + ' you\'ve referred to me. I\'ll keep you in the loop as things progress — please reach out anytime if you have questions.')
    + cards
    + P('Thank you again for the referral — I genuinely value our partnership.')
  return {
    subject: 'File Update — ' + deals.length + ' Active Deal' + (deals.length !== 1 ? 's' : '') + ' | Vatsal Barot',
    html: modernWrapper({ accentColor:'#2563eb', icon:'&#x1F4CB;', tagline: deals.length + ' active file' + (deals.length !== 1 ? 's' : ''), bodyHtml: body, sig: sig })
  }
}

// ── COFFEE INVITE ──
export function coffeeInviteEmail({ partnerName, sig }) {
  var body = H2("Let's Catch Up", 'A personal note from Vatsal')
    + P('Hi ' + partnerName + ',')
    + P('I hope things are going well! It\'s been a little while since we\'ve had a chance to connect and I just wanted to reach out personally.')
    + P('I\'ve genuinely valued our relationship and the clients you\'ve trusted me with — and I\'d love to catch up over a coffee, hear how business is going on your end, and explore how we can continue supporting each other.')
    + P('Would you be open to meeting sometime in the next couple of weeks? I\'m completely flexible on timing — just let me know what works for you and I\'ll make it happen.')
    + P('Looking forward to connecting!')
  return {
    subject: "Let's grab a coffee — Vatsal Barot",
    html: modernWrapper({ accentColor:'#d97706', icon:'&#x2615;', tagline:'A personal note', bodyHtml: body, sig: sig })
  }
}

// ── STALE DEAL ──
export function staleDealEmail({ dealName, stage, daysSinceUpdate, sig }) {
  var urgent = daysSinceUpdate > 20
  var color = urgent ? '#dc2626' : '#d97706'
  var body = H2('Follow-up Needed', 'A deal has been idle for ' + daysSinceUpdate + ' days')
    + '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px"><tr>'
    + '<td style="background:' + color + '0d;border:1px solid ' + color + '33;border-radius:10px;padding:16px 20px">'
    + '<div style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px">' + dealName + '</div>'
    + '<div style="font-size:13px;color:#64748b">Stage: <strong>' + stage + '</strong> &nbsp;&#183;&nbsp; <strong style="color:' + color + '">' + daysSinceUpdate + ' days</strong> with no update</div>'
    + '</td></tr></table>'
    + P('This deal has been sitting idle. Consider reaching out to the client or updating the file status to keep things moving forward.')
    + '<table cellpadding="0" cellspacing="0" border="0"><tr><td>'
    + '<a href="https://brokerdesk.vercel.app" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Open BrokerDesk &#8594;</a>'
    + '</td></tr></table>'
  return {
    subject: 'Follow-up needed: ' + dealName + ' — ' + stage + ' (' + daysSinceUpdate + ' days)',
    html: modernWrapper({ accentColor: color, icon: urgent ? '&#x1F6A8;' : '&#x26A0;', tagline:'Action required', bodyHtml: body, sig: sig })
  }
}

// ── FUNDED FOLLOW-UP ──
export function fundedFollowupEmail({ clientName, followupNumber, sig }) {
  var body
  if (followupNumber === 1) {
    body = H2('Checking In', 'A quick hello from Vatsal')
      + P('Hi ' + clientName + ',')
      + P('I hope you\'re settling into your new home and that the move went smoothly! It\'s been about a month since everything finalized and I just wanted to check in to see how you\'re doing.')
      + P('If you have any questions about your mortgage, your payment schedule, or anything at all, please don\'t hesitate to reach out — I\'m always here to help.')
      + P('Wishing you all the best in your new home!')
  } else if (followupNumber === 2) {
    body = H2('Thinking of You', 'A quick hello from Vatsal')
      + P('Hi ' + clientName + ',')
      + P('I hope you\'re enjoying your home! I was thinking of you and wanted to touch base to see how things are going a couple of months in.')
      + P('If you know anyone — a friend, family member, or colleague — who is looking to buy a home, refinance, or renew their mortgage, I would truly appreciate the referral. A personal recommendation means the world to me.')
      + P('As always, I\'m just a call or email away if you ever need anything!')
  } else {
    body = H2('3 Month Check-In', 'Your mortgage journey continues')
      + P('Hi ' + clientName + ',')
      + P('Congratulations — it\'s been 3 months since your mortgage finalized! I hope home ownership has been everything you hoped for and more.')
      + Box('A friendly reminder', 'As your mortgage term progresses, it\'s always a good idea to stay informed about your options. When your renewal approaches, I\'ll be reaching out well in advance to make sure you get the best possible rate and terms — just like we did the first time.', '#8b5cf6')
      + P('In the meantime, if you have any questions or know someone who could use my help, I\'m always here for you.')
  }
  var subjects = { 1:'Checking in — how are you settling in?', 2:'Thinking of you — a quick hello', 3:'3 months in — your mortgage, your future' }
  var accents = { 1:'#10b981', 2:'#3b82f6', 3:'#8b5cf6' }
  var icons = { 1:'&#x1F3E0;', 2:'&#x1F44B;', 3:'&#x1F389;' }
  return {
    subject: subjects[followupNumber] || subjects[1],
    html: modernWrapper({ accentColor: accents[followupNumber] || '#10b981', icon: icons[followupNumber] || '&#x1F3E0;', tagline: followupNumber + ' month' + (followupNumber !== 1 ? 's' : '') + ' since funding', bodyHtml: body, sig: sig })
  }
}

// ── BIRTHDAY ──
export function birthdayEmail({ clientName, sig }) {
  var body = H2('Happy Birthday!', 'Wishing you a wonderful day')
    + P('Happy Birthday, ' + clientName + '! &#x1F389;')
    + P('I just wanted to take a moment to wish you a truly wonderful birthday. I hope your day is filled with joy, celebration, and everything that makes you happy.')
    + P('It has been such a pleasure working with you and I\'m genuinely grateful for the trust you placed in me. I hope this next year brings you exciting new adventures — maybe even another chapter in your real estate journey!')
    + P('Wishing you a special day and an incredible year ahead. Please don\'t hesitate to reach out if there\'s ever anything I can help you with.')
  return {
    subject: 'Happy Birthday, ' + clientName + '! — Vatsal Barot',
    html: modernWrapper({ accentColor:'#8b5cf6', icon:'&#x1F382;', tagline:'Wishing you a wonderful day', bodyHtml: body, sig: sig })
  }
}

// ── ANNIVERSARY ──
export function anniversaryEmail({ clientName, sig }) {
  var body = H2('One Year in Your Home!', 'Congratulations on your homeownership anniversary')
    + P('Hi ' + clientName + ',')
    + P('Can you believe it has already been one year since you moved into your home? Time really does fly! It feels like just yesterday we were working through all the details together, and now here you are — a full year in.')
    + P('Homeownership is one of the most important decisions a person can make, and I am truly proud to have been a part of your journey. Watching clients build their lives and memories in their homes is the reason I love what I do.')
    + Box('A friendly reminder', 'As your mortgage term continues, it\'s always smart to stay ahead of your renewal. When the time comes, I\'ll make sure you\'re informed and have access to the best options available — that\'s a promise.', '#2563eb')
    + P('If you know any friends or family who are thinking about buying a home, refinancing, or renewing their mortgage, I would be honoured if you kept me in mind. A referral from someone like you truly means the world to me.')
    + P('Here\'s to many more wonderful years in your home. Thank you for trusting me with such an important milestone. &#x1F942;')
  return {
    subject: 'Happy 1-Year Home Anniversary, ' + clientName + '!',
    html: modernWrapper({ accentColor:'#2563eb', icon:'&#x1F3E0;', tagline:'1-year homeownership anniversary', bodyHtml: body, sig: sig })
  }
}

// ── DOCS / PRE-APPROVAL FOLLOW-UP ──
export function docsFollowupEmail({ clientName, emailNumber, stage, sig }) {
  var body
  if (emailNumber === 1) {
    body = H2('House Hunting Update', 'Checking in on your search')
      + P('Hi ' + clientName + ',')
      + P('I just wanted to check in and see how the house hunting is going! Finding the right home takes time and I want to make sure you feel fully supported throughout the entire process.')
      + P('If you\'ve found a property you love, or if you have any questions about your mortgage options, financing, or next steps — I\'m just a call or email away and happy to help.')
      + P('Wishing you the best of luck in your search — your perfect home is out there!')
  } else {
    body = H2("Let's Connect", 'When works for you?')
      + P('Hi ' + clientName + ',')
      + P('I hope your search is going well! I wanted to reach out and see if we could find some time to connect — even just for a quick call to make sure everything is lined up on the mortgage side so that when you find the right property, you\'re ready to move quickly.')
      + Box('Why connect now?', 'In today\'s market, being fully prepared can make all the difference. Having your mortgage pre-approved and in order means you can make a confident offer the moment the right home comes along.', '#0891b2')
      + P('<strong>Would you have some free time this week or next?</strong> Just reply to this email or give me a call and we\'ll find a time that works perfectly for you.')
      + P('Looking forward to hearing from you!')
  }
  var subjects = { 1:'Checking in — how is the house hunting going?', 2:"Let's connect — when works for you?" }
  return {
    subject: subjects[emailNumber] || subjects[1],
    html: modernWrapper({ accentColor:'#0891b2', icon:'&#x1F3E1;', tagline: emailNumber === 1 ? 'House hunting check-in' : "Let's find a time to chat", bodyHtml: body, sig: sig })
  }
}

// ── RENEWAL REMINDERS ──
export function renewalReminderEmail({ clientName, daysOut, sig }) {
  var body
  if (daysOut === 90) {
    body = H2('Your Mortgage Renewal Is Coming Up', 'Plan ahead for the best results')
      + P('Hi ' + clientName + ',')
      + P('I hope you\'re doing well! I\'m reaching out because your mortgage renewal period is on the horizon, and I wanted to make sure you have plenty of time to explore your options.')
      + Box('Why start early?', '&#x2705; Shopping multiple lenders takes time — starting early gives us maximum flexibility<br>&#x2705; The renewal offer from your current lender is often not the most competitive available<br>&#x2705; I work at no cost to you — lenders pay my fee<br>&#x2705; Early preparation means no last-minute stress', '#2563eb')
      + P('I\'d love to connect and walk you through what\'s available. Starting this conversation now puts you in the strongest possible position.')
      + P('Please reach out at your convenience — I\'m here to make this process as easy and beneficial as possible for you.')
  } else if (daysOut === 60) {
    body = H2('Your Renewal Is Getting Closer', 'Now is the ideal time to act')
      + P('Hi ' + clientName + ',')
      + P('I wanted to follow up and make sure your mortgage renewal is on your radar. The best rates and options are typically secured well before the renewal date — and right now is the ideal time to start that conversation.')
      + Box("Don't wait until the last minute", 'The mortgage market is always changing. Having someone in your corner who knows what\'s available across multiple lenders can make a significant difference in what you end up paying over the next several years.', '#d97706')
      + P('I\'d love to set up a quick call or meeting at your convenience. There\'s absolutely no obligation — just a free, honest conversation about what\'s best for you.')
      + P('Please reach out when you\'re ready — I\'m looking forward to helping you again!')
  } else {
    body = H2('Your Renewal Requires Attention Soon', "Don't miss this important window")
      + P('Hi ' + clientName + ',')
      + P('I\'m reaching out because your mortgage renewal is approaching soon and I want to make sure you don\'t miss this important window to review your options and secure the best possible terms.')
      + Box('Why this matters', 'Simply accepting your lender\'s renewal offer without reviewing your options could mean being locked into a rate that isn\'t competitive — potentially for the next several years. A brief conversation with me could make a meaningful difference.', '#dc2626')
      + P('I work with multiple lenders and can quickly assess whether there are better options available to you — at absolutely no cost to you.')
      + P('<strong>Please reach out as soon as possible</strong> so we can make sure you\'re making the most informed decision about your most important financial asset.')
      + P('I\'m here to help — let\'s talk soon.')
  }
  var subjects = { 90:'Your mortgage renewal is approaching — plan ahead', 60:"Your mortgage renewal is coming — let's get ahead of it", 30:'Important: Your mortgage renewal needs attention soon' }
  var colors = { 90:'#2563eb', 60:'#d97706', 30:'#dc2626' }
  var icons = { 90:'&#x1F4CB;', 60:'&#x23F0;', 30:'&#x1F6A8;' }
  return {
    subject: subjects[daysOut] || subjects[90],
    html: modernWrapper({ accentColor: colors[daysOut] || '#2563eb', icon: icons[daysOut] || '&#x1F4CB;', tagline: daysOut + ' days before renewal', bodyHtml: body, sig: sig })
  }
}
