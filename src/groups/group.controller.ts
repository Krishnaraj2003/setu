import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { GroupService } from './group.service';
import { VerifyTokenUser } from 'src/decorators/auth.decorator';
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(':id/members')
  async getGroup(
    @VerifyTokenUser() _,
    @Param() params: createParams,
  ): Promise<memebers> {
    const memeberList = await this.groupService.getMemebers(params.id);
    return {
      groupMembers: memeberList,
    };
  }

  @Get(':id/splits')
  async getSplits(
    @VerifyTokenUser() _,
    @Param() params: createParams,
  ): Promise<any> {
    return await this.groupService.getSplits(params.id);
  }

  @Post('create')
  async createGroup(
    @VerifyTokenUser() _,
    @Body() body: createBody,
    @Res() res,
  ): Promise<void> {
    await this.groupService.createGroup(body.name, body.members);
    res.status(204).send();
  }
}

interface createBody {
  name: string;
  members: string[];
}

interface createParams {
  id: string;
}

interface memebers {
  groupMembers: string[];
}
