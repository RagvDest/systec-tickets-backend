import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as session from 'express-session'; // Typescript
var cors = require('cors')
const FileStore = require('session-file-store')(session); // Nodejs


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
      saveUninitialized: false,
      cookie: {
        sameSite: true,
        secure: false
      },
      store: new FileStore()
    })
  );

  await app.listen(3000);
}
bootstrap();
