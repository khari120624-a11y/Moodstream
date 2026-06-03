import nodemailer from 'nodemailer';

/**
 * Send OTP via Email (supports Brevo API over HTTPS as primary, falls back to SMTP)
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
export const sendEmailOTP = async (email, otp) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const subject = 'MoodStream Account Verification Code';
  const htmlContent = `
    <div style="max-width: 500px; margin: 0 auto; font-family: sans-serif; background-color: #0b0c10; border: 1px solid #1f2937; border-radius: 12px; padding: 30px; color: #f5f6f9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #818cf8; margin: 0; font-size: 24px; font-weight: 800;">MoodStream 🎵</h1>
      </div>
      <div style="border-top: 1px solid #1f2937; padding-top: 20px;">
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Use the following verification code to activate your account. This code is valid for 5 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #a5b4fc; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); padding: 12px 24px; border-radius: 8px; font-family: monospace; display: inline-block; box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 25px;">If you did not request this code, please ignore this email.</p>
      </div>
    </div>
  `;

  // Try Brevo API over HTTPS (ideal for Render/prod environments to bypass blocked SMTP ports)
  if (brevoKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'MoodStream Security',
            email: user || 'khari120624@gmail.com'
          },
          to: [{ email: email }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (response.ok) {
        console.log(`[OTP SUCCESS] Real email verification code successfully sent to ${email} via Brevo REST API`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('[OTP ERROR] Brevo API failed with status:', response.status, errorText);
      }
    } catch (error) {
      console.error('[OTP ERROR] Brevo API connection failed:', error.message);
    }
  }

  // Fallback to Nodemailer SMTP
  if (!user || !pass) {
    console.log('[OTP WARNING] Email credentials not configured in .env. Skipping SMTP email send.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    });

    const mailOptions = {
      from: `"MoodStream Security" <${user}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP SUCCESS] Real email verification code successfully sent to ${email} via SMTP`);
    return true;
  } catch (error) {
    console.error('[OTP ERROR] Failed to send email verification via SMTP:', error.message);
    return false;
  }
};

/**
 * Send Password Reset OTP via Email (supports Brevo API over HTTPS as primary, falls back to SMTP)
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit reset OTP
 */
export const sendPasswordResetEmail = async (email, otp) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const subject = 'MoodStream Password Reset Code';
  const htmlContent = `
    <div style="max-width: 500px; margin: 0 auto; font-family: sans-serif; background-color: #0b0c10; border: 1px solid #1f2937; border-radius: 12px; padding: 30px; color: #f5f6f9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #f87171; margin: 0; font-size: 24px; font-weight: 800;">MoodStream 🎵</h1>
      </div>
      <div style="border-top: 1px solid #1f2937; padding-top: 20px;">
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">You requested to reset your password. Use the following verification code to reset it. This code is valid for 5 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #fca5a5; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px 24px; border-radius: 8px; font-family: monospace; display: inline-block; box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 25px;">If you did not request this password reset, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  // Try Brevo API over HTTPS
  if (brevoKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'MoodStream Security',
            email: user || 'khari120624@gmail.com'
          },
          to: [{ email: email }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (response.ok) {
        console.log(`[OTP SUCCESS] Real password reset email successfully sent to ${email} via Brevo REST API`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('[OTP ERROR] Brevo reset API failed with status:', response.status, errorText);
      }
    } catch (error) {
      console.error('[OTP ERROR] Brevo reset API connection failed:', error.message);
    }
  }

  // Fallback to Nodemailer SMTP
  if (!user || !pass) {
    console.log('[OTP WARNING] Email credentials not configured in .env. Skipping SMTP password reset email send.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    });

    const mailOptions = {
      from: `"MoodStream Security" <${user}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP SUCCESS] Real password reset email successfully sent to ${email} via SMTP`);
    return true;
  } catch (error) {
    console.error('[OTP ERROR] Failed to send password reset email via SMTP:', error.message);
    return false;
  }
};
