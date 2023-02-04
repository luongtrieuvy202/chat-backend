import { IEmailJob } from 'src/features/user/interfaces/user.interface';
import { emailWorker } from 'src/shared/workers/email.worker';
import { BaseQueue } from './base.queue';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
    this.processJob('changePassword', 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
