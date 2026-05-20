/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY not configured');
    } else {
      SendGrid.setApiKey(apiKey);
      this.logger.log('SendGrid initialized');
    }
  }

  private getFromEmail(): { email: string; name: string } {
    const emailFrom = this.configService.get<string>('EMAIL_FROM')!;
    this.logger.log(`Email from: ${emailFrom}`);
    return {
      email: emailFrom,
      name:
        this.configService.get<string>('EMAIL_FROM_NAME') ||
        'Qualification Service',
    };
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    if (!html || html.length === 0) {
      this.logger.error(`HTML content is empty for email to ${to}`);
      return;
    }

    try {
      const from = this.getFromEmail();

      const msg: SendGrid.MailDataRequired = {
        to,
        from,
        subject,
        html,
        text: text || ' ',
      };

      await SendGrid.send(msg);
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${to}`,
        JSON.stringify(error.response?.body || error.message),
      );
    }
  }

  async sendOverdueNotification(
    email: string,
    employeeName: string,
    courseName: string,
    plannedDate: Date,
  ): Promise<void> {
    const subject = '⏰ Просрочено назначение курса';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Уведомление о просрочке</h2>
        <p>Уважаемый(ая) <strong>${employeeName}</strong>,</p>
        <p>Назначение на курс <strong>"${courseName}"</strong> просрочено.</p>
        <p>Плановая дата прохождения: <strong>${plannedDate.toLocaleDateString('ru-RU')}</strong></p>
        <p style="color: #666;">Пожалуйста, свяжитесь с отделом HR для уточнения дальнейших действий.</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;"><em>Автоматическое уведомление из ИС "Учёт повышения квалификации"</em></p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendBlockNotification(
    email: string,
    employeeName: string,
    overdueCount: number,
  ): Promise<void> {
    const subject = '🚫 Аккаунт заблокирован';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Внимание! Аккаунт заблокирован</h2>
        <p>Уважаемый(ая) <strong>${employeeName}</strong>,</p>
        <p>Ваш аккаунт заблокирован в системе из-за <strong>${overdueCount}</strong> просроченных назначений курсов.</p>
        <p style="background: #ffebee; padding: 12px; border-radius: 4px;">
          Для разблокировки необходимо обратиться к HR-менеджеру или администратору системы.
        </p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;"><em>Автоматическое уведомление из ИС "Учёт повышения квалификации"</em></p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendCourseAssignedNotification(
    email: string,
    employeeName: string,
    courseName: string,
    plannedDate: Date,
  ): Promise<void> {
    const subject = '📚 Назначен новый курс';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Новое назначение курса</h2>
        <p>Уважаемый(ая) <strong>${employeeName}</strong>,</p>
        <p>Вам назначен курс <strong>"${courseName}"</strong>.</p>
        <p>Плановая дата прохождения: <strong>${plannedDate.toLocaleDateString('ru-RU')}</strong></p>
        <p style="background: #e3f2fd; padding: 12px; border-radius: 4px;">
          Пожалуйста, ознакомьтесь с материалами и пройдите курс вовремя.
        </p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;"><em>Автоматическое уведомление из ИС "Учёт повышения квалификации"</em></p>
      </div>
    `;

    this.logger.log(`HTML length: ${html.length}`);

    await this.sendMail(email, subject, html);
  }

  async sendReminderNotification(
    email: string,
    employeeName: string,
    courseName: string,
    plannedDate: Date,
    daysBefore: number,
  ): Promise<void> {
    const dayWord = this.declineDays(daysBefore);
    const subject = `⏰ Напоминание: курс через ${daysBefore} ${dayWord}`;
    const urgencyColor =
      daysBefore <= 1 ? '#d32f2f' : daysBefore <= 7 ? '#f57c00' : '#1976d2';
    const urgencyBg =
      daysBefore <= 1 ? '#ffebee' : daysBefore <= 7 ? '#fff3e0' : '#e3f2fd';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${urgencyColor};">Напоминание о предстоящем курсе</h2>
        <p>Уважаемый(ая) <strong>${employeeName}</strong>,</p>
        <p>Через <strong>${daysBefore} ${dayWord}</strong> необходимо пройти курс <strong>"${courseName}"</strong>.</p>
        <p>Плановая дата прохождения: <strong>${plannedDate.toLocaleDateString('ru-RU')}</strong></p>
        <div style="background: ${urgencyBg}; padding: 12px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; color: ${urgencyColor}; font-weight: bold;">
            ${
              daysBefore <= 1
                ? '⚠️ Срочно! Курс нужно пройти завтра!'
                : daysBefore <= 7
                  ? 'Внимание! Осталась неделя.'
                  : 'Пожалуйста, запланируйте время для прохождения курса.'
            }
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;"><em>Автоматическое уведомление из ИС "Учёт повышения квалификации"</em></p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  private declineDays(n: number): string {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
    if (lastOne === 1) return 'день';
    if (lastOne >= 2 && lastOne <= 4) return 'дня';
    return 'дней';
  }
}
