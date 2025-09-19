const createTransporter = () => {
  return {
    sendMail: async () => {
      console.log('Email sending stubbed. No email sent.');
      return { messageId: 'stubbed' };
    },
  };
};

export const sendEmail = async (to, subject, text, html = '') => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};