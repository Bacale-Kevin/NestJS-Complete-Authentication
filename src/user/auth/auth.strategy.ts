import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from './../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpresRequest } from '../../types/expressRequest.interface';
import { UserService } from './../user.service';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: (req: ExpresRequest) => {
        if (!req || !req.cookies) return null;
        return req.cookies['access_token'];
      },
      ignoreExpiration: false,
      secretOrKey: 'super secret jwt token',
    });
  }

  async validate(data: UserEntity, req: ExpresRequest): Promise<any> {
    if (!data) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(data.id);
    console.log('user --> ', user);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
