import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UserEntity } from './../entities/user.entity';
import { UserService } from './../user.service';
import { ExpresRequest } from '../../types/expressRequest.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type Payload = {
  user: UserEntity;
};

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
          const secretData = request?.cookies['access_token'];
          return secretData;
        },
      ]),
      ignoreExpiration: true, //is set to true beacuse we know that the token is expired
      secretOrKey: 'super secret jwt token', //use for decrypting jwt
      passReqToCallback: true,
    });
  }

  async validate(req: ExpresRequest, data: Payload): Promise<UserEntity> {
    console.log('refresh payload --> ', data);
    const secretData = req?.cookies['access_token'];

    if (!secretData) throw new BadRequestException();

    // if (!secretData.refreshToken) throw new BadRequestException();

    const user = await this.userService.validateRefreshToken(
      data.user.email,
      data.user.refreshToken,
    );

    if (!user) throw new BadRequestException();

    return user;
  }
}
