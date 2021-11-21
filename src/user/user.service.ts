import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email: createUserDto.email });

    if (user) {
      throw new HttpException('Email is already taken', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = await this.userRepository.create(createUserDto);

    return this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto, response: Response): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { email: loginUserDto.email },
      { select: ['id', 'name', 'email', 'password'] },
    );

    if (!user)
      throw new HttpException('Invalid email or password', HttpStatus.UNPROCESSABLE_ENTITY);

    const match = await compare(loginUserDto.password, user.password);

    if (!match) {
      throw new HttpException('Invalid email or password', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // do not return password to the client
    delete user.password;

    const token = this.jwtService.sign({ user });
    response
      .cookie('access_token', token, {
        httpOnly: true,
        domain: 'localhost', // your domain here!
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .json(user);

    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
