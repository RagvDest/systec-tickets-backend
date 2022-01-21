import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as session from 'express-session'; // Typescript
const FileStore = require('session-file-store')(session); // Nodejs

const cookieParser = require('cookie-parser');


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser('Clave Secreta'));
  app.use(express.static('public'));

  app.use(
    session({
      name: 'server-session-id',
      secret: 'hasta las 15',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false
      },
      store: new FileStore()
    })
  );

  await app.listen(3000);
}
bootstrap();
