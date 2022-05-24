import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonaModule } from './persona/persona.module';
import { EstadoModule } from './estado/estado.module';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PedidoModule } from './pedido/pedido.module';
import { TicketService } from './ticket/ticket.service';
import { TicketModule } from './ticket/ticket.module';
import { AppGateway } from './app.gateway';
import { NotificacionModule } from './notificacion/notificacion.module';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from './usuario/usuario.service';
import { PedidoService } from './pedido/pedido.service';
import { Usuario, UsuarioSchema } from './usuario/usuario.entity';
import { Persona, PersonaSchema } from './persona/persona.entity';
import { Pedido, PedidoSchema } from './pedido/pedido.entity';
import { Ticket, TicketSchema } from './ticket/ticket.entity';
import { PersonaService } from './persona/persona.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    EstadoModule,
    RolModule,
    PersonaModule,
    UsuarioModule,
    PedidoModule,
    TicketModule,
    EstadoModule,
    NotificacionModule,
    MongooseModule.forFeature(
      [
          {name:Usuario.name, schema:UsuarioSchema},
          {name:Persona.name, schema:PersonaSchema},
          {name:Pedido.name,schema:PedidoSchema},
          {name:Ticket.name,schema:TicketSchema},
          {name:Persona.name,schema:PersonaSchema}
      ]),
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    AppGateway,
    UsuarioService,
    PedidoService,
    TicketService,
    PersonaService,
    JwtService, 
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
