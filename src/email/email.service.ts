import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type Transport = nodemailer.Transporter;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transport: Transport | null = null;

  constructor(private configService: ConfigService) {}

  private getTransport(): Transport | null {
    if (this.transport) return this.transport;

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM');

    if (!host || !port || !user || !pass || !from) {
      this.logger.warn(
        'SMTP not configured. Emails will be logged to console instead.',
      );
      return null;
    }

    this.transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transport;
  }

  async send(to: string, subject: string, html: string, text?: string) {
    const transport = this.getTransport();

    if (!transport) {
      this.logger.log(
        `[EMAIL MOCK] To: ${to} | Subject: ${subject} | HTML: ${html.slice(0, 200)}...`,
      );
      return { mocked: true, to, subject };
    }

    const from = this.configService.get<string>('SMTP_FROM');
    await transport.sendMail({ from, to, subject, html, text });
    this.logger.log(`Email sent to ${to}: ${subject}`);
    return { mocked: false, to, subject };
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const html = getPasswordResetTemplate(resetUrl);
    const text = `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`;
    return this.send(to, 'Reset Your Password', html, text);
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = getWelcomeTemplate(name);
    const text = `Welcome to the Gym Management System, ${name}! Your account has been created successfully.`;
    return this.send(to, 'Welcome to the Gym', html, text);
  }

  async sendExpiryReminder(to: string, name: string, daysUntilExpiry: number) {
    const html = getExpiryReminderTemplate(name, daysUntilExpiry);
    const text =
      daysUntilExpiry < 0
        ? `Hi ${name}, your membership expired on ${Math.abs(daysUntilExpiry)} day(s) ago. Please renew to continue access.`
        : daysUntilExpiry === 0
          ? `Hi ${name}, your membership expires today. Please renew soon.`
          : `Hi ${name}, your membership expires in ${daysUntilExpiry} day(s). Please renew soon.`;
    return this.send(to, 'Membership Expiry Reminder', html, text);
  }
}

function getPasswordResetTemplate(resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background-color:#1e40af;padding:32px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">Reset Your Password</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">We received a request to reset your password. Click the button below to create a new password.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<a href="${resetUrl}" style="display:inline-block;background-color:#1e40af;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:500;">Reset Password</a>
</td></tr>
</table>
<p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">This link expires in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
</td></tr>
<tr><td style="padding:0 32px 32px 32px;border-top:1px solid #e5e7eb;padding-top:24px;">
<p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;">This is an automated message from the Gym Management System. Please do not reply to this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function getWelcomeTemplate(name: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background-color:#059669;padding:32px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">Welcome, ${name}!</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">Your account has been created successfully. You can now access the Gym Management System.</p>
<p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">If you have any questions, please contact the gym front desk.</p>
</td></tr>
<tr><td style="padding:0 32px 32px 32px;border-top:1px solid #e5e7eb;padding-top:24px;">
<p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;">This is an automated message from the Gym Management System.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function getExpiryReminderTemplate(
  name: string,
  daysUntilExpiry: number,
): string {
  const urgencyColor =
    daysUntilExpiry <= 0
      ? '#dc2626'
      : daysUntilExpiry <= 3
        ? '#f59e0b'
        : '#6b7280';
  const message =
    daysUntilExpiry < 0
      ? `Your membership expired <strong>${Math.abs(daysUntilExpiry)} day(s) ago</strong>. Please renew to continue access.`
      : daysUntilExpiry === 0
        ? 'Your membership <strong>expires today</strong>. Please renew soon to avoid interruption.'
        : `Your membership expires in <strong>${daysUntilExpiry} day(s)</strong>. Please renew soon.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background-color:${urgencyColor};padding:32px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">Membership Expiry Reminder</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">Hi ${name},</p>
<p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">${message}</p>
<p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">Contact the gym front desk to renew your membership.</p>
</td></tr>
<tr><td style="padding:0 32px 32px 32px;border-top:1px solid #e5e7eb;padding-top:24px;">
<p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;">This is an automated message from the Gym Management System.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
