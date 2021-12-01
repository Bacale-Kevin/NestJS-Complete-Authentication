import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: UserEntity, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: `"No Reply" <process.env.NODEMAILER_SENDER_EMAIL>`,
      subject: 'Square Space - Account Verification',
      //template: 'templates/confirmation', // `.hbs` extension is appended automatically
      html: `<p>Hello <b>${user.name}</b></p>
      <p>Your account have been created.</p>
      <p>Please click on the link below in other to activate your account</p>
      <a target='_' href=${process.env.CLIENT_DOMAIN}/register/confirm/${token}> <b>Click here</b></a>
      </div>`,
      //   context: {
      // ✏️ filling curly brackets with content
      // name: user.name,
      // url,
      //   },
    });
  }

  async sendForgotPasswordConfirmation(user: UserEntity, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: `"No Reply" <process.env.NODEMAILER_SENDER_EMAIL>`,
      subject: 'Square Space - Reset Password',
      //template: 'templates/confirmation', // `.hbs` extension is appended automatically
      html: `<p>Hello <b>${user.name}</b></p>
      <p>You have made a request to reset your password.</p>
      <p>If you did not made any request to reset your password please ignore this email!.</p>
      <p>Please click on the link below in other to reset your password</p>
      <a target='_' href=${process.env.CLIENT_DOMAIN}/auth/reset/${token}> <b>Click here</b></a>
      </div>`,
      //   context: {
      // ✏️ filling curly brackets with content
      // name: user.name,
      // url,
      //   },
    });
  }
}
