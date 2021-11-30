import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: UserEntity, token: string) {
    const url = `${process.env.CLIENT_DOMAIN}/auth/confirm/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: process.env.MAIL_FROM,
      subject: 'Square Space - Account Verification',
      //template: 'templates/confirmation', // `.hbs` extension is appended automatically
      html: `<h1>Email Confirmation</h1>
      <h2>Hello ${user.name}</h2>
      <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
      <a target='_' href=${process.env.CLIENT_DOMAIN}/register/confirm/${token}> Click here</a>
      </div>`,
      //   context: {
      // ✏️ filling curly brackets with content
      // name: user.name,
      // url,
      //   },
    });
  }
}
