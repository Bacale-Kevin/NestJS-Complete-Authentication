import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from './../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpresRequest } from '../../types/expressRequest.interface';
import { UserService } from './../user.service';

type payload = {
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

  async validate(_: ExpresRequest, data: payload): Promise<any> {
    if (!data) {
      throw new UnauthorizedException();
    }

    const user = this.userService.findOne(data.user.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
