import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from './../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpresRequest } from '../../types/expressRequest.interface';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {
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
    const { id } = data;
    const user = await this.userRepository.findOne(id);
    console.log(user);
    if (!user) {
      throw new HttpException('Not authorize', HttpStatus.UNAUTHORIZED);
    }
    req.user = user;

    return req.user;
  }
}
