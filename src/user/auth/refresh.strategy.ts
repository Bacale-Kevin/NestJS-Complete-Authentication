import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
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
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: ExpresRequest) => {
          const data = request?.cookies['access_token'];
          if (!data) {
            return null;
          }
          return data.token;
        },
      ]),
      ignoreExpiration: true, //is set to true beacuse we know that the token is expired
      secretOrKey: 'super secret jwt token', //use for decrypting jwt
      passReqToCallback: true,
    });
  }

  async validate(req: ExpresRequest, payload: any): Promise<UserEntity> {
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }

    const data = req?.cookies['access_token'];
    if (!data?.refreshToken) {
      throw new BadRequestException('invalid refresh token');
    }

    const user = await this.userService.validateRefreshToken(payload.email, data.refreshToken);

    if (!user) throw new BadRequestException('token expired');

    return user;
  }
}
