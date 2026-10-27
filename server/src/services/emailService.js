import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.log(`\n======================================================`);
    console.log(`[Email Service (Dev Simulation)]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const info = await mailer.sendMail({
      from: `"${process.env.FROM_NAME || 'Faculty Advancement Portal'}" <${process.env.FROM_EMAIL || 'no-reply@institution.edu'}>`,
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service] Error sending mail:', err.message);
    return { success: false, error: err.message };
  }
};
