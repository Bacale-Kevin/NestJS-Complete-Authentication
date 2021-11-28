import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './../entities/user.entity';
import { ExpresRequest } from '../../types/expressRequest.interface';
import { UserService } from './../user.service';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: ExpresRequest) => {
          const data = request?.cookies['access_token'];
          if (!data) {
            return null;
          }

          return data.token; //payload inside the token is been decoded auto by passport
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'super secret jwt token',
      // passReqToCallback: true,
    });
  }

  async validate(payload: any): Promise<UserEntity> {
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
