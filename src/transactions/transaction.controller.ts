import { Body, Controller, Get, Post, Res, Param } from '@nestjs/common';
import { VerifyTokenUser } from 'src/decorators/auth.decorator';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(':id/splitEqually')
  async createSplitEqually(
    @VerifyTokenUser() user: string,
    @Body() body: bodyJson,
    @Res() res,
    @Param() params,
  ): Promise<void> {
    await this.transactionService.createEqualSplit(
      params.id,
      user,
      body.name,
      body.amount,
    );
    res.status(204).send();
  }

  @Post(':id/splitExactly')
  async createSplitExactly(
    @VerifyTokenUser() user: string,
    @Body() body: bodyJson3,
    @Res() res,
    @Param() params,
  ): Promise<void> {
    await this.transactionService.createExactSplit(
      params.id,
      user,
      body.name,
      body.amount,
      body.split,
    );
    res.status(204).send();
  }

  @Post(':id/settleUp')
  async settleUp(
    @VerifyTokenUser() user: string,
    @Body() body: bodyJson2,
    @Res() res,
    @Param() params: createParams,
  ): Promise<void> {
    await this.transactionService.settleUp(params.id, user, body.to);
    res.status(204).send();
  }

  @Get(':id')
  async getHistory(
    @VerifyTokenUser() _,
    @Param() params: createParams,
  ): Promise<any> {
    return await this.transactionService.getHistory(params.id);
  }
}

interface createParams {
  id: string;
}

interface bodyJson {
  name: string;
  amount: number;
}

interface bodyJson2 {
  to: string;
}

interface bodyJson3 {
  name: string;
  amount: number;
  split: { [key: string]: number };
}
