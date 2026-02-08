import path from 'path';
import ejs from 'ejs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
) {
  const html = await ejs.renderFile(
    path.resolve(
      'apps',
      'auth-service',
      'templates',
      'email',
      `${template}.ejs`
    ),
    data
  );

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}