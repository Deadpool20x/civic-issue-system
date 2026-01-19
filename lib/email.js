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
