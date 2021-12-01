import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserEntity } from './../entities/user.entity';
import { UserService } from './../user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly userService: UserService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserEntity> {
    // console.table({ email, password });

    const user = await this.userService.validateUserCredentials(email, password);

    if (user === null) {
      throw new BadRequestException('Invalid user credentials');
    }
    return user;
  }
}
