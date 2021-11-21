import { Controller, Get, Post, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  login() {
    // Do username+password check here.
    const userId = 'dummy';

    const payload = { userId: userId };
    const token = this.jwtService.sign(payload);
    throw new HttpException('not implemented yet!', 500);
  }
}
