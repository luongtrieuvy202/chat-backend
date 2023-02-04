import Logger from 'bunyan';
import { config } from 'src/config';
import sendGridMail from '@sendgrid/mail';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentMailSender(receiverEmail, subject, body);
    } else {
      this.productMailSender(receiverEmail, subject, body);
    }
  }

  private async developmentMailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!
      }
    });

    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('Development email send successfully.');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productMailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email send successfully');
    } catch (error) {
      log.error('Production email send error', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
