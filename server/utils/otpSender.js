import nodemailer from 'nodemailer';

/**
 * Send OTP via Email using Nodemailer
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
export const sendEmailOTP = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log('[OTP WARNING] Email credentials not configured in .env. Skipping real email send.');
    return false;
  }

  try {
    // Configure standard SMTP transporter (defaults to Gmail)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: user,
        pass: pass, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"MoodStream Security" <${user}>`,
      to: email,
      subject: 'MoodStream Account Verification Code',
      html: `
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
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP SUCCESS] Real email verification code successfully sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[OTP ERROR] Failed to send email verification:', error.message);
    return false;
  }
};

/**
 * Send Password Reset OTP via Email using Nodemailer
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit reset OTP
 */
export const sendPasswordResetEmail = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log('[OTP WARNING] Email credentials not configured in .env. Skipping real password reset email send.');
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
      subject: 'MoodStream Password Reset Code',
      html: `
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
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP SUCCESS] Real password reset email successfully sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[OTP ERROR] Failed to send password reset email:', error.message);
    return false;
  }
};
