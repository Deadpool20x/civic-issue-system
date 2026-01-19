/**
 * Generate HTML for rating request email
 * @param {Object} reportData - Report information
 * @param {string} beforePhoto - URL of before photo (optional)
 * @param {string} afterPhoto - URL of after photo (optional)
 * @returns {string} HTML email content
 */
export function generateRatingRequestEmail(reportData, beforePhoto, afterPhoto) {
    const { reportId, title, resolutionDate } = reportData;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rate Your Experience</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #10B981; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Issue Resolved! 🎉</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    We're pleased to inform you that your report has been resolved. We'd love to hear about your experience!
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
                        <strong style="color: #006989;">Resolution Date:</strong> ${resolutionDate || 'Recently'}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Before & After Photos -->
                  ${beforePhoto || afterPhoto ? `
                    <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 15px 0;">
                          <strong style="color: #006989; font-size: 16px;">Before & After</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              ${beforePhoto ? `
                                <td style="width: 50%; text-align: center; padding: 10px; vertical-align: top;">
                                  <div style="font-weight: 600; color: #333333; margin-bottom: 8px;">Before</div>
                                  <img src="${beforePhoto}" alt="Before" style="max-width: 100%; max-height: 150px; border-radius: 6px; border: 1px solid #e5e5e5;">
                                </td>
                              ` : ''}
                              ${afterPhoto ? `
                                <td style="width: 50%; text-align: center; padding: 10px; vertical-align: top;">
                                  <div style="font-weight: 600; color: #333333; margin-bottom: 8px;">After</div>
                                  <img src="${afterPhoto}" alt="After" style="max-width: 100%; max-height: 150px; border-radius: 6px; border: 1px solid #e5e5e5;">
                                </td>
                              ` : ''}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
                  <!-- Star Rating -->
                  <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                    <tr>
                      <td style="text-align: center; padding: 15px 0;">
                        <p style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">
                          How did we do?
                        </p>
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            ${[1, 2, 3, 4, 5].map(star => `
                              <td style="padding: 0 8px;">
                                <a href="${baseUrl}/issues/${reportId}?rate=${star}" 
                                   style="display: inline-block; background-color: #FE7F2D; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-size: 18px; font-weight: 600; min-height: 44px; line-height: 44px;">
                                  ${star}★
                                </a>
                              </td>
                            `).join('')}
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Optional Feedback -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                          Optional: Share additional feedback
                        </p>
                        <a href="${baseUrl}/issues/${reportId}" 
                           style="display: inline-block; background-color: #006989; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; min-height: 40px; line-height: 40px;">
                          Provide Feedback
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
                    Your feedback helps us improve our service for all citizens.
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
