import { Resend } from 'resend';
import { config } from '../config/env.js';
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Alpha Cut <verification@alpha-cut.com>';
export const createEmailTemplateHtml = ({ name, code, title = 'Verify Your Email', badge = 'ALPHA CUT AGENCY' }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alpha Cut Agency</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #170B06;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        color: #FBEFE1;
      }
      .wrapper {
        width: 100%;
        background-color: #170B06;
        padding: 40px 16px;
        box-sizing: border-box;
      }
      .container {
        max-width: 560px;
        margin: 0 auto;
        background: #241209;
        border: 1px solid rgba(201, 160, 107, 0.3);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      }
      .header {
        background: linear-gradient(180deg, #170B06 0%, #241209 100%);
        padding: 36px 32px 24px 32px;
        text-align: center;
        border-bottom: 1px solid rgba(201, 160, 107, 0.15);
      }
      .brand-badge {
        display: inline-block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #D9B27C;
        text-transform: uppercase;
        background: rgba(217, 178, 124, 0.12);
        border: 1px solid rgba(217, 178, 124, 0.3);
        padding: 6px 14px;
        border-radius: 100px;
        margin-bottom: 12px;
      }
      .title {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 28px;
        font-weight: 800;
        color: #FBEFE1;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .body-content {
        padding: 32px 32px 36px 32px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 700;
        color: #FBEFE1;
        margin-top: 0;
        margin-bottom: 12px;
      }
      .text {
        font-size: 14.5px;
        line-height: 1.65;
        color: #C9B8A8;
        margin-top: 0;
        margin-bottom: 24px;
      }
      .otp-card {
        background: #170B06;
        border: 1.5px solid #D9B27C;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        margin: 28px 0;
        box-shadow: 0 10px 30px -10px rgba(217, 178, 124, 0.25);
      }
      .otp-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        color: #D9B27C;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 10px;
        display: block;
      }
      .otp-code {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 38px;
        font-weight: 800;
        letter-spacing: 12px;
        color: #FBEFE1;
        margin: 0;
        text-shadow: 0 2px 10px rgba(217, 178, 124, 0.3);
      }
      .timer-note {
        font-size: 12.5px;
        color: #C9B8A8;
        text-align: center;
        margin-top: 12px;
      }
      .divider {
        height: 1px;
        background: rgba(251, 239, 225, 0.12);
        margin: 32px 0 24px 0;
      }
      .footer {
        padding: 0 32px 32px 32px;
        text-align: center;
        font-size: 12px;
        color: #8B776A;
        line-height: 1.6;
      }
      .footer a {
        color: #D9B27C;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <span class="brand-badge">${badge}</span>
          <h1 class="title">${title}</h1>
        </div>
        <div class="body-content">
          <p class="greeting">Hello ${name},</p>
          <p class="text">
            Welcome to <strong>Alpha Cut Agency</strong>. Enter the 6-digit verification code below to confirm your account and access your client dashboard.
          </p>

          <div class="otp-card">
            <span class="otp-label">VERIFICATION CODE</span>
            <div class="otp-code">${code}</div>
            <p class="timer-note">Valid for 15 minutes &bull; Single-use security code</p>
          </div>

          <p class="text" style="font-size: 13px; color: #8B776A; margin-bottom: 0;">
            If you did not request this verification code, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          <div class="divider"></div>
          <p style="margin: 0 0 8px 0;">
            <strong>Alpha Cut Agency</strong> &bull; High-Impact Retention Video Editing
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
    const htmlContent = createEmailTemplateHtml({ name, code });
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
