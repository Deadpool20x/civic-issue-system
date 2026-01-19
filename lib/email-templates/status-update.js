/**
 * Generate HTML for status update notification email
 * @param {Object} reportData - Report information
 * @param {string} newStatus - New status of the report
 * @returns {string} HTML email content
 */
export function generateStatusUpdateEmail(reportData, newStatus) {
    const { reportId, title } = reportData;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Status color mapping
    const statusColors = {
        'submitted': '#FE7F2D',
        'in-progress': '#006989',
        'resolved': '#10B981',
        'rejected': '#D7263D',
        'escalated': '#D7263D'
    };

    const statusColor = statusColors[newStatus.toLowerCase()] || '#666666';

    // Timeline data
    const timeline = [
        { status: 'submitted', label: 'Report Submitted', date: 'Just now' },
        { status: newStatus.toLowerCase(), label: `Status: ${newStatus}`, date: 'Just now' }
    ];

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #006989; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Status Update</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    Your report has been updated. Here are the latest details:
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
                        <strong style="color: #006989;">New Status:</strong> 
                        <span style="background-color: ${statusColor}; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 14px; font-weight: 600;">${newStatus}</span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Timeline -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 15px 0 10px 0;">
                        <strong style="color: #006989; font-size: 16px;">Timeline</strong>
                      </td>
                    </tr>
                    ${timeline.map((item, index) => `
                      <tr>
                        <td style="padding: 10px 0; border-left: 3px solid ${item.status === newStatus.toLowerCase() ? statusColor : '#e5e5e5'}; padding-left: 15px;">
                          <div style="color: #333333; font-weight: 600;">${item.label}</div>
                          <div style="color: #666666; font-size: 13px;">${item.date}</div>
                        </td>
                      </tr>
                    `).join('')}
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
                  
                  ${newStatus.toLowerCase() === 'resolved' ? `
                    <table role="presentation" style="width: 100%; margin-top: 20px;">
                      <tr>
                        <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                          <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; font-weight: 600;">
                            How did we do?
                          </p>
                          <table role="presentation" style="margin: 0 auto;">
                            <tr>
                              ${[1, 2, 3, 4, 5].map(star => `
                                <td style="padding: 0 5px;">
                                  <a href="${baseUrl}/issues/${reportId}?rate=${star}" 
                                     style="display: inline-block; background-color: #FE7F2D; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; min-height: 36px; line-height: 36px;">
                                    ${star}★
                                  </a>
                                </td>
                              `).join('')}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
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
