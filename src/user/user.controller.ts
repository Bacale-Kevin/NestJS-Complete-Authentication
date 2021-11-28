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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ExpresRequest } from '../types/expressRequest.interface';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.create(createUserDto);
  }

  @HttpCode(200)
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto, @Res() response: Response): Promise<UserEntity> {
    return await this.userService.login(loginUserDto, response);
  }

  @Get('refresh-token')
  @UseGuards(AuthGuard('refresh'))
  async refreshToken(
    @Req() req: ExpresRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const token = await this.userService.getJwtToken(req.user);
    const refresToken = await this.userService.getRefreshToken(req.user.id);

    const secretData = {
      token,
      refreshToken: refresToken,
    };
    res.cookie('access_token', secretData, { httpOnly: true });
    return { message: 'sucess' };
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: ExpresRequest): Promise<any> {
    // console.log(req.user);
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
