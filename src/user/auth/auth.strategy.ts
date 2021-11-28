import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './../entities/user.entity';
import { ExpresRequest } from '../../types/expressRequest.interface';
import { UserService } from './../user.service';

type Payload = {
  user: UserEntity;
};

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: ExpresRequest) => {
          return request?.cookies.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'super secret jwt token',
      passReqToCallback: true,
    });
  }

  async validate(_: ExpresRequest, data: Payload): Promise<UserEntity> {
    console.log('auth payload --> ', data);
    if (!data) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(data.user.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
