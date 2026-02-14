import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendSystemNotification(_userId: string, _message: string): Promise<void> {
    // Placeholder for push/email/SMS adapters.
  }
}
