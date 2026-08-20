import { Resend } from 'resend';
import { config } from '../config/env.js';
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Alpha Cut <onboarding@resend.dev>';
export const sendVerificationEmail = async ({ toEmail, name, code }) => {
    const subject = 'Alpha Cut — Verify Your Email Address';
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #FBEFE1; color: #451D13; margin: 0; padding: 40px 20px; }
          .card { max-width: 540px; margin: 0 auto; background-color: #FFFDF8; border-radius: 20px; padding: 40px 32px; border: 1px solid rgba(69,29,19,0.12); box-shadow: 0 20px 40px -20px rgba(69,29,19,0.2); }
          .title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 800; color: #451D13; margin-bottom: 8px; }
          .code-box { background-color: #170B06; color: #D9B27C; font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 20px; border-radius: 14px; text-align: center; margin: 24px 0; }
          .footer { font-size: 12px; color: #7A5C4E; margin-top: 32px; border-top: 1px solid rgba(69,29,19,0.12); padding-top: 16px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">Alpha Cut Agency</div>
          <p>Hello ${name},</p>
          <p>Welcome to Alpha Cut. Enter the following 6-digit code to verify your email address:</p>
          <div class="code-box">${code}</div>
          <p>This verification code is valid for 15 minutes.</p>
          <div class="footer">
            Alpha Cut Agency &bull; Developed by aymen10.netlify.app
          </div>
        </div>
      </body>
    </html>
  `;
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
