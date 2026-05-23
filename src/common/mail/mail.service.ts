import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST') || 'smtp.gmail.com';
    const port = Number(this.config.get<string>('MAIL_PORT')) || 587;
    const secure = this.config.get<string>('MAIL_SECURE') === 'true';
    const user = this.config.get<string>('MAIL_USER') || 'infoaquasportsbbnacademy@gmail.com';
    const pass = this.config.get<string>('MAIL_PASS') || 'lwyp uidw zzjw eqzw';
    this.from = this.config.get<string>('MAIL_FROM') || user || `no-reply@${host}`;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      this.transporter
        .verify()
        .then(() => {
          this.logger.log('Mail transporter configured successfully');
        })
        .catch((error) => {
          this.logger.error('Failed to verify mail transporter', error);
          this.transporter = null;
        });
    } else {
      this.logger.warn(
        'Mail settings are not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASS to enable email notifications.',
      );
    }
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Skipping email to ${to} because mail transporter is not configured`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html: html ?? text,
      });
      this.logger.log(`Email sent to ${to} for subject: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error as Error);
    }
  }
}
