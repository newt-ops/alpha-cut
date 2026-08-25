import { Resend } from 'resend';
import { config } from '../config/env.js';
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Alpha Cut <verification@alpha-cut.com>';
export const createEmailTemplateHtml = ({ name, code, title, badge, messageText, actionUrl, actionButtonText, }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alpha Cut Agency</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800&family=IBM+Plex+Mono:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

      body {
        margin: 0;
        padding: 0;
        background-color: #0E0604;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        color: #FBEFE1;
      }
      .wrapper {
        width: 100%;
        background-color: #0E0604;
        background-image: radial-gradient(circle at 50% 0%, #291209 0%, #0E0604 70%);
        padding: 48px 16px;
        box-sizing: border-box;
      }
      .container {
        max-width: 580px;
        margin: 0 auto;
        background: #1A0D07;
        border: 1px solid rgba(217, 178, 124, 0.35);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
      }
      .top-glow-bar {
        height: 4px;
        background: linear-gradient(90deg, #9E7444 0%, #D9B27C 50%, #9E7444 100%);
      }
      .header {
        background: linear-gradient(180deg, #170B06 0%, #1A0D07 100%);
        padding: 40px 36px 28px 36px;
        text-align: center;
        border-bottom: 1px solid rgba(217, 178, 124, 0.15);
      }
      .brand-logo-emblem {
        width: 48px;
        height: 48px;
        margin: 0 auto 16px auto;
        background: rgba(217, 178, 124, 0.1);
        border: 1px solid rgba(217, 178, 124, 0.35);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .brand-badge {
        display: inline-block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 2.5px;
        color: #D9B27C;
        text-transform: uppercase;
        background: rgba(217, 178, 124, 0.12);
        border: 1px solid rgba(217, 178, 124, 0.3);
        padding: 6px 16px;
        border-radius: 100px;
        margin-bottom: 14px;
      }
      .title {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 30px;
        font-weight: 800;
        color: #FBEFE1;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .body-content {
        padding: 36px 36px 40px 36px;
      }
      .greeting {
        font-size: 19px;
        font-weight: 700;
        color: #FBEFE1;
        margin-top: 0;
        margin-bottom: 12px;
      }
      .text {
        font-size: 15px;
        line-height: 1.7;
        color: #C9B8A8;
        margin-top: 0;
        margin-bottom: 28px;
      }
      .otp-card {
        background: #0F0704;
        border: 1.5px solid #D9B27C;
        border-radius: 20px;
        padding: 28px 20px;
        text-align: center;
        margin: 32px 0;
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8), 0 12px 35px -10px rgba(217, 178, 124, 0.25);
        position: relative;
      }
      .otp-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        color: #D9B27C;
        letter-spacing: 3px;
        text-transform: uppercase;
        margin-bottom: 12px;
        display: block;
      }
      .otp-code {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 42px;
        font-weight: 800;
        letter-spacing: 14px;
        color: #FFFFFF;
        margin: 0;
        text-shadow: 0 0 20px rgba(217, 178, 124, 0.4);
      }
      .timer-badge {
        display: inline-block;
        margin-top: 14px;
        font-size: 12px;
        font-weight: 600;
        color: #D9B27C;
        background: rgba(217, 178, 124, 0.12);
        padding: 4px 12px;
        border-radius: 100px;
        border: 1px solid rgba(217, 178, 124, 0.25);
      }
      .btn-container {
        text-align: center;
        margin: 32px 0 16px 0;
      }
      .btn {
        display: inline-block;
        background: linear-gradient(135deg, #E4C596 0%, #C9A06B 100%);
        color: #170B06 !important;
        font-weight: 700;
        font-size: 15px;
        text-decoration: none;
        padding: 16px 36px;
        border-radius: 14px;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(201, 160, 107, 0.4);
        letter-spacing: 0.2px;
      }
      .security-notice {
        background: rgba(217, 178, 124, 0.06);
        border-left: 3px solid #D9B27C;
        border-radius: 0 12px 12px 0;
        padding: 14px 18px;
        margin-top: 28px;
        font-size: 13px;
        line-height: 1.6;
        color: #A89588;
      }
      .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(217, 178, 124, 0.2) 50%, transparent 100%);
        margin: 36px 0 24px 0;
      }
      .footer {
        padding: 0 36px 36px 36px;
        text-align: center;
        font-size: 12.5px;
        color: #8B776A;
        line-height: 1.6;
      }
      .footer a {
        color: #D9B27C;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="top-glow-bar"></div>
        <div class="header">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px auto;">
            <tr>
              <td align="center" style="background: rgba(217, 178, 124, 0.12); border: 1px solid rgba(217, 178, 124, 0.35); border-radius: 14px; width: 52px; height: 52px; text-align: center; vertical-align: middle;">
                <span style="font-family: 'Fraunces', serif; font-size: 22px; font-weight: 800; color: #D9B27C; line-height: 52px; display: block;">AC</span>
              </td>
            </tr>
          </table>
          <span class="brand-badge">${badge}</span>
          <h1 class="title">${title}</h1>
        </div>
        <div class="body-content">
          <p class="greeting">Hello ${name},</p>
          <p class="text">${messageText}</p>

          <div class="otp-card">
            <span class="otp-label">SINGLE-USE VERIFICATION CODE</span>
            <div class="otp-code">${code}</div>
            <div class="timer-badge">⏱ Expires in 15 Minutes</div>
          </div>

          ${actionUrl && actionButtonText
    ? `<div class="btn-container">
                   <a href="${actionUrl}" class="btn" target="_blank">${actionButtonText}</a>
                 </div>`
    : ''}

          <div class="security-notice">
            <strong>Security Notice:</strong> Never share this verification code with anyone. Alpha Cut team members will never ask for your security code via chat or email.
          </div>
        </div>

        <div class="footer">
          <div class="divider"></div>
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #FBEFE1;">Alpha Cut Agency</strong> &bull; Executive Video Editing & Retainer OS
          </p>
          <p style="margin: 0;">
            <a href="https://alpha-cut.com">alpha-cut.com</a> &bull; Developed by <a href="https://aymen10.netlify.app">aymen10.netlify.app</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
`;
export const sendVerificationEmail = async ({ toEmail, name, code }) => {
    const subject = 'Alpha Cut — Verify Your Email Address';
    const actionUrl = `${config.clientUrl}/verify-email`;
    const htmlContent = createEmailTemplateHtml({
        name,
        code,
        title: 'Verify Your Email',
        badge: 'ALPHA CUT AGENCY',
        messageText: 'Welcome to <strong>Alpha Cut Agency</strong>. Please enter the 6-digit security verification code below to confirm your account and access your client dashboard workspace.',
        actionUrl,
        actionButtonText: 'Verify Account',
    });
    if (!resend) {
        console.log(`[DEV MODE EMAIL RESEND] Verification code for ${toEmail}: ${code}`);
        return { success: true, devMode: true };
    }
    try {
        const result = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [toEmail],
            subject,
            html: htmlContent,
        });
        if (result.error) {
            console.error('[RESEND API ERROR]:', result.error.message);
            console.log(`[RESEND FALLBACK OTP CODE] for ${toEmail}: ${code}`);
            return { success: false, error: result.error.message, fallbackCode: code };
        }
        console.log(`[RESEND SUCCESS] Sent verification email to ${toEmail}`);
        return { success: true, data: result.data };
    }
    catch (err) {
        console.error('Resend email exception:', err.message);
        console.log(`[RESEND FALLBACK OTP CODE] for ${toEmail}: ${code}`);
        return { success: false, error: err.message, fallbackCode: code };
    }
};
export const sendPasswordResetEmail = async ({ toEmail, name, code }) => {
    const subject = 'Alpha Cut — Reset Your Password';
    const actionUrl = `${config.clientUrl}/reset-password?email=${encodeURIComponent(toEmail)}`;
    const htmlContent = createEmailTemplateHtml({
        name,
        code,
        title: 'Reset Your Password',
        badge: 'ACCOUNT RECOVERY SECURITY',
        messageText: 'We received a request to reset the password for your <strong>Alpha Cut Agency</strong> account. Enter the 6-digit security code below or click the button to proceed.',
        actionUrl,
        actionButtonText: 'Reset Password',
    });
    if (!resend) {
        console.log(`[DEV MODE EMAIL RESEND] Password reset code for ${toEmail}: ${code}`);
        return { success: true, devMode: true };
    }
    try {
        const result = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [toEmail],
            subject,
            html: htmlContent,
        });
        if (result.error) {
            console.error('[RESEND API ERROR]:', result.error.message);
            console.log(`[RESEND FALLBACK OTP CODE] for ${toEmail}: ${code}`);
            return { success: false, error: result.error.message, fallbackCode: code };
        }
        console.log(`[RESEND SUCCESS] Sent password reset email to ${toEmail}`);
        return { success: true, data: result.data };
    }
    catch (err) {
        console.error('Resend email exception:', err.message);
        console.log(`[RESEND FALLBACK OTP CODE] for ${toEmail}: ${code}`);
        return { success: false, error: err.message, fallbackCode: code };
    }
};
