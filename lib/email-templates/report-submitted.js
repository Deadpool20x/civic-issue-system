/**
 * Generate HTML for report submission confirmation email
 * @param {Object} reportData - Report information
 * @param {string} reportData.reportId - Report ID
 * @param {string} reportData.title - Report title
 * @param {string} reportData.category - Report category
 * @param {string} reportData.location - Report location
 * @param {string} reportData.status - Report status
 * @returns {string} HTML email content
 */
export function generateReportSubmittedEmail(reportData) {
    const { reportId, title, category, location, status } = reportData;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report Submitted</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #006989; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Report Submitted Successfully</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    Thank you for submitting your report. Our team will review it and keep you updated on the progress.
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
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                        <strong style="color: #006989;">Category:</strong> ${category}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                        <strong style="color: #006989;">Location:</strong> ${location}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <strong style="color: #006989;">Status:</strong> 
                        <span style="background-color: #FE7F2D; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">${status}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${baseUrl}/issues/${reportId}" 
                           style="display: inline-block; background-color: #006989; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; min-height: 44px; line-height: 44px;">
                          Track Your Report
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
                    You received this email because you submitted a report on our civic issue system.
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
