import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mailchimp from '@mailchimp/mailchimp_marketing';

@Injectable()
export class MailchimpService implements OnModuleInit {
  private readonly logger = new Logger(MailchimpService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('MAILCHIMP_API_KEY');
    const server = this.configService.get<string>('MAILCHIMP_SERVER_PREFIX');

    // Validamos para evitar el error de "undefined" en TypeScript
    if (!apiKey || !server) {
      this.logger.error(
        'MAILCHIMP_API_KEY o MAILCHIMP_SERVER_PREFIX faltan en el .env',
      );
      return;
    }

    mailchimp.setConfig({
      apiKey: apiKey,
      server: server,
    });
  }

  async addSubscriber(email: string, fullName?: string) {
    const listId = this.configService.get<string>('MAILCHIMP_AUDIENCE_ID');

    if (!listId) {
      this.logger.error('MAILCHIMP_AUDIENCE_ID no está configurado en el .env');
      return;
    }

    try {
      return await mailchimp.lists.addListMember(listId, {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FULL_NAME: fullName || '',
        },
      });
    } catch (error: any) {
      if (error.response?.body?.title === 'Member Exists') {
        this.logger.warn(`El usuario ${email} ya existe en Mailchimp.`);
        return { message: 'Member already exists' };
      }

      this.logger.error(
        'Error en Mailchimp:',
        error.response?.body?.detail || error.message,
      );
    }
  }
}
