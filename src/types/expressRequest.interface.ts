import { Request } from 'express';
import { UserEntity } from '../user/entities/user.entity';

export interface ExpresRequest extends Request {
  user?: UserEntity;
}
