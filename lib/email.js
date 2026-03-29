import { Resend } from 'resend';

/**
 * Send an email using Resend
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendEmail = async (to, subject, htmlContent) => {
  // Validate environment at runtime (not at module load time)
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not found in environment variables');
    return {
      success: false,
      error: 'RESEND_API_KEY not configured'
    };
  }

  try {
    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Civic Issue System <noreply@resend.dev>',
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('[email] Email sent successfully:', data.id);
    return {
      success: true,
      messageId: data.id
    };
  } catch (error) {
    console.error('[email] Unexpected error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send an OTP email using Resend
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - 6-digit OTP
 * @param {string} params.userName - Name of the user
 */
export async function sendOTPEmail({ to, otp, userName }) {
  // Validate environment at runtime (not at module load time)
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not found in environment variables');
    return {
      success: false,
      error: 'RESEND_API_KEY not configured'
    };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'CivicPulse <no-reply@civicpulse.in>',
      to,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px;
                    margin: 0 auto; background: #0A0A0A; padding: 32px;
                    border-radius: 16px; color: #FFFFFF;">

          <h2 style="color: #F5A623; margin-bottom: 8px;">
            Password Reset OTP
          </h2>

          <p style="color: #AAAAAA; margin-bottom: 24px;">
            Hi ${userName}, here is your OTP to reset your password.
          </p>

          <div style="background: #1A1A1A; border: 1px solid #333333;
                      border-radius: 12px; padding: 24px; text-align: center;
                      margin-bottom: 24px;">
            <p style="color: #AAAAAA; font-size: 14px; margin-bottom: 8px;">
              Your One-Time Password
            </p>
            <h1 style="color: #F5A623; font-size: 48px; letter-spacing: 12px;
                       margin: 0; font-weight: 900;">
              ${otp}
            </h1>
            <p style="color: #666666; font-size: 12px; margin-top: 12px;">
              Valid for 10 minutes only
            </p>
          </div>

          <div style="background: #FF4444/20; border: 1px solid #FF444440;
                      border-radius: 8px; padding: 12px; margin-bottom: 24px;">
            <p style="color: #F87171; font-size: 13px; margin: 0;">
              ⚠️ Never share this OTP with anyone.
              CivicPulse will never ask for your OTP.
            </p>
          </div>

          <p style="color: #666666; font-size: 12px;">
            If you did not request this, ignore this email.
            Your password will not change.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[email] Unexpected error sending email:', error);
    return { success: false, error: error.message };
  }
}
