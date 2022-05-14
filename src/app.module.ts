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


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/systec'),
    EstadoModule,
    RolModule,
    PersonaModule,
    UsuarioModule,
    PedidoModule,
    TicketModule,
    EstadoModule,
    NotificacionModule
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
