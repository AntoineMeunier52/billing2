import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "noreply@tranzcom-tool.com";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth:
        SMTP_USER && SMTP_PASS
          ? {
              user: SMTP_USER,
              pass: SMTP_PASS,
            }
          : undefined,
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
      //text: text || html.replace(/<[^>]*>/g, ""),
    });
    console.log(html);
    console.log(info);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export function generateActivationEmail(
  name: string,
  email: string,
  activationToken: string
) {
  console.log("activation email");
  const activationUrl = `${
    process.env.APP_URL || "http://localhost:3000"
  }/auth/reset-password?token=${activationToken}`;

  return {
    subject: "Set Your Password - Billing Platform",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .credentials { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; }
            .alert { background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Billing Platform</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Your account has been created successfully!</p>

              <p>Click the button below to set your password and activate your account:</p>

              <a href="${activationUrl}" class="button">Set Password</a>

              <div class="credentials">
                <p><strong>Your Email:</strong> ${email}</p>
              </div>

              <div class="alert">
                <p><strong>⚠️ Important:</strong></p>
                <ul>
                  <li>This link will expire in 24 hours</li>
                  <li>After setting your password, you'll need to log in</li>
                </ul>
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${activationUrl}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function generatePasswordResetEmail(
  name: string,
  email: string,
  resetToken: string
) {
  const resetUrl = `${
    process.env.APP_URL || "http://localhost:3000"
  }/auth/reset-password?token=${resetToken}`;

  return {
    subject: "Reset Your Password - Billing Platform",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .alert { background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset the password for your account (${email}).</p>

              <p>Click the button below to reset your password:</p>

              <a href="${resetUrl}" class="button">Reset Password</a>

              <div class="alert">
                <p><strong>⚠️ Important:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password will remain unchanged</li>
                </ul>
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
