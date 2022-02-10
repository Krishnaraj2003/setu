import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { json } from 'body-parser';
import { Server } from 'http';
import { RedisStore } from './utils/RedisClient';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = '/api/v1/';
  const port = process.env.PORT || 8080;
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  app.use(json()); //user json
  await RedisStore.getInstance().initialize();
  const server = (await app.listen(port)) as Server;
  server.timeout = 0;
}

bootstrap();
