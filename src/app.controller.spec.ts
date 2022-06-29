import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LocalMockAuthGuard } from './auth/guards/local-mock-emp-auth.guard';
import { EstadoModule } from './estado/estado.module';
import { NotificacionModule } from './notificacion/notificacion.module';
import { Pedido, PedidoSchema } from './pedido/pedido.entity';
import { PedidoModule } from './pedido/pedido.module';
import { PedidoService } from './pedido/pedido.service';
import { Persona, PersonaSchema } from './persona/persona.entity';
import { PersonaModule } from './persona/persona.module';
import { PersonaService } from './persona/persona.service';
import { RolModule } from './rol/rol.module';
import { Ticket, TicketSchema } from './ticket/ticket.entity';
import { TicketModule } from './ticket/ticket.module';
import { TicketService } from './ticket/ticket.service';
import { Usuario, UsuarioSchema } from './usuario/usuario.entity';
import { UsuarioModule } from './usuario/usuario.module';
import { UsuarioService } from './usuario/usuario.service';

describe('AppController', () => {
  let appController: AppController;
  let app: INestApplication;

  let mockUserService = {}

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports:[
        ConfigModule.forRoot({
          isGlobal:true
        }),
        MongooseModule.forRoot(process.env.MONGO_URI_TEST),
        MongooseModule.forFeature(
          [
              {name:Usuario.name, schema:UsuarioSchema},
              {name:Persona.name, schema:PersonaSchema},
              {name:Pedido.name,schema:PedidoSchema},
              {name:Ticket.name,schema:TicketSchema}
          ])
      ],
      controllers: [AppController],
      providers: [AppService, 
        AppGateway,
        UsuarioService,
        PedidoService,
        TicketService,
        PersonaService,
        JwtService, 
        AuthService],
    }).overrideProvider(JwtAuthGuard)
    .useClass(LocalMockAuthGuard)
    .compile();

    appController = moduleRef.get<AppController>(AppController);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

