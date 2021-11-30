import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from './auth/auth.strategy';
import { RefreshStrategy } from './auth/refresh.strategy';
import { LocalStrategy } from './auth/local.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 30,
      },
    }),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService, AuthStrategy, RefreshStrategy, LocalStrategy],
})
export class UserModule {}
