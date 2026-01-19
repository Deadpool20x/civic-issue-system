/**
 * Generate HTML for report rejection notification email
 * @param {Object} reportData - Report information
 * @param {string} reason - Rejection reason
 * @returns {string} HTML email content
 */
export function generateReportRejectedEmail(reportData, reason) {
    const { reportId, title } = reportData;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #D7263D; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Report Status Update</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    Your report has been reviewed by our team. After careful consideration, we have determined that this report cannot be processed at this time.
                  </p>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                        <strong style="color: #006989;">Report ID:</strong> ${reportId}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                        <strong style="color: #006989;">Title:</strong> ${title}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <strong style="color: #D7263D;">Rejection Reason:</strong>
                        <div style="margin-top: 8px; padding: 12px; background-color: #fef2f2; border-left: 3px solid #D7263D; color: #333333; font-size: 14px;">
                          ${reason}
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- What to do next -->
                  <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 15px 0;">
                        <strong style="color: #006989; font-size: 16px;">What to do next</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <p style="margin: 0 0 10px 0; color: #333333; font-size: 14px; line-height: 1.6;">
                          • Review the rejection reason above<br>
                          • If you have additional information, you can resubmit your report<br>
                          • For urgent matters, please contact our support team directly
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${baseUrl}/issues/${reportId}" 
                           style="display: inline-block; background-color: #006989; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; min-height: 44px; line-height: 44px;">
                          View Report
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                    You received this email because you have an active report on our civic issue system.
                  </p>
                  <p style="margin: 0; color: #666666; font-size: 12px;">
                    <a href="${baseUrl}/profile/settings" style="color: #006989; text-decoration: underline;">Unsubscribe</a>
                  </p>
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
