import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { UserEntity } from './../entities/user.entity';
import { UserService } from './../user.service';
import { ExpresRequest } from '../../types/expressRequest.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  /**
   *
   */
  constructor(
    private userService: UserService,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: (req: ExpresRequest) => {
        console.log(req.user);
        if (!req || !req.cookies) return null;
        return req.cookies['access_token'];
      },
      ignoreExpiration: true, //is set to true beacuse we know that the token is expired
      secretOrKey: 'super secret jwt token',
      //   passReqToCallback: true,
    });
  }

  async validate(data: UserEntity, req: ExpresRequest): Promise<any> {
    console.log(req.user);
  }
}
