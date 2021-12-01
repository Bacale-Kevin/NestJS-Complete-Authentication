import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, ResendEmailDto, ResetPasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ExpresRequest } from '../types/expressRequest.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /****************************** AUTHENTICATION **********************************/

  /**Register */
  @Post('register')
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.create(createUserDto);
  }

  /**Login */
  @HttpCode(200)
  @Post('login')
  @UseGuards(AuthGuard('local')) //strategy use to handle login request
  async login(@Req() req: ExpresRequest, @Res({ passthrough: true }) res: Response): Promise<any> {
    const token = await this.userService.getJwtToken(req.user);

    const refreshToken = await this.userService.getRefreshToken(req.user.id);

    const secretData = {
      token,
      refreshToken: refreshToken,
    };
    res.cookie('access_token', secretData, { httpOnly: true });
    const user = await this.userService.findOne(req.user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      status: user.status,
    };
  }

  /**Refresh token */
  @Get('refresh-token')
  @UseGuards(AuthGuard('refresh')) //strategy use to refresh token
  async refreshToken(
    @Req() req: ExpresRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const token = await this.userService.getJwtToken(req.user);
    const refreshToken = await this.userService.getRefreshToken(req.user.id);

    const secretData = {
      token,
      refreshToken: refreshToken,
    };
    res.cookie('access_token', secretData, { httpOnly: true });
    return { message: 'sucess' };
  }

  /**Activate account after registration */
  @Get('register/confirm/:token')
  async activateAccountAfterRegistration(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<any> {
    await this.userService.activateAccountAfterRegistration(token);

    return res.json({ success: true, message: 'Account verified successfully please login' });
  }

  /**Resend account activation email address to user */
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('register/resend-email')
  async resendVerificationEmail(
    @Body() emailDto: ResendEmailDto,
    @Res() res: Response,
  ): Promise<any> {
    await this.userService.resendVerificationEmail(emailDto);

    return res.json({
      success: true,
      message: `Email sent to ${emailDto.email}, checkout your email inbox to activate your account`,
    });
  }

  /**Forgot password email reset link */
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Post('forgot-password')
  async sendForgotPasswordEmailResetLink(
    @Body() emailDto: ResendEmailDto,
    @Res() res: Response,
  ): Promise<any> {
    await this.userService.forgotPassword(emailDto);

    return res.json({
      success: true,
      message: `Email sent to ${emailDto.email}, checkout your email inbox to reset your password`,
    });
  }

  /**Verify reset token validity */
  @Get('forgot-password/verify/:token')
  async verifyResetPasswordToken(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<any> {
    await this.userService.verifyResetPasswordToken(token);

    return res.json({ success: true, message: 'Reset password link verified successfully' });
  }

  /**Insert new password */
  @Put('forgot-password/new/:token')
  async enterNewPassword(
    @Body() passwordDto: ResetPasswordDto,
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<any> {
    await this.userService.enterNewPassword(token, passwordDto);

    return res.json({ success: true, message: 'Your password has been reset successfully' });
  }

  /********************************************** USER **************************************/

  /**Get all users */
  @Get('users')
  @UseGuards(AuthGuard('jwt')) //strategy use to require signin
  async findAll(@Req() req: ExpresRequest): Promise<any> {
    return await this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
