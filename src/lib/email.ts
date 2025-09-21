import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM;
const appUrl = process.env.AUTH_URL;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  if (!fromEmail || !appUrl) {
    console.error("Email 'from' address or app URL is not configured.");
    return;
  }
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};

export const sendWelcomeEmail = async (email: string, username: string) => {
  if (!fromEmail) {
    console.error("Email 'from' address is not configured.");
    return;
  }
  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Welcome to AuthFlow!',
    html: `<p>Hi ${username},</p><p>Welcome to AuthFlow! We're excited to have you on board.</p>`,
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
    if (!fromEmail) {
      console.error("Email 'from' address is not configured.");
      return;
    }
    await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your 2FA Code',
        html: `<p>Your 2FA code is: ${token}</p>`
    })
}
