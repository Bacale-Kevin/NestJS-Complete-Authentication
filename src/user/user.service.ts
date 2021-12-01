import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateUserDto, ResendEmailDto, ResetPasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { compare } from 'bcrypt';
import { Response } from 'express';
import * as randomToken from 'rand-token';
import * as moment from 'moment';
import { sign, verify } from 'jsonwebtoken';
import { MailService } from './../mail/mail.service';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    // private jwtService: JwtService,
    private mailService: MailService,
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
      { id: newUser.id, email: createUserDto.email },
      process.env.JWT_CONFIRMATION_TOKEN_SECRET,
      { expiresIn: '1h' }, //👈 confirmation code  token expiration
    );

    newUser.confirmationCode = confirmationCodeToken;

    const savedNewUser = await this.userRepository.save(newUser);

    /** 📧 👇 send email for user to activate account */
    await this.mailService.sendUserConfirmation(savedNewUser, confirmationCodeToken);
    return savedNewUser;
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

  /**Verify account token  */
  async activateAccountAfterRegistration(token: string): Promise<any> {
    const decoded: any = verify(token, process.env.JWT_CONFIRMATION_TOKEN_SECRET);

    if (!decoded) {
      throw new UnprocessableEntityException('failed to verify activation link');
    }

    const user = await this.userRepository.findOne({ email: decoded.email });

    user.status = 'active';
    user.confirmationCode = '';

    await this.userRepository.save(user);
  }

  async resendVerificationEmail(emailDto: ResendEmailDto): Promise<any> {
    const user = await this.userRepository.findOne({ email: emailDto.email });

    if (!user) throw new NotFoundException('User with this email does not exist');

    /**Generate a confirmation token code that will be use to validate users token */
    const confirmationCodeToken = sign(
      { id: user.id, email: emailDto.email },
      process.env.JWT_CONFIRMATION_TOKEN_SECRET,
      { expiresIn: '1h' },
    );
    user.confirmationCode = confirmationCodeToken;

    const savedUser = await this.userRepository.save(user);

    /** 📧 👇 send email for user to activate account */
    await this.mailService.sendUserConfirmation(savedUser, confirmationCodeToken);
  }

  async forgotPassword(emailDto: ResendEmailDto): Promise<any> {
    const user = await this.userRepository.findOne({ email: emailDto.email });

    if (!user) throw new NotFoundException('User with this email does not exist');

    /**Generate a confirmation token code that will be use to validate users token */
    const confirmationCodeToken = sign(
      { id: user.id, email: emailDto.email },
      process.env.JWT_CONFIRMATION_TOKEN_SECRET,
      { expiresIn: '1h' },
    );
    user.confirmationCode = confirmationCodeToken;

    const savedUser = await this.userRepository.save(user);

    /** 📧 👇 send email for user to reset password */
    await this.mailService.sendForgotPasswordConfirmation(savedUser, confirmationCodeToken);
  }

  /**Verify reset password token validity  */
  async verifyResetPasswordToken(token: string): Promise<any> {
    const decoded: any = verify(token, process.env.JWT_CONFIRMATION_TOKEN_SECRET);

    if (!decoded) {
      throw new UnprocessableEntityException('failed to verify reset password link');
    }

    const user = await this.userRepository.findOne({ email: decoded.email });

    await this.userRepository.save(user);
  }

  async enterNewPassword(token: string, password: ResetPasswordDto): Promise<any> {
    const decoded: any = verify(token, process.env.JWT_CONFIRMATION_TOKEN_SECRET);

    if (!decoded) {
      throw new UnprocessableEntityException('failed to verify reset password link');
    }

    const user = await this.userRepository.findOne({ email: decoded.email });

    const hashedPassword: any = await hash(password.password, 10);
    user.password = hashedPassword;
    user.confirmationCode = '';

    await this.userRepository.save(user);
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

  async getJwtToken(user: UserEntity): Promise<string> {
    const payload = {
      ...user,
    };
    return sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' });
  }

  /** Generate a refresh token */
  async getRefreshToken(userId: number): Promise<string> {
    const userDataToUpdate = {
      refreshToken: randomToken.generate(16),
      refreshTokenExp: moment().day(1).format('YYYY/MM/DD'),
    };

    /**👇important the refresh and refresh token expiration token needs to be save in the db */
    await this.userRepository.update(userId, userDataToUpdate); //👈 save
    return userDataToUpdate.refreshToken;
  }

  /** Use by RefreshStrategy */
  async validateRefreshToken(email: string, refreshToken: string): Promise<UserEntity> {
    // const currantDate = moment().format('YYYY/MM/DD');
    const user = await this.userRepository.findOne({
      where: {
        email: email,
        refreshToken: refreshToken,
        refreshTokenExp: MoreThanOrEqual(moment().day(1).format('YYYY/MM/DD')),
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

  /** Use by LocalStrategy */
  async validateUserCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { email },
      { select: ['id', 'name', 'email', 'password', 'refreshToken', 'refreshTokenExp', 'status'] },
    );

    if (!user || user === null) {
      return null;
    }

    const match = await compare(password, user.password);
    console.log(match);

    if (!match) {
      return null;
    }

    if (user.status === 'pending')
      throw new BadRequestException('please verify your email to activate your account');

    return user;
  }
}
