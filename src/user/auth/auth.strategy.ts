import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from './../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies) return null;
        return req.cookies['access_token'];
      },
      ignoreExpiration: false,
      secretOrKey: 'super secret jwt token',
    });
  }

  async validate(data: UserEntity, req: Request): Promise<any> {
    const { id } = data;
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new HttpException('Not authorize', HttpStatus.UNAUTHORIZED);
    }
    req.user = user;

    return req.user;
  }
}
