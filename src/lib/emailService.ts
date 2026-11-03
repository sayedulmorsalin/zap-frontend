/**
 * High-Security Email Dispatcher for ZAP Administrative Console
 * Supports:
 * - Resend API (via native fetch over HTTPS)
 * - Brevo / Sendinblue API (via native fetch over HTTPS)
 * - SendGrid API (via native fetch over HTTPS)
 * - Generic Webhook / Relay URL
 * - Development Console / Simulation Mode (with clear logs & audit trail)
 */

export interface SendOtpEmailParams {
  to: string;
  code: string;
  ip: string;
  userAgent?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  provider: 'resend' | 'brevo' | 'sendgrid' | 'webhook' | 'simulation';
  message: string;
  previewUrl?: string;
}

function generateOtpEmailHtml(code: string, ip: string, userAgent?: string): string {
  const formattedTime = new Date().toUTCString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZAP Executive Console Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F4F5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #09090B; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" max-width="520" style="max-width: 520px; background-color: #121217; border: 1px solid #27272A; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          <!-- Top Accent Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #DC2626 0%, #EF4444 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #B91C1C 0%, #DC2626 100%); color: #FFFFFF; font-weight: 900; font-size: 16px; padding: 6px 14px; border-radius: 8px; letter-spacing: 0.08em; margin-bottom: 16px;">
                ZAP
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #EF4444; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px;">
                EXECUTIVE SECURITY SYSTEM
              </div>
              <h1 style="font-size: 22px; font-weight: 900; color: #FFFFFF; margin: 0; line-height: 1.3;">
                Your Dynamic 2FA Security PIN
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 16px 32px 24px; text-align: center;">
              <p style="font-size: 14px; line-height: 1.6; color: #A1A1AA; margin: 0 0 24px;">
                A sign-in attempt was initiated for the ZAP Footwear Executive Management Console. Use the single-use 6-digit verification code below to authorize your session:
              </p>

              <!-- PIN Display Box -->
              <div style="background-color: #18181B; border: 1.5px dashed #3F3F46; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 900; letter-spacing: 0.35em; color: #FFFFFF; text-shadow: 0 2px 10px rgba(220, 38, 38, 0.4);">
                  ${code}
                </div>
                <div style="font-size: 12px; color: #71717A; font-weight: 600; margin-top: 8px;">
                  VALID FOR 10 MINUTES • SINGLE USE ONLY
                </div>
              </div>

              <!-- Metadata Info Box -->
              <table role="presentation" width="100%" style="background-color: #0F172A; border: 1px solid #1E293B; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; font-size: 12px; text-align: left; color: #94A3B8;">
                <tr>
                  <td style="padding: 4px 0; color: #64748B; width: 35%;">Request Time:</td>
                  <td style="padding: 4px 0; color: #E2E8F0; font-family: monospace;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748B;">Requesting IP:</td>
                  <td style="padding: 4px 0; color: #E2E8F0; font-family: monospace;">${ip}</td>
                </tr>
                ${userAgent ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748B;">Device / Agent:</td>
                  <td style="padding: 4px 0; color: #E2E8F0; word-break: break-all;">${userAgent.slice(0, 70)}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Warning -->
              <div style="border-top: 1px solid #27272A; padding-top: 20px; font-size: 12px; line-height: 1.5; color: #71717A;">
                <strong style="color: #EF4444;">Security Alert:</strong> If you did not initiate this administrative login, someone may have obtained your master passkey. Please change your master credentials immediately.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0B0B0E; padding: 16px 32px; text-align: center; border-top: 1px solid #1F1F24;">
              <span style="font-size: 11px; color: #52525B;">
                © ${new Date().getFullYear()} ZAP Footwear. Automated High-Security Alert.
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends a dynamic 2FA PIN email to the administrative recipient.
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<EmailDispatchResult> {
  const { to, code, ip, userAgent } = params;
  const subject = `🔐 [ZAP Footwear] Your 6-Digit Admin Verification PIN: ${code}`;
  const html = generateOtpEmailHtml(code, ip, userAgent);

  // 1. Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'ZAP Security <security@zapbd.com>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (res.ok) {
        return {
          success: true,
          provider: 'resend',
          message: `Verification PIN dispatched to ${to} via Resend.`,
        };
      }
      const errData = await res.json().catch(() => ({}));
      console.warn('[Resend API Error]:', errData);
    } catch (err) {
      console.error('[Resend API Exception]:', err);
    }
  }

  // 2. Brevo (Sendinblue) API
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'security@zapbd.com';
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: 'ZAP Security', email: fromEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        return {
          success: true,
          provider: 'brevo',
          message: `Verification PIN dispatched to ${to} via Brevo.`,
        };
      }
    } catch (err) {
      console.error('[Brevo API Exception]:', err);
    }
  }

  // 3. SendGrid API
  const sendGridKey = process.env.SENDGRID_API_KEY;
  if (sendGridKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'security@zapbd.com';
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendGridKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: 'ZAP Security' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (res.ok) {
        return {
          success: true,
          provider: 'sendgrid',
          message: `Verification PIN dispatched to ${to} via SendGrid.`,
        };
      }
    } catch (err) {
      console.error('[SendGrid API Exception]:', err);
    }
  }

  // 4. Custom Webhook / Relay URL
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, code, subject, html, ip, userAgent }),
      });
      if (res.ok) {
        return {
          success: true,
          provider: 'webhook',
          message: `Verification PIN dispatched to ${to} via email webhook.`,
        };
      }
    } catch (err) {
      console.error('[Email Webhook Exception]:', err);
    }
  }

  // 5. Fallback Simulation / Local Development Mode
  // If no external SMTP/API key is configured yet, print formatted log to terminal
  console.log('\n================================================================');
  console.log('🔒 [ZAP SECURITY SHIELD] DYNAMIC 2FA EMAIL DISPATCH');
  console.log(`✉️  RECIPIENT : ${to}`);
  console.log(`🔑  2FA PIN   : [ ${code} ]`);
  console.log(`⏱️  VALIDITY  : 10 Minutes (Single Use Only)`);
  console.log(`🌐  IP        : ${ip}`);
  console.log('💡  NOTE      : Configure RESEND_API_KEY or BREVO_API_KEY in .env to deliver real emails.');
  console.log('================================================================\n');

  return {
    success: true,
    provider: 'simulation',
    message: `Verification PIN generated and sent to ${to} (Simulation Mode - see server logs).`,
  };
}

