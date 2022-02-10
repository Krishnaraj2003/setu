import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { GetCreds, VerifyTokenUser } from '../decorators/auth.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('auth')
  async login(@GetCreds() [user, pass]): Promise<loginAPI> {
    const jwt = await this.userService.getToken(user, pass);
    return { jwt };
  }

  @Post('create')
  async createUser(@Body() body: createUserBody, @Res() res): Promise<void> {
    const { user, password } = body;
    await this.userService.createUser(user, password);
    res.status(204).send();
    return;
  }

  @Get('groups')
  async getUserGroups(@VerifyTokenUser() user): Promise<getGroupsAPI> {
    return {
      groups: await this.userService.getGroups(user),
    };
  }
}

interface loginAPI {
  jwt: string;
}

interface createUserBody {
  user: string;
  password: string;
}

interface getGroupsAPI {
  groups: string[];
}
