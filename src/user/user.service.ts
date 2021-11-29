import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
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
import { sign } from 'jsonwebtoken';

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

    /**Generate a confirmation token code that will be use to validate users email address  */
    const confirmationCodeToken = sign(
      { email: createUserDto.email },
      process.env.JWT_CONFIRMATION_TOKEN_SECRET,
      { expiresIn: '3h' },
    );

    newUser.confirmationCode = confirmationCodeToken;

    return this.userRepository.save(newUser);
  }

  /**Login User */
  async login(loginUserDto: LoginUserDto, response: Response): Promise<any> {
    // const user = await this.userRepository.findOne(
    //   { email: loginUserDto.email },
    //   { select: ['id', 'name', 'email', 'password', 'refreshToken', 'refreshTokenExp'] },
    // );
    // if (!user)
    //   throw new HttpException('Invalid email or password', HttpStatus.UNPROCESSABLE_ENTITY);
    // /** compare password */
    // const match = await compare(loginUserDto.password, user.password);
    // if (!match)
    //   throw new HttpException('Invalid email or password', HttpStatus.UNPROCESSABLE_ENTITY);
    // const token = await this.getJwtToken(user);
    // const refreshToken = await this.getRefreshToken(user.id);
    // user.refreshToken = refreshToken;
    // const secretData = {
    //   token,
    //   refreshToken: refreshToken,
    // };
    // response
    //   .cookie('access_token', secretData, {
    //     httpOnly: true,
    //     domain: 'localhost', // your domain here!
    //   })
    //   .json(user);
    // await this.userRepository.save(user);
    // return user;
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
    return this.jwtService.signAsync(payload);
  }

  async getRefreshToken(userId: number): Promise<string> {
    const userDataToUpdate = {
      refreshToken: randomToken.generate(16),
      refreshTokenExp: moment().day(1).format('YYYY/MM/DD'),
    };

    await this.userRepository.update(userId, userDataToUpdate);
    return userDataToUpdate.refreshToken;
  }

  async validateRefreshToken(email: string, refreshToken: string): Promise<UserEntity> {
    const currentDate = moment().format('YYYY/MM/DD');

    const user = await this.userRepository.findOne({
      where: {
        email: email,
        refreshToken: refreshToken,
        refreshTokenExp: MoreThanOrEqual(currentDate),
      },
    });

    if (!user) {
      return null;
    }

    const User = new UserEntity();
    User.email = user.email;
    User.id = user.id;
    User.name = user.name;
    User.image = user.image;

    return User;
  }

  async validateUserCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { email },
      { select: ['id', 'name', 'email', 'password', 'refreshToken', 'refreshTokenExp', 'status'] },
    );

    if (!user || user === null) {
      return null;
    }

    const match = await compare(password, user.password);

    if (!match) {
      return null;
    }

    if (user.status === 'pending')
      throw new BadRequestException('please verify your email to activate your account');

    return user;
  }
}
