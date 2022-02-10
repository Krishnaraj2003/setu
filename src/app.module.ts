import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GroupModule } from './groups/group.module';
import { TransactionModule } from './transactions/transaction.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [UserModule, GroupModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
