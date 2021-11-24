import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as randomToken from 'rand-token';
import * as moment from 'moment';
import { ExpresRequest } from '../types/expressRequest.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  /**Register User */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email: createUserDto.email });

    if (user) {
      throw new HttpException('Email is already taken', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = await this.userRepository.create(createUserDto);

    return this.userRepository.save(newUser);
  }

  /**Login User */
  async login(loginUserDto: LoginUserDto, response: Response): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { email: loginUserDto.email },
      { select: ['id', 'name', 'email', 'password', 'refreshToken', 'refreshTokenExp'] },
    );

    if (!user)
      throw new HttpException('Invalid email or password', HttpStatus.UNPROCESSABLE_ENTITY);

    const match = await compare(loginUserDto.password, user.password);

    if (!match) {
      throw new HttpException('Invalid email or password', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // do not return password to the client
    // delete user.password;

    const refreshToken = this.jwtService.sign(
      { user },
      {
        secret: 'super secret jwt token',
        expiresIn: '3d',
      },
    );
    // user.refreshToken = await hash(refreshToken, 10);
    user.refreshToken = refreshToken;

    //respond with a generated cookie
    const token = this.jwtService.sign({ user });
    response
      .cookie('access_token', token, {
        httpOnly: true,
        domain: 'localhost', // your domain here!
      })
      .json(user);

    return user;
  }

  async getRefreshToken(req: ExpresRequest): Promise<any> {
    // console.log('request --> ', req.user);
    return 'req';
  }

  async findAll(): Promise<any> {
    return `This action returns all user`;
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    delete user.password;
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // async getRefreshToken(userId: number): Promise<string> {
  //   const user = await this.userRepository.findOne();
  // }

  async validateUser(email: string, pass: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { email },
      { select: ['id', 'name', 'email', 'password', 'refreshToken', 'refreshTokenExp'] },
    );
    if (!user) {
      throw new HttpException('Invalid login credentials', HttpStatus.BAD_REQUEST);
    }

    const match = await compare(pass, user.password);

    if (!match) {
      throw new HttpException('Invalid login credentials', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async getJwtToken(user: UserEntity): Promise<string> {
    const payload = {
      ...user,
    };
    return this.jwtService.sign({ payload });
  }
}
