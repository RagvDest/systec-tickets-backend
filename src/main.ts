import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as session from 'express-session'; // Typescript
var cors = require('cors')
const FileStore = require('session-file-store')(session); // Nodejs

const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");

require("dotenv").config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.static('public'));
  

  app.use(cors({
    origin : process.env.BASE_URL,
    credentials: true
  }));


  app.use(
    session({
      name: 'server-session-id',
      secret: process.env.SECRET_SESSION,
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: true,
        secure: false
      },
      store: new FileStore()
    })
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
