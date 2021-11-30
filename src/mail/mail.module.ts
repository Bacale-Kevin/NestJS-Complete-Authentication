import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // 👈 global module
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        // host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        secure: false,
        auth: {
          user: 'bacale86@gmail.com',
          pass: 'bacalemireille@yahoo.com',
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}
