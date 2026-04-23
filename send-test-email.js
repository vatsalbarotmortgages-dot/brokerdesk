import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'Vatsal Barot <vatsal@vatsalbarotmortgages.ca>';
export const BROKER_EMAIL = 'vatsal@vatsalbarotmortgages.ca';

export function getSignature(customSig) {
  return customSig || `
Vatsal Barot
Associate Mortgage Broker | Mortgage Intelligence
Broker License: #30005730 | Brokerage License: #3000168
📧 vatsal@vatsalbarotmortgages.ca
  `.trim();
}

export function emailHtml(body, signature) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; font-size: 15px; line-height: 1.7; margin: 0; padding: 0; background: #f8f8f6; }
  .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.08); }
  .header { background: linear-gradient(135deg, #1e3a5f, #1e40af); padding: 28px 36px; }
  .header-title { color: #fff; font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -.02em; }
  .header-sub { color: rgba(255,255,255,.6); font-size: 13px; margin: 4px 0 0; }
  .body { padding: 32px 36px; }
  .sig { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; line-height: 1.8; }
  .sig strong { color: #1a1a1a; font-size: 15px; display: block; margin-bottom: 4px; }
  .deal-card { background: #f8f8f6; border-radius: 10px; padding: 16px 20px; margin: 16px 0; border-left: 4px solid #1e40af; }
  .deal-name { font-weight: 700; font-size: 15px; color: #1a1a1a; margin-bottom: 4px; }
  .deal-stage { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #eff6ff; color: #1e40af; margin-bottom: 8px; }
  .deal-update { font-size: 13px; color: #6b7280; }
  .footer { background: #f8f8f6; padding: 16px 36px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-title">Mortgage Intelligence</div>
    <div class="header-sub">Vatsal Barot — Associate Mortgage Broker</div>
  </div>
  <div class="body">
    ${body}
    <div class="sig">
      <strong>Vatsal Barot</strong>
      Associate Mortgage Broker | Mortgage Intelligence<br>
      Broker License: #30005730 | Brokerage License: #3000168<br>
      📧 vatsal@vatsalbarotmortgages.ca
      ${signature ? '<br><br>' + signature.replace(/\n/g, '<br>') : ''}
    </div>
  </div>
  <div class="footer">This email was sent by BrokerDesk CRM on behalf of Vatsal Barot, Mortgage Intelligence.</div>
</div>
</body>
</html>`;
}
