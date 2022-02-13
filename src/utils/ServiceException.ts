import { HttpException, HttpStatus } from '@nestjs/common';

export class ServiceException {
  throwGroupExists() {
    throw new HttpException('Group already exists', HttpStatus.FORBIDDEN);
  }

  throwGroupNotExists(name: string) {
    throw new HttpException(
      `Group ${name} does not exists`,
      HttpStatus.FORBIDDEN,
    );
  }

  throwUserNotExists(name: string) {
    throw new HttpException(
      `User ${name} Does Not Exists`,
      HttpStatus.FORBIDDEN,
    );
  }

  throwInvalidCreds() {
    throw new HttpException('Incorrect Credentials', HttpStatus.UNAUTHORIZED);
  }

  throwAmountMismatch() {
    throw new HttpException(
      'Amount Mismatch',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
