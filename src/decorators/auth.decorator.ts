import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JWT } from '../utils/jwt';

export const GetCreds = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    try {
      const auth = request.headers.authorization.split(' ');
      if (auth[0] !== 'Basic') throw new Error();
      const [user, pass] = Buffer.from(auth[1], 'base64').toString().split(':');
      return [user, pass];
    } catch {
      throw new HttpException(
        'Missing Basic Auth or Incorrect format',
        HttpStatus.BAD_REQUEST,
      );
    }
  },
);

export const VerifyTokenUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    try {
      const auth = request.headers.authorization.split(' ');
      if (auth[0] !== 'Bearer') throw new Error();
      const user = JWT.verify(auth[1]).user;
      return user;
    } catch {
      throw new HttpException(
        'Missing Basic Auth or Incorrect format',
        HttpStatus.BAD_REQUEST,
      );
    }
  },
);
