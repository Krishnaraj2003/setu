import * as jwt from 'jsonwebtoken';
import { JWTSECRET } from './Constants';
import { userJWTInterface } from '../intefraces/JWT.interface';
export class JWT {
  static sign(user: string): string {
    return jwt.sign({ user }, JWTSECRET);
  }

  static verify(token: string): userJWTInterface {
    const decoded = jwt.verify(token, JWTSECRET);
    if (!decoded) throw new Error('Incorrect JWT or Expired');
    return decoded as userJWTInterface;
  }
}
