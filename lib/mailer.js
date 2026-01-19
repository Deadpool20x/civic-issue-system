import { sendEmail } from './email.js';
import { generateReportSubmittedEmail } from './email-templates/report-submitted.js';
import { generateStatusUpdateEmail } from './email-templates/status-update.js';
import { generateReportRejectedEmail } from './email-templates/report-rejected.js';
import { generateNewReportAlertEmail } from './email-templates/new-report-alert.js';
import { generateRatingRequestEmail } from './email-templates/rating-request.js';

/**
 * Send report submission confirmation to citizen
 * @param {string} userEmail - Citizen's email address
 * @param {Object} reportData - Report information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendReportConfirmation(userEmail, reportData) {
  try {
    const htmlContent = generateReportSubmittedEmail(reportData);
    return await sendEmail(userEmail, 'Report Submitted Successfully', htmlContent);
  } catch (error) {
    console.error('[mailer] Error sending report confirmation:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send status update notification to citizen
 * @param {string} userEmail - Citizen's email address
 * @param {Object} reportData - Report information
 * @param {string} newStatus - New status of the report
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendStatusUpdate(userEmail, reportData, newStatus) {
  try {
    const htmlContent = generateStatusUpdateEmail(reportData, newStatus);
    return await sendEmail(userEmail, 'Report Status Update', htmlContent);
  } catch (error) {
    console.error('[mailer] Error sending status update:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send rejection notification to citizen
 * @param {string} userEmail - Citizen's email address
 * @param {Object} reportData - Report information
 * @param {string} reason - Rejection reason
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendRejectionNotification(userEmail, reportData, reason) {
  try {
    const htmlContent = generateReportRejectedEmail(reportData, reason);
    return await sendEmail(userEmail, 'Report Status Update', htmlContent);
  } catch (error) {
    console.error('[mailer] Error sending rejection notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send new report alert to department
 * @param {string[]} departmentEmails - Array of department email addresses
 * @param {Object} reportData - Report information
 * @param {string} departmentName - Department name
 * @returns {Promise<Array<{success: boolean, messageId?: string, error?: string}>>}
 */
export async function sendDepartmentAlert(departmentEmails, reportData, departmentName) {
  const results = [];
  
  for (const email of departmentEmails) {
    try {
      const htmlContent = generateNewReportAlertEmail(reportData, departmentName);
      const result = await sendEmail(email, 'New Report Alert', htmlContent);
      results.push(result);
    } catch (error) {
      console.error(`[mailer] Error sending department alert to ${email}:`, error);
      results.push({
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Send rating request to citizen after resolution
 * @param {string} userEmail - Citizen's email address
 * @param {Object} reportData - Report information
 * @param {string} beforePhoto - URL of before photo (optional)
 * @param {string} afterPhoto - URL of after photo (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendRatingRequest(userEmail, reportData, beforePhoto = null, afterPhoto = null) {
  try {
    const htmlContent = generateRatingRequestEmail(reportData, beforePhoto, afterPhoto);
    return await sendEmail(userEmail, 'Rate Your Experience', htmlContent);
  } catch (error) {
    console.error('[mailer] Error sending rating request:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
