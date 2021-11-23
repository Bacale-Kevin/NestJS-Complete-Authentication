import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { UserEntity } from './../entities/user.entity';
import { UserService } from './../user.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  /**
   *
   */
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies) return null;
        return req.cookies['access_token'];
      },
      ignoreExpiration: true, //is set to true beacuse we know that the token is expired
      secretOrKey: 'super secret jwt token',
      passReqToCallback: true,
    });
  }

  //   async validate(data: UserEntity, req: Request): Promise<UserEntity> {
  //     const secretData = req?.cookies['access-token'];
  //     if (!secretData) {
  //       throw new BadRequestException();
  //     }

  //     if (!secretData.refreshToken) {
  //       throw new BadRequestException();
  //     }

  // const user = await this.userService.validateRefreshToken(data.email, secretData.refreshToken);

  // if (!user) {
  //   throw new BadRequestException();
  // }
  // return user;
}
