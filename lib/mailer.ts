// lib/mailer.ts

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your Stay password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1;">Reset your password</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">
          We received a request to reset your Stay account password.
          This link will expire in 15 minutes.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; margin: 20px 0; padding: 12px 24px;
                  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
                  color: #ffffff; text-decoration: none; border-radius: 10px;
                  font-weight: 600; font-size: 14px;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 12px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
