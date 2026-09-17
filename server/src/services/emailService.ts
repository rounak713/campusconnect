/**
 * Transactional email delivery for student verification.
 *
 * Provider resolution order:
 *   1. SENDGRID_API_KEY  -> SendGrid SMTP relay (apikey / <key>)
 *   2. SMTP_HOST         -> generic SMTP (Gmail, Zoho, Mailgun, ...)
 *   3. none              -> console transport (local dev / CI, zero cost)
 */
import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const FROM_ADDRESS = process.env.MAIL_FROM || 'CampusConnect <no-reply@campusconnect.in>';
const APP_URL = process.env.APP_PUBLIC_URL || 'https://campusconnect.in';

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  static getProvider(): 'SENDGRID' | 'SMTP' | 'CONSOLE' {
    if (process.env.SENDGRID_API_KEY) return 'SENDGRID';
    if (process.env.SMTP_HOST) return 'SMTP';
    return 'CONSOLE';
  }

  private static getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const provider = this.getProvider();
    if (provider === 'SENDGRID') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY as string }
      });
    } else if (provider === 'SMTP') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST as string,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS as string }
          : undefined
      });
    } else {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }

    return this.transporter;
  }

  static async send(payload: MailPayload): Promise<{ delivered: boolean; provider: string }> {
    const provider = this.getProvider();
    try {
      await this.getTransporter().sendMail({
        from: FROM_ADDRESS,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      });
      if (provider === 'CONSOLE') {
        console.log(`[EmailService:console] -> ${payload.to} | ${payload.subject}\n${payload.text}`);
      }
      return { delivered: true, provider };
    } catch (err) {
      console.error(`[EmailService] Delivery failed via ${provider}:`, (err as Error).message);
      return { delivered: false, provider };
    }
  }

  static sendOtp(email: string, code: string, expiresInMinutes: number) {
    return this.send({
      to: email,
      subject: `${code} is your CampusConnect verification code`,
      text:
        `Your CampusConnect student verification code is ${code}.\n` +
        `It expires in ${expiresInMinutes} minutes. If you did not request this, ignore this email.`,
      html:
        `<p>Your CampusConnect student verification code is:</p>` +
        `<p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p>` +
        `<p>It expires in ${expiresInMinutes} minutes. If you did not request this, ignore this email.</p>`
    });
  }

  static sendVerificationApproved(email: string) {
    return this.send({
      to: email,
      subject: 'Your CampusConnect student verification is approved',
      text:
        `Good news — your college ID was approved and your account is now VERIFIED.\n` +
        `Jump back in: ${APP_URL}`,
      html:
        `<p>Good news — your college ID was approved and your account is now <b>VERIFIED</b>.</p>` +
        `<p><a href="${APP_URL}">Jump back into CampusConnect</a></p>`
    });
  }

  static sendVerificationRejected(email: string, reason: string) {
    return this.send({
      to: email,
      subject: 'Your CampusConnect student verification needs another look',
      text:
        `We could not verify your college ID.\nReason: ${reason}\n` +
        `You can upload a clearer photo or verify with your college email instead: ${APP_URL}`,
      html:
        `<p>We could not verify your college ID.</p><p><b>Reason:</b> ${reason}</p>` +
        `<p>You can upload a clearer photo or verify with your college email instead — ` +
        `<a href="${APP_URL}">open CampusConnect</a>.</p>`
    });
  }
}
