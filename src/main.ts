import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as session from 'express-session'; // Typescript
var cors = require('cors')
const FileStore = require('session-file-store')(session); // Nodejs

const cookieParser = require('cookie-parser');


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser('Clave Secreta'));
  app.use(express.static('public'));

  app.use(cors({
    origin : 'http://localhost:3001',
    credentials: true
  }));

  app.use(
    session({
      name: 'server-session-id',
      secret: 'hasta las 15',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true
      },
      store: new FileStore()
    })
  );

  await app.listen(3000);
}
bootstrap();
