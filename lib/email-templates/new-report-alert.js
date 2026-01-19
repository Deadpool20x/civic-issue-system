/**
 * Generate HTML for new report alert email to department
 * @param {Object} reportData - Report information
 * @param {string} departmentName - Department name
 * @returns {string} HTML email content
 */
export function generateNewReportAlertEmail(reportData, departmentName) {
    const { reportId, title, category, location, priority, photoUrl } = reportData;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Priority color mapping
    const priorityColors = {
        'low': '#10B981',
        'medium': '#FE7F2D',
        'high': '#D7263D',
        'critical': '#D7263D'
    };

    const priorityColor = priorityColors[priority?.toLowerCase()] || '#666666';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Report Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #006989; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Report Alert</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    A new report has been submitted and requires your attention.
                  </p>
                  
                  <!-- Photo Thumbnail -->
                  ${photoUrl ? `
                    <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                      <tr>
                        <td style="text-align: center;">
                          <img src="${photoUrl}" alt="Report Photo" style="max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid #e5e5e5;">
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
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
                        <strong style="color: #006989;">Priority:</strong> 
                        <span style="background-color: ${priorityColor}; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 600;">${priority}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${baseUrl}/admin/reports/${reportId}" 
                           style="display: inline-block; background-color: #006989; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; min-height: 44px; line-height: 44px;">
                          View in Dashboard
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
                    You received this because you're in ${departmentName}
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
