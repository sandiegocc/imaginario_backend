import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailchimpService } from './services/mailchimp.service';

@Module({
  imports: [ConfigModule],
  providers: [MailchimpService],
  exports: [MailchimpService],
})
export class MailchimpModule {}
