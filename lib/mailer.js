// lib/mailer.js
// Deprecated: nodemailer has been removed from the project. This module is now a no-op.
export default async function sendMail() {
  // eslint-disable-next-line no-console
  console.warn('[mailer] Email system removed. No email sent.');
  return { messageId: 'stubbed' };
}
